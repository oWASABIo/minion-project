import { defineStore } from "pinia";
import type { ProjectConfig, Section, PageConfig } from "@minions/shared";

export const useBuilderStore = defineStore("builder", {
  state: () => ({
    // Project Data
    projectConfig: null as ProjectConfig | null,
    currentPageId: "home" as string,

    // UI State
    selectedSectionId: undefined as string | undefined,
    isEditMode: false,
    viewport: "desktop" as "desktop" | "tablet" | "mobile",

    // Status
    isSaving: false,
    isPublished: false,

    // History (Undo/Redo)
    history: [] as ProjectConfig[],
    historyIndex: -1,
    isUndoRedoAction: false,
    // Generation Config
    generation: {
      template: "landing" as string,
      stack: "nuxt" as string,
      mode: "auto" as "auto" | "blueprint" | "live",
      brief: "" as string,
      wordpressBaseUrl: "" as string,
      wordpressRestBase: "/wp-json/wp/v2" as string,
    },
  }),

  getters: {
    currentPageConfig: (state): PageConfig | undefined => {
      // console.log("[Store] Getter currentPageConfig:", {
      //   hasConfig: !!state.projectConfig,
      //   pageId: state.currentPageId,
      //   keys: state.projectConfig?.pages ? Object.keys(state.projectConfig.pages) : []
      // });
      if (!state.projectConfig) return undefined;
      const page = state.projectConfig.pages?.[state.currentPageId];
      if (!page) {
        console.warn(
          "[Store] currentPageConfig: Page not found for ID:",
          state.currentPageId
        );
      }
      return page;
    },

    currentSections: (state): Section[] => {
      const page = state.projectConfig?.pages?.[state.currentPageId];
      return page?.sections || [];
    },

    hasResult: (state): boolean => !!state.projectConfig,

    selectedSection: (state): Section | undefined => {
      if (
        !state.selectedSectionId ||
        !state.projectConfig?.pages?.[state.currentPageId]
      )
        return undefined;
      return state.projectConfig.pages[state.currentPageId]?.sections?.find(
        (s) => s.id === state.selectedSectionId
      );
    },

    canUndo: (state): boolean => state.historyIndex > 0,
    canRedo: (state): boolean => state.historyIndex < state.history.length - 1,
  },

  actions: {
    // --- Core Data Actions ---

    setProjectConfig(config: ProjectConfig) {
      this.projectConfig = config;
      // Reset history on new load? Or push? Usually reset if it's a fresh load.
      // If just setting initial data:
      if (this.history.length === 0) {
        this.pushHistory();
      }
    },

    updateProjectConfig(newConfig: ProjectConfig) {
      this.projectConfig = newConfig;
      this.pushHistory();
    },

    setSections(sections: Section[]) {
      if (!this.projectConfig || !this.currentPageId) return;

      const page = this.projectConfig.pages[this.currentPageId];
      if (page) {
        page.sections = sections;
        this.pushHistory();
      }
    },

    updateSection(updatedSection: Section) {
      if (!this.projectConfig || !this.currentPageId) return;

      const page = this.projectConfig.pages[this.currentPageId];
      if (!page) return;

      const idx = page.sections.findIndex((s) => s.id === updatedSection.id);
      if (idx !== -1) {
        page.sections[idx] = updatedSection;
        this.pushHistory();
      }
    },

    updateSectionField(sectionId: string, path: string, value: any) {
      if (!this.projectConfig || !this.currentPageId) return;

      const page = this.projectConfig.pages[this.currentPageId];
      if (!page) return;

      const section = page.sections.find((s) => s.id === sectionId);
      if (!section) return;

      // Handle simple assignment or nested path
      if (!path.includes(".")) {
        (section as any)[path] = value;
      } else {
        const parts = path.split(".");
        let current: any = section;
        for (let i = 0; i < parts.length - 1; i++) {
          const key = parts[i];
          if (!key) continue;
          current = (current as any)[key];
        }
        const lastKey = parts[parts.length - 1];
        if (lastKey) {
          (current as any)[lastKey] = value;
        }
      }
      this.pushHistory();
    },

    // --- History Management ---

    pushHistory() {
      if (this.isUndoRedoAction) {
        this.isUndoRedoAction = false;
        return;
      }

      if (!this.projectConfig) return;

      // Copy current state
      const snapshot = JSON.parse(JSON.stringify(this.projectConfig));

      // Truncate future history if we were in the middle
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }

      this.history.push(snapshot);
      this.historyIndex = this.history.length - 1;

      // Limit history size (optional, e.g. 50 steps)
      if (this.history.length > 50) {
        this.history.shift();
        this.historyIndex--;
      }
    },

    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.isUndoRedoAction = true;
        this.projectConfig = JSON.parse(
          JSON.stringify(this.history[this.historyIndex])
        );
      }
    },

    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.isUndoRedoAction = true;
        this.projectConfig = JSON.parse(
          JSON.stringify(this.history[this.historyIndex])
        );
      }
    },

    // --- UI Actions ---

    selectSection(sectionId: string) {
      this.selectedSectionId = sectionId;
    },

    clearSelection() {
      this.selectedSectionId = undefined;
    },
  },
});

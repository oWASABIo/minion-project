import { defineStore } from "pinia";
import type { ProjectConfig, Section, PageConfig } from "@minions/shared";
import { debounce } from "~/utils/performance";

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

      // Default Global Design Tokens
      spacing: 5 as number,
      borderRadius: 16 as number,
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

    updateSectionContent(
      pageId: string,
      sectionId: string,
      path: string,
      value: any
    ) {
      const page = this.projectConfig?.pages?.[pageId];
      if (!page) return;
      const section = page.sections?.find((s) => s.id === sectionId);
      if (!section) return;

      if (!path) {
        Object.assign(section, value);
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

    duplicateSection(sectionId: string) {
      if (!this.projectConfig || !this.currentPageId) return;
      const page = this.projectConfig.pages[this.currentPageId];
      if (!page) return;

      const idx = page.sections.findIndex((s) => s.id === sectionId);
      if (idx !== -1) {
        const section = page.sections[idx];
        const copy = JSON.parse(JSON.stringify(section));
        copy.id = `sec-${Math.random().toString(36).substring(2, 9)}`;
        page.sections.splice(idx + 1, 0, copy);
        this.pushHistory();
      }
    },

    reorderSection(sectionId: string, direction: "up" | "down") {
      if (!this.projectConfig || !this.currentPageId) return;
      const page = this.projectConfig.pages[this.currentPageId];
      if (!page) return;

      const idx = page.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return;

      const sections = [...page.sections];
      if (direction === "up" && idx > 0) {
        [sections[idx], sections[idx - 1]] = [sections[idx - 1], sections[idx]];
      } else if (direction === "down" && idx < sections.length - 1) {
        [sections[idx], sections[idx + 1]] = [sections[idx + 1], sections[idx]];
      } else {
        return; // No change
      }

      page.sections = sections;
      this.pushHistory();
    },

    deleteSection(sectionId: string) {
      if (!this.projectConfig || !this.currentPageId) return;
      const page = this.projectConfig.pages[this.currentPageId];
      if (!page) return;

      const idx = page.sections.findIndex((s) => s.id === sectionId);
      if (idx !== -1) {
        page.sections.splice(idx, 1);
        if (this.selectedSectionId === sectionId) {
          this.selectedSectionId = undefined;
        }
        this.pushHistory();
      }
    },

    updateGlobalSiteConfig(updates: Partial<ProjectConfig["site"]>) {
      if (!this.projectConfig) return;

      // 1. Update project root site config
      this.projectConfig.site = {
        ...this.projectConfig.site,
        ...updates,
      } as any;

      // 2. Synchronize all pages to use these same global tokens
      if (this.projectConfig.pages) {
        Object.keys(this.projectConfig.pages).forEach((pageId) => {
          const page = this.projectConfig!.pages[pageId];
          if (page) {
            page.site = {
              ...page.site,
              ...updates,
            } as any;
          }
        });
      }

      this.pushHistory();
    },

    // --- History Management ---

    pushHistory() {
      // Internal helper to avoid immediate stringify on every keystroke
      this._doPushHistory();
    },

    // Not exported, use underscores or helper
    _doPushHistory: debounce(function (this: any) {
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
    }, 500),

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

<script setup lang="ts">
import { ref } from "vue";
const activeTab = ref("Nuxt");
</script>

<template>
  <main class="py-12 px-6">
    <div class="mx-auto max-w-4xl">
      <div class="mb-16">
        <h1 class="text-4xl font-bold md:text-5xl">User Guide</h1>
        <p class="mt-4 text-xl text-slate-400">
          Complete documentation for building, exporting, and integrating your
          AI-generated sites.
        </p>
      </div>

      <div class="grid gap-12 lg:grid-cols-[250px_1fr]">
        <aside class="hidden lg:block relative">
          <nav class="sticky top-32 space-y-1 z-10">
            <a
              href="#quick-start"
              class="block px-3 py-2 text-sm font-medium text-white bg-white/5 rounded-lg"
            >
              Quick Start
            </a>
            <a
              href="#integration"
              class="block px-3 py-2 text-sm font-medium text-slate-400 hover:text-white"
            >
              Integration Guide
            </a>
            <a
              href="#prompting"
              class="block px-3 py-2 text-sm font-medium text-slate-400 hover:text-white"
            >
              Prompting Tips
            </a>
          </nav>

          <!-- Gimmick: Samurai Minion -->
          <div
            class="fixed bottom-0 left-12 z-0 opacity-80 pointer-events-none transform scale-90 origin-bottom-left animate-breathe"
          >
            <img
              src="/images/minion-samurai.png"
              alt="Minion Samurai"
              class="w-56 drop-shadow-2xl"
            />
          </div>
        </aside>

        <div class="space-y-16">
          <!-- 1. Quick Start -->
          <section id="quick-start" class="scroll-mt-32">
            <h2 class="text-2xl font-bold text-indigo-400 mb-6">
              1. Quick Start
            </h2>
            <div class="prose prose-invert max-w-none text-slate-300">
              <p>
                MINIONS is an AI-powered prototyping tool. Instead of dragging
                and dropping components manually, you describe what you want,
                and we generate the code configuration for you.
              </p>
              <div class="not-prose mt-6 grid gap-4 sm:grid-cols-2">
                <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div class="text-lg font-bold text-white mb-2">
                    Step 1: Briefing
                  </div>
                  <p class="text-sm text-slate-400">
                    Desribe your business "SaaS for pet lovers" or "Portfolio
                    for photographer".
                  </p>
                </div>
                <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div class="text-lg font-bold text-white mb-2">
                    Step 2: Generate
                  </div>
                  <p class="text-sm text-slate-400">
                    Our AI selects the layout, copy, and components matching
                    your stack.
                  </p>
                </div>
                <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div class="text-lg font-bold text-white mb-2">
                    Step 3: Download
                  </div>
                  <p class="text-sm text-slate-400">
                    Get a <code>.zip</code> file containing the JSON config and
                    boilerplate code.
                  </p>
                </div>
                <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div class="text-lg font-bold text-white mb-2">
                    Step 4: Run
                  </div>
                  <p class="text-sm text-slate-400">
                    Unzip, install dependencies, and run
                    <code>npm run dev</code>.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Detailed Integration Guide -->
          <section id="integration" class="scroll-mt-32">
            <h2 class="text-2xl font-bold text-indigo-400 mb-6">
              Integration Guide
            </h2>
            <div
              class="rounded-2xl border border-white/10 bg-slate-900/50 overflow-hidden"
            >
              <!-- Tabs -->
              <div class="flex border-b border-white/10 bg-white/5">
                <button
                  v-for="tab in ['Nuxt', 'Next.js', 'WordPress', 'Vue + Vite']"
                  :key="tab"
                  @click="activeTab = tab"
                  class="px-6 py-4 text-sm font-medium transition-colors border-r border-white/10 last:border-0"
                  :class="
                    activeTab === tab
                      ? 'bg-indigo-500/10 text-indigo-300'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  "
                >
                  {{ tab }}
                </button>
              </div>

              <!-- Content -->
              <div class="p-8 space-y-8">
                <!-- NUXT GUIDE -->
                <div v-if="activeTab === 'Nuxt'" class="space-y-8">
                  <div>
                    <h3
                      class="flex items-center gap-3 text-lg font-bold text-white mb-4"
                    >
                      <span
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm"
                        >1</span
                      >
                      Initialize Project
                    </h3>
                    <div
                      class="rounded-xl bg-black/40 p-4 border border-white/5"
                    >
                      <code class="text-sm text-slate-300 block mb-2"
                        ># Create a new Nuxt project</code
                      >
                      <pre class="text-sm font-mono text-emerald-400">
npx nuxi@latest init my-landing</pre
                      >
                      <pre class="text-sm font-mono text-emerald-400 mt-2">
cd my-landing</pre
                      >
                      <pre class="text-sm font-mono text-emerald-400 mt-2">
npm install</pre
                      >
                    </div>
                  </div>

                  <div>
                    <h3
                      class="flex items-center gap-3 text-lg font-bold text-white mb-4"
                    >
                      <span
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm"
                        >2</span
                      >
                      Install TailwindCSS
                    </h3>
                    <p class="text-slate-400 text-sm mb-3">
                      Install the Tailwind module for styling.
                    </p>
                    <div
                      class="rounded-xl bg-black/40 p-4 border border-white/5"
                    >
                      <pre class="text-sm font-mono text-emerald-400">
npm install -D @nuxtjs/tailwindcss</pre
                      >
                    </div>
                    <p class="text-slate-400 text-sm mt-3">
                      Add to `nuxt.config.ts`:
                    </p>
                    <div
                      class="rounded-xl bg-black/40 p-4 border border-white/5 mt-2"
                    >
                      <pre class="text-xs font-mono text-slate-300">
modules: ['@nuxtjs/tailwindcss']</pre
                      >
                    </div>
                  </div>

                  <div>
                    <h3
                      class="flex items-center gap-3 text-lg font-bold text-white mb-4"
                    >
                      <span
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm"
                        >3</span
                      >
                      Import Data
                    </h3>
                    <p class="text-slate-400 text-sm mb-3">
                      1. Download the Kit from the Builder.<br />
                      2. Copy <code>data/page-config.json</code> to your
                      project's <code>assets/</code> folder.<br />
                      3. Copy <code>types.ts</code> to your
                      <code>types/</code> folder.
                    </p>
                  </div>

                  <div>
                    <h3
                      class="flex items-center gap-3 text-lg font-bold text-white mb-4"
                    >
                      <span
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm"
                        >4</span
                      >
                      Render Page
                    </h3>
                    <p class="text-slate-400 text-sm mb-3">
                      Create <code>app.vue</code> or a page file:
                    </p>
                    <div
                      class="rounded-xl bg-black/40 p-4 border border-white/5"
                      v-pre
                    >
                      <pre class="text-xs font-mono text-slate-300">
&lt;script setup lang="ts"&gt;
import config from "~/assets/page-config.json";
// You need to implement or copy the Section components (Hero, Features, etc.)
// from the starter kit suggestions or build your own.
&lt;/script&gt;

&lt;template&gt;
  &lt;div&gt;
    &lt;header&gt;{{ config.site.siteName }}&lt;/header&gt;
    &lt;main&gt;
       &lt;component 
         v-for="section in config.sections" 
         :key="section.id" 
         :is="resolveComponent(section.type)" 
         :section="section" 
       /&gt;
    &lt;/main&gt;
  &lt;/div&gt;
&lt;/template&gt;</pre
                      >
                    </div>
                  </div>
                </div>

                <!-- NEXT.JS GUIDE -->
                <div v-else-if="activeTab === 'Next.js'" class="space-y-8">
                  <div>
                    <h3
                      class="flex items-center gap-3 text-lg font-bold text-white mb-4"
                    >
                      <span
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-sm"
                        >1</span
                      >
                      Create App
                    </h3>
                    <div
                      class="rounded-xl bg-black/40 p-4 border border-white/5"
                    >
                      <pre class="text-sm font-mono text-indigo-400">
npx create-next-app@latest my-site --typescript --tailwind --eslint</pre
                      >
                    </div>
                  </div>

                  <div>
                    <h3
                      class="flex items-center gap-3 text-lg font-bold text-white mb-4"
                    >
                      <span
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-sm"
                        >2</span
                      >
                      Setup Data
                    </h3>
                    <p class="text-slate-400 text-sm mb-3">
                      Place <code>page-config.json</code> in
                      <code>src/data/</code>.
                    </p>
                  </div>

                  <div>
                    <h3
                      class="flex items-center gap-3 text-lg font-bold text-white mb-4"
                    >
                      <span
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-sm"
                        >3</span
                      >
                      Map Components
                    </h3>
                    <p class="text-slate-400 text-sm mb-3">
                      In <code>page.tsx</code>, map the JSON types to React
                      components.
                    </p>
                    <div
                      class="rounded-xl bg-black/40 p-4 border border-white/5"
                    >
                      <pre class="text-xs font-mono text-slate-300">
import config from "@/data/page-config.json";
import { Hero } from "@/components/Hero";
import { Cta } from "@/components/Cta";

const COMPONENTS = {
  hero: Hero,
  cta: Cta,
  // ... map others
};

export default function Home() {
  return (
    &lt;main className="min-h-screen"&gt;
      {config.sections.map((section) => {
        const Component = COMPONENTS[section.type];
        return Component ? &lt;Component key={section.id} {...section} /&gt; : null;
      })}
    &lt;/main&gt;
  );
}</pre
                      >
                    </div>
                  </div>
                </div>

                <!-- WORDPRESS -->
                <div v-else-if="activeTab === 'WordPress'" class="space-y-8">
                  <div
                    class="rounded-xl bg-blue-500/10 border border-blue-500/20 p-6"
                  >
                    <h4 class="text-blue-300 font-bold mb-2">
                      Headless Architecture
                    </h4>
                    <p class="text-sm text-slate-300 leading-relaxed">
                      This workflow uses WordPress strictly as a Content
                      Management System (dataset). The frontend should be built
                      with Nuxt or Next.js (see tabs above), fetching data from
                      WP.
                    </p>
                  </div>

                  <div>
                    <h3
                      class="flex items-center gap-3 text-lg font-bold text-white mb-4"
                    >
                      <span
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-sm"
                        >1</span
                      >
                      Prepare WordPress
                    </h3>
                    <ul class="list-disc pl-5 space-y-2 text-sm text-slate-400">
                      <li>
                        Ensure <strong>REST API</strong> is enabled (Standard in
                        WP 5+).
                      </li>
                      <li>
                        Install <strong>ACF Pro</strong> (Advanced Custom
                        Fields) if you want to edit "Hero", "Features" fields in
                        WP Admin.
                      </li>
                      <li>
                        Create a Field Group for "Page Builder" and add a
                        Flexible Content field.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3
                      class="flex items-center gap-3 text-lg font-bold text-white mb-4"
                    >
                      <span
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-sm"
                        >2</span
                      >
                      Configure Frontend
                    </h3>
                    <p class="text-slate-400 text-sm mb-3">
                      In the Builder, set your
                      <strong>WordPress Base URL</strong> (e.g.,
                      https://my-wp-site.com).
                    </p>
                    <p class="text-slate-400 text-sm">
                      The generated JSON will auto-configure the
                      <code>blogList</code> section to fetch from:
                    </p>
                    <div
                      class="rounded-xl bg-black/40 p-3 border border-white/5 mt-2 font-mono text-xs text-blue-300"
                    >
                      GET https://my-wp-site.com/wp-json/wp/v2/posts
                    </div>
                  </div>
                </div>

                <!-- VUE + VITE -->
                <div v-else-if="activeTab === 'Vue + Vite'" class="space-y-8">
                  <div>
                    <h3
                      class="flex items-center gap-3 text-lg font-bold text-white mb-4"
                    >
                      <span
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm"
                        >1</span
                      >
                      Option A: Starter Kit (Recommended)
                    </h3>
                    <p class="text-slate-400 text-sm mb-3">
                      The easiest way to start. We generate a fully configured
                      Vite project for you.
                    </p>
                    <div
                      class="rounded-xl bg-black/40 p-4 border border-white/5 font-mono text-sm space-y-2"
                    >
                      <div class="flex items-center gap-2 text-slate-300">
                        <span class="text-emerald-400">1.</span> Download
                        <strong>.zip</strong> from Builder
                      </div>
                      <div class="flex items-center gap-2 text-slate-300">
                        <span class="text-emerald-400">2.</span> Unzip and
                        terminal:
                      </div>
                      <div class="pl-6 text-emerald-400">npm install</div>
                      <div class="pl-6 text-emerald-400">npm run dev</div>
                    </div>
                  </div>

                  <div>
                    <h3
                      class="flex items-center gap-3 text-lg font-bold text-white mb-4"
                    >
                      <span
                        class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm"
                        >2</span
                      >
                      Option B: Manual Setup
                    </h3>
                    <p class="text-slate-400 text-sm mb-3">
                      If you want to integrate into an existing Vite project
                      manually.
                    </p>

                    <div class="space-y-4">
                      <div
                        class="rounded-xl bg-black/40 p-4 border border-white/5"
                      >
                        <div
                          class="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide"
                        >
                          1. Create Project
                        </div>
                        <pre class="text-sm font-mono text-emerald-400">
npm create vite@latest my-app -- --template vue-ts</pre
                        >
                      </div>

                      <div
                        class="rounded-xl bg-black/40 p-4 border border-white/5"
                      >
                        <div
                          class="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide"
                        >
                          2. Install Tailwind
                        </div>
                        <pre class="text-sm font-mono text-emerald-400">
npx tailwindcss init -p</pre
                        >
                        <p class="text-xs text-slate-400 mt-2">
                          Add <code>@minions/shared</code> types if needed.
                        </p>
                      </div>

                      <div
                        class="rounded-xl bg-black/40 p-4 border border-white/5"
                      >
                        <div
                          class="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide"
                        >
                          3. Import Data
                        </div>
                        <p class="text-sm text-slate-300">
                          Copy <code>project-config.json</code> to
                          <code>src/data/</code>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 3. Prompting Tips -->
          <section id="prompting" class="scroll-mt-32">
            <h2 class="text-2xl font-bold text-indigo-400 mb-6">
              Prompting Best Practices
            </h2>
            <div class="space-y-6">
              <p class="text-slate-300">
                Getting the perfect landing page depends heavily on how you
                describe it. Here are some techniques to get better results from
                the AI.
              </p>

              <div class="grid gap-6 md:grid-cols-2">
                <div class="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h3 class="text-lg font-semibold text-white mb-2">
                    🎭 Define the Persona
                  </h3>
                  <p class="text-sm text-slate-400 mb-4">
                    Tell the AI who it should sound like.
                  </p>
                  <div
                    class="rounded bg-black/40 p-3 text-xs text-indigo-300 font-mono"
                  >
                    "Use a friendly, approachable tone like a local coffee shop
                    owner."
                  </div>
                </div>

                <div class="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h3 class="text-lg font-semibold text-white mb-2">
                    🎯 Specify Sections
                  </h3>
                  <p class="text-sm text-slate-400 mb-4">
                    List exactly what you need if you have a structure in mind.
                  </p>
                  <div
                    class="rounded bg-black/40 p-3 text-xs text-indigo-300 font-mono"
                  >
                    "Must include a Hero, 3-col Feature grid, Testimonials, and
                    a Pricing table."
                  </div>
                </div>

                <div class="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h3 class="text-lg font-semibold text-white mb-2">
                    🎨 Visual Directives
                  </h3>
                  <p class="text-sm text-slate-400 mb-4">
                    You can hint at visual styles (dark/light, colors).
                  </p>
                  <div
                    class="rounded bg-black/40 p-3 text-xs text-indigo-300 font-mono"
                  >
                    "[Style] Dark mode with neon violet accents and
                    glassmorphism cards."
                  </div>
                </div>

                <div class="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h3 class="text-lg font-semibold text-white mb-2">
                    👥 Target Audience
                  </h3>
                  <p class="text-sm text-slate-400 mb-4">
                    Who is this for? The AI will adjust vocabulary.
                  </p>
                  <div
                    class="rounded bg-black/40 p-3 text-xs text-indigo-300 font-mono"
                  >
                    "Target enterprise CTOs looking for security solutions."
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { TeamSection as TeamSectionType } from "@minions/shared";

defineProps<{
  section: TeamSectionType;
}>();

function getFallbackAvatar(name: string) {
  const n = name.toLowerCase();
  if (n.includes("sarah")) return "/images/team-1.png";
  if (n.includes("david")) return "/images/team-2.png";
  if (n.includes("emily")) return "/images/team-3.png";
  if (n.includes("michael")) return "/images/team-4.png";
  return undefined;
}
</script>

<template>
  <section class="py-24 px-6 overflow-hidden">
    <div class="mx-auto max-w-5xl">
      <div class="text-center mb-16 max-w-3xl mx-auto">
        <h2
          class="text-3xl font-bold tracking-tight md:text-5xl transition-colors"
          style="color: var(--text-primary)"
          data-sb-field="title"
        >
          {{ section.title || "Our Team" }}
        </h2>
        <p
          v-if="section.subtitle"
          class="mt-6 text-lg leading-relaxed transition-colors"
          style="color: var(--text-secondary)"
          data-sb-field="subtitle"
        >
          {{ section.subtitle }}
        </p>
      </div>

      <div
        class="grid gap-10 px-6 sm:grid-cols-2 lg:grid-cols-4 justify-center"
      >
        <div
          v-for="(member, idx) in section.members || []"
          :key="idx"
          class="group relative flex flex-col items-center"
        >
          <div
            class="relative mb-6 h-40 w-40 overflow-hidden rounded-full border-4 border-white dark:border-white/10 shadow-xl transition-transform group-hover:scale-105"
          >
            <img
              v-if="member.avatar || getFallbackAvatar(member.name)"
              :src="member.avatar || getFallbackAvatar(member.name)"
              :alt="member.name"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-4xl font-bold text-slate-500 dark:text-slate-400"
            >
              {{ member.name.charAt(0) }}
            </div>

            <!-- Social Overlay (Optional Style) -->
            <div
              class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]"
            >
              <a
                v-if="member.socials?.twitter"
                :href="member.socials.twitter"
                target="_blank"
                class="text-white hover:text-sky-400 transition-colors"
              >
                <span class="sr-only">Twitter</span>
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path
                    d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                  />
                </svg>
              </a>
              <a
                v-if="member.socials?.linkedin"
                :href="member.socials.linkedin"
                target="_blank"
                class="text-white hover:text-blue-500 transition-colors"
              >
                <span class="sr-only">LinkedIn</span>
                <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 21.227.792 22 1.771 22h20.451C23.2 22 24 21.227 24 20.271V1.729C24 .774 23.2 0 22.25 0z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div class="text-center relative z-10">
            <h3
              class="text-lg font-bold transition-colors"
              style="color: var(--text-primary)"
              :data-sb-field="`members.${idx}.name`"
            >
              {{ member.name }}
            </h3>
            <p
              class="text-sm font-semibold text-primary uppercase tracking-wide mt-1"
              :data-sb-field="`members.${idx}.role`"
            >
              {{ member.role }}
            </p>
            <p
              v-if="member.bio"
              class="mt-4 text-sm leading-relaxed max-w-xs mx-auto transition-colors"
              style="color: var(--text-secondary)"
              :data-sb-field="`members.${idx}.bio`"
            >
              {{ member.bio }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

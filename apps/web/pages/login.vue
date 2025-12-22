<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const email = ref("");
const password = ref("");
const loading = ref(false);
const message = ref("");
const isSignUp = ref(false);
const { styles } = useTheme();

// Redirect if already logged in
watchEffect(() => {
  if (user.value) {
    navigateTo("/builder");
  }
});

const handleLogin = async () => {
  loading.value = true;
  message.value = "";

  try {
    const { error } = isSignUp.value
      ? await supabase.auth.signUp({
          email: email.value,
          password: password.value,
        })
      : await supabase.auth.signInWithPassword({
          email: email.value,
          password: password.value,
        });

    if (error) throw error;

    if (isSignUp.value) {
      message.value = "Check your email for the confirmation link!";
    } else {
      navigateTo("/builder");
    }
  } catch (error: any) {
    message.value = error.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-slate-950 flex items-center justify-center p-4"
    :style="styles"
  >
    <div
      class="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-xl"
    >
      <div class="text-center mb-8">
        <div
          class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 mb-4"
        >
          <img src="/logo.png" alt="Minions" class="h-10 w-10" />
        </div>
        <h1 class="text-2xl font-bold text-white mb-2">
          {{ isSignUp ? "Create an Account" : "Welcome Back" }}
        </h1>
        <p class="text-slate-400 text-sm">
          {{
            isSignUp ? "Join the Minions Builder" : "Sign in to your account"
          }}
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1"
            >Email</label
          >
          <input
            v-model="email"
            type="email"
            required
            class="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
            placeholder="dev@example.com"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1"
            >Password</label
          >
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            class="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
            placeholder="••••••••"
          />
        </div>

        <div
          v-if="message"
          class="p-3 rounded-lg text-sm text-center"
          :class="
            isSignUp
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400'
          "
        >
          {{ message }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
          <span v-else>{{ isSignUp ? "Sign Up" : "Sign In" }}</span>
        </button>
      </form>

      <p class="mt-8 text-center text-xs text-slate-500">
        {{ isSignUp ? "Already have an account?" : "Don't have an account?" }}
        <button
          @click="isSignUp = !isSignUp"
          class="text-indigo-400 hover:text-indigo-300 font-medium ml-1"
        >
          {{ isSignUp ? "Sign In" : "Sign Up" }}
        </button>
      </p>
    </div>
  </div>
</template>

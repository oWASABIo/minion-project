<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

const { items, isDrawerOpen, toggleDrawer, updateQuantity, cartTotal } =
  useCart();

const formattedTotal = computed(() => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cartTotal.value);
});

function close() {
  isDrawerOpen.value = false;
}
</script>

<template>
  <TransitionRoot as="template" :show="isDrawerOpen">
    <Dialog as="div" class="relative z-[100]" @close="close">
      <TransitionChild
        as="template"
        enter="ease-in-out duration-500"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in-out duration-500"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity"
        />
      </TransitionChild>

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div
            class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10"
          >
            <TransitionChild
              as="template"
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enter-from="translate-x-full"
              enter-to="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leave-from="translate-x-0"
              leave-to="translate-x-full"
            >
              <DialogPanel class="pointer-events-auto w-screen max-w-md">
                <div
                  class="flex h-full flex-col overflow-y-scroll shadow-xl transition-colors"
                  :style="{ backgroundColor: 'var(--bg-page)' }"
                >
                  <div class="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    <div class="flex items-start justify-between">
                      <DialogTitle
                        class="text-lg font-medium transition-colors"
                        style="color: var(--text-primary)"
                        >Shopping Cart</DialogTitle
                      >
                      <div class="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          class="relative -m-2 p-2 hover:opacity-100 opacity-60 transition-opacity"
                          :style="{ color: 'var(--text-secondary)' }"
                          @click="close"
                        >
                          <span class="absolute -inset-0.5" />
                          <span class="sr-only">Close panel</span>
                          <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div class="mt-8">
                      <div v-if="items.length === 0" class="text-center py-12">
                        <div class="text-6xl mb-4">🛒</div>
                        <h3
                          class="text-lg font-medium transition-colors"
                          style="color: var(--text-primary)"
                        >
                          Your cart is empty
                        </h3>
                        <p class="mt-2" style="color: var(--text-secondary)">
                          Looks like you haven't added anything yet.
                        </p>
                        <button
                          @click="close"
                          class="mt-6 text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                          Continue Shopping &rarr;
                        </button>
                      </div>
                      <div v-else class="flow-root">
                        <ul
                          role="list"
                          class="-my-6 divide-y"
                          :style="{ borderColor: 'var(--border-color)' }"
                        >
                          <li
                            v-for="product in items"
                            :key="product.id"
                            class="flex py-6"
                          >
                            <div
                              class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border"
                              :style="{ borderColor: 'var(--border-color)' }"
                            >
                              <img
                                :src="product.image"
                                :alt="product.name"
                                class="h-full w-full object-cover object-center"
                              />
                            </div>

                            <div class="ml-4 flex flex-1 flex-col">
                              <div>
                                <div
                                  class="flex justify-between text-base font-medium transition-colors"
                                  style="color: var(--text-primary)"
                                >
                                  <h3>
                                    <a href="#">{{ product.name }}</a>
                                  </h3>
                                  <p
                                    class="ml-4"
                                    style="color: var(--text-primary)"
                                  >
                                    {{ product.price }}
                                  </p>
                                </div>
                              </div>
                              <div
                                class="flex flex-1 items-end justify-between text-sm"
                              >
                                <div
                                  class="flex items-center border rounded-lg"
                                  :style="{
                                    borderColor: 'var(--border-color)',
                                  }"
                                >
                                  <button
                                    @click="updateQuantity(product.id, -1)"
                                    class="px-3 py-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                                  >
                                    -
                                  </button>
                                  <span
                                    class="px-2 font-medium transition-colors"
                                    style="color: var(--text-primary)"
                                    >{{ product.quantity }}</span
                                  >
                                  <button
                                    @click="updateQuantity(product.id, 1)"
                                    class="px-3 py-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                                  >
                                    +
                                  </button>
                                </div>

                                <div class="flex">
                                  <button
                                    type="button"
                                    @click="updateQuantity(product.id, -9999)"
                                    class="font-medium text-indigo-600 hover:text-indigo-500"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="items.length > 0"
                    class="border-t px-4 py-6 sm:px-6 transition-colors"
                    :style="{ borderColor: 'var(--border-color)' }"
                  >
                    <div
                      class="flex justify-between text-base font-medium transition-colors"
                      style="color: var(--text-primary)"
                    >
                      <p>Subtotal</p>
                      <p>{{ formattedTotal }}</p>
                    </div>
                    <p
                      class="mt-0.5 text-sm"
                      style="color: var(--text-secondary)"
                    >
                      Shipping and taxes calculated at checkout.
                    </p>
                    <div class="mt-6">
                      <a
                        href="#"
                        class="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                        >Checkout</a
                      >
                    </div>
                    <div
                      class="mt-6 flex justify-center text-center text-sm"
                      style="color: var(--text-secondary)"
                    >
                      <p>
                        or
                        <button
                          type="button"
                          class="font-medium text-indigo-600 hover:text-indigo-500"
                          @click="close"
                        >
                          Continue Shopping
                          <span aria-hidden="true"> &rarr;</span>
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

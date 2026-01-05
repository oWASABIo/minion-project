import { useState, computed } from "#imports";

export interface CartItem {
  id: string | number;
  name: string;
  price: string;
  image: string;
  quantity: number;
  size?: string;
}

export const useCart = () => {
  const items = useState<CartItem[]>("cart-items", () => []);
  const isDrawerOpen = useState<boolean>("cart-drawer-open", () => false);

  const addToCart = (product: any, quantity: number = 1, size?: string) => {
    // Unique ID for items with different sizes
    const baseId = product.id || product.sku || Date.now();
    const itemKey = size ? `${baseId}-${size}` : `${baseId}`;

    const existing = items.value.find((i) =>
      size ? i.id === baseId && i.size === size : i.id === baseId
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.value.push({
        id: baseId,
        name: product.name || "Product",
        price: product.price || "$0",
        image: product.images?.[0] || "",
        quantity: quantity,
        size: size,
      });
    }

    // Auto open drawer
    isDrawerOpen.value = true;
  };

  const removeFromCart = (id: string | number) => {
    const idx = items.value.findIndex((i) => i.id === id);
    if (idx !== -1) {
      items.value.splice(idx, 1);
    }
  };

  const updateQuantity = (id: string | number, delta: number) => {
    const item = items.value.find((i) => i.id === id);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        removeFromCart(id);
      }
    }
  };

  const cartCount = computed(() => {
    return items.value.reduce(
      (acc: number, item: CartItem) => acc + item.quantity,
      0
    );
  });

  const cartTotal = computed(() => {
    return items.value.reduce((acc: number, item: CartItem) => {
      // Clean price string (e.g. "$299.00" -> 299.00)
      const priceStr = String(item.price).replace(/[^0-9.]/g, "");
      const priceVal = parseFloat(priceStr) || 0;
      return acc + priceVal * item.quantity;
    }, 0);
  });

  const toggleDrawer = () => {
    isDrawerOpen.value = !isDrawerOpen.value;
  };

  return {
    items,
    isDrawerOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartCount,
    cartTotal,
    toggleDrawer,
  };
};

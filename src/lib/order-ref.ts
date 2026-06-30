/** Last 8 characters of the order id — used for guest order lookup. */
export function formatOrderRef(orderId: string) {
  return orderId.slice(-8).toUpperCase();
}

export function displayOrderRef(orderId: string) {
  return `#${formatOrderRef(orderId)}`;
}
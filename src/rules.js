const rules = {
  MIN_NET_PRICE: (rule, item) => {
    const netValue = item.product.dynamicPrice
      ? item.metadata.netValue
      : item.netValue;

    if (netValue < rule.payload) {
      return `Item ${item.id} net price must be at least ${rule.payload}`;
    }
  },
  MAX_QUANTITY: (rule, item) => {
    if (item.quantity > rule.payload) {
      return `Item ${item.id} max allowed quantity is ${rule.payload} but found ${item.quantity}`;
    }
  },
};

module.exports = rules;

const OrderDiscount = {
  name: "order-discount",
  action: {
    actionKey: "discounts",
    actionParameters: {
      discountType: "order"
    }
  }
};

const ItemDiscount = {
  name: "item-discount",
  action: {
    actionKey: "discounts",
    actionParameters: {
      discountType: "item"
    }
  }
};

const ShippingDiscount = {
  name: "shipping-discount",
  action: {
    actionKey: "discounts",
    actionParameters: {
      discountType: "shipping"
    }
  }
};

export default [OrderDiscount, ItemDiscount, ShippingDiscount];

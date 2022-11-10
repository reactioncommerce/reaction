const OrderDiscount = {
  name: "order-discount",
  action: {
    actionKey: "discount",
    actionParameters: {
      discountType: "order"
    }
  }
};

const ItemDiscount = {
  name: "item-discount",
  action: {
    actionKey: "discount",
    actionParameters: {
      discountType: "item"
    }
  }
};

const ShippingDiscount = {
  name: "shipping-discount",
  action: {
    actionKey: "discount",
    actionParameters: {
      discountType: "shipping"
    }
  }
};

export default [OrderDiscount, ItemDiscount, ShippingDiscount];

export default {
  name: "10 percent discount on orders over 100",
  conditions: {
    any: [{
      all: [{
        fact: "cart",
        path: "$.merchandiseTotal",
        operator: "greaterThan",
        value: 100
      }]
    }]
  },
  event: { // define the event to fire when the conditions evaluate truthy
    type: "applyDiscountPercentageToCart",
    params: {
      discountId: "62a1b24cc0f292462b955782"
    }
  }
};

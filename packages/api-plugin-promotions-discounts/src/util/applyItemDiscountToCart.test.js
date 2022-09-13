import { applyItemDiscountToCart } from "./applyDiscountToCart.js";

const fifteenPercentOffAllKayaks = {
  _id: "15PercentOffAllKayaks",
  label: "15 Percent Off All Kayaks",
  description: "15 Percent off all Kayaks",
  enabled: true,
  discountType: "item",
  discountValue: 15,
  discountCalculationType: "percentage",
  inclusionRules: {
    conditions: {
      any: [
        {
          fact: "item",
          path: "category",
          operator: "equal",
          value: "Kayaks"
        },
        {
          fact: "item",
          path: "class",
          operator: "contains",
          value: ["03-25-03-101-102", "03-25-03-101-103", "03-25-03-101-104", "03-25-03-101-105"]
        }
      ]
    },
    event: { // define the event to fire when the conditions evaluate truthy
      type: "applyDiscount"
    }
  }
};

const cart = {
  _id: "LBEmeFhN2JBi79gvn",
  accountId: null,
  anonymousAccessToken: "8lnrKAnBiu2Bba6Cw2ybdQM3jplaG824j0TZM/dcFzM=",
  currencyCode: "USD",
  items: [
    {
      _id: "3ufntJYuBPZupoNTD",
      attributes: [
        {
          label: "Size",
          value: "Red"
        }
      ],
      compareAtPrice: {
        amount: 22,
        currencyCode: "USD"
      },
      isTaxable: true,
      metafields: null,
      category: "Kayaks",
      optionTitle: "Red",
      parcel: null,
      price: {
        amount: 12,
        currencyCode: "USD"
      },
      priceWhenAdded: {
        amount: 12,
        currencyCode: "USD"
      },
      productId: "ESoEGHi6ts8oZCSvQ",
      productSlug: "stupid-product",
      productVendor: "Products Inc.",
      productType: "product-simple",
      productTagIds: null,
      quantity: 24,
      shopId: "9MYfksHT8wMs3xnkq",
      subtotal: {
        amount: 288,
        currencyCode: "USD"
      },
      taxCode: null,
      title: "Stupid Product",
      variantId: "onSRjBSMqZAwyQhK4",
      variantTitle: "Red Thing",
      discounts: []
    }
  ],
  shopId: "9MYfksHT8wMs3xnkq",
  workflow: {
    status: "new"
  },
  referenceId: "twpk7AeYEeo3KAsno",
  shipping: [
    {
      _id: "E2fXyepDStQHoEZMk",
      itemIds: [
        "3ufntJYuBPZupoNTD"
      ],
      shopId: "9MYfksHT8wMs3xnkq",
      type: "shipping"
    }
  ],
  discounts: [

  ],
  discount: 0,
  surcharges: [

  ],
  taxSummary: null
};

test("discount is applied when item meets inclusion rules", async () => {
  const context = { promotions: { operators: { } } };
  const results = await applyItemDiscountToCart(context, fifteenPercentOffAllKayaks, cart);
  const { discountedItems } = results;
  expect(discountedItems).toEqual(1);
  expect(discountedItems[0].productId).toEqual("ESoEGHi6ts8oZCSvQ");
});

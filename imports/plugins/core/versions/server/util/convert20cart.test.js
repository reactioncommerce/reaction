import { convertCart } from "./convert20";

const beforeCart = {
  _id: "6nWt7o6pWzXfdsS7A",
  accountId: null,
  anonymousAccessToken: "g2DgjyFt3yXulzlLFaJM296vZv9WYNvcya1zTlwqDA8=",
  billing: [
    {
      _id: "5EJqJfWe56Pmbh4qQ",
      address: {
        country: "US",
        fullName: "Big John",
        address1: "2110 Main Street",
        address2: "Suite 207",
        postal: "90405",
        city: "Santa Monica",
        region: "CA",
        phone: "5555555555",
        isShippingDefault: true,
        isBillingDefault: true,
        isCommercial: false,
        _id: "XgC7vnPhJK2S2Crzn",
        failedValidation: false
      },
      currency: {
        userCurrency: "USD"
      }
    }
  ],
  currencyCode: "USD",
  createdAt: new Date("2018-09-20T20:29:23.674+0000"),
  items: [
    {
      _id: "9QYm3oHAwGFPgowyA",
      attributes: [
        {
          label: null,
          value: "Silver frame"
        }
      ],
      isTaxable: false,
      optionTitle: "Untitled Option",
      parcel: {
        weight: 10,
        height: 10,
        width: 10,
        length: 10
      },
      priceWhenAdded: {
        amount: 119,
        currencyCode: "USD"
      },
      productId: "TXPc3HumuTv3KMqS5",
      productSlug: "classic-aviator-shades",
      productVendor: "Pilot, Inc.",
      productType: "product-simple",
      quantity: 1,
      shopId: "J8Bhq3uTtdgwZx3rz",
      taxCode: "0000",
      title: "Classic Aviator Shades",
      updatedAt: new Date("2018-09-20T20:29:23.667+0000"),
      variantId: "jwPJFv4ygy4o2H4zp",
      variantTitle: "Silver frame",
      addedAt: new Date("2018-09-20T20:29:23.667+0000"),
      createdAt: new Date("2018-09-20T20:29:23.667+0000")
    },
    {
      _id: "juqNCv6TreaWrNxgB",
      attributes: [
        {
          label: null,
          value: "Green & Red Leather Handbag"
        }
      ],
      isTaxable: false,
      optionTitle: "Untitled Option",
      parcel: {
        weight: 2,
        height: 2,
        width: 2,
        length: 2
      },
      priceWhenAdded: {
        amount: 299.99,
        currencyCode: "USD"
      },
      productId: "S3NLiQDxuhpGzLxkk",
      productSlug: "green-and-red-leather-handbag",
      productVendor: "Bags Bags Bags",
      productType: "product-simple",
      quantity: 1,
      shopId: "J8Bhq3uTtdgwZx3rz",
      taxCode: "0000",
      title: "Green & Red Leather Handbag",
      updatedAt: new Date("2018-09-20T20:29:30.523+0000"),
      variantId: "fdqkxaiLuSGTpWnFi",
      variantTitle: "Green & Red Leather Handbag",
      addedAt: new Date("2018-09-20T20:29:30.523+0000"),
      createdAt: new Date("2018-09-20T20:29:30.523+0000")
    }
  ],
  shopId: "J8Bhq3uTtdgwZx3rz",
  updatedAt: new Date("2018-09-20T20:29:30.634+0000"),
  workflow: {
    status: "new"
  },
  shipping: [
    {
      _id: "dJdgaGkP7ywveweSs",
      itemIds: [
        "9QYm3oHAwGFPgowyA",
        "juqNCv6TreaWrNxgB"
      ],
      shopId: "J8Bhq3uTtdgwZx3rz",
      type: "shipping"
    }
  ],
  discount: 0
};

const afterCart = {
  _id: "6nWt7o6pWzXfdsS7A",
  accountId: null,
  anonymousAccessToken: "g2DgjyFt3yXulzlLFaJM296vZv9WYNvcya1zTlwqDA8=",
  billing: [],
  billingAddress: {
    country: "US",
    fullName: "Big John",
    address1: "2110 Main Street",
    address2: "Suite 207",
    postal: "90405",
    city: "Santa Monica",
    region: "CA",
    phone: "5555555555",
    isShippingDefault: true,
    isBillingDefault: true,
    isCommercial: false,
    _id: "XgC7vnPhJK2S2Crzn",
    failedValidation: false
  },
  currencyCode: "USD",
  createdAt: new Date("2018-09-20T20:29:23.674+0000"),
  items: [
    {
      _id: "9QYm3oHAwGFPgowyA",
      attributes: [
        {
          label: null,
          value: "Silver frame"
        }
      ],
      isTaxable: false,
      optionTitle: "Untitled Option",
      parcel: {
        weight: 10,
        height: 10,
        width: 10,
        length: 10
      },
      priceWhenAdded: {
        amount: 119,
        currencyCode: "USD"
      },
      productId: "TXPc3HumuTv3KMqS5",
      productSlug: "classic-aviator-shades",
      productVendor: "Pilot, Inc.",
      productType: "product-simple",
      quantity: 1,
      shopId: "J8Bhq3uTtdgwZx3rz",
      taxCode: "0000",
      title: "Classic Aviator Shades",
      updatedAt: new Date("2018-09-20T20:29:23.667+0000"),
      variantId: "jwPJFv4ygy4o2H4zp",
      variantTitle: "Silver frame",
      addedAt: new Date("2018-09-20T20:29:23.667+0000"),
      createdAt: new Date("2018-09-20T20:29:23.667+0000")
    },
    {
      _id: "juqNCv6TreaWrNxgB",
      attributes: [
        {
          label: null,
          value: "Green & Red Leather Handbag"
        }
      ],
      isTaxable: false,
      optionTitle: "Untitled Option",
      parcel: {
        weight: 2,
        height: 2,
        width: 2,
        length: 2
      },
      priceWhenAdded: {
        amount: 299.99,
        currencyCode: "USD"
      },
      productId: "S3NLiQDxuhpGzLxkk",
      productSlug: "green-and-red-leather-handbag",
      productVendor: "Bags Bags Bags",
      productType: "product-simple",
      quantity: 1,
      shopId: "J8Bhq3uTtdgwZx3rz",
      taxCode: "0000",
      title: "Green & Red Leather Handbag",
      updatedAt: new Date("2018-09-20T20:29:30.523+0000"),
      variantId: "fdqkxaiLuSGTpWnFi",
      variantTitle: "Green & Red Leather Handbag",
      addedAt: new Date("2018-09-20T20:29:30.523+0000"),
      createdAt: new Date("2018-09-20T20:29:30.523+0000")
    }
  ],
  shopId: "J8Bhq3uTtdgwZx3rz",
  updatedAt: new Date("2018-09-20T20:29:30.634+0000"),
  workflow: {
    status: "new"
  },
  shipping: [
    {
      _id: "dJdgaGkP7ywveweSs",
      itemIds: [
        "9QYm3oHAwGFPgowyA",
        "juqNCv6TreaWrNxgB"
      ],
      shopId: "J8Bhq3uTtdgwZx3rz",
      type: "shipping"
    }
  ],
  discount: 0
};

test("converts a cart correctly", () => {
  const doc = convertCart(beforeCart);
  expect(doc).toEqual(afterCart);
});

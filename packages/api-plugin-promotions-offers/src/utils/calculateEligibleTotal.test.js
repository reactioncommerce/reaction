import calculateEligibleTotal, { getEligibleItems, removeIneligibleItems } from "./calculateEligibleTotal.js";

const context = {
  promotions: {
    enhancers: [],
    operators: []
  }
};

const inclusionRule = {
  conditions: {
    all: [
      {
        fact: "item",
        path: "$.brand",
        operator: "equal",
        value: "World of Things"
      }
    ]
  }
};
const exclusionRule = {
  conditions: {
    all: [
      {
        fact: "item",
        path: "$.class",
        operator: "equal",
        value: "Small Things"
      }
    ]
  }
};
const cart = {
  items: [
    {
      brand: "Acme",
      class: "Big Things",
      price: {
        amount: 10.00
      },
      quantity: 1
    },

    {
      brand: "World of Things",
      class: "Small Things",
      price: {
        amount: 12.00
      },
      quantity: 2
    },
    {
      brand: "World of Things",
      class: "Medium Things",
      price: {
        amount: 13.00
      },
      quantity: 3
    }
  ]
};

test("getEligibleItems only returns eligible items", async () => {
  const results = await getEligibleItems(context, cart, inclusionRule);
  expect(results.length).toEqual(2);
  expect(results[0].brand).toEqual("World of Things");
  expect(results[1].brand).toEqual("World of Things");
});

test("remnoveIneligibleItems removes ineligibleItems", async () => {
  const results = await removeIneligibleItems(context, cart.items, exclusionRule);
  expect(results.length).toEqual(2);
});


test("produces correct value when both inclusion and exclusion rules exist", async () => {
  const eligibleTotal = await calculateEligibleTotal(context, cart, inclusionRule, exclusionRule);
  expect(eligibleTotal).toEqual(39.00);
});

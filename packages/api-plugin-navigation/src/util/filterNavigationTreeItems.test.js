import filterNavigationTreeItems from "./filterNavigationTreeItems.js";

const mockNavigationTreeItems = [{
  isVisible: true,
  isPrivate: false,
  isSecondary: true,
  navigationItemId: 1000,
  items: [{
    isVisible: true,
    isPrivate: false,
    isSecondary: false,
    navigationItemId: 1001
  }, {
    isVisible: true,
    isPrivate: true,
    isSecondary: false,
    navigationItemId: 1002
  }, {
    isVisible: false,
    isPrivate: true,
    isSecondary: true,
    navigationItemId: 1003
  }]
}, {
  isVisible: true,
  isPrivate: false,
  isSecondary: false,
  navigationItemId: 2000
}, {
  isVisible: true,
  isPrivate: true,
  isSecondary: false,
  navigationItemId: 3000
}, {
  isVisible: false,
  isPrivate: false,
  isSecondary: true,
  navigationItemId: 4000
}];

test("filters navigation tree excluding secondary items", async () => {
  const results = filterNavigationTreeItems(mockNavigationTreeItems, {
    isAdmin: false,
    shouldIncludeSecondary: false
  });

  expect(results.length).toBe(1);
  expect(results[0].navigationItemId).toBe(2000);
});

test("filters navigation tree including secondary items", async () => {
  const results = filterNavigationTreeItems(mockNavigationTreeItems, {
    isAdmin: false,
    shouldIncludeSecondary: true
  });

  expect(results.length).toBe(2);
  expect(results[0].navigationItemId).toBe(1000);
  expect(results[0].items.length).toBe(1);
});

test("filters navigation tree including secondary and private items", async () => {
  const results = filterNavigationTreeItems(mockNavigationTreeItems, {
    isAdmin: true,
    shouldIncludeSecondary: true
  });

  expect(results.length).toBe(3);
  expect(results[0].navigationItemId).toBe(1000);
  expect(results[0].items.length).toBe(2);
});

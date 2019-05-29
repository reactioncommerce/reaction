import setDefaultsForNavigationTreeItems from "./setDefaultsForNavigationTreeItems";

const mockNavigationTreeItemsInput = [
  {
    navigationItemId: "cmVhY3Rpb24vbmF2aWdhdGlvbkl0ZW06dWFYWGF3YzVveHk5ZVI0aFA=",
    items: [
      {
        isPrivate: true,
        navigationItemId: "cmVhY3Rpb24vbmF2aWdhdGlvbkl0ZW06dEFLQVRRZXFvRDRBaDVnZzI="
      }
    ]
  },
  {
    isSecondary: true,
    isVisible: false,
    navigationItemId: "cmVhY3Rpb24vbmF2aWdhdGlvbkl0ZW06S0VjbjZOdnJSdXp0bVBNcTg="
  }
];

const mockNavigationTreeItemsResult = [
  {
    isPrivate: false,
    isSecondary: false,
    isVisible: true,
    navigationItemId: "cmVhY3Rpb24vbmF2aWdhdGlvbkl0ZW06dWFYWGF3YzVveHk5ZVI0aFA=",
    items: [
      {
        isPrivate: true,
        isSecondary: false,
        isVisible: true,
        navigationItemId: "cmVhY3Rpb24vbmF2aWdhdGlvbkl0ZW06dEFLQVRRZXFvRDRBaDVnZzI="
      }
    ]
  },
  {
    isPrivate: false,
    isSecondary: true,
    isVisible: false,
    navigationItemId: "cmVhY3Rpb24vbmF2aWdhdGlvbkl0ZW06S0VjbjZOdnJSdXp0bVBNcTg="
  }
];

const mockNavigationTreeItemsResult2 = [
  {
    isPrivate: false,
    isSecondary: false,
    isVisible: false,
    navigationItemId: "cmVhY3Rpb24vbmF2aWdhdGlvbkl0ZW06dWFYWGF3YzVveHk5ZVI0aFA=",
    items: [
      {
        isPrivate: true,
        isSecondary: false,
        isVisible: false,
        navigationItemId: "cmVhY3Rpb24vbmF2aWdhdGlvbkl0ZW06dEFLQVRRZXFvRDRBaDVnZzI="
      }
    ]
  },
  {
    isPrivate: false,
    isSecondary: true,
    isVisible: false,
    navigationItemId: "cmVhY3Rpb24vbmF2aWdhdGlvbkl0ZW06S0VjbjZOdnJSdXp0bVBNcTg="
  }
];

test("filters navigation tree excluding secondary items, with supplied defaults values", async () => {
  const defaultValues = {
    shouldNavigationTreeItemsBeAdminOnly: false,
    shouldNavigationTreeItemsBePublicallyVisible: true,
    shouldNavigationTreeItemsBeSecondaryNavOnly: false
  };

  const results = setDefaultsForNavigationTreeItems(mockNavigationTreeItemsInput, defaultValues);
  expect(results).toEqual(mockNavigationTreeItemsResult);
});

test("filters navigation tree excluding secondary items, without supplied default values", async () => {
  const results = setDefaultsForNavigationTreeItems(mockNavigationTreeItemsInput);
  expect(results).toEqual(mockNavigationTreeItemsResult2);
});

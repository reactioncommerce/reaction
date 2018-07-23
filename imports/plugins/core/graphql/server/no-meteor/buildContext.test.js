import mockContext from "/imports/test-utils/helpers/mockContext";
import buildContext from "./buildContext";

const fakeUser = {
  _id: "FAKE_BUILD_CONTEXT_USER_ID"
};

test("properly mutates the context object without user", async () => {
  const context = { collections: mockContext.collections };
  await buildContext(context, undefined);
  expect(context).toEqual({
    collections: mockContext.collections,
    mutations: {
      accounts: {
        addressBookAdd: jasmine.any(Function)
      },
      cart: {
        addCartItems: jasmine.any(Function),
        createCart: jasmine.any(Function)
      },
      catalog: {
        publishProducts: jasmine.any(Function)
      }
    },
    queries: {
      accounts: {
        group: jasmine.any(Function),
        groups: jasmine.any(Function),
        primaryShopId: jasmine.any(Function),
        roles: jasmine.any(Function),
        shopAdministrators: jasmine.any(Function),
        userAccount: jasmine.any(Function)
      },
      catalog: {
        catalogItemProduct: jasmine.any(Function),
        catalogItems: jasmine.any(Function),
        tag: jasmine.any(Function),
        tags: jasmine.any(Function),
        tagsByIds: jasmine.any(Function)
      },
      cart: {
        anonymousCartByCartId: jasmine.any(Function)
      },
      shops: {
        shopById: jasmine.any(Function)
      }
    },
    shopId: null,
    user: null,
    userHasPermission: jasmine.any(Function),
    userId: null
  });
});

test("properly mutates the context object with user", async () => {
  const mockAccount = { _id: "accountId", userId: fakeUser._id };
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(Promise.resolve(mockAccount));

  const context = { collections: mockContext.collections };
  await buildContext(context, fakeUser);
  expect(context).toEqual({
    account: mockAccount,
    accountId: mockAccount._id,
    collections: mockContext.collections,
    mutations: {
      accounts: {
        addressBookAdd: jasmine.any(Function)
      },
      cart: {
        addCartItems: jasmine.any(Function),
        createCart: jasmine.any(Function)
      },
      catalog: {
        publishProducts: jasmine.any(Function)
      }
    },
    queries: {
      accounts: {
        group: jasmine.any(Function),
        groups: jasmine.any(Function),
        primaryShopId: jasmine.any(Function),
        roles: jasmine.any(Function),
        shopAdministrators: jasmine.any(Function),
        userAccount: jasmine.any(Function)
      },
      catalog: {
        catalogItemProduct: jasmine.any(Function),
        catalogItems: jasmine.any(Function),
        tag: jasmine.any(Function),
        tags: jasmine.any(Function),
        tagsByIds: jasmine.any(Function)
      },
      cart: {
        anonymousCartByCartId: jasmine.any(Function)
      },
      shops: {
        shopById: jasmine.any(Function)
      }
    },
    shopId: null,
    user: fakeUser,
    userHasPermission: jasmine.any(Function),
    userId: fakeUser._id
  });

  // Make sure the hasPermission currying works with one arg
  const result1 = await context.userHasPermission(["foo"]);
  expect(result1).toBe(false);

  // Make sure the hasPermission currying works with two args
  const result2 = await context.userHasPermission(["foo"], "scope");
  expect(result2).toBe(false);
});

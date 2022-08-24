import Random from "@reactioncommerce/random";

const DEFAULT_NAME = "Main Navigation";

/**
 * @name createDefaultNavigationTreeForShop
 * @summary Creates a default navigation tree for a shop
 * @param {Object} context App context
 * @param {Object} shop Shop to create tree for
 * @returns {String} Navigation tree _id
 */
export default async function createDefaultNavigationTreeForShop(context, shop) {
  const { collections: { NavigationTrees, Shops } } = context;
  const { _id: shopId } = shop;

  // Create a couple example items
  const navigationItem = await context.mutations.createNavigationItem(context.getInternalContext(), {
    navigationItem: {
      draftData: {
        classNames: null,
        content: [
          {
            language: "en",
            value: "Example Navigation"
          }
        ],
        isUrlRelative: true,
        shouldOpenInNewWindow: false,
        url: "/"
      },
      shopId
    }
  });

  const navigationSubItem = await context.mutations.createNavigationItem(context.getInternalContext(), {
    navigationItem: {
      draftData: {
        classNames: null,
        content: [
          {
            language: "en",
            value: "Example Tag Page"
          }
        ],
        isUrlRelative: true,
        shouldOpenInNewWindow: false,
        url: "/tag/example-tag"
      },
      shopId
    }
  });

  const items = [
    {
      expanded: true,
      isPrivate: false,
      isSecondary: false,
      isVisible: true,
      items: [
        {
          isPrivate: false,
          isSecondary: false,
          isVisible: true,
          navigationItemId: navigationSubItem._id
        }
      ],
      navigationItemId: navigationItem._id
    }
  ];

  // Create the tree
  const navigationTreeId = Random.id();
  await NavigationTrees.insertOne({
    _id: navigationTreeId,
    draftItems: items,
    hasUnpublishedChanges: true,
    items,
    name: DEFAULT_NAME,
    shopId
  });

  await context.mutations.publishNavigationChanges(context.getInternalContext(), {
    navigationTreeId,
    shopId
  });

  await Shops.updateOne({ _id: shopId }, { $set: { defaultNavigationTreeId: navigationTreeId } });

  return navigationTreeId;
}

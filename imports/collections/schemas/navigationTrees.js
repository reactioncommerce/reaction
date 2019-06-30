import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";

const navigationItemId = {
  type: String,
  optional: true
};

const items = {
  type: Array,
  optional: true
};

const expanded = {
  type: Boolean,
  optional: true
};

const isPrivate = {
  label: "Admin access only",
  type: Boolean,
  defaultValue: false
};

const isSecondary = {
  label: "Secondary nav only",
  type: Boolean,
  defaultValue: false
};

const isVisible = {
  label: "Show in storefront",
  type: Boolean,
  defaultValue: false
};

const NavigationItem = {
  navigationItemId,
  expanded,
  isVisible,
  isPrivate,
  isSecondary,
  items
};

/**
 * @name NavigationTreeItem
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Represents a navigation item and its children in a tree
 * @property {String} navigationItemId The _id of the navigation item
 * @property {Array} items Child navigation items
 */
export const NavigationTreeItem = new SimpleSchema({
  ...NavigationItem,
  "items.$": {
    type: new SimpleSchema({
      ...NavigationItem,
      "items.$": {
        type: new SimpleSchema({
          ...NavigationItem,
          "items.$": {
            type: new SimpleSchema({
              ...NavigationItem,
              "items.$": {
                type: new SimpleSchema({
                  ...NavigationItem,
                  "items.$": {
                    type: new SimpleSchema({
                      ...NavigationItem,
                      "items.$": {
                        type: new SimpleSchema({
                          ...NavigationItem,
                          "items.$": {
                            type: new SimpleSchema({
                              ...NavigationItem,
                              "items.$": {
                                type: new SimpleSchema({
                                  ...NavigationItem,
                                  "items.$": {
                                    type: new SimpleSchema({
                                      ...NavigationItem,
                                      "items.$": {
                                        type: new SimpleSchema({
                                          navigationItemId,
                                          isVisible,
                                          isPrivate,
                                          isSecondary
                                        })
                                      }
                                    })
                                  }
                                })
                              }
                            })
                          }
                        })
                      }
                    })
                  }
                })
              }
            })
          }
        })
      }
    })
  }
});

/**
 * @name NavigationTree
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Represents a navigation tree containing multiple levels of navigation items
 * @property {String} _id Mongo _id of tree
 * @property {String} shopId The _id of the shop this navigation tree belongs to
 * @property {String} name The name of the tree, for operator display purposes. Assumed to be in the primary shop's
 *  language
 * @property {Array} items The published navigation items that make up this tree
 * @property {Array} draftItems The draft navigation items that make up this tree
 * @property {Boolean} hasUnpublishedChanges Whether the navigation item has unpublished changes
 */
export const NavigationTree = new SimpleSchema({
  "_id": {
    type: String,
    optional: true
  },
  "shopId": {
    type: String,
    optional: true
  },
  "name": {
    type: String,
    optional: true
  },
  "items": {
    type: Array,
    optional: true
  },
  "items.$": {
    type: NavigationTreeItem
  },
  "draftItems": {
    type: Array,
    optional: true
  },
  "draftItems.$": {
    type: NavigationTreeItem
  },
  "hasUnpublishedChanges": {
    type: Boolean,
    optional: true
  }
});

registerSchema("NavigationTree", NavigationTree);

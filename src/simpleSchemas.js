import SimpleSchema from "simpl-schema";

/**
 * @name NavigationItemContent
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary The translated content for a navigation item
 * @property {String} language The language of the piece of navigation content
 * @property {String} value The translated value, in plain text or markdown
 */
export const NavigationItemContent = new SimpleSchema({
  language: {
    type: String
  },
  value: {
    type: String
  }
});

/**
 * @name NavigationItemData Schema
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary The data for a navigation item
 * @property {String} classNames CSS class names to add to the navigation item for display
 * @property {Array} content The content for the navigation item, in one or more languages
 * @property {String} url The URL for the navigation item to link to
 * @property {Boolean} isUrlRelative Whether the provided URL is relative or external
 * @property {Boolean} shouldOpenInNewWindow Whether the navigation item should trigger a new tab/window to open
 *  when clicked
 */
export const NavigationItemData = new SimpleSchema({
  "classNames": {
    type: String,
    optional: true
  },
  "content": {
    type: Array,
    optional: true
  },
  "content.$": {
    type: NavigationItemContent
  },
  "url": {
    type: String,
    optional: true
  },
  "isUrlRelative": {
    type: Boolean,
    optional: true
  },
  "shouldOpenInNewWindow": {
    type: Boolean,
    optional: true
  }
});

/**
 * @name NavigationItem Schema
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary An item in a shop's navigation tree
 * @property {String} _id The Navigation Item _id
 * @property {String} shopId The ID of the shop the navigation item belongs to
 * @property {Object} data The published data for the navigation item
 * @property {Object} draftData The draft/unpublished data for the navigation item
 * @property {Object} metadata An object storing additional metadata about the navigation item
 *  (such as its related tag)
 * @property {Array} treeIds The _id's of trees the navigation item belongs to
 * @property {Date} createdAt Date/time the navigation item was created
 * @property {Boolean} hasUnpublishedChanges Whether the navigation item has unpublished changes
 */
export const NavigationItem = new SimpleSchema({
  "_id": {
    type: String,
    optional: true
  },
  "shopId": {
    type: String,
    optional: true
  },
  "data": {
    type: NavigationItemData,
    optional: true
  },
  "draftData": {
    type: NavigationItemData,
    optional: true
  },
  "metadata": {
    type: Object,
    blackbox: true,
    optional: true
  },
  "treeIds": {
    type: Array,
    optional: true
  },
  "treeIds.$": {
    type: String
  },
  "createdAt": {
    type: Date,
    optional: true
  },
  "hasUnpublishedChanges": {
    type: Boolean,
    optional: true
  }
});

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

const NavigationItemForTree = {
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
  ...NavigationItemForTree,
  "items.$": {
    type: new SimpleSchema({
      ...NavigationItemForTree,
      "items.$": {
        type: new SimpleSchema({
          ...NavigationItemForTree,
          "items.$": {
            type: new SimpleSchema({
              ...NavigationItemForTree,
              "items.$": {
                type: new SimpleSchema({
                  ...NavigationItemForTree,
                  "items.$": {
                    type: new SimpleSchema({
                      ...NavigationItemForTree,
                      "items.$": {
                        type: new SimpleSchema({
                          ...NavigationItemForTree,
                          "items.$": {
                            type: new SimpleSchema({
                              ...NavigationItemForTree,
                              "items.$": {
                                type: new SimpleSchema({
                                  ...NavigationItemForTree,
                                  "items.$": {
                                    type: new SimpleSchema({
                                      ...NavigationItemForTree,
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

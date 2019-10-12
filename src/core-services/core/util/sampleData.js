export default {
  products: [{
    _id: "BCTMZ6HTxFSppJESk",
    shopId: "J8Bhq3uTtdgwZx3rz",
    ancestors: [],
    createdAt: new Date("2014-04-03T13:46:52.411-0700"),
    description: "Sign in as administrator to edit.\nYou can clone this product" +
      " from the product grid.\nYou can upload images click or drag in image box on the left" +
      " here.\nTag this product below, and then add tag in navigation.\nClick the bookmark in" +
      " the tag to set product url.\nOption variants, price, quantity, and child variants are" +
      " created by clicking on the variant below, clone the variant to add more options.\nDetails" +
      " can be added below the image for more specific product information.\n Login next to the" +
      " cart, and then click the dashboard icon for more tools.",
    handle: "example-product",
    hashtags: [
      "cseCBSSrJ3t8HQSNP"
    ],
    price: {
      range: "12.99 - 19.99",
      min: 12.99,
      max: 19.99
    },
    isDeleted: false,
    isVisible: true,
    metafields: [{
      key: "Material",
      value: "Cotton"
    }, {
      key: "Quality",
      value: "Excellent"
    }],
    pageTitle: "This is a basic product. You can do a lot with it.",
    supportedFulfillmentTypes: ["shipping"],
    type: "simple",
    title: "Example Product",
    updatedAt: new Date("2014-06-01T12:17:13.949-0700"),
    vendor: "Example Manufacturer"
  }, {
    _id: "6qiqPwBkeJdtdQc4G",
    ancestors: [
      "BCTMZ6HTxFSppJESk"
    ],
    attributeLabel: "Size",
    title: "Example Product - Small",
    optionTitle: "Small",
    price: 19.99,
    isDeleted: false,
    isVisible: true,
    updatedAt: new Date("2014-04-03T13:46:52.411-0700"),
    createdAt: new Date("2014-04-03T13:46:52.411-0700"),
    weight: 35,
    metafields: [{
      key: null,
      value: null
    }],
    shopId: "J8Bhq3uTtdgwZx3rz",
    isTaxable: true,
    type: "variant"
  }, {
    _id: "SMr4rhDFnYvFMtDTX",
    ancestors: [
      "BCTMZ6HTxFSppJESk",
      "6qiqPwBkeJdtdQc4G"
    ],
    attributeLabel: "Color",
    title: "Example Product - Small - Red",
    optionTitle: "Red",
    price: 19.99,
    isDeleted: false,
    isVisible: true,
    updatedAt: new Date("2014-04-03T13:46:52.411-0700"),
    createdAt: new Date("2014-04-03T13:46:52.411-0700"),
    weight: 25,
    length: 10,
    height: 3,
    width: 10,
    metafields: [{
      key: null,
      value: null
    }],
    shopId: "J8Bhq3uTtdgwZx3rz",
    isTaxable: true,
    type: "variant"
  }, {
    _id: "CJoRBm9vRrorc9mxZ",
    ancestors: [
      "BCTMZ6HTxFSppJESk",
      "6qiqPwBkeJdtdQc4G"
    ],
    attributeLabel: "Color",
    title: "Example Product - Small - Green",
    optionTitle: "Green",
    price: 12.99,
    isDeleted: false,
    isVisible: true,
    updatedAt: new Date("2014-04-03T13:46:52.411-0700"),
    createdAt: new Date("2014-04-03T13:46:52.411-0700"),
    weight: 25,
    length: 10,
    height: 3,
    width: 10,
    metafields: [{
      key: null,
      value: null
    }],
    shopId: "J8Bhq3uTtdgwZx3rz",
    isTaxable: true,
    type: "variant"
  }],
  tags: [{
    _id: "cseCBSSrJ3t8HQSNP",
    createdAt: new Date("2014-04-12T08:17:20.576-0700"),
    displayTitle: "Example Tag Page",
    groups: [],
    isDeleted: false,
    isTopLevel: false,
    isVisible: true,
    name: "Example",
    shopId: "J8Bhq3uTtdgwZx3rz",
    slug: "example-tag",
    updatedAt: new Date("2014-04-12T08:17:20.576-0700")
  }],
  navigationItems: [
    {
      _id: "ZBnbCdLmxnX4h89iK",
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
      shopId: "J8Bhq3uTtdgwZx3rz",
      data: {
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
      metadata: {},
      createdAt: new Date("2019-06-19T15:59:17.146+0000"),
      hasUnpublishedChanges: false
    },
    {
      _id: "S4wwymL4GogRY835E",
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
      shopId: "J8Bhq3uTtdgwZx3rz",
      data: {
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
      metadata: {},
      createdAt: new Date("2019-06-19T16:00:19.603+0000"),
      hasUnpublishedChanges: false
    }
  ],
  navigationTrees: [
    {
      _id: "XyS5wksrr9gTQLN9i",
      draftItems: [
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
              navigationItemId: "S4wwymL4GogRY835E"
            }
          ],
          navigationItemId: "ZBnbCdLmxnX4h89iK"
        }
      ],
      hasUnpublishedChanges: false,
      items: [
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
              navigationItemId: "S4wwymL4GogRY835E"
            }
          ],
          navigationItemId: "ZBnbCdLmxnX4h89iK"
        }
      ],
      name: "Main Navigation",
      shopId: "J8Bhq3uTtdgwZx3rz"
    }
  ]
};

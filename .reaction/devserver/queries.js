function getFakeMongoCursor(collectionName, results) {
  const cursor = {
    clone: () => ({
      count: () => results.length
    }),
    cmd: {
      query: {}
    },
    filter: () => cursor,
    limit: () => cursor,
    ns: `meteor.${collectionName}`,
    options: {
      db: {
        collection: () => ({
          findOne: () => Promise.resolve(null)
        }),
        databaseName: "meteor"
      },
    },
    skip: () => cursor,
    sort: () => cursor,
    toArray() {
      return Promise.resolve(results)
    }
  };
  return cursor;
}

export default {
  shopAdministrators() {
    return Promise.resolve(getFakeMongoCursor("Accounts", [
      { _id: "a1", name: "Owner" },
      { _id: "b2", name: "Admin 1" },
      { _id: "c3", name: "Admin 2" }
    ]));
  },
  shopById(context, _id) {
    return {
      _id
    };
  },
  userAccount(context, _id) {
    return {
      _id,
      profile: {
        addressBook: [
          {
            _id: "ab55",
            address1: "Address 1",
            address2: "Address 2",
            city: "New York City",
            country: "United States",
            failedValidation: false,
            fullName: "Full Name",
            isBillingDefault: false,
            isCommercial: false,
            isShippingDefault: false,
            phone: "+15555555555",
            postal: "12345",
            region: "NY"
          }
        ],
      },
      name: "Fake Person"
    };
  },
  group(context, _id) {
    return {
      _id: "bc456",
      createdAt: new Date(),
      createdBy: "acc123",
      description: "",
      name: "shop_managers",
      permissions: ["owner", "admin", "createProduct"],
      shopId: "abc123",
      slug: "shop-managers",
      updatedAt: new Date()
    };
  },
  groups(context, shopId) {
    return Promise.resolve(getFakeMongoCursor("Groups", [
      {
        _id: "bc456",
        createdAt: new Date(),
        createdBy: "acc123",
        description: "",
        name: "shop_managers",
        permissions: ["owner", "admin", "createProduct"],
        shopId: "abc123",
        slug: "shop-managers",
        updatedAt: new Date()
      },
      {
        _id: "gh678",
        createdAt: new Date(),
        createdBy: "acc123",
        description: "",
        name: "special_customers",
        permissions: ["createProduct"],
        shopId: "abc123",
        slug: "special-customers",
        updatedAt: new Date()
      },
      {
        _id: "db7986",
        createdAt: new Date(),
        createdBy: "acc123",
        description: "",
        name: "brands",
        permissions: ["owner", "admin", "createProduct"],
        shopId: "bcfgghj6768",
        slug: "brands",
        updatedAt: new Date()
      }
    ]));
  }
};

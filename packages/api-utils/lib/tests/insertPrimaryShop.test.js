import insertPrimaryShop from "./insertPrimaryShop.js";
import mockContext from "./mockContext.js";

const expectedShopBase = {
  allowGuestCheckout: false,
  slug: "mockSlug",
  merchantShops: [{ _id: "mock_id", slug: "mockSlug", name: "mockName" }],
  shopType: "primary",
  active: true,
  status: "mockStatus",
  name: "Primary Shop",
  description: "mockDescription",
  keywords: "mockKeywords",
  addressBook: [
    {
      _id: "mock_id",
      fullName: "mockFullName",
      firstName: "mockFirstName",
      lastName: "mockLastName",
      address1: "mockAddress1",
      address2: "mockAddress2",
      addressName: "mockAddressName",
      city: "mockCity",
      company: "mockCompany",
      phone: "mockPhone",
      region: "mockRegion",
      postal: "mockPostal",
      country: "mockCountry",
      isCommercial: false,
      isBillingDefault: true,
      isShippingDefault: false,
      failedValidation: true,
      metafields: []
    }
  ],
  domains: ["mockDomains.$"],
  emails: [
    {
      provides: "mockProvides",
      address: "Deborah37@yahoo.com",
      verified: false
    }
  ],
  defaultPaymentMethod: "mockDefaultPaymentMethod",
  currency: "USD",
  currencies: {},
  locales: { continents: {}, countries: {} },
  language: "en",
  languages: [{ label: "mockLabel", i18n: "mockI18n", enabled: false }],
  public: "mockPublic",
  timezone: "mockTimezone",
  baseUOL: "mockBaseUOL",
  unitsOfLength: [
    {
      uol: "mockUnitsOfLength.$.uol",
      label: "mockUnitsOfLength.$.label",
      default: false
    }
  ],
  baseUOM: "mockBaseUOM",
  unitsOfMeasure: [
    {
      uom: "mockUnitsOfMeasure.$.uom",
      label: "mockUnitsOfMeasure.$.label",
      default: false
    }
  ],
  metafields: [
    {
      key: "mockKey",
      namespace: "mockNamespace",
      scope: "mockScope",
      value: "mockValue",
      valueType: "mockValueType",
      description: "mockDescription"
    }
  ],
  defaultSellerRoles: ["mockDefaultSellerRoles.$"],
  defaultParcelSize: { weight: 45053, height: 32953, length: 23919, width: 93407 },
  theme: { themeId: "mockThemeId", styles: "mockStyles" },
  brandAssets: [{ mediaId: "mockMediaId", type: "mockType" }],
  paymentMethods: [{}],
  availablePaymentMethods: ["mockAvailablePaymentMethods.$"],
  workflow: { status: "mockStatus", workflow: ["mockWorkflow.$"] },
  defaultNavigationTreeId: "mockDefaultNavigationTreeId",
  shopLogoUrls: { primaryShopLogoUrl: "mockPrimaryShopLogoUrl" },
  storefrontUrls: {
    storefrontHomeUrl: "mockStorefrontHomeUrl",
    storefrontLoginUrl: "mockStorefrontLoginUrl",
    storefrontOrderUrl: "mockStorefrontOrderUrl",
    storefrontOrdersUrl: "mockStorefrontOrdersUrl",
    storefrontAccountProfileUrl: "mockStorefrontAccountProfileUrl"
  },
  allowCustomUserLocale: true,
  orderStatusLabels: {}
};

test("inserts a primary shop with random string ID", async () => {
  const shopId = await insertPrimaryShop(mockContext);

  const expectedShop = {
    ...expectedShopBase,
    _id: jasmine.any(String),
    createdAt: jasmine.any(Date),
    updatedAt: jasmine.any(Date)
  };

  expect(shopId).toEqual(jasmine.any(String));
  expect(mockContext.collections.Shops.insertOne).toHaveBeenCalledWith(expectedShop);
  expect(mockContext.appEvents.emit).toHaveBeenCalledWith("afterShopCreate", {
    createdBy: null,
    shop: expectedShop
  });
});

test("accepts override values for shop fields, including _id, createdAt, and updatedAt", async () => {
  const overrides = {
    _id: "CUSTOM_ID",
    active: false,
    additionalField: "foo",
    createdAt: new Date(Date.now() - 300000),
    updatedAt: new Date()
  };

  const shopId = await insertPrimaryShop(mockContext, overrides);

  const expectedShop = {
    ...expectedShopBase,
    ...overrides
  };

  expect(shopId).toEqual("CUSTOM_ID");
  expect(mockContext.collections.Shops.insertOne).toHaveBeenCalledWith(expectedShop);
  expect(mockContext.appEvents.emit).toHaveBeenCalledWith("afterShopCreate", {
    createdBy: null,
    shop: expectedShop
  });
});

test("uses provided user ID when emitting", async () => {
  await insertPrimaryShop(mockContext, null, { userId: "USER" });

  const expectedShop = {
    ...expectedShopBase,
    _id: jasmine.any(String),
    createdAt: jasmine.any(Date),
    updatedAt: jasmine.any(Date)
  };

  expect(mockContext.appEvents.emit).toHaveBeenCalledWith("afterShopCreate", {
    createdBy: "USER",
    shop: expectedShop
  });
});

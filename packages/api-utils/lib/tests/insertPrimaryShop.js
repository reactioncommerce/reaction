import Random from "@reactioncommerce/random";

const mockShop = {
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

/**
 * @name insertPrimaryShop
 * @summary Inserts a primary shop with mock data for use in integration tests
 * @param {Object} context App context
 * @param {Object} [shopData] Optional shop data to override the defaults
 * @param {Object} [options] Other info
 * @param {String} [options.userId=null] User ID to use as `createdBy`
 * @returns {Object} fake cursor
 */
export default async function insertPrimaryShop(context, shopData, options = {}) {
  const { appEvents, collections } = context;

  const newId = (shopData && shopData._id) || Random.id();
  const createdAt = new Date();

  const primaryShop = {
    ...mockShop,
    createdAt,
    updatedAt: createdAt,
    ...(shopData || {}),
    _id: newId,
    shopType: "primary"
  };

  await collections.Shops.insertOne(primaryShop);

  await appEvents.emit("afterShopCreate", {
    createdBy: options.userId || null,
    shop: primaryShop
  });

  return newId;
}

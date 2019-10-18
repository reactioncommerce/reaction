export const defaultCustomerRoles = [
  "account/profile",
  "cart/completed",
  "guest",
  "index",
  "product",
  "tag"
];

export const defaultVisitorRoles = [
  "anonymous",
  "cart/completed",
  "guest",
  "index",
  "product",
  "tag"
];

export const defaultShopManagerRoles = [
  ...defaultCustomerRoles,
  "createProduct",
  "dashboard",
  "media/create",
  "media/update",
  "media/delete",
  "product/admin",
  "shopSettings"
];

export const defaultOwnerRoles = [
  ...defaultShopManagerRoles,
  "owner"
];

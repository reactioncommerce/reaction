export const defaultCustomerRoles = [
  "account/profile",
  "cart/completed",
  "guest",
  "index",
  "product", // not sure what this one is
  "tag", // not sure what this one is
  "reaction:legacy:products/read", // should this go here?
  "reaction:legacy:tags/read"
];

export const defaultVisitorRoles = [
  "anonymous",
  "cart/completed",
  "guest",
  "index",
  "product", // not sure what this one is
  "tag", // not sure what this one is
  "reaction:legacy:products/read", // should this go here?
  "reaction:legacy:tags/read"
];

export const defaultShopManagerRoles = [
  ...defaultCustomerRoles,
  "createProduct",
  "dashboard",
  "media/create",
  "media/update",
  "media/delete",
  "product/admin",
  "shopSettings",
  "reaction:legacy:accounts/add:address-books",
  "reaction:legacy:accounts/add:emails",
  "reaction:legacy:accounts/create",
  "reaction:legacy:accounts/delete:emails",
  "reaction:legacy:accounts/invite:group",
  "reaction:legacy:accounts/read",
  "reaction:legacy:accounts/read:admin-accounts",
  "reaction:legacy:accounts/remove:address-books",
  "reaction:legacy:accounts/update:address-books",
  "reaction:legacy:accounts/update:currency",
  "reaction:legacy:accounts/update:language",
  "reaction:legacy:addressValidationRules/create", // TODO(pod-auth): figure out why this was "admin" only
  "reaction:legacy:addressValidationRules/delete", // TODO(pod-auth): figure out why this was "admin" only
  "reaction:legacy:addressValidationRules/read", // TODO(pod-auth): figure out why this was "admin" only
  "reaction:legacy:addressValidationRules/update", // TODO(pod-auth): figure out why this was "admin" only
  "reaction:legacy:emails/send",
  "reaction:legacy:media/update",
  "reaction:legacy:mediaRecords/create:media",
  "reaction:legacy:mediaRecords/delete:media",
  "reaction:legacy:mediaRecords/update:media",
  "reaction:legacy:orders/approve:payment",
  "reaction:legacy:orders/cancel:item",
  "reaction:legacy:orders/capture:payment",
  "reaction:legacy:orders/move:item",
  "reaction:legacy:orders/read",
  "reaction:legacy:orders/refund:payment",
  "reaction:legacy:orders/update",
  "reaction:products:products/archive",
  "reaction:products:products/clone",
  "reaction:products:products/create",
  "reaction:legacy:products/publish",
  "reaction:legacy:products/read",
  "reaction:legacy:products/update",
  "reaction:legacy:shops/read", // TODO(pod-auth): this was owner / admin only, might not belong as shopManager
  "reaction:legacy:shops/update", // TODO(pod-auth): this was owner / admin only, might not belong as shopManager
  "reaction:legacy:tags/create",
  "reaction:legacy:tags/delete",
  "reaction:legacy:tags/read",
  "reaction:legacy:tags/update",
  "reaction:legacy:taxes/read"
];

export const defaultOwnerRoles = [
  ...defaultShopManagerRoles,
  "owner",
  "reaction:legacy:shops/owner"
];

export const otherRolesThatDidntSeemToFit = [
  "reaction:legacy:shops/create"
];

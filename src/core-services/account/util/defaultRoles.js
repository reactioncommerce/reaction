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
  "reaction:legacy:carts:/update",
  "reaction:legacy:discounts/create", // TODO(pod-auth): this was owner / admin only
  "reaction:legacy:discounts/delete", // TODO(pod-auth): this was owner / admin only
  "reaction:legacy:discounts/read", // TODO(pod-auth): this was owner / admin only
  "reaction:legacy:discounts/update", // TODO(pod-auth): this was owner / admin only
  "reaction:legacy:email-templates/read",
  "reaction:legacy:email-templates/update",
  "reaction:legacy:emails/read",
  "reaction:legacy:emails/send",
  "reaction:legacy:fulfillment/read", // TODO(pod-auth): figure out why this was "admin" only
  "reaction:legacy:inventory/read", // TODO(pod-auth): figure out why this was "admin" only
  "reaction:legacy:inventory/update", // TODO(pod-auth): figure out why this was "admin" only
  "reaction:legacy:media/update",
  "reaction:legacy:mediaRecords/create:media",
  "reaction:legacy:mediaRecords/delete:media",
  "reaction:legacy:mediaRecords/update:media",
  "reaction:legacy:navigationTreeItems/create",
  "reaction:legacy:navigationTreeItems/delete",
  "reaction:legacy:navigationTreeItems/publish",
  "reaction:legacy:navigationTreeItems/read",
  "reaction:legacy:navigationTreeItems/update",
  "reaction:legacy:navigationTrees/update",
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
  "reaction:legacy:products/update:prices",
  "reaction:legacy:shippingMethods/create",
  "reaction:legacy:shippingMethods/delete",
  "reaction:legacy:shippingMethods/read",
  "reaction:legacy:shippingMethods/update",
  "reaction:legacy:shippingRestrictions/create",
  "reaction:legacy:shippingRestrictions/delete",
  "reaction:legacy:shippingRestrictions/read",
  "reaction:legacy:shippingRestrictions/update",
  "reaction:legacy:shops/read", // TODO(pod-auth): this was owner / admin only, might not belong as shopManager
  "reaction:legacy:shops/update", // TODO(pod-auth): this was owner / admin only, might not belong as shopManager
  "reaction:legacy:surcharges/create",
  "reaction:legacy:surcharges/delete",
  "reaction:legacy:surcharges/update",
  "reaction:legacy:tags/create",
  "reaction:legacy:tags/delete",
  "reaction:legacy:tags/read",
  "reaction:legacy:tags/update",
  "reaction:legacy:taxes/read",
  "reaction:legacy:taxRates/create", // TODO(pod-auth): this was owner / admin only
  "reaction:legacy:taxRates/delete", // TODO(pod-auth): this was owner / admin only
  "reaction:legacy:taxRates/read", // TODO(pod-auth): this was owner / admin only
  "reaction:legacy:taxRates/update" // TODO(pod-auth): this was owner / admin only
];

export const defaultOwnerRoles = [
  ...defaultShopManagerRoles,
  "owner",
  "reaction:legacy:shops/owner"
];

export const otherRolesThatDidntSeemToFit = [
  "reaction:legacy:shops/create"
];

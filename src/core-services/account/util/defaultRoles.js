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
  "reaction:legacy:addressValidationRules/create",
  "reaction:legacy:addressValidationRules/delete",
  "reaction:legacy:addressValidationRules/read",
  "reaction:legacy:addressValidationRules/update",
  "reaction:legacy:carts:/update",
  "reaction:legacy:discounts/create",
  "reaction:legacy:discounts/delete",
  "reaction:legacy:discounts/read",
  "reaction:legacy:discounts/update",
  "reaction:legacy:email-templates/read",
  "reaction:legacy:email-templates/update",
  "reaction:legacy:emails/read",
  "reaction:legacy:emails/send",
  "reaction:legacy:fulfillment/read",
  "reaction:legacy:groups/create",
  "reaction:legacy:groups/delete",
  "reaction:legacy:groups/manage:accounts",
  "reaction:legacy:groups/read",
  "reaction:legacy:groups/update",
  "reaction:legacy:inventory/read",
  "reaction:legacy:inventory/update",
  "reaction:legacy:inventory/update:settings",
  "reaction:legacy:media/update",
  "reaction:legacy:mediaRecords/create:media",
  "reaction:legacy:mediaRecords/delete:media",
  "reaction:legacy:mediaRecords/update:media",
  "reaction:legacy:navigationTreeItems/create",
  "reaction:legacy:navigationTreeItems/delete",
  "reaction:legacy:navigationTreeItems/publish",
  "reaction:legacy:navigationTreeItems/read",
  "reaction:legacy:navigationTreeItems/update",
  "reaction:legacy:navigationTreeItems/update:settings",
  "reaction:legacy:navigationTrees/update",
  "reaction:legacy:navigationTrees-drafts/read", // TODO(pod-auth): revisit how draft is done
  "reaction:legacy:orders/approve:payment",
  "reaction:legacy:orders/cancel:item",
  "reaction:legacy:orders/capture:payment",
  "reaction:legacy:orders/move:item",
  "reaction:legacy:orders/read",
  "reaction:legacy:orders/refund:payment",
  "reaction:legacy:orders/update",
  "reaction:legacy:products/archive",
  "reaction:legacy:products/clone",
  "reaction:legacy:products/create",
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
  "reaction:legacy:shipping-rates/update:settings",
  "reaction:legacy:sitemaps/update:settings",
  "reaction:legacy:shops/read",
  "reaction:legacy:shops/update",
  "reaction:legacy:surcharges/create",
  "reaction:legacy:surcharges/delete",
  "reaction:legacy:surcharges/update",
  "reaction:legacy:tags/create",
  "reaction:legacy:tags/delete",
  "reaction:legacy:tags/read",
  "reaction:legacy:tags/update",
  "reaction:legacy:tags-inactive/read", // TODO(pod-auth): revisit how inactive is done
  "reaction:legacy:taxes/read",
  "reaction:legacy:taxes/update:settings",
  "reaction:legacy:taxRates/create",
  "reaction:legacy:taxRates/delete",
  "reaction:legacy:taxRates/read",
  "reaction:legacy:taxRates/update"
];

export const defaultOwnerRoles = [
  ...defaultShopManagerRoles,
  "owner",
  "reaction:legacy:shops/owner"
];

export const otherRolesThatDidntSeemToFit = [
  "reaction:legacy:shops/create"
];

/* eslint-disable no-await-in-loop */
import _ from "lodash";
import Random from "@reactioncommerce/random";

/**
 * @summary Performs migration up from previous data version
 * @param {Object} context Migration context
 * @param {Object} context.db MongoDB `Db` instance
 * @param {Function} context.progress A function to report progress, takes percent
 *   number as argument.
 * @return {undefined}
 */
async function up({ db, progress }) {
  const legacyShopPermissions = [
    "account/invite",
    "core",
    "create-product",
    "createProduct",
    "dashboard",
    "discounts/apply",
    "media/create",
    "media/delete",
    "media/update",
    "orders",
    "order/fulfillment",
    "order/view",
    "product/admin",
    "product/archive",
    "product/clone",
    "product/create",
    "product/publish",
    "product/update",
    "reaction-accounts",
    "reaction-email",
    "reaction-templates",
    "shipping",
    "shops/create",
    "tags",
    "tags/admin",
    "tags/edit",
    "taxes/read",
    "taxes/write",
    "owner",
    "admin"
  ];

  const legacyShopPermissionMap = {
    "core": [
      "reaction:legacy:navigationTrees/update",
      "reaction:legacy:navigationTreeItems/create",
      "reaction:legacy:navigationTreeItems/delete",
      "reaction:legacy:navigationTreeItems/publish",
      "reaction:legacy:navigationTreeItems/read",
      "reaction:legacy:navigationTreeItems/update"
    ],
    "create-product": [
      "reaction:legacy:navigationTrees-drafts/read"
    ],
    "createProduct": [
      "reaction:legacy:products/update:prices",
      "reaction:legacy:products/read",
      "reaction:legacy:products/update",
      "reaction:legacy:products/create",
      "reaction:legacy:products/clone",
      "reaction:legacy:products/publish",
      "reaction:legacy:products/archive",
      "reaction:legacy:products/admin"
    ],
    "dashboard": [
      "reaction:legacy:emails/read"
    ],
    "discounts/apply": [
      "reaction:legacy:carts:/update"
    ],
    "media/create": [
      "reaction:legacy:mediaRecords/create:media"
    ],
    "media/delete": [
      "reaction:legacy:mediaRecords/delete:media"
    ],
    "media/update": [
      "reaction:legacy:media/update",
      "reaction:legacy:mediaRecords/update:media"
    ],
    "orders": [
      "reaction:legacy:orders/capture:payment",
      "reaction:legacy:orders/approve:payment",
      "reaction:legacy:orders/read",
      "reaction:legacy:orders/refund:payment",
      "reaction:legacy:orders/cancel:item",
      "reaction:legacy:orders/update",
      "reaction:legacy:orders/move:item"
    ],
    "order/fulfillment": [
      "reaction:legacy:orders/capture:payment",
      "reaction:legacy:orders/approve:payment",
      "reaction:legacy:orders/read",
      "reaction:legacy:orders/refund:payment",
      "reaction:legacy:orders/cancel:item",
      "reaction:legacy:orders/update",
      "reaction:legacy:orders/move:item"
    ],
    "order/view": [
      "reaction:legacy:orders/read"
    ],
    "product/admin": [
      "reaction:legacy:products/update:prices",
      "reaction:legacy:products/read",
      "reaction:legacy:products/update",
      "reaction:legacy:products/create",
      "reaction:legacy:products/clone",
      "reaction:legacy:products/archive",
      "reaction:legacy:products/publish"
    ],
    "product/archive": [
      "reaction:legacy:products/archive"
    ],
    "product/clone": [
      "reaction:legacy:products/clone"
    ],
    "product/create": [
      "reaction:legacy:products/create"
    ],
    "product/publish": [
      "reaction:legacy:products/publish"
    ],
    "product/update": [
      "reaction:legacy:products/update:prices",
      "reaction:legacy:products/update"
    ],
    "reaction-email": [
      "reaction:legacy:emails/send"
    ],
    "reaction-templates": [
      "reaction:legacy:email-templates/update"
    ],
    "shipping": [
      "reaction:legacy:surcharges/delete",
      "reaction:legacy:surcharges/update",
      "reaction:legacy:surcharges/create",
      "reaction:legacy:shippingRestrictions/read",
      "reaction:legacy:shippingMethods/read",
      "reaction:legacy:shippingRestrictions/update",
      "reaction:legacy:shippingMethods/update",
      "reaction:legacy:shippingMethods/create",
      "reaction:legacy:shippingMethods/delete",
      "reaction:legacy:shippingRestrictions/create"
    ],
    "tags": [
      "reaction:legacy:tags-inactive/read"
    ],
    "tags/admin": [
      "reaction:legacy:tags/read", "reaction:legacy:tags/update"
    ],
    "tags/edit": [
      "reaction:legacy:tags/read", "reaction:legacy:tags/update"
    ],
    "taxes/read": [
      "reaction:legacy:taxes/read"
    ],
    "taxes/write": [
      "reaction:legacy:taxes/read"
    ],
    "owner": ["reaction:legacy:navigationTrees-drafts/read",
      "reaction:legacy:tags-inactive/read",
      "reaction:legacy:taxRates/create",
      "reaction:legacy:taxRates/delete",
      "reaction:legacy:taxRates/read",
      "reaction:legacy:taxRates/update",
      "reaction:legacy:surcharges/delete",
      "reaction:legacy:surcharges/update",
      "reaction:legacy:surcharges/create",
      "reaction:legacy:shippingRestrictions/read",
      "reaction:legacy:shippingMethods/read",
      "reaction:legacy:shippingRestrictions/update",
      "reaction:legacy:shippingMethods/update",
      "reaction:legacy:shippingMethods/delete",
      "reaction:legacy:shippingRestrictions/create",
      "reaction:legacy:shippingRestrictions/delete",
      "reaction:legacy:shippingMethods/create",
      "reaction:legacy:email-templates/read",
      "reaction:legacy:email-templates/update",
      "reaction:legacy:emails/read",
      "reaction:legacy:accounts/update:emails",
      "reaction:legacy:discounts/read",
      "reaction:legacy:discounts/update",
      "reaction:legacy:discounts/delete",
      "reaction:legacy:discounts/create",
      "reaction:legacy:carts:/update",
      "reaction:legacy:products/read",
      "reaction:legacy:tags/read",
      "reaction:legacy:tags/update",
      "reaction:legacy:tags/delete",
      "reaction:legacy:tags/create",
      "reaction:legacy:taxes/read",
      "reaction:legacy:shops/read",
      "reaction:legacy:shops/update",
      "reaction:legacy:shops/owner"
    ],
    "admin": ["reaction:legacy:navigationTrees-drafts/read",
      "reaction:legacy:tags-inactive/read",
      "reaction:legacy:taxRates/create",
      "reaction:legacy:taxRates/delete",
      "reaction:legacy:taxRates/read",
      "reaction:legacy:taxRates/update",
      "reaction:legacy:surcharges/delete",
      "reaction:legacy:surcharges/update",
      "reaction:legacy:surcharges/create",
      "reaction:legacy:inventory/read",
      "reaction:legacy:inventory/update",
      "reaction:legacy:fulfillment/read",
      "reaction:legacy:shippingRestrictions/read",
      "reaction:legacy:shippingMethods/read",
      "reaction:legacy:shippingRestrictions/update",
      "reaction:legacy:shippingMethods/update",
      "reaction:legacy:shippingMethods/delete",
      "reaction:legacy:shippingRestrictions/create",
      "reaction:legacy:shippingRestrictions/delete",
      "reaction:legacy:shippingMethods/create",
      "reaction:legacy:navigationTreeItems/create",
      "reaction:legacy:email-templates/read",
      "reaction:legacy:email-templates/update",
      "reaction:legacy:emails/read",
      "reaction:legacy:accounts/update:emails",
      "reaction:legacy:discounts/read",
      "reaction:legacy:discounts/update",
      "reaction:legacy:discounts/delete",
      "reaction:legacy:discounts/create",
      "reaction:legacy:carts:/update",
      "reaction:legacy:products/read",
      "reaction:legacy:tags/read",
      "reaction:legacy:tags/update",
      "reaction:legacy:tags/delete",
      "reaction:legacy:tags/create",
      "reaction:legacy:taxes/read",
      "reaction:legacy:shops/read",
      "reaction:legacy:shops/update",
      "reaction:legacy:addressValidationRules/create",
      "reaction:legacy:addressValidationRules/delete",
      "reaction:legacy:addressValidationRules/update",
      "reaction:legacy:addressValidationRules/read"
    ]
  };

  // get all groups
  const groups = await db.collection("Groups").find({}).toArray();

  if (groups && Array.isArray(groups)) {
    // loop over each group
    for (let index = 0; index < groups.length; index += 1) {
      const group = groups[index];
      const newPermissions = group.permissions;
      // loop over all permissions in a group, find legacy permissions, and update them to the new permissions
      group.permissions.forEach((permission) => {
        // if permission is in list of legacy, then update with new ones
        if (legacyShopPermissions.includes(permission)) {
          const mappedPermissionsToAdd = legacyShopPermissionMap[permission];
          newPermissions.push(mappedPermissionsToAdd);
        }
      });

      // flatten array
      const flattenedPermissions = _.flattenDeep(newPermissions);

      // remove duplicates from list
      // many legacy permissions have the same new permissions on them, we don't need duplicates
      const uniqueNewPermissions = _.uniq(flattenedPermissions);

      // filter legacy permissions from list
      const finalPermissions = uniqueNewPermissions.filter((permission) => !legacyShopPermissions.includes(permission) && permission !== null);

      // update Groups collection with new permissions
      await db.collection("Groups").updateOne({
        _id: group._id
      }, {
        $set: {
          permissions: finalPermissions
        }
      });

      progress(Math.floor((((index + 1) / groups.length) / 2) * 100));
    }
  }

  // check to see if new `accounts-manager` and `system-manager` groups exist
  // create them if they don't
  const newGroups = [];
  let accountsManagerGroupId;
  let systemManagerGroupId;
  if (!groups.find((group) => group.slug === "accounts-manager")) {
    accountsManagerGroupId = Random.id();
    const currentDate = Date();
    newGroups.push({
      _id: accountsManagerGroupId,
      createdAt: currentDate,
      updatedAt: currentDate,
      name: "accounts manager",
      slug: "accounts-manager",
      permissions: [
        "reaction:legacy:accounts/invite:group",
        "reaction:legacy:accounts/add:emails",
        "reaction:legacy:accounts/add:address-books",
        "reaction:legacy:accounts/create",
        "reaction:legacy:accounts/delete:emails",
        "reaction:legacy:accounts/read",
        "reaction:legacy:accounts/remove:address-books",
        "reaction:legacy:accounts/update:address-books",
        "reaction:legacy:accounts/update:currency",
        "reaction:legacy:accounts/update:language",
        "reaction:legacy:accounts/read:admin-accounts"
      ],
      shopId: null
    });
  }

  if (!groups.find((group) => group.slug === "system-manager")) {
    systemManagerGroupId = Random.id();
    const currentDate = Date();
    newGroups.push({
      _id: systemManagerGroupId,
      createdAt: currentDate,
      updatedAt: currentDate,
      name: "system manager",
      slug: "system-manager",
      permissions: [
        "reaction:legacy:accounts/invite:group",
        "reaction:legacy:accounts/add:emails",
        "reaction:legacy:accounts/add:address-books",
        "reaction:legacy:accounts/create",
        "reaction:legacy:accounts/delete:emails",
        "reaction:legacy:accounts/read",
        "reaction:legacy:accounts/remove:address-books",
        "reaction:legacy:accounts/update:address-books",
        "reaction:legacy:accounts/update:currency",
        "reaction:legacy:accounts/update:language",
        "reaction:legacy:accounts/read:admin-accounts",
        "reaction:legacy:shops/create"
      ],
      shopId: null
    });
  }

  if (newGroups.length) {
    await db.collection("Groups").insertMany(newGroups);

    // if we created the new groups, we need to update users who previously held `owner` and `admin` roles
    // to be a part of the new groups
    // 1. find all accounts that are NOT in the `customer` group, this will return only admins
    const customerGroup = groups.find((group) => group.slug === "customer") || {};
    const accounts = await db.collection("Accounts").find({ groups: { $nin: [customerGroup._id] } }).toArray();

    // 2. find each user, and see their admin status
    for (let index = 0; index < accounts.length; index += 1) {
      const account = accounts[index];
      const accountGroups = account.groups;
      const user = await db.collection("users").findOne({ _id: account.userId });
      if (!user || !user.roles) return;

      // if user was global "owner", make them part of the `system-manager` group
      // else if user was global "admin", make them part of the `accounts-manager` group
      // else if user was `owner` or `admin` of the primary shop, make them part of the `accounts-manager` group
      if (user.roles.__global_roles__ && user.roles.__global_roles__.includes("owner") && systemManagerGroupId) {
        accountGroups.push(systemManagerGroupId);
      } else if (user.roles.__global_roles__ && user.roles.__global_roles__.includes("admin") && accountsManagerGroupId) {
        accountGroups.push(accountsManagerGroupId);
      } else if (accountsManagerGroupId) {
        const primaryShop = db.collection("Shops").findOne({ shopType: "primary" });
        if (user.roles[primaryShop._id] && user.roles[primaryShop._id].find((perm) => ["admin", "owner"].includes(perm))) {
          accountGroups.push(accountsManagerGroupId);
        }
      }

      await db.collection("Accounts").updateOne(
        { _id: account._id },
        {
          $set: {
            groups: accountGroups
          }
        }
      );

      progress(Math.floor((((index + 1) / accounts.length) / 2) * 100) + 50);
    }
  } else {
    progress(100);
  }
}

export default {
  down: "impossible",
  up
};

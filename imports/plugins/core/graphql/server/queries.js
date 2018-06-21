import { shopAdministratorsQuery } from "/imports/plugins/core/accounts/server/methods/shopAdministratorsQuery";
import { userAccountQuery } from "/imports/plugins/core/accounts/server/methods/userAccountQuery";
import { groupQuery, groupsQuery } from "/imports/plugins/core/accounts/server/methods/groupQuery";
import { rolesQuery } from "/imports/plugins/core/accounts/server/methods/rolesQuery";
import catalogItems from "/imports/plugins/core/catalog/server/no-meteor/queries/catalogItems";
import catalogItemProduct from "/imports/plugins/core/catalog/server/no-meteor/queries/catalogItemProduct";
import tag from "/imports/plugins/core/catalog/server/no-meteor/queries/tag";
import tags from "/imports/plugins/core/catalog/server/no-meteor/queries/tags";
import tagsByIds from "/imports/plugins/core/catalog/server/no-meteor/queries/tagsByIds";
import getShopIdByDomain from "/imports/plugins/core/accounts/server/no-meteor/getShopIdByDomain";

export default {
  catalogItems,
  catalogItemProduct,
  group: groupQuery,
  groups: groupsQuery,
  primaryShopId: getShopIdByDomain,
  roles: rolesQuery,
  shopAdministrators: shopAdministratorsQuery,
  shopById: (context, _id) => context.collections.Shops.findOne({ _id }),
  tag,
  tags,
  tagsByIds,
  userAccount: userAccountQuery
};

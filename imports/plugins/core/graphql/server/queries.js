import { shopAdministratorsQuery } from "/imports/plugins/core/accounts/server/methods/shopAdministratorsQuery";
import { userAccountQuery } from "/imports/plugins/core/accounts/server/methods/userAccountQuery";
import { groupQuery, groupsQuery } from "/imports/plugins/core/accounts/server/methods/groupQuery";
import { rolesQuery } from "/imports/plugins/core/accounts/server/methods/rolesQuery";
import tags from "/imports/plugins/core/catalog/server/queries/tags";
import tagsByIds from "/imports/plugins/core/catalog/server/queries/tagsByIds";

export default {
  group: groupQuery,
  groups: groupsQuery,
  roles: rolesQuery,
  shopAdministrators: shopAdministratorsQuery,
  shopById: (context, _id) => context.collections.Shops.findOne({ _id }),
  tags,
  tagsByIds,
  userAccount: userAccountQuery
};

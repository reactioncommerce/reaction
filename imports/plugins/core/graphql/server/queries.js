import { shopAdministratorsQuery } from "/imports/plugins/core/accounts/server/methods/shopAdministratorsQuery";
import { userAccountQuery } from "/imports/plugins/core/accounts/server/methods/userAccountQuery";
import { groupQuery, groupsQuery } from "/imports/plugins/core/accounts/server/methods/groupQuery";
import { rolesQuery } from "/imports/plugins/core/accounts/server/methods/rolesQuery";

export default {
  group: groupQuery,
  groups: groupsQuery,
  roles: rolesQuery,
  shopAdministrators: shopAdministratorsQuery,
  shopById(context, _id) {
    return {
      _id
    };
  },
  userAccount: userAccountQuery
};

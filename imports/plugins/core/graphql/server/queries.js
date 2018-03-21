import { shopAdministratorsQuery } from "/imports/plugins/core/accounts/server/methods/shopAdministratorsQuery";
import { userAccountQuery } from "/imports/plugins/core/accounts/server/methods/userAccountQuery";
import { groupQuery, groupsQuery } from "/imports/plugins/core/accounts/server/methods/groupQuery";

export default {
  group: groupQuery,
  groups: groupsQuery,
  shopAdministrators: shopAdministratorsQuery,
  shopById(context, _id) {
    return {
      _id
    };
  },
  userAccount: userAccountQuery
};

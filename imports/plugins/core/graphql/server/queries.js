import { shopAdministratorsQuery } from "/imports/plugins/core/accounts/server/methods/shopAdministratorsQuery";
import { userAccountQuery } from "/imports/plugins/core/accounts/server/methods/userAccountQuery";
import { rolesQuery } from "/imports/plugins/core/accounts/server/methods/rolesQuery";

export default {
  roles: rolesQuery,
  shopAdministrators: shopAdministratorsQuery,
  shopById(context, _id) {
    return {
      _id
    };
  },
  userAccount: userAccountQuery
};

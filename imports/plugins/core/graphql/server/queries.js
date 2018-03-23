import { shopAdministratorsQuery } from "/imports/plugins/core/accounts/server/methods/shopAdministratorsQuery";
import { userAccountQuery } from "/imports/plugins/core/accounts/server/methods/userAccountQuery";

export default {
  shopAdministrators: shopAdministratorsQuery,
  shopById(context, _id) {
    return {
      _id
    };
  },
  userAccount: userAccountQuery
};

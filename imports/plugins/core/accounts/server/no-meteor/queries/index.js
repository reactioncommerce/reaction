import getShopIdByDomain from "../getShopIdByDomain";
import group from "./group";
import groups from "./groups";
import roles from "./roles";
import shopAdministrators from "./shopAdministrators";
import userAccount from "./userAccount";

export default {
  group,
  groups,
  primaryShopId: getShopIdByDomain,
  roles,
  shopAdministrators,
  userAccount
};

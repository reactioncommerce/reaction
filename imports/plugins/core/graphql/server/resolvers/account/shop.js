import { xformShopResponse } from "../xforms/shop";

/**
 * @name shop
 * @method
 * @summary query the Accounts collection and return user account data
 * @param {Object} account - an object containing account data
 * @return {Object} object containing transformed shop data
 */
export default function shop(account) {
  const { shopId } = account;
  if (!shopId) return null;

  const result = {
    _id: shopId
  };

  return xformShopResponse(result);
}

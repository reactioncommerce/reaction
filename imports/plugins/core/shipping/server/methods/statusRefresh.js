import { check } from "meteor/check";

/**
 * @name shipping/status/refresh
 * @method
 * @memberof Shipping/Methods
 * @todo This is a stub for future core processing
 * @summary Blank method. Serves as a place for Method Hooks,
 * in other shipping packages, like Shippo
 * @param  {String} orderId order ID
 * @return {String}         order ID
 */
export default function statusRefresh(orderId) {
  check(orderId, String);
  // this is a stub for future core processing
  // it also serves as a place for Method Hooks
  // in other shipping packages, like Shippo
  return orderId;
}

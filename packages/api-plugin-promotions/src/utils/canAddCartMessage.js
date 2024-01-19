import _ from "lodash";

/**
 * @summary check if a cart message can be added to the cart
 * @param {Object} cart - The cart to check
 * @param {Object} promotion - The promotion to check
 * @returns {Boolean} - True if the cart message can be added
 */
export default function canAddToCartMessages(cart, promotion) {
  if (_.find(cart.messages, { metaFields: { promotionId: promotion._id } })) return false;
  if (promotion.triggerType === "explicit") return true;
  return _.find(cart.appliedPromotions || [], { _id: promotion._id }) !== undefined;
}

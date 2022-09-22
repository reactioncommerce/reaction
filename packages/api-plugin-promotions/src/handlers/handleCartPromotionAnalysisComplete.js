import _ from "lodash";

/**
 * @summary handle promotions were applied to see if any promotions need to be removed
 * @param {Object} context - The application context
 * @param {Object} cart - The cart
 * @param {Array<Object>} qualifiedPromotions - An array of the qualified promotions
 * @param {String} triggerType - The trigger type
 * @return {Promise<Object>} - The updated cart
 */
export default async function handleCartPromotionsAnalysisComplete(context, { cart, qualifiedPromotions, triggerType = "offers" }) {
  const { appEvents } = context;
  // perform analysis of what changed and write our promotion history record
  if (!cart.appliedPromotions && qualifiedPromotions.length) {
    const addedPromotions = [];
    const removedPromotions = [];
    qualifiedPromotions.forEach((promotion) => {
      addedPromotions.push(promotion);
    });
    const historyRecord = {
      updatedAt: new Date(),
      promotionsAdded: addedPromotions,
      promotionsRemoved: removedPromotions
    };
    cart.promotionHistory = [historyRecord];
    context.mutations.saveCart(context, cart, "promotions");
    return cart;
  }
  const currentState = cart.appliedPromotions || [];
  const currentTriggerState = currentState.filter((state) => state.triggers.filter((trigger) => trigger.triggerKey === triggerType));
  const addedPromotions = _.differenceBy(qualifiedPromotions, currentTriggerState, "_id");
  const removedPromotions = _.differenceBy(currentTriggerState, qualifiedPromotions, "_id");
  if (addedPromotions.length) {
    appEvents.emit("promotionsAddedToCart", { cart, addedPromotions, triggerType });
  }

  if (removedPromotions.length) {
    appEvents.emit("promotionsRemovedFromCart", { cart, removedPromotions, triggerType });
  }
  // write the history record
  const historyRecord = {
    updatedAt: new Date(),
    promotionsAdded: addedPromotions,
    promotionsRemoved: removedPromotions
  };
  // remove no-longer-applicable promotions
  if (cart.appliedPromotions && cart.appliedPromotions.length) {
    const appliedPromotions = cart.appliedPromotions.filter((promotion) => removedPromotions.map((rp) => rp.id).includes(promotion._id));
    cart.appliedPromotions = appliedPromotions;
  } else {
    cart.appliedPromotions = [];
  }
  if (!cart.promotionHistory) cart.promotionHistory = [];
  if (addedPromotions.length) {
    cart.appliedPromotions.push(...addedPromotions);
  }
  if (historyRecord.promotionsAdded.length || historyRecord.promotionsRemoved.length) {
    cart.promotionHistory.push(historyRecord);
  }

  context.mutations.saveCart(context, cart, "promotions");
  return cart;
}

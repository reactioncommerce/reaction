function calculatePreviousState(cart) {
  let currentState = [];
  if (!cart.promotionHistory) return currentState;
  cart.promotionHistory.forEach((history) => {
    // add the ones added and then filter out the removed ones
    currentState.push(...history.promotionsAdded);
    history.promotionsRemoved.forEach((promotionRemoved) => {
      currentState = currentState.filter((state) => state._id !== promotionRemoved._id);
    });
  });
  return currentState;
}

function calculateRemovedPromotions(currentTriggerState, qualifiedPromotions) {
  const currentTriggerStateIdMap = currentTriggerState.map((state) => state._id);
  const qualifiedPromotionsIdMap = qualifiedPromotions.map((state) => state._id);
  const removed = currentTriggerStateIdMap.filter((promotion) => !qualifiedPromotionsIdMap.includes(promotion));
  // map back to the full promotion record
  const removedPromotions = removed.map((rmId) => currentTriggerState.find((state) => state._id === rmId));
  return removedPromotions;
}


export default async function handleCartPromotionsAnalysisComplete(context, { cart, qualifiedPromotions, triggerType = "offers" }) {
  const { appEvents } = context;
  // perform analysis of what changed and write our promotion history record
  if (!cart.promotionHistory && qualifiedPromotions.length) {
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
  }
  const currentState = calculatePreviousState(cart);
  const currentTriggerState = currentState.filter((state) => {
    return state.triggers.filter((trigger) => {
      return trigger.triggerKey === triggerType;
    });
  });
  const addedPromotions = qualifiedPromotions.filter((promotion) => {
    const existingPromotion = currentTriggerState.filter((state) => promotion._id === state._id);
    return !existingPromotion;
  });
  if (addedPromotions.length) {
    appEvents.emit("promotionsAddedToCart", { cart, addedPromotions, triggerType });
  }


  const removedPromotions = calculateRemovedPromotions(currentTriggerState, qualifiedPromotions);
  if (removedPromotions.length) {
    appEvents.emit("promotionsRemovedFromCart", { cart, removedPromotions, triggerType });
  }
}

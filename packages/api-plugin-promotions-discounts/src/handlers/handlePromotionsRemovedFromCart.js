export default async function handlePromotionsRemovedFromCart(context, { cart, removedPromotions }) {
  const discountPromotions = removedPromotions.filter((promotion) => promotion.actions.some((action) => action.actionKey === "applyDiscountToCart"));
  const discountIds = [];
  discountPromotions.forEach((promotion) => {
    promotion.actions.forEach((action) => {
      discountIds.push(action.actionParameters.discountId);
    });
  });
  cart.discounts = cart.discounts.filter((discount) => !discountIds.includes(discount._id));
  context.mutations.saveCart(context, cart, "promotions");
  // TODO: Do this for item and shipping discounts
}

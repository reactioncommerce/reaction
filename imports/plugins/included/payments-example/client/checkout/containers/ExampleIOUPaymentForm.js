import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Reaction, Router } from "/client/api";
import { unstoreAnonymousCart } from "/imports/plugins/core/cart/client/util/anonymousCarts";
import getCart from "/imports/plugins/core/cart/client/util/getCart";
import buildOrderInputFromCart from "/imports/plugins/core/cart/client/util/buildOrderInputFromCart";
import simpleGraphQLClient from "/imports/plugins/core/graphql/lib/helpers/simpleClient";
import ExampleIOUPaymentForm from "../components/ExampleIOUPaymentForm";

/**
 * @summary Builds a submit handler function
 * @param {Object} billingAddress Address to be sent with placeOrder mutation
 * @param {String} billingAddressId Address ID to be sent with placeOrder mutation
 * @param {Object} cart Cart document
 * @param {String} [cartToken] Token for anonymous carts
 * @returns {Function} onSubmit function
 */
function getSubmitHandler(billingAddress, billingAddressId, cart, cartToken) {
  return async function placeOrderWithExampleIOUPayment(paymentData) {
    // Build the order input
    const order = await buildOrderInputFromCart(cart);

    // Build the payment input
    const payments = [{
      billingAddress,
      data: paymentData,
      method: "iou_example"
    }];

    await simpleGraphQLClient.mutations.placeOrder({ input: { order, payments } });

    // If there wasn't an error, the cart has been deleted.
    if (cartToken) {
      unstoreAnonymousCart(cart._id);
    }

    Router.go("cart/completed", {}, {
      _id: cart._id
    });
  };
}

/**
 * @summary ExampleIOUPaymentForm composer
 * @param {Object} props Passed in props
 * @param {Function} onData Call this with more props
 * @returns {undefined}
 */
function composer(props, onData) {
  const { cart, token } = getCart();
  if (!cart || !Reaction.Subscriptions.Packages.ready()) return;

  const { billingAddress: cartBillingAddress } = cart;
  const billingAddress = {
    address1: cartBillingAddress.address1,
    address2: cartBillingAddress.address2,
    city: cartBillingAddress.city,
    country: cartBillingAddress.country,
    fullName: cartBillingAddress.fullName,
    isCommercial: cartBillingAddress.isCommercial,
    phone: cartBillingAddress.phone,
    postal: cartBillingAddress.postal,
    region: cartBillingAddress.region
  };
  const billingAddressId = cartBillingAddress._id;

  onData(null, {
    onSubmit: getSubmitHandler(billingAddress, billingAddressId, cart, token)
  });
}

registerComponent("ExampleIOUPaymentForm", ExampleIOUPaymentForm, [
  composeWithTracker(composer)
]);

export default composeWithTracker(composer)(ExampleIOUPaymentForm);

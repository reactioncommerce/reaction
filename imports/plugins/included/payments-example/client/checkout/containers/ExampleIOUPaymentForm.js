import { compose } from "recompose";
import { composeWithTracker, registerComponent, withTracking } from "@reactioncommerce/reaction-components";
import { Reaction, Router } from "/client/api";
import { unstoreAnonymousCart } from "/imports/plugins/core/cart/client/util/anonymousCarts";
import getCart from "/imports/plugins/core/cart/client/util/getCart";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import buildOrderInputFromCart from "/imports/plugins/core/cart/client/util/buildOrderInputFromCart";
import simpleGraphQLClient from "/imports/plugins/core/graphql/lib/helpers/simpleClient";
import trackOrder from "/imports/plugins/core/ui/client/tracking/trackOrder";
import ExampleIOUPaymentForm from "../components/ExampleIOUPaymentForm";

/**
 * @summary Builds a submit handler function
 * @param {Object} props React props
 * @param {Object} billingAddress Address to be sent with placeOrder mutation
 * @param {String} billingAddressId Address ID to be sent with placeOrder mutation
 * @param {Object} cart Cart document
 * @param {String} [cartToken] Token for anonymous carts
 * @returns {Function} onSubmit function
 */
function getSubmitHandler(props, billingAddress, billingAddressId, cart, cartToken) {
  return async function placeOrderWithExampleIOUPayment(paymentData) {
    // Build the order input
    const order = await buildOrderInputFromCart(cart);

    // Build the payment input
    const [opaqueBillingAddressId] = await getOpaqueIds([{ namespace: "Address", id: billingAddressId }]);
    const payment = {
      billingAddress,
      billingAddressId: opaqueBillingAddressId,
      ...paymentData
    };

    const result = await simpleGraphQLClient.mutations.placeOrderWithExampleIOUPayment({ input: { order, payment } });

    // If there wasn't an error, the cart has been deleted.
    if (cartToken) {
      unstoreAnonymousCart(cart._id);
    }

    // Get new order id from mutation result
    const { placeOrderWithExampleIOUPayment: { orders } } = result;

    // Track Segment event
    trackOrder(props.tracking, orders[0]);

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
    onSubmit: getSubmitHandler(props, billingAddress, billingAddressId, cart, token)
  });
}

registerComponent("ExampleIOUPaymentForm", ExampleIOUPaymentForm, [
  withTracking,
  composeWithTracker(composer)
]);

export default compose(
  withTracking,
  composeWithTracker(composer)
)(ExampleIOUPaymentForm);

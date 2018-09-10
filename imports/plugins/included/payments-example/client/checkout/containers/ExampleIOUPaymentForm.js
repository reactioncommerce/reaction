import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Reaction, Router } from "/client/api";
import { Accounts } from "/lib/collections";
import { unstoreAnonymousCart } from "/imports/plugins/core/cart/client/util/anonymousCarts";
import getCart from "/imports/plugins/core/cart/client/util/getCart";
import simpleGraphQLClient from "/imports/plugins/core/graphql/lib/helpers/simpleClient";
import ExampleIOUPaymentForm from "../components/ExampleIOUPaymentForm";

/**
 * @summary Get opaque IDs for GraphQL calls
 * @param {Object[]} methodInput Argument to pass to "getOpaqueIdFromInternalId" Meteor method
 * @returns {String[]} Array of opaque IDs in the same order as `methodInput` array
 */
function getOpaqueIds(methodInput) {
  return new Promise((resolve, reject) => {
    Meteor.call("getOpaqueIdFromInternalId", methodInput, (error, opaqueIds) => {
      if (error) {
        reject(error);
      } else {
        resolve(opaqueIds);
      }
    });
  });
}

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
    const [
      opaqueBillingAddressId,
      opaqueCartId,
      opaqueCartShopId
    ] = await getOpaqueIds([
      { namespace: "Address", id: billingAddressId },
      { namespace: "Cart", id: cart._id },
      { namespace: "Shop", id: cart.shopId }
    ]);

    const fulfillmentGroups = await Promise.all(cart.shipping.map(async (group) => {
      const items = cart.items.filter((cartItem) => group.itemIds.indexOf(cartItem._id) !== -1);
      const itemProductIds = items.map((item) => ({ namespace: "Product", id: item.productId }));
      const itemVariantIds = items.map((item) => ({ namespace: "Product", id: item.variantId }));

      const [
        opaqueGroupShopId,
        selectedFulfillmentMethodId,
        ...itemOpaqueProductIds
      ] = await getOpaqueIds([
        { namespace: "Shop", id: group.shopId },
        { namespace: "FulfillmentMethod", id: group.shipmentMethod._id },
        ...itemProductIds
      ]);

      const itemOpaqueVariantIds = await getOpaqueIds(itemVariantIds);

      let totalPrice = 0;
      const finalItems = items.map((item, index) => {
        totalPrice += (item.subtotal + (item.tax || 0));
        return {
          addedAt: item.addedAt,
          price: item.priceWhenAdded.amount,
          productConfiguration: {
            productId: itemOpaqueProductIds[index],
            productVariantId: itemOpaqueVariantIds[index]
          },
          quantity: item.quantity
        };
      });

      totalPrice += ((group.shipmentMethod.rate || 0) + (group.shipmentMethod.handling || 0));

      const shippingAddress = {
        address1: group.address.address1,
        address2: group.address.address2,
        city: group.address.city,
        country: group.address.country,
        fullName: group.address.fullName,
        isCommercial: group.address.isCommercial,
        phone: group.address.phone,
        postal: group.address.postal,
        region: group.address.region
      };

      return {
        data: {
          shippingAddress
        },
        items: finalItems,
        selectedFulfillmentMethodId,
        shopId: opaqueGroupShopId,
        totalPrice,
        type: group.type
      };
    }));

    let { email } = cart;
    if (!email) {
      const customerAccount = Accounts.findOne({ _id: cart.accountId });
      if (customerAccount) {
        const defaultEmail = (customerAccount.emails || []).find((emailRecord) => emailRecord.provides === "default");
        if (defaultEmail) {
          email = defaultEmail.address;
        }
      }
    }

    await simpleGraphQLClient.mutations.placeOrderWithExampleIOUPayment({
      input: {
        order: {
          cartId: opaqueCartId,
          currencyCode: cart.currencyCode,
          email,
          fulfillmentGroups,
          shopId: opaqueCartShopId
        },
        payment: {
          billingAddress,
          billingAddressId: opaqueBillingAddressId,
          ...paymentData
        }
      }
    });

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

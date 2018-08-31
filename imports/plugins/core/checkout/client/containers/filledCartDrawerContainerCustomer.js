import { compose, withProps } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { $ } from "meteor/jquery";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import { getPrimaryMediaForOrderItem, ReactionProduct } from "/lib/api";
import { Reaction } from "/client/api";
import withUpdateCartItemsQuantity from "/imports/plugins/core/graphql/lib/hocs/withUpdateCartItemsQuantity";
import FilledCartDrawer from "../components/filledCartDrawer";

// event handlers to pass in as props
const handlers = {
  handleImage(item) {
  return (item && item.imageURLs) ? item.imageURLs.small : null;
    // const media = getPrimaryMediaForOrderItem(item);
    // return media && media.url({ store: "small" });
  },

  handleShowProduct(productItem) {
    if (productItem) {
      Reaction.Router.go("product", {
        handle: productItem.productSlug,
        variantId: productItem.productConfiguration.productVariantId
      });

      ReactionProduct.setCurrentVariant(productItem.variantId);
    }
  },

  pdpPath(productItem) {
    if (productItem) {
      const handle = productItem.productSlug || (productItem.productConfiguration && productItem.productConfiguration.productId);
      return Reaction.Router.pathFor("product", {
        hash: {
          handle,
          variantId: productItem.variantId
        }
      });
    }
    return "";
  },

  handleCheckout() {
    document.querySelector("#cart-drawer-container").classList.remove("opened");
    Session.set("displayCart", false);
    return Reaction.Router.go("cart/checkout");
  }
};

/**
 * @name composer
 * @private
 * @summary Subscribes to images for products in cart & passes cart products to CartDrawer
 * @param {Object} props - React props
 * @param {Function} onData - Function to call when data is ready
 * @returns {undefined}
 */
function composer(props, onData) {
  const { cartItems, cartId } = props;
  if (!cartItems) return;

  Meteor.subscribe("CartImages", cartId);


  const handleRemoveItem = (event, item) => {
    event.stopPropagation();
    event.preventDefault();
    const cartItemElement = $(event.target).closest(".cart-drawer-swiper-slide");

    cartItemElement.fadeOut(500,
      () => props.updateCartItemsQuantity(
        {
          variables: {
            input: {
              cartId: props.cartId,
              items: [
                {
                  cartItemId: item._id,
                  quantity: 0
                }
              ]
            }
          }
        }
      ));
  }

  const productItems = cartItems;
  onData(null, {
    productItems,
    handleRemoveItem,
    ...props
  });
}

// register the containers
registerComponent("FilledCartDrawerCustomer", FilledCartDrawer, [
  withUpdateCartItemsQuantity,
  withProps(handlers),
  composeWithTracker(composer)
]);

export default compose(
  withUpdateCartItemsQuantity,
  withProps(handlers),
  composeWithTracker(composer)
)(FilledCartDrawer);

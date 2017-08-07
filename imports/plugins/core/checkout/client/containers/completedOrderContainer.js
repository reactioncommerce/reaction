import { compose, withProps } from "recompose";
import PropTypes from "prop-types";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Orders } from "/lib/collections";
import { Reaction } from "/client/api";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import CompletedOrder from "../components/completedOrder";


const handlers = {};

function composer(props, onData) {
  const orderSub = Meteor.subscribe("Orders");

  if (orderSub.ready()) {
    const order = Orders.findOne({
      userId: Meteor.userId(),
      cartId: Reaction.Router.getQueryParam("_id")
    });

    const itemsByShop = _.sortBy(order.items, function (o) { return o.shopID; });
    console.log("itemsByShop", itemsByShop);
    onData(null, {
      order,
      items: itemsByShop
    });
  }

}

CompletedOrder.propTypes  = {
  items: PropTypes.array,
  order: PropTypes.object
};

registerComponent("CompletedOrder", CompletedOrder, [
  withProps(handlers),
  composeWithTracker(composer)
]);

export default compose(
  withProps(handlers),
  composeWithTracker(composer)
)(CompletedOrder);

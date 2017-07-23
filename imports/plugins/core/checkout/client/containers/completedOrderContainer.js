import { compose, withProps } from "recompose";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { Orders } from "/lib/collections";
import { Reaction } from "/client/api";
import { composeWithTracker } from "/lib/api/compose";
import CompletedOrder from "../components/completedOrder";


const handlers = {};

function composer(props, onData) {
  const order = Orders.findOne({
    userId: Meteor.userId(),
    cartId: Reaction.Router.getQueryParam("_id")
  });

  onData(null, {
    order
  });
}

CompletedOrder.propTypes  = {
  order: PropTypes.object
};

export default compose(
  withProps(handlers),
  composeWithTracker(composer)
)(CompletedOrder);

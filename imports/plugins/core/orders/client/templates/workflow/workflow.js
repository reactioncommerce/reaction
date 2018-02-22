import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { Orders } from "/lib/collections";

/**
 * coreOrderWorkflowHelpers
 */
Template.coreOrderWorkflow.helpers({
  /**
   * orderFulfillmentData
   * @summary Creates an Object with order id and a fulfillment object
   * @param  {String} orderId - An order id
   * @param  {Object} fulfillment - An order fulfillment. e.g. a shipment
   * @return {Object} An object witht the order id and fulfillment
   */
  orderFulfillmentData(orderId, fulfillment) {
    return {
      orderId,
      fulfillment
    };
  },

  /**
   * baseOrder
   * @todo may be unnecessary
   * @return {Object} contents of Template.currentData(), non-reactive
   */
  baseOrder() {
    return Template.currentData();
  },

  /**
   * order
   * @return {Object|Boolean} An order or false
   */
  order() {
    const id = this.order ? this.order._id : Reaction.Router.getQueryParam("_id");
    if (id) {
      return Orders.findOne(id);
    }
    return false;
  },

  /**
   * fulfillmentNumber
   * @param  {Number} index - A number
   * @return {Number} index + 1
   */
  fulfillmentNumber(index) {
    return index + 1;
  },

  /**
   * isCompleted
   * @todo may need to be refactored
   * @return {String|Boolean} order completion status or false
   */
  isCompleted() {
    const order = Template.parentData(1);
    if (this.status === true) {
      return order.workflow.status;
    }
    return false;
  },

  /**
   * isPending
   * @todo may need to be refactored
   * @return {String|Boolean} status or false
   */
  isPending() {
    if (this.status === this.template) {
      return this.status;
    }
    return false;
  }
});

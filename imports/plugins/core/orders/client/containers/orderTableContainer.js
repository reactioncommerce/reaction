import React, { Component } from "react";
import { compose } from "recompose";
import { Meteor } from "meteor/meteor";
import { Reaction, i18next } from "/client/api";
import { getPrimaryMediaForOrderItem } from "/lib/api";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { getShippingInfo } from "../helpers";
import {
  PACKAGE_NAME,
  ORDER_LIST_FILTERS_PREFERENCE_NAME,
  ORDER_LIST_SELECTED_ORDER_PREFERENCE_NAME,
  shippingStates
} from "../../lib/constants";
import OrderTable from "../components/orderTable";

const shippingStrings = ["picked", "packed", "labeled", "shipped"];

const wrapComponent = (Comp) => (
  class OrderTableContainer extends Component {
    constructor(props) {
      super(props);
      this.state = {
        selectedItems: [],
        multipleSelect: false,
        // TODO: model this with the assumption that there may be different stages to workflows
        shipping: {
          picked: false,
          packed: false,
          labeled: false,
          shipped: false
        },
        renderFlowList: false,
        // TODO: model this with the assumption that there may be different stages to workflows
        isLoading: {
          picked: false,
          packed: false,
          labeled: false,
          shipped: false,
          capturePayment: false
        },
        ready: false
      };
    }
    toggleShippingFlowList = () => {
      this.setState({
        renderFlowList: !this.state.renderFlowList
      });
      this.setListItemsToDefault();
    }

    setListItemsToDefault() {
      if (this.state.renderFlowList === false) {
        shippingStrings.forEach((value) => {
          this.setState({
            shipping: {
              [value]: false
            }
          });
        });
      }
    }

    handleSelect = (event, isInputChecked, name) => {
      this.setState({
        multipleSelect: false,
        renderFlowList: false
      });
      shippingStrings.forEach((value) => {
        this.setState({
          shipping: {
            [value]: false
          }
        });
      });
      const selectedItemsArray = this.state.selectedItems;

      if (!selectedItemsArray.includes(name)) {
        selectedItemsArray.push(name);
        this.setState({
          selectedItems: selectedItemsArray
        });
      } else {
        const updatedSelectedArray = selectedItemsArray.filter((id) => id !== name);
        this.setState({
          selectedItems: updatedSelectedArray
        });
      }
    }

    selectAllOrders = (orders, areAllSelected) => {
      this.setState({
        renderFlowList: false
      });
      shippingStrings.forEach((string) => {
        this.setState({
          shipping: {
            [string]: false
          }
        });
      });
      if (areAllSelected) {
        // if all orders are selected, clear the selectedItems array
        // and set multipleSelect to false
        this.setState({
          selectedItems: [],
          multipleSelect: false
        });
      } else {
        // if there are no selected orders, or if there are some orders that have been
        // selected but not all of them, loop through the orders array and return a
        // new array with order ids only, then set the selectedItems array with the orderIds
        const orderIds = orders.map((order) => order._id);
        this.setState({
          selectedItems: orderIds,
          multipleSelect: true
        });
      }
    }

    handleClick = (order, startWorkflow = false) => {
      Reaction.setActionViewDetail({
        label: "Order Details",
        i18nKeyLabel: "orderWorkflow.orderDetails",
        data: {
          order
        },
        props: {
          size: "large"
        },
        template: "coreOrderWorkflow"
      });

      if (startWorkflow === true) {
        Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", order);
        Reaction.setUserPreferences(PACKAGE_NAME, ORDER_LIST_FILTERS_PREFERENCE_NAME, "processing");
      }

      /* TODO:
      a) What other routes have a query parameter of _id=XXXXXXX ?
      b) What exactly are we using the order dashboard for? If it's search,
       well, clicking a search result doesn't CURRENTLY do anything. What's
       more, there's some debate as to whether that SHOULD link to anywhere.
       And if it should, why not the existing, modal orders panel?
      */
      Reaction.setUserPreferences(PACKAGE_NAME, ORDER_LIST_SELECTED_ORDER_PREFERENCE_NAME, order._id);
    }

    /**
     * updateBulkStatusHelper
     *
     * @summary return formatted shipping object to update state
     * @param {String} status - the shipping status to be set
     * @return {Object} the formatted shipping object
     */
    updateBulkStatusHelper = (status) => {
      const statusIndex = shippingStrings.indexOf(status);
      return shippingStrings.reduce((shipping, state) => ({
        ...shipping,
        [state]: shippingStrings.indexOf(state) <= statusIndex
      }), {});
    }

    /**
     * updateBulkLoadingHelper
     *
     * @summary return formatted isLoading object to update state
     * @param {String} status - the shipping status to be set
     * @return {Object} the formatted isLoading object
     */
    updateBulkLoadingHelper = (status) => {
      const statusIndex = shippingStrings.indexOf(status);
      const prevStatusIndex = Object.keys(this.state.shipping).reduce((maxIndex, state) => {
        if (this.state.shipping[state]) {
          return Math.max(shippingStrings.indexOf(state), maxIndex);
        }
        return maxIndex;
      }, -1);
      return shippingStrings.reduce((shipping, state) => {
        if (prevStatusIndex < statusIndex) {
          return {
            ...shipping,
            [state]: shippingStrings.indexOf(state) <= statusIndex && shippingStrings.indexOf(state) > prevStatusIndex
          };
        }
        return {
          ...shipping,
          [state]: shippingStrings.indexOf(state) >= statusIndex && shippingStrings.indexOf(state) <= prevStatusIndex
        };
      }, {});
    }

    /**
     * shippingStatusUpdateCall
     *
     * @summary set selected order(s) to the provided shipping state
     * @param {Array} selectedOrders - array of selected orders
     * @param {String} status - the shipping status to be set
     * @return {null} no return value
     */
    shippingStatusUpdateCall = (selectedOrders, status) => {
      const filteredSelectedOrders = selectedOrders.filter((order) => order.shipping && Object.keys(getShippingInfo(order)).length);
      this.setState({
        isLoading: this.updateBulkLoadingHelper(status)
      });
      let orderText = "order";

      if (filteredSelectedOrders.length > 1) {
        orderText = "orders";
      }

      // capitalize the first letter of the shipping status passed in
      // e.g. 'shipped' becomes 'Shipped'.
      // status[0].toUpperCase() capitalizes the first letter of the string
      // status.substr(1).toLowerCase() converts every other letter to lower case
      const capitalizeStatus = status[0].toUpperCase() + status.substr(1).toLowerCase();
      let orderCount = 0;

      // TODO: send these orders in batch as an array. This would entail re-writing the Meteor calls to update the
      // different shipping statuses to receive an array of objects(orders) as a param

      // TODO: rethink this type of flow for updating shipping statuses
      filteredSelectedOrders.forEach((order) => {
        const shippingRecord = getShippingInfo(order);

        Meteor.call(`orders/shipment${capitalizeStatus}`, order, shippingRecord, (error) => {
          if (error) {
            Alerts.toast(`An error occured while setting the status: ${error}`, "error");
          } else {
            Meteor.call("orders/updateHistory", order._id, "Shipping state set by bulk operation", status);
          }
          orderCount += 1;
          if (orderCount === filteredSelectedOrders.length) {
            this.setState({
              shipping: this.updateBulkStatusHelper(status),
              isLoading: {
                [status]: false
              }
            });
            Alerts.alert({
              text: i18next.t("order.orderSetToState", {
                orderNumber: filteredSelectedOrders.length,
                orderText,
                status
              }),
              type: "success",
              allowOutsideClick: false
            });
          }
        });
      });
    }

    displayAlert = (selectedOrders, status, options) => {
      // capitalize the first letter of the shipping status passed in
      // e.g. 'shipped' becomes 'Shipped'.
      // status[0].toUpperCase() capitalizes the first letter of the string
      // status.substr(1).toLowerCase() converts every other letter to lower case
      const capitalizeStatus = status[0].toUpperCase() + status.substr(1).toLowerCase();
      const alertOptions = options || {};
      let orderText = "order";
      let skippedOrdersText = "is";
      let orderAlreadyInStateText = "Order has";

      if (selectedOrders.length > 1) {
        orderText = "orders";
        orderAlreadyInStateText = "Orders have";
      }

      if (alertOptions.falsePreviousStatuses > 1) {
        skippedOrdersText = "are";
      }

      // if the order(s) want to skip the previous states, display alert
      if (alertOptions.falsePreviousStatuses) {
        Alerts.alert({
          text: i18next.t("order.skippedBulkOrdersAlert", {
            selectedOrders: selectedOrders.length,
            orderText,
            status: capitalizeStatus,
            numberOfSkippedOrders: alertOptions.falsePreviousStatuses,
            skippedOrdersText,
            skippedState: alertOptions.whichFalseState
          }),
          type: "warning",
          showCancelButton: true,
          showCloseButton: true,
          allowOutsideClick: false,
          confirmButtonText: i18next.t("order.approveBulkOrderAction"),
          cancelButtonText: i18next.t("order.cancelBulkOrderAction")
        }, (setSelected) => {
          if (setSelected) {
            // set status of order(s) if this action is confirmed
            this.shippingStatusUpdateCall(selectedOrders, status);
          }
        });

        // if the order(s) are following proper flow, set the status
      } else if (!alertOptions.falsePreviousStatuses && alertOptions.falseCurrentState) {
        this.shippingStatusUpdateCall(selectedOrders, status);
        // display alert if order(s) are already in this state
      } else if (!alertOptions.falsePreviousStatuses && !alertOptions.falseCurrentState &&
        alertOptions.trueCurrentState) {
        Alerts.alert({
          text: i18next.t("order.orderAlreadyInState", {
            orderText: orderAlreadyInStateText,
            status
          })
        });
      }
    }

    displayRegressionAlert = (selectedOrders, ordersToRegress, status, options) => {
      // capitalize the first letter of the shipping status passed in
      // e.g. 'shipped' becomes 'Shipped'.
      // status[0].toUpperCase() capitalizes the first letter of the string
      // status.substr(1).toLowerCase() converts every other letter to lower case
      const capitalizeStatus = status[0].toUpperCase() + status.substr(1).toLowerCase();
      const alertOptions = options || {};
      let orderText = "order";

      if (ordersToRegress > 1) {
        orderText = "orders";
      }

      Alerts.alert({
        text: i18next.t("order.bulkOrdersRegressionAlert", {
          ordersToRegress, orderText, status: capitalizeStatus
        }),
        type: "warning",
        showCancelButton: true,
        showCloseButton: true,
        allowOutsideClick: false,
        confirmButtonText: i18next.t("order.approveBulkOrderActionRegression"),
        cancelButtonText: i18next.t("order.cancelBulkOrderAction")
      }, (regress) => {
        if (regress) {
          // if some of the order(s) want to skip the previous state, display warning alert for skipping states
          if (alertOptions.falsePreviousStatuses) {
            this.displayAlert(
              selectedOrders, status,
              {
                whichFalseState: alertOptions.whichFalseState,
                falsePreviousStatuses: alertOptions.falsePreviousStatuses,
                falseCurrentState: alertOptions.falseCurrentState,
                trueCurrentState: alertOptions.trueCurrentState
              }
            );
          } else {
            // set status of order(s) if this action is confirmed
            this.shippingStatusUpdateCall(selectedOrders, status);
          }
        }
      });
    }

    pickedShippingStatus = (selectedOrders, status) => {
      // counters to keep track of how many orders are not picked,
      // are already picked, and how many are being regressed
      let isNotPicked = 0;
      let isPicked = 0;
      let ordersToRegress = 0;

      // loop through selected orders array to determine the current shipping workflow
      // status of each order in regard to the other statuses
      // TODO: optimise this process to avoid having this similar repetitive block of code across 4 methods
      selectedOrders.forEach((order) => {
        const orderWorkflow = getShippingInfo(order).workflow;
        // check if the order(s) are in this state already or in the previous state

        // TODO: model this with the assumption that there may be different workflows
        // depending on the type of shop or product that a shop is selling.
        if (orderWorkflow) {
          if (orderWorkflow.status === "new") {
            isNotPicked += 1;
          } else if (orderWorkflow.status === "coreOrderWorkflow/picked") {
            isPicked += 1;
          } else if (orderWorkflow.workflow.includes("coreOrderWorkflow/picked")) {
            ordersToRegress += 1;
          } else if (!orderWorkflow.workflow.includes("coreOrderWorkflow/picked") &&
                     (orderWorkflow.status === "coreOrderWorkflow/packed" ||
                      orderWorkflow.status === "coreOrderWorkflow/labeled" ||
                      orderWorkflow.status === "coreOrderWorkflow/shipped")) {
            ordersToRegress += 1;
          }
        }
      });

      // display regression alert if order(s) are being regressed
      if (ordersToRegress) {
        this.displayRegressionAlert(selectedOrders, ordersToRegress, status);

        // set status to 'picked' if order(s) are in the previous state OR
        // display alert if order(s) are already in this state
      } else {
        this.displayAlert(
          selectedOrders, status,
          {
            falseCurrentState: isNotPicked,
            trueCurrentState: isPicked
          }
        );
      }
    }

    packedShippingStatus = (selectedOrders, status) => {
      // if an order state wants to skip to packed, this is the state being skipped
      const whichFalseState = shippingStates.picked;
      // counters to keep track of how many orders are not picked/packed,
      // are already packed, and how many are being regressed
      let isNotPicked = 0;
      let isNotPacked = 0;
      let isPacked = 0;
      let ordersToRegress = 0;

      // loop through selected orders array to determine the current shipping workflow
      // status of each order in regard to the other statuses
      // TODO: optimise this process to avoid having this similar repetitive block of code across 4 methods
      selectedOrders.forEach((order) => {
        const orderWorkflow = getShippingInfo(order).workflow;

        // check if the order(s) are in this state already or in one of the previous states

        // TODO: model this with the assumption that there may be different workflows
        // depending on the type of shop or product that a shop is selling.
        if (orderWorkflow) {
          if (orderWorkflow.status === "new") {
            isNotPicked += 1;
          } else if (orderWorkflow.status === "coreOrderWorkflow/picked") {
            isNotPacked += 1;
          } else if (orderWorkflow.status === "coreOrderWorkflow/packed") {
            isPacked += 1;
          } else if (orderWorkflow.workflow.includes("coreOrderWorkflow/packed")) { // check if the selected order(s) are being regressed back to this state
            ordersToRegress += 1;
          } else if (!orderWorkflow.workflow.includes("coreOrderWorkflow/packed") &&
                     (orderWorkflow.status === "coreOrderWorkflow/labeled" ||
                      orderWorkflow.status === "coreOrderWorkflow/shipped")) {
            ordersToRegress += 1;
          }
        }
      });

      // display regression alert if order(s) are being regressed
      if (ordersToRegress) {
        this.displayRegressionAlert(
          selectedOrders, ordersToRegress, status,
          {
            whichFalseState,
            falsePreviousStatuses: isNotPicked,
            falseCurrentState: isNotPacked,
            trueCurrentState: isPacked
          }
        );

        // display proper alert if the order(s) are in this state already or want to skip the previous states
      } else {
        this.displayAlert(
          selectedOrders, status,
          {
            whichFalseState,
            falsePreviousStatuses: isNotPicked,
            falseCurrentState: isNotPacked,
            trueCurrentState: isPacked
          }
        );
      }
    }

    labeledShippingStatus = (selectedOrders, status) => {
      // string that will hold the state being skipped
      let whichFalseState = "";
      // counters to keep track of how many orders are not picked/packed/labeled,
      // are already labeled, and how many are being regressed
      let isNotPacked = 0;
      let isNotLabeled = 0;
      let isLabeled = 0;
      let ordersToRegress = 0;

      // loop through selected orders array to determine the current shipping workflow
      // status of each order in regard to the other statuses
      // TODO: optimise this process to avoid having this similar repetitive block of code across 4 methods
      selectedOrders.forEach((order) => {
        const orderWorkflow = getShippingInfo(order).workflow;
        // check if the order(s) are in this state already or in one of the previous states

        // TODO: model this with the assumption that there may be different workflows
        // depending on the type of shop or product that a shop is selling.
        if (orderWorkflow) {
          if (orderWorkflow.status === "new") {
            isNotPacked += 1;
            whichFalseState = shippingStates.picked;
          } else if (orderWorkflow.status === "coreOrderWorkflow/picked") {
            isNotPacked += 1;
            whichFalseState = shippingStates.packed;
          } else if (orderWorkflow.status === "coreOrderWorkflow/packed") {
            isNotLabeled += 1;
          } else if (orderWorkflow.status === "coreOrderWorkflow/labeled") {
            isLabeled += 1;
          } else if (orderWorkflow.workflow.includes("coreOrderWorkflow/labeled") ||
                     orderWorkflow.status === "coreOrderWorkflow/shipped") { // check if the selected order(s) are being regressed back to this state
            ordersToRegress += 1;
          }
        }
      });

      // display regression alert if order(s) are being regressed
      if (ordersToRegress) {
        this.displayRegressionAlert(
          selectedOrders, ordersToRegress, status,
          {
            whichFalseState,
            falsePreviousStatuses: isNotPacked,
            falseCurrentState: isNotLabeled,
            trueCurrentState: isLabeled
          }
        );

        // display proper alert if the order(s) are in this state already or want to skip the previous states
      } else {
        this.displayAlert(
          selectedOrders, status,
          {
            whichFalseState,
            falsePreviousStatuses: isNotPacked,
            falseCurrentState: isNotLabeled,
            trueCurrentState: isLabeled
          }
        );
      }
    }


    shippedShippingStatus = (selectedOrders, status) => {
      // string that will hold the state being skipped
      let whichFalseState = "";
      // counters to keep track of how many orders are not picked/packed/labeled/shipped,
      // are already shipped, and how many are being regressed
      let isNotLabeled = 0;
      let isNotShipped = 0;
      let isShipped = 0;

      // loop through selected orders array to determine the current shipping workflow
      // status of each order in regard to the other statuses
      // TODO: optimise this process to avoid having this similar repetitive block of code across 4 methods
      selectedOrders.forEach((order) => {
        const orderWorkflow = getShippingInfo(order).workflow;
        // check if the order(s) are in this state already or in one of the previous states

        // TODO: model this with the assumption that there may be different workflows
        // depending on the type of shop or product that a shop is selling.
        if (orderWorkflow) {
          const orderWorkflowStatus = orderWorkflow.status;
          if (orderWorkflowStatus === "new") {
            isNotLabeled += 1;
            whichFalseState = shippingStates.picked;
          } else if (orderWorkflowStatus === "coreOrderWorkflow/picked") {
            isNotLabeled += 1;
            whichFalseState = shippingStates.packed;
          } else if (orderWorkflowStatus === "coreOrderWorkflow/packed") {
            isNotLabeled += 1;
            whichFalseState = shippingStates.labeled;
          } else if (orderWorkflowStatus === "coreOrderWorkflow/labeled") {
            isNotShipped += 1;
          } else if (orderWorkflowStatus === "coreOrderWorkflow/shipped") {
            isShipped += 1;
          }
        }
      });

      // display proper alert if the order(s) are in this state already or want to skip the previous states
      this.displayAlert(
        selectedOrders, status,
        {
          whichFalseState,
          falsePreviousStatuses: isNotLabeled,
          falseCurrentState: isNotShipped,
          trueCurrentState: isShipped
        }
      );
    }

    /**
     * setShippingStatus
     *
     * @summary call the relevant method based on the provided shipping status
     * @param {String} status - the selected shipping status to be set
     * @param {Array} selectedOrdersIds - array of ids of the selected orders
     * @param {Array} orders - array of orders
     * @return {null} no return value
     */
    setShippingStatus = (status, selectedOrdersIds, orders) => {
      this.setState({
        renderFlowList: true
      });
      const selectedOrders = orders.filter((order) => selectedOrdersIds.includes(order._id));

      if (status === "picked") {
        this.pickedShippingStatus(selectedOrders, status);
      }

      if (status === "packed") {
        this.packedShippingStatus(selectedOrders, status);
      }

      if (status === "labeled") {
        this.labeledShippingStatus(selectedOrders, status);
      }

      if (status === "shipped") {
        this.shippedShippingStatus(selectedOrders, status);
      }
    }

    /**
     * orderCreditMethod: Finds the credit record in order.billing for the active shop
     * @param order: The order where to find the billing record in.
     * @return: The billing record with paymentMethod.method === credit of currently active shop
     */
    orderCreditMethod(order) {
      const creditBillingRecords = order.billing.filter((value) => value.paymentMethod.method === "credit");
      const billingRecord = creditBillingRecords.find((billing) => billing.shopId === Reaction.getShopId());
      return billingRecord;
    }

    handleBulkPaymentCapture = (selectedOrdersIds, orders) => {
      this.setState({
        isLoading: {
          capturePayment: true
        }
      });
      const selectedOrders = orders.filter((order) => selectedOrdersIds.includes(order._id));

      let orderCount = 0;
      const done = () => {
        orderCount += 1;
        if (orderCount === selectedOrders.length) {
          this.setState({
            isLoading: {
              capturePayment: false
            }
          });
          Alerts.alert({
            text: i18next.t("order.paymentCaptureSuccess"),
            type: "success",
            allowOutsideClick: false
          });
        }
      };

      // TODO: send these orders in batch as an array. This would entail re-writing the
      // "orders/approvePayment" method to receive an array of orders as a param.
      selectedOrders.forEach((order) => {
        // Only capture orders which are not captured yet (but possibly are already approved)
        const billingRecord = this.orderCreditMethod(order);
        if (billingRecord.paymentMethod.mode === "capture" && billingRecord.paymentMethod.status === "completed") {
          done();
          return;
        }
        Meteor.call("orders/approvePayment", order, (approvePaymentError) => {
          if (approvePaymentError) {
            this.setState({
              isLoading: {
                capturePayment: false
              }
            });
            Alerts.toast(`An error occured while approving the payment: ${approvePaymentError}`, "error");
          } else {
            // TODO: send these orders in batch as an array. This would entail re-writing the
            // "orders/capturePayments" method to receive an array of orders as a param.
            Meteor.call("orders/capturePayments", order._id, (capturePaymentError) => {
              if (capturePaymentError) {
                this.setState({
                  isLoading: {
                    capturePayment: false
                  }
                });
                Alerts.toast(`An error occured while capturing the payment: ${capturePaymentError}`, "error");
              }
              done();
            });
          }
        });
      });
    }

    render() {
      return (
        <Comp
          {...this.props}
          handleSelect={this.handleSelect}
          handleClick={this.handleClick}
          displayMedia={getPrimaryMediaForOrderItem}
          selectedItems={this.state.selectedItems}
          selectAllOrders={this.selectAllOrders}
          multipleSelect={this.state.multipleSelect}
          setShippingStatus={this.setShippingStatus}
          shipping={this.state.shipping}
          isLoading={this.state.isLoading}
          renderFlowList={this.state.renderFlowList}
          toggleShippingFlowList={this.toggleShippingFlowList}
          handleBulkPaymentCapture={this.handleBulkPaymentCapture}
        />
      );
    }
  }
);

registerComponent("OrderTable", OrderTable, [wrapComponent]);

export default compose(wrapComponent)(OrderTable);

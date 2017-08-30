import React, { Component } from "react";
import PropTypes from "prop-types";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Media, Orders } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { Loading } from "/imports/plugins/core/ui/client/components";
import OrderDashboard from "../components/orderDashboard.js";
import { OrderSearch as OrderSearchCollection } from "/lib/collections";
import OrderSearch from "../components/orderSearch";
import { Tracker } from "meteor/tracker";

const OrderHelper =  {
  makeQuery(filter) {
    let query = {};

    switch (filter) {
      // New orders
      case "new":
        query = {
          "workflow.status": "new"
        };
        break;

      // Orders that have been approved
      case "approved":
        query = {
          "workflow.status": "coreOrderWorkflow/processing",
          "billing.paymentMethod.status": "approved"
        };
        break;

      // Orders that have been captured
      case "captured":
        query = {
          "billing.paymentMethod.status": "completed",
          "shipping.shipped": false
        };
        break;

      // Orders that are being processed
      case "processing":
        query = {
          "workflow.status": "coreOrderWorkflow/processing"
        };
        break;

      // Orders that are complete, including all items with complete status
      case "completed":
        query = {
          "workflow.status": "coreOrderWorkflow/completed"
        };
        break;

      case "canceled":
        query = {
          "workflow.status": "coreOrderWorkflow/canceled"
        };
        break;

      default:
    }

    return query;
  }
};

class OrderDashboardContainer extends Component {
  static propTypes = {
    handleMenuClick: PropTypes.func,
    orders: PropTypes.array
  }

  constructor(props) {
    super(props);

    this.state = {
      selectedItems: [],
      orders: props.orders,
      multipleSelect: false,
      ready: false,
      query: {},
      filter: i18next.t("order.filter.status"),
      className: "",
      searchQuery: ""
    };

    this.dep = new Tracker.Dependency;
  }

  componentDidMount() {
    this.setupTracker();
  }

  componentWillReceiveProps() {
    this.setupTracker();
  }

  componentWillUnmount() {
    this.subscription.stop();
  }
  /**
   * handleSearchChange - handler called on search query change
   * @param  {String} value - search field current value
   * @return {null} -
   */
  handleSearchChange = (value) => {
    this.setState({ searchQuery: value }, () => {
      this.dep.changed();
    });
  }

  handleMenuClick = (event, value) => {
    const query = OrderHelper.makeQuery(value);

    this.setState({
      query,
      filter: i18next.t(`order.filter.${value}`),
      className: "active"
    });
  }

  // Extracted Tracker logic for the search subscription, to allow calling in both
  // componentDidMount and componentWillReceiveProps
  // This tracker is setup in the class itself because we need to re-subscribe when search input changes
  setupTracker = () => {
    Tracker.autorun(() => {
      this.dep.depend();
      this.subscription = Meteor.subscribe("SearchResults", "orders", this.state.searchQuery);
      let orderSearchResultsIds;

      if (this.subscription.ready()) {
        const orderSearchResults = OrderSearchCollection.find().fetch();
        const query = this.state.query;
        orderSearchResultsIds = orderSearchResults.map(orderSearch => orderSearch._id);
        // checking to ensure search was made and search results are returned
        if (this.state.searchQuery && Array.isArray(orderSearchResultsIds)) {
          // add matching results from search to query passed to Sortable
          query._id = { $in: orderSearchResultsIds };
          return this.setState({ query: query });
        }
        // being here means no search text is inputed or search was cleared, so reset any previous match
        delete query._id;
        this.setState({ query: query });
      }
    });
  }

  clearFilter = () => {
    const oldQuery = this.state.query;
    const query = OrderHelper.makeQuery("");
    // id is set by the searchbar in setupTracker. Here we check if there's a current value in it before
    // the filter was cleared. If there is, we attach it back to the queryObj
    if (oldQuery._id) {
      query._id = oldQuery._id;
    }

    this.setState({
      query,
      filter: i18next.t("order.filter.status"),
      className: ""
    });
  }

  handleSelect = (event, isInputChecked, name) => {
    this.setState({
      multipleSelect: false
    });
    const selectedItemsArray = this.state.selectedItems;

    if (!selectedItemsArray.includes(name)) {
      selectedItemsArray.push(name);
      this.setState({
        selectedItems: selectedItemsArray
      });
    } else {
      const updatedSelectedArray = selectedItemsArray.filter((id) => {
        if (id !== name) {
          return id;
        }
      });
      this.setState({
        selectedItems: updatedSelectedArray
      });
    }
  }

  selectAllOrders = (orders, areAllSelected) => {
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
      const orderIds = orders.map((order) => {
        return order._id;
      });
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
        order: order
      },
      props: {
        size: "large"
      },
      template: "coreOrderWorkflow"
    });

    if (startWorkflow === true) {
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", order);
    }
  }

  /**
   * Media - find media based on a product/variant
   * @param  {Object} item object containing a product and variant id
   * @return {Object|false} An object contianing the media or false
   */
  handleDisplayMedia = (item) => {
    const variantId = item.variants._id;
    const productId = item.productId;

    const variantImage = Media.findOne({
      "metadata.variantId": variantId,
      "metadata.productId": productId
    });

    if (variantImage) {
      return variantImage;
    }

    const defaultImage = Media.findOne({
      "metadata.productId": productId,
      "metadata.priority": 0
    });

    if (defaultImage) {
      return defaultImage;
    }
    return false;
  }

  render() {
    return (
      <div className="order-list">
        <OrderSearch handleChange={this.handleSearchChange} />
        <OrderDashboard
          handleSelect={this.handleSelect}
          orders={this.state.orders}
          query={this.state.query}
          filter={this.state.filter}
          className={this.state.className}
          clearFilter={this.clearFilter}
          handleClick={this.handleClick}
          displayMedia={this.handleDisplayMedia}
          selectedItems={this.state.selectedItems}
          selectAllOrders={this.selectAllOrders}
          multipleSelect={this.state.multipleSelect}
          handleMenuClick={this.handleMenuClick}
        />
      </div>
    );
  }
}

const composer = (props, onData) => {
  const mediaSubscription = Meteor.subscribe("Media");
  const ordersSubscription = Meteor.subscribe("CustomPaginatedOrders");

  if (mediaSubscription.ready() && ordersSubscription.ready()) {
    const orders = Orders.find().fetch();

    onData(null, {
      orders
    });
  }
};

export default composeWithTracker(composer, Loading)(OrderDashboardContainer);

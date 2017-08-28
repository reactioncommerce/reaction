import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import PropTypes from "prop-types";
import { Icon, Translation } from "@reactioncommerce/reaction-ui";
import OrderTable from "./orderTable";
import OrderActions from "./orderActions";
import { OrderSearch as OrderSearchCollection } from "/lib/collections";
import OrderSearch from "../components/orderSearch";

class OrderDashboard extends Component {
  static propTypes = {
    className: PropTypes.string,
    clearFilter: PropTypes.func,
    displayMedia: PropTypes.func,
    filter: PropTypes.string,
    handleBulkPaymentCapture: PropTypes.func,
    handleClick: PropTypes.func,
    handleMenuClick: PropTypes.func,
    handleSelect: PropTypes.func,
    isLoading: PropTypes.object,
    multipleSelect: PropTypes.bool,
    orders: PropTypes.array,
    query: PropTypes.object,
    renderFlowList: PropTypes.bool,
    selectAllOrders: PropTypes.func,
    selectedItems: PropTypes.array,
    setShippingStatus: PropTypes.func,
    shipping: PropTypes.object,
    toggleShippingFlowList: PropTypes.func
  }

  constructor(props) {
    super(props);

    this.state = {
      detailClassName: "",
      listClassName: "order-icon-toggle",
      openList: true,
      orders: this.props.orders,
      query: this.props.query,
      searchQuery: ""
    };

    this.dep = new Tracker.Dependency;
  }

  componentDidMount() {
    this.setupTracker();
  }

  componentWillReceiveProps(nextProps) {
    this.setupTracker();
    if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
      this.setState({
        orders: nextProps.orders,
        query: nextProps.query
      });
    }
  }

  componentWillUnmount() {
    this.subscription.stop();
  }

  // Extracted Tracker logic for the search subscription, to allow calling in both
  // componentDidMount and componentWillReceiveProps
  setupTracker = () => {
    Tracker.autorun(() => {
      this.dep.depend();
      this.subscription = Meteor.subscribe("SearchResults", "orders", this.state.searchQuery);
      let orderSearchResultsIds;

      if (this.subscription.ready()) {
        const orderSearchResults = OrderSearchCollection.find().fetch();
        orderSearchResultsIds = orderSearchResults.map(orderSearch => orderSearch._id);
        // checking to ensure search was made and no results came back
        if (this.state.searchQuery && Array.isArray(orderSearchResultsIds)) {
          // pick and show only orders that are in search results (orderSearchResultsIds)
          return this.setState({
            orders: this.props.orders.filter(
              order => orderSearchResultsIds.indexOf(order._id) > -1
            )
          });
        }
        // no search query applied, so show all current orders
        this.setState({ orders: this.props.orders });
      }
    });
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

  handleListToggle = () => {
    this.setState({
      detailClassName: "",
      listClassName: "order-icon-toggle",
      openList: true
    });
  }

  handleDetailToggle = () => {
    this.setState({
      detailClassName: "order-icon-toggle",
      listClassName: "",
      openList: false
    });
  }

  render() {
    return (
      <div className="order-list">
        <OrderSearch handleChange={this.handleSearchChange} />
        <OrderActions
          handleMenuClick={this.props.handleMenuClick}
          clearFilter={this.props.clearFilter}
          filter={this.props.filter}
          className={this.props.className}
        />
        {this.state.orders.length ?
          <div className="container-fluid-sm">
            <div className="order-toggle-buttons">
              <button
                className={`order-toggle-btn ${this.state.detailClassName}`}
                onClick={this.handleDetailToggle}
              >
                <i className="fa fa-th-list" />
              </button>

              <button
                className={`order-toggle-btn ${this.state.listClassName}`}
                onClick={this.handleListToggle}
              >
                <i className="fa fa-list" />
              </button>
            </div>

            <div>
              <OrderTable
                orders={this.state.orders}
                query={this.state.query}
                selectedItems={this.props.selectedItems}
                handleSelect={this.props.handleSelect}
                handleClick={this.props.handleClick}
                multipleSelect={this.props.multipleSelect}
                selectAllOrders={this.props.selectAllOrders}
                displayMedia={this.props.displayMedia}
                isOpen={this.state.openList}
                shipping={this.props.shipping}
                setShippingStatus={this.props.setShippingStatus}
                isLoading={this.props.isLoading}
                renderFlowList={this.props.renderFlowList}
                toggleShippingFlowList={this.props.toggleShippingFlowList}
                handleBulkPaymentCapture={this.props.handleBulkPaymentCapture}
              />
            </div>
          </div> :
          <div className="container-fluid-sm">
            <div className="empty-view-message">
              <Icon icon="fa fa-sun-o" />
              <Translation defaultValue={"No orders found"} i18nKey={"order.ordersNotFound"} />
            </div>
          </div>
        }
      </div>
    );
  }
}

export default OrderDashboard;

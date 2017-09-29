import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-ui";
import OrderTable from "./orderTable";
import OrderFilter from "./orderFilter";
import OrderSearch from "./orderSearch";

class OrderDashboard extends Component {
  static propTypes = {
    clearFilter: PropTypes.func,
    displayMedia: PropTypes.func,
    filterDates: PropTypes.func,
    filterShippingStatus: PropTypes.func,
    filterWorkflowStatus: PropTypes.func,
    handleBulkPaymentCapture: PropTypes.func,
    handleChange: PropTypes.func,
    handleClick: PropTypes.func,
    handleSelect: PropTypes.func,
    isLoading: PropTypes.object,
    multipleSelect: PropTypes.bool,
    orderCount: PropTypes.number,
    orders: PropTypes.array,
    query: PropTypes.object,
    renderFlowList: PropTypes.bool,
    searchQuery: PropTypes.string,
    selectAllOrders: PropTypes.func,
    selectedItems: PropTypes.array,
    setShippingStatus: PropTypes.func,
    shipping: PropTypes.object,
    toggleShippingFlowList: PropTypes.func
  }

  state = {
    detailClassName: "",
    listClassName: "order-icon-toggle",
    openList: true,
    orders: this.props.orders,
    query: this.props.query
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      orders: nextProps.orders,
      query: nextProps.query
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
      <div className="orders-table-container">
        <OrderSearch
          handleChange={this.props.handleChange}
          searchQuery={this.props.searchQuery}
        />
        <OrderFilter
          clearFilter={this.props.clearFilter}
          filterDates={this.props.filterDates}
          filterShippingStatus={this.props.filterShippingStatus}
          filterWorkflowStatus={this.props.filterWorkflowStatus}
        />
        {this.state.orders.length ?
          <div className="container-fluid-sm order-details-list-container">
            <div className="order-toggle-buttons-container">
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
            </div>

            <OrderTable
              orders={this.props.orders}
              orderCount={this.props.orderCount}
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
          </div> :
          <div className="container-fluid-sm order-details-list-container">
            <div className="empty-view-message">
              <Components.Icon icon="fa fa-sun-o" />
              <Components.Translation defaultValue={"No orders found"} i18nKey={"order.ordersNotFound"} />
            </div>
          </div>
        }
      </div>
    );
  }
}

export default OrderDashboard;

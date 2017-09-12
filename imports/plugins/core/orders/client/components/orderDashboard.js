import React, { Component } from "react";
import PropTypes from "prop-types";
import { Icon, Translation } from "@reactioncommerce/reaction-ui";
import OrderTable from "./orderTable";
import OrderActions from "./orderActions";

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
    orderCount: PropTypes.number,
    orders: PropTypes.array,
    query: PropTypes.object,
    renderFlowList: PropTypes.bool,
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
    console.log("props", this.props);
    return (
      <div>
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

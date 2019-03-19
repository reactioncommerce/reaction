import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import OrderTable from "../containers/orderTableContainer";
import OrderFilter from "./orderFilter";

class OrderDashboard extends Component {
  static propTypes = {
    clearFilter: PropTypes.func,
    currentPage: PropTypes.number,
    filterDates: PropTypes.func,
    filterShippingStatus: PropTypes.func,
    filterWorkflowStatus: PropTypes.func,
    handleBulkPaymentCapture: PropTypes.func,
    handleClick: PropTypes.func,
    handleSelect: PropTypes.func,
    isLoading: PropTypes.object,
    multipleSelect: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
    onPageChange: PropTypes.func,
    onPageSizeChange: PropTypes.func,
    orders: PropTypes.array,
    pages: PropTypes.number,
    query: PropTypes.object,
    renderFlowList: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
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
    orders: this.props.orders
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
      <div className="order-dashboard-container">
        <OrderFilter
          clearFilter={this.props.clearFilter}
          filterDates={this.props.filterDates}
          filterShippingStatus={this.props.filterShippingStatus}
          filterWorkflowStatus={this.props.filterWorkflowStatus}
        />
        {this.props.orders.length ?
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
              isOpen={this.state.openList}
              onPageChange={this.props.onPageChange}
              onPageSizeChange={this.props.onPageSizeChange}
              pages={this.props.pages}
              page={this.props.currentPage}
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

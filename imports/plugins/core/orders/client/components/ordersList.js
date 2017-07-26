import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames/dedupe";
import Avatar from "react-avatar";
import moment from "moment";
import { Orders } from "/lib/collections";
import { formatPriceString } from "/client/api";
import { Badge, ClickToCopy, Icon, Translation, Checkbox, Button, SortableTable, Loading } from "@reactioncommerce/reaction-ui";
import ProductImage from "./productImage";
import OrderTable from "./orderTable";

class OrdersList extends Component {
  static propTypes = {
    detailClassName: PropTypes.string,
    displayMedia: PropTypes.func,
    handleClick: PropTypes.func,
    handleDetailToggle: PropTypes.func,
    handleListToggle: PropTypes.func,
    handleSelect: PropTypes.func,
    handleShowMoreClick: PropTypes.func,
    hasMoreOrders: PropTypes.bool,
    listClassName: PropTypes.string,
    multipleSelect: PropTypes.bool,
    openDetail: PropTypes.bool,
    openList: PropTypes.bool,
    orders: PropTypes.array,
    selectAllOrders: PropTypes.func,
    selectedItems: PropTypes.array
  }

  /**
   * Fullfilment Badge
   * @param  {Object} order object containing info for order and coreOrderWorkflow
   * @return {string} A string containing the type of Badge
   */
  fulfillmentBadgeStatus(order) {
    const orderStatus = order.workflow.status;

    if (orderStatus === "new") {
      return "info";
    } else if (orderStatus === "coreOrderWorkflow/processing") {
      return "success";
    } else if (orderStatus === "coreOrderWorkflow/canceled") {
      return "danger";
    } else if (orderStatus === "coreOrderWorkflow/completed") {
      return "primary";
    }

    return "default";
  }

  /**
   * Shipping Badge
   * TODO: any logic here, we don't have shipping status changes at the moment
   * @return {string} A string containing the type of Badge
   */
  shippingBadgeStatus() {
    return "basic";
  }

  renderOrderButton(order) {
    const startWorkflow = order.workflow.status === "new";
    const classes = classnames({
      "rui": true,
      "btn": true,
      "btn-success": startWorkflow
    });

    return (
      <button className={classes} onClick={() => this.props.handleClick(order, startWorkflow)}>
        <Icon icon="fa fa-chevron-right" />
      </button>
    );
  }

  renderOrderInfo(order) {
    const { displayMedia } = this.props;

    return (
      <div className="order-info">
        <div className="order-totals">
          <span className="order-data order-data-date">
            <strong>Date: </strong>
            {moment(order.createdAt).fromNow()} | {moment(order.createdAt).format("MM/D/YYYY")}
          </span>

          <span className="order-data order-data-id">
            <strong>Order ID: </strong>
            <ClickToCopy
              copyToClipboard={order._id}
              displayText={order._id}
              i18nKeyTooltip="admin.orderWorkflow.summary.copyOrderLink"
              tooltip="Copy Order Link"
            />
          </span>

          <span className="order-data order-data-total">
            <strong>Total: {formatPriceString(order.billing[0].invoice.total)}</strong>
          </span>
        </div>

        <div className="order-items">
          {order.items.map((item, i) => {
            return (
              <div className="order-item" key={i}>
                <div className="order-item-media">
                  <ProductImage
                    item={item}
                    displayMedia={displayMedia}
                    size="small"
                    badge={true}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  renderShipmentInfo(order) {
    const emailAddress = order.email || <Translation defaultValue={"Email not availabe"} i18nKey={"admin.orderWorkflow.ordersList.emailNotFound"} />;
    return (
      <div className="shipment-info">
        <div className="customer-info">
          <Avatar
            email={order.email}
            round={true}
            name={order.shipping[0].address.fullName}
            size={30}
            className="rui-order-avatar"
          />
          <strong>{order.shipping[0].address.fullName}</strong> | {emailAddress}
        </div>
        <div className="workflow-info">
          <Badge
            badgeSize="large"
            i18nKeyLabel={`cartDrawer.${order.shipping[0].workflow.status}`}
            label={order.shipping[0].workflow.status}
            status={this.shippingBadgeStatus(order)}
          />
          <Badge
            badgeSize="large"
            i18nKeyLabel={`cartDrawer.${order.workflow.status}`}
            label={order.workflow.status}
            status={this.fulfillmentBadgeStatus(order)}
          />
        </div>
      </div>
    );
  }

  /**
   * Render Sortable Table for the list view for orders
   * @param {Object} orders object containing info for order
   * @return {Component} SortableTable list of orders
   */

  renderOrderCard(order) {
    // const { handleClick } = this.props;

    return (
      <div className="rui card order">
        <div className="content" onClick={() => this.props.handleClick(order, false)}>
          {this.renderShipmentInfo(order)}
          {this.renderOrderInfo(order)}
        </div>
        <div className="controls" onClick={() => this.props.handleClick(order)}>
          {this.renderOrderButton(order)}
        </div>
      </div>
    );
  }

  handleClick = (event) => {
    if (this.props.handleShowMoreClick) {
      this.props.handleShowMoreClick(event);
    }
  }

  renderBulkOrderActionsBar = () => {
    const { orders, selectedItems, selectAllOrders } = this.props;

    if (selectedItems.length > 0) {
      return (
        <div className="bulk-order-actions-bar">
          <Checkbox
            className="checkbox-large orders-checkbox"
            checked={this.renderCheckedStatus()}
            name="orders-checkbox"
            onChange={() => selectAllOrders(orders, this.renderCheckedStatus())}
          />
          <Translation
            className="selected-orders"
            defaultValue={`${selectedItems.length} Selected`}
            i18nKey={`${selectedItems.length} order.selected`}
          />
          <Button
            status="success"
            bezelStyle="solid"
            className="capture-orders-button"
            label="Capture"
            i18nKeyLabel="order.capture"
          />
          <Button
            status="default"
            bezelStyle="solid"
            className="bulk-actions-button"
            label="Bulk Actions"
            i18nKeyLabel="order.bulkActions"
            icon="fa fa-chevron-down"
            iconAfter={true}
          />
        </div>
      );
    }
  }

  renderCheckedStatus() {
    const { selectedItems, orders, multipleSelect } = this.props;
    return selectedItems.length === orders.length ? true : multipleSelect;
  }

  renderTableClassNameHidden = () => {
    const { selectedItems } = this.props;
    return selectedItems.length > 0 ? "table-header-hidden" : "table-header-visible";
  }

  renderPaginationClassNameHidden = () => {
    const { selectedItems } = this.props;
    return selectedItems.length > 0 ? "order-table-pagination-hidden" : "order-table-pagination-visible";
  }
  // renderDetailsTable() {
  //   // add i18n handling to headers
  //   const customColumnMetadata =  ;
  // }

  render() {
    if (this.props.orders.length) {
      return (
        <div className="container-fluid-sm">
          <div className="order-toggle-buttons">
            <button
              className={`order-toggle-btn ${this.props.detailClassName}`}
              onClick={this.props.handleDetailToggle}
            >
              <i className="fa fa-th-list" />
            </button>

            <button
              className={`order-toggle-btn ${this.props.listClassName}`}
              onClick={this.props.handleListToggle}
            >
              <i className="fa fa-list" />
            </button>
          </div>

          {this.props.openList &&
            <OrderTable
              orders={this.props.orders}
              selectedItems={this.props.selectedItems}
              handleSelect={this.props.handleSelect}
              handleClick={this.props.handleClick}
              multipleSelect={this.props.multipleSelect}
              selectAllOrders={this.props.selectAllOrders}
              shippingBadgeStatus={this.shippingBadgeStatus}
              fulfillmentBadgeStatus={this.fulfillmentBadgeStatus}
              renderBulkOrderActionsBar={this.renderBulkOrderActionsBar}
              renderPaginationClassNameHidden={this.renderPaginationClassNameHidden}
              renderTableClassNameHidden={this.renderTableClassNameHidden}
              renderOrderCard={this.renderOrderCard}
              isOpen={false}
            />
          }

          {this.props.openDetail &&
            <div>
              {/* {this.props.orders.map((order, i) => {
                return (
                  <div key={i}>
                    {this.renderOrderCard(order)}
                  </div>
                );
              })}
              {this.props.hasMoreOrders && <button onClick={this.props.handleShowMoreClick}>Show More</button>} */}
               {/* <SortableTable
                publication="CustomPaginatedOrders"
                collection={Orders}
                matchingResultsCount="order-count"
                columnMetadata={{
                  Cell: row => (
                    <div>{this.renderOrderCard(row.original)}</div>
                  )
                }}
                externalLoadingComponent={Loading}
              /> */}
              <OrderTable
                orders={this.props.orders}
                selectedItems={this.props.selectedItems}
                handleSelect={this.props.handleSelect}
                handleClick={this.props.handleClick}
                multipleSelect={this.props.multipleSelect}
                selectAllOrders={this.props.selectAllOrders}
                shippingBadgeStatus={this.shippingBadgeStatus}
                fulfillmentBadgeStatus={this.fulfillmentBadgeStatus}
                renderBulkOrderActionsBar={this.renderBulkOrderActionsBar}
                renderPaginationClassNameHidden={this.renderPaginationClassNameHidden}
                renderTableClassNameHidden={this.renderTableClassNameHidden}
                renderOrderCard={this.renderOrderCard}
                isOpen={true}
                displayMedia={this.props.displayMedia}
              />
            </div>
          }
        </div>
      );
    }

    return (
      <div className="container-fluid-sm">
        <div className="empty-view-message">
          <Icon icon="fa fa-sun-o" />
          <Translation defaultValue={"No orders found"} i18nKey={"order.ordersNotFound"} />
        </div>
      </div>
    );
  }
}

export default OrdersList;

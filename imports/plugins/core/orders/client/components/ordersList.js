import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames/dedupe";
import Avatar from "react-avatar";
import moment from "moment";
import { formatPriceString } from "/client/api";
// import { Orders } from "/lib/collections";
import { Badge, ClickToCopy, Icon, Translation, SortableTable, Loading, Checkbox, Button } from "@reactioncommerce/reaction-ui";
import ProductImage from "./productImage";
import OrderTableColumn from "./orderTableColumn";

class OrdersList extends Component {

  static propTypes = {
    displayMedia: PropTypes.func,
    handleClick: PropTypes.func,
    handleDetailToggle: PropTypes.func,
    handleListToggle: PropTypes.func,
    handleSelect: PropTypes.func,
    handleShowMoreClick: PropTypes.func,
    hasMoreOrders: PropTypes.bool,
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
   * @param  {Object} order object containing info for order and coreOrderWorkflow
   * @return {string} A string containing the type of Badge
   */
  shippingBadgeStatus() {
    return "basic";
  }

  renderOrderButton(order) {
    const classes = classnames({
      "rui": true,
      "btn": true,
      "btn-success": order.workflow.status === "new"
    });

    return (
      <button className={classes} data-event-action="startProcessingOrder"><Icon icon="fa fa-chevron-right" /></button>
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
  renderListView(orders) {
    const { selectedItems, handleSelect, handleClick, multipleSelect, selectAllOrders } = this.props;

    const filteredFields = {
      Name: "shipping[0].address.fullName",
      Email: "email",
      Date: "createdAt",
      ID: "_id",
      Total: "billing[0].invoice.total",
      Shipping: "shipping[0].workflow.status",
      Status: "workflow.status"
    };

    const customColumnMetadata = [];
    const columnNames = Object.keys(filteredFields);

    // https://react-table.js.org/#/story/cell-renderers-custom-components
    columnNames.forEach((columnName) => {
      let colStyle = { borderRight: "none" };
      let colHeader = undefined;

      // Add custom styles for the column name `name`
      if (columnName === "Name") {
        colStyle = { borderRight: "1px solid #e6e6e6" };
        colHeader = () => <div style={{ display: "inline-flex", paddingLeft: 5 }}>
            <Checkbox
              className="order-header-checkbox checkbox"
              checked={multipleSelect}
              name="orders-checkbox"
              onChange={() => selectAllOrders(orders, multipleSelect)}
            />
            <span style={{ marginLeft: 5 }}>{columnName}</span>
          </div>;
      }

      const columnMeta = {
        accessor: filteredFields[columnName],
        Header: colHeader ? colHeader : columnName,
        headerStyle: { borderRight: "none", textAlign: "left", paddingTop: 15 },
        style: colStyle,
        Cell: row => (
          <OrderTableColumn
            row={row}
            handleClick={handleClick}
            handleSelect={handleSelect}
            selectedItems={selectedItems}
            fulfillmentBadgeStatus={this.fulfillmentBadgeStatus}
            shippingBadgeStatus={this.shippingBadgeStatus}
          />
        )
      };
      customColumnMetadata.push(columnMeta);
    });

    return (
      <div>
        {this.renderBulkOrderActionsBar()}
        <SortableTable
          tableClassName={`rui order table ${this.renderClassNameHidden()} -highlight`}
          data={orders}
          columnMetadata={customColumnMetadata}
          externalLoadingComponent={Loading}
          filteredFields={columnNames}
          filterType="none"
          getTrGroupProps={(state, rowInfo, column) => {
            return {
              style: {
                borderRight: "1px solid #e6e6e6",
                borderLeft: "1px solid #e6e6e6"
              }
            };
          }}
        />
      </div>
    );
  }


  renderOrderCard(order) {
    const { handleClick } = this.props;

    return (
      <div className="rui card order">
        <div className="content" onClick={() => handleClick(order, false)}>
          {this.renderShipmentInfo(order)}
          {this.renderOrderInfo(order)}
        </div>
        <div className="controls" onClick={() => handleClick(order)}>
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

  renderBulkOrderActionsBar() {
    const { orders, selectedItems, selectAllOrders } = this.props;

    if (selectedItems.length > 0) {
      return (
        <div className="bulk-order-actions-bar">
          <Checkbox
            className="checkbox orders-checkbox"
            checked={this.renderCheckedStatus()}
            name="orders-checkbox"
            onChange={() => selectAllOrders(orders, this.renderCheckedStatus())}
          />
          <Translation
            className="selected-orders"
            defaultValue={`${selectedItems.length} Selected`}
          />
          <Button
            status="success"
            bezelStyle="solid"
            className="capture-orders-button"
            label="Capture"
          />
          <Button
            status="default"
            bezelStyle="solid"
            className="bulk-actions-button"
            label="Bulk Actions"
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

  renderClassNameHidden() {
    return this.props.selectedItems.length > 0 ? "table-header-hidden" : "table-header-visible";
  }

  render() {
    const { orders, openDetail, openList, handleDetailToggle, handleListToggle, hasMoreOrders } = this.props;

    if (orders.length) {
      return (
        <div>
          <div style= {{ float: "right", padding: 10 }}>
            <button className="rui btn order-toggle-btn" onClick={handleListToggle}> <i className="fa fa-list" /> </button>
            <button className="rui btn order-toggle-btn" onClick={handleDetailToggle}> <i className="fa fa-list-alt" /> </button>
          </div>

          {openList &&  <div className="container-fluid-sm">{this.renderListView(orders)}</div>}
          {openDetail &&
            <div className="container-fluid-sm">
              {orders.map((order, i) => {
                return (
                  <div key={i}>
                    {this.renderOrderCard(order)}
                  </div>
                );
              })}
            </div>
          }
          {hasMoreOrders &&
            <button
              className="btn btn-primary show-more-orders"
              type="button"
              onClick={this.handleClick}
            >
            <Translation defaultValue="Show More" i18nKey="order.showMore" />
          </button>
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

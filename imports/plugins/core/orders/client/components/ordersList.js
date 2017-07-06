import React, { Component, PropTypes } from "react";
import classnames from "classnames/dedupe";
import Avatar from "react-avatar";
import moment from "moment";
import { formatPriceString } from "/client/api";
// import { Orders } from "/lib/collections";
import { SortableTable, Loading, RolloverCheckbox, Checkbox } from "/imports/plugins/core/ui/client/components";
import { Badge, ClickToCopy, Icon, Translation } from "@reactioncommerce/reaction-ui";
import ProductImage from "./productImage";

class OrdersList extends Component {

  static propTypes = {
    displayMedia: PropTypes.func,
    handleClick: PropTypes.func,
    handleDetailToggle: PropTypes.func,
    handleListToggle: PropTypes.func,
    handleSelect: PropTypes.func,
    handleShowMoreClick: PropTypes.func,
    hasMoreOrders: PropTypes.bool,
    openDetail: PropTypes.bool,
    openList: PropTypes.bool,
    orders: PropTypes.array,
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

  renderListView(orders) {
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
    const { selectedItems, handleSelect } = this.props;
    columnNames.forEach((columnName) => {
      let colStyle = { borderRight: "none" };
      let colHeader = undefined;

      if (columnName === "Name") {
        colStyle = { borderRight: "1px solid #e6e6e6" };
        colHeader = () => <div style={{ display: "inline-flex", paddingLeft: 5 }}><Checkbox className="order-header-checkbox checkbox"/> <span style={{ marginLeft: 5 }}>{columnName}</span></div>;
      }
      const columnMeta = {
        accessor: filteredFields[columnName],
        Header: colHeader ? colHeader : columnName,
        headerStyle: { borderRight: "none", textAlign: "left", paddingTop: 15 },
        style: colStyle,
        Cell: row => {
          const bla = row.column.id;
          if (bla === "shipping[0].address.fullName") {
            return (
              <div style={{ display: "inline-flex" }}>
                <RolloverCheckbox
                  checkboxClassName="checkbox"
                  name={row.original._id}
                  onChange={handleSelect}
                  checked={selectedItems.includes(row.original._id)}
                >
                  <Avatar
                    email={row.original.email}
                    round={true}
                    name={row.value}
                    size={30}
                    className="rui-order-avatar"
                  />
                </RolloverCheckbox>
                <strong style={{ paddingLeft: 5 }}>{row.value}</strong>
              </div>
            );
          }
          if (bla === "createdAt") {
            const createdDate = moment(row.value).format("MM/D/YYYY");
            return (
              <span>{createdDate}</span>
            );
          }
          if (bla === "_id") {
            return (
              <ClickToCopy
                copyToClipboard={row.original._id}
                displayText={row.original._id}
                i18nKeyTooltip="admin.orderWorkflow.summary.copyOrderLink"
                tooltip="Copy Order Link"
              />
            );
          }
          if (bla === "billing[0].invoice.total") {
            return (
              <strong>{formatPriceString(row.original.billing[0].invoice.total)}</strong>
            );
          }
          if (bla === "shipping[0].workflow.status") {
            return (
              <Badge
                badgeSize="large"
                i18nKeyLabel={`cartDrawer.${row.value}`}
                label={row.value}
                status={this.shippingBadgeStatus()}
              />
            );
          }
          if (bla === "workflow.status") {
            const classes = classnames({
              "rui": true,
              "btn": true,
              "btn-success": row.original.workflow.status === "new"
            });

            return (
              <span>
                <Badge
                  badgeSize="large"
                  i18nKeyLabel={`cartDrawer.${row.value}`}
                  label={row.value}
                  status={this.fulfillmentBadgeStatus(row.original)}
                />
                <button
                  className={classes}
                  data-event-action="startProcessingOrder"
                  style={{ backgroundColor: "transparent", float: "right" }}
                  onClick={() => this.props.handleClick(row.original)}
                >
                  <Icon icon="fa fa-chevron-right" />
                </button>
              </span>
            );
          }
          return (
            <span>{row.value}</span>
          );
        }
      };
      customColumnMetadata.push(columnMeta);
    });

    return (
      <SortableTable
        tableClassName="rui order table -highlight"
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

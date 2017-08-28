import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames/dedupe";
import moment from "moment";
import { formatPriceString } from "/client/api";
import Avatar from "react-avatar";
import { Badge, ClickToCopy, Icon, RolloverCheckbox, Checkbox } from "@reactioncommerce/reaction-ui";
import { getOrderRiskBadge, getOrderRiskStatus } from "../helpers";

class OrderTableColumn extends Component {
  static propTypes = {
    fulfillmentBadgeStatus: PropTypes.func,
    handleClick: PropTypes.func,
    handleSelect: PropTypes.func,
    row: PropTypes.object,
    selectedItems: PropTypes.array
  }

  renderCheckboxOnSelect(row) {
    if (this.props.selectedItems.length) {
      return (
        <div className="all-checkboxes">
          <Checkbox
            className="checkbox-large checkbox-avatar"
            name={row.original._id}
            onChange={this.props.handleSelect}
            checked={this.props.selectedItems.includes(row.original._id)}
          />
        </div>
      );
    }
    return (
      <RolloverCheckbox
        checkboxClassName="checkbox-avatar checkbox-large"
        name={row.original._id}
        onChange={this.props.handleSelect}
        checked={this.props.selectedItems.includes(row.original._id)}
      >
        <Avatar
          email={row.original.email}
          round={true}
          name={row.value}
          size={30}
          className="rui-order-avatar"
        />
      </RolloverCheckbox>
    );
  }

  render() {
    const columnAccessor = this.props.row.column.id;
    const orderRisk = getOrderRiskStatus(this.props.row.original);

    if (columnAccessor === "shipping[0].address.fullName") {
      return (
        <div style={{ display: "inline-flex" }}>
          {this.renderCheckboxOnSelect(this.props.row)}
          <strong style={{ paddingLeft: 5, marginTop: 7 }}>
            {this.props.row.value}
          </strong>
          {orderRisk &&
            <Badge
              badgeSize="large"
              className="risk-info"
              i18nKeyLabel={`admin.orderRisk.${orderRisk}`}
              label={orderRisk}
              status={getOrderRiskBadge(orderRisk)}
            />
          }
        </div>
      );
    }
    if (columnAccessor === "email") {
      return (
        <div style={{ marginTop: 7 }}>{this.props.row.value}</div>
      );
    }
    if (columnAccessor === "createdAt") {
      const createdDate = moment(this.props.row.value).format("MM/D/YYYY");
      return (
        <div style={{ marginTop: 7 }}>{createdDate}</div>
      );
    }
    if (columnAccessor === "_id") {
      const id = this.props.row.original._id;
      const truncatedId = id.substring(0, 4);
      return (
        <div style={{ marginTop: 7 }}>
          <ClickToCopy
            copyToClipboard={id}
            displayText={truncatedId}
            i18nKeyTooltip="admin.orderWorkflow.summary.copyOrderLink"
            tooltip="Copy Order Link"
          />
        </div>
      );
    }
    if (columnAccessor === "billing[0].invoice.total") {
      return (
        <div style={{ marginTop: 7 }}>
          <strong>{formatPriceString(this.props.row.original.billing[0].invoice.total)}</strong>
        </div>
      );
    }
    if (columnAccessor === "shipping[0].workflow.status") {
      return (
        <Badge
          className="orders-badge"
          badgeSize="large"
          i18nKeyLabel={`cartDrawer.${this.props.row.value}`}
          label={this.props.row.value}
          status="basic"
        />
      );
    }
    if (columnAccessor === "workflow.status") {
      return (
        <div className="status-info">
          <Badge
            badgeSize="large"
            i18nKeyLabel={`cartDrawer.${this.props.row.value}`}
            label={this.props.row.value}
            status={this.props.fulfillmentBadgeStatus(this.props.row.original)}
          />
        </div>
      );
    }
    if (columnAccessor === "") {
      const startWorkflow = this.props.row.original.workflow.status === "new";
      const classes = classnames({
        "rui": true,
        "btn": true,
        "btn-success": startWorkflow
      });

      return (
        <button className={classes} onClick={() => this.props.handleClick(this.props.row.original, startWorkflow)}>
          <Icon icon="fa fa-chevron-right" />
        </button>
      );
    }
    return (
      <span>{this.props.row.value}</span>
    );
  }
}

export default OrderTableColumn;

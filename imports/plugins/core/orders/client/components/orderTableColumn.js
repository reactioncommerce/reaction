import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames/dedupe";
import moment from "moment";
import { formatPriceString } from "/client/api";
import Avatar from "react-avatar";
import { Badge, ClickToCopy, Icon, RolloverCheckbox } from "@reactioncommerce/reaction-ui";
import { getOrderRiskBadge, getOrderRiskStatus } from "../helpers";

class OrderTableColumn extends Component {
  static propTypes = {
    fulfillmentBadgeStatus: PropTypes.func,
    handleClick: PropTypes.func,
    handleSelect: PropTypes.func,
    row: PropTypes.object,
    selectedItems: PropTypes.array,
    shippingBadgeStatus: PropTypes.func
  }

  render() {
    const { row, selectedItems, handleClick, handleSelect, fulfillmentBadgeStatus, shippingBadgeStatus } = this.props;
    const columnAccessor = row.column.id;

    if (columnAccessor === "shipping[0].address.fullName") {
      return (
        <div style={{ display: "inline-flex" }}>
          <RolloverCheckbox
            checkboxClassName="checkbox-avatar checkbox-large"
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
          <strong style={{ paddingLeft: 5, marginTop: 7 }}>{row.value}</strong>
        </div>
      );
    }
    if (columnAccessor === "email") {
      return (
        <div style={{ marginTop: 7 }}>{row.value}</div>
      );
    }
    if (columnAccessor === "createdAt") {
      const createdDate = moment(row.value).format("MM/D/YYYY");
      return (
        <div style={{ marginTop: 7 }}>{createdDate}</div>
      );
    }
    if (columnAccessor === "_id") {
      const id = row.original._id;
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
          <strong>{formatPriceString(row.original.billing[0].invoice.total)}</strong>
        </div>
      );
    }
    if (columnAccessor === "shipping[0].workflow.status") {
      return (
        <Badge
          className="orders-badge"
          badgeSize="large"
          i18nKeyLabel={`cartDrawer.${row.value}`}
          label={row.value}
          status={shippingBadgeStatus()}
        />
      );
    }
    if (columnAccessor === "workflow.status") {
      const orderRisk = getOrderRiskStatus(row.original);

      return (
        <div className="status-info">
          <Badge
            badgeSize="large"
            i18nKeyLabel={`cartDrawer.${row.value}`}
            label={row.value}
            status={fulfillmentBadgeStatus(row.original)}
          />
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
    if (columnAccessor === "") {
      const startWorkflow = row.original.workflow.status === "new";
      const classes = classnames({
        "rui": true,
        "btn": true,
        "btn-success": startWorkflow
      });

      return (
        <button className={classes} onClick={() => handleClick(row.original, startWorkflow)}>
          <Icon icon="fa fa-chevron-right" />
        </button>
      );
    }
    return (
      <span>{row.value}</span>
    );
  }
}

export default OrderTableColumn;

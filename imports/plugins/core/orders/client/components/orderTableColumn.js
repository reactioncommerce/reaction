import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames/dedupe";
import moment from "moment";
import { formatPriceString } from "/client/api";
import Avatar from "react-avatar";
import { Badge, ClickToCopy, Icon, RolloverCheckbox } from "@reactioncommerce/reaction-ui";

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
            checkboxClassName="checkbox-large checkbox-avatar"
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
    if (columnAccessor === "email") {
      return (
        <span>{row.value}</span>
      );
    }
    if (columnAccessor === "createdAt") {
      const createdDate = moment(row.value).format("MM/D/YYYY");
      return (
        <span>{createdDate}</span>
      );
    }
    if (columnAccessor === "_id") {
      return (
        <ClickToCopy
          copyToClipboard={row.original._id}
          displayText={row.original._id}
          i18nKeyTooltip="admin.orderWorkflow.summary.copyOrderLink"
          tooltip="Copy Order Link"
        />
      );
    }
    if (columnAccessor === "billing[0].invoice.total") {
      return (
        <strong>{formatPriceString(row.original.billing[0].invoice.total)}</strong>
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
            status={fulfillmentBadgeStatus(row.original)}
          />
          <button
            className={classes}
            data-event-action="startProcessingOrder"
            style={{ backgroundColor: "transparent", float: "right" }}
            onClick={() => handleClick(row.original)}
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
}

export default OrderTableColumn;

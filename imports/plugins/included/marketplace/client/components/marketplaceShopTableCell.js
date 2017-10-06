import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { SHOP_WORKFLOW_STATUS_ACTIVE, SHOP_WORKFLOW_STATUS_DISABLED } from "../../lib/constants";

class MarketplaceShopTableCell extends Component {
  static propTypes = {
    data: PropTypes.object,
    field: PropTypes.string,
    onWorkflowChange: PropTypes.func
  }

  get shop() {
    return this.props.data.original;
  }

  get status() {
    if (this.shop.workflow) {
      return this.shop.workflow.status;
    }

    return SHOP_WORKFLOW_STATUS_ACTIVE;
  }

  handleWorkflowChange = (event, value) => {
    if (this.props.onWorkflowChange) {
      // Get the shop id from the original document
      const { _id } = this.shop;

      this.props.onWorkflowChange(_id, value);
    }
  }

  render() {
    const { field, data } = this.props;

    if (field === "emails" && Array.isArray(data.value) && data.value.length) {
      return (
        <div className="table-cell body">
          <span>{data.value[0].address}</span>
        </div>
      );
    }

    if (field === "workflow") {
      return (
        <Components.DropDownMenu
          buttonElement={
            <div className="col-dropdown">
              <Components.Button bezelStyle="solid" label={_.startCase(this.status)}>
                &nbsp;
                <i className="fa fa-chevron-down" />
              </Components.Button>
            </div>
          }
          onChange={this.handleWorkflowChange}
          value={this.status}
        >
          <Components.MenuItem
            label="Active"
            value={SHOP_WORKFLOW_STATUS_ACTIVE}
          />
          <Components.MenuItem
            label="Disabled"
            value={SHOP_WORKFLOW_STATUS_DISABLED}
          />
        </Components.DropDownMenu>
      );
    }


    return (
      <div className="table-cell body">
        <span>{data.value}</span>
      </div>
    );
  }
}

registerComponent("MarketplaceShopTableCell", MarketplaceShopTableCell);

export default MarketplaceShopTableCell;

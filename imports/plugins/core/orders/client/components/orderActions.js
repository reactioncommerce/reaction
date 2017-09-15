import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames/dedupe";
import { i18next } from "/client/api";
import { Button, DropDownMenu, MenuItem, Translation } from "@reactioncommerce/reaction-ui";

class OrderActions extends Component {
  static propTypes = {
    className: PropTypes.string,
    clearFilter: PropTypes.func,
    filter: PropTypes.string,
    handleMenuClick: PropTypes.func
  }

  buttonElement() {
    return (
      <Button
        className="order-filter-dropdown-button"
      >
        <i className="fa fa-angle-down" />
      </Button>
    );
  }

  render() {
    const filterClassName = classnames({
      "order-filter-button": true
    }, this.props.className);

    const labelClassName = classnames({
      "order-filter-name": true
    }, this.props.className);

    const attachmentDirection = i18next.dir() === "rtl" ? "left" : "right";

    return (
      <div className="order-filter-bar">
        <div className="order-filter-item">
          <div className="order-filter-label">
            <span className={labelClassName}>
              <Translation
                defaultValue={this.props.filter}
                i18nKey={this.props.filter}
              />
            </span>
            <div className="order-filter-icons">
              <Button
                className={filterClassName}
                onClick={this.props.clearFilter}
              >
                <i className="fa fa-filter" />
              </Button>
              <DropDownMenu
                buttonElement={this.buttonElement()}
                menuClassName="tab-list-dropdown"
                className="order-menu-item-dropdown"
                onChange={this.props.handleMenuClick}
                attachment={`bottom ${attachmentDirection}`}
                targetAttachment={`top ${attachmentDirection}`}
              >
                <MenuItem
                  label="New"
                  i18nKeyLabel="order.filter.new"
                  value="new"
                />
                <MenuItem
                  label="Approved"
                  i18nKeyLabel="order.filter.approved"
                  value="approved"
                />
                <MenuItem
                  label="Captured"
                  i18nKeyLabel="order.filter.captured"
                  value="captured"
                />
                <MenuItem
                  label="Processing"
                  i18nKeyLabel="order.filter.processing"
                  value="processing"
                />
                <MenuItem
                  label="Completed"
                  i18nKeyLabel="order.filter.completed"
                  value="completed"
                />
                <MenuItem
                  label="Canceled"
                  i18nKeyLabel="order.filter.canceled"
                  value="canceled"
                />
              </DropDownMenu>
            </div>


          </div>
        </div>
        <div className="order-filter-item">
          <div className="order-filter-label">
            <span className="order-filter-name">
              <Translation
                defaultValue="This Week"
                i18nKey="order.filter.thisWeek"
              />
            </span>
            <div className="order-filter-icons">
              <Button className="order-filter-button">
                <i className="fa fa-filter" />
              </Button>
              {this.buttonElement()}
            </div>
          </div>
        </div>
        <div className="order-filter-item">
          <div className="order-filter-label">
            <span className="order-filter-name">
              <Translation
                defaultValue="Shipping Status"
                i18nKey="order.filter.shippingStatus"
              />
            </span>
            <div className="order-filter-icons">
              <Button className="order-filter-button">
                <i className="fa fa-filter" />
              </Button>
              {this.buttonElement()}
            </div>

          </div>
        </div>
      </div>
    );
  }
}

export default OrderActions;

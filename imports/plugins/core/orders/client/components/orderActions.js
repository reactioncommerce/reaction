import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames/dedupe";
import { Button, DropDownMenu, MenuItem, Icon } from "@reactioncommerce/reaction-ui";

class OrderActions extends Component {
  static propTypes = {
    clearFilter: PropTypes.func,
    handleMenuClick: PropTypes.func
  }

  state = {
    className: ""
  }

  buttonElement() {
    return (
      <Button
        className="order-filter-button"
        onClick={() => {
          this.setState({
            isOpen: !this.state.isOpen
          });
        }}
      >
        <i className="fa fa-filter" /> &nbsp;
        <i className="fa fa-chevron-down" />
      </Button>
    );
  }

  render() {
    const iconClassName = classnames({
      "order-filter-status-icon": true
    }, this.state.className);
    return (
      <div className="order-filter-bar">
        <div className="order-filter-item">
          <div className="order-filter-label">
            <Button
              className={iconClassName}
              onClick={() => {
                this.props.clearFilter();
                this.setState({
                  className: ""
                });
              }}
            >
              <i className="fa fa-caret-down fa-2x"/>
            </Button>
            <span className="order-filter-name"> New </span>

            <DropDownMenu
              buttonElement={this.buttonElement()}
              menuClassName="tab-list-dropdown"
              className="order-menu-item-dropdown"
              onChange={(event, value) => {
                this.setState({
                  className: "status-active"
                });
                this.props.handleMenuClick(event, value);
              }}
              attachment="bottom right"
              targetAttachment="top right"
            >
              <MenuItem
                label="Created"
                value="created"
              />
              <MenuItem
                label="Approved"
                value="approved"
              />
              <MenuItem
                label="Captured"
                value="captured"

              />
              <MenuItem
                label="Processing"
                value="processing"
              />
              <MenuItem
                label="Completed"
                value="completed"
              />
              <MenuItem
                label="Canceled"
                value="canceled"
              />
            </DropDownMenu>
          </div>
        </div>
        <div className="order-filter-item">
          <div className="order-filter-label">
            <Icon className="order-filter-icon" icon="fa fa-caret-down fa-2x" />
            <span className="order-filter-name"> This Week </span>

            {this.buttonElement()}
          </div>
        </div>
        <div className="order-filter-item">
          <div className="order-filter-label">
            <Icon className="order-filter-icon" icon="fa fa-caret-down fa-2x" />
            <span className="order-filter-name">  Shipping Status </span>

            {this.buttonElement()}
          </div>
        </div>
      </div>
    );
  }
}

export default OrderActions;

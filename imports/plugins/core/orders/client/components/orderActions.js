import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, DropDownMenu, MenuItem } from "@reactioncommerce/reaction-ui";

class OrderActions extends Component {
  static propTypes = {
    handleMenuClick: PropTypes.func
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
    return (
      <div className="order-filter-bar">

        <div
          className="order-filter-item"
          onClick={() => {}}
        >
          <div className="order-filter-label">
            <span className="order-filter-name"> New </span>

            <DropDownMenu
              buttonElement={this.buttonElement()}
              menuClassName="tab-list-dropdown"
              className="order-menu-item-dropdown"
              onChange={this.props.handleMenuClick}
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
        <div
          className="order-filter-item"
          onClick={() => {}}
        >
          <div className="order-filter-label">
            <span className="order-filter-name"> This Week </span>

            {this.buttonElement()}
          </div>
        </div>
        <div
          className="order-filter-item"
          onClick={() => {}}
        >
          <div className="order-filter-label">
            <span className="order-filter-name">  Shipping Status </span>

            {this.buttonElement()}
          </div>


        </div>
      </div>
    );
  }
}

export default OrderActions;

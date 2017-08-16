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
              attachment="bottom right"
              targetAttachment="top right"
            >
              <MenuItem
                label="Approved"
                onClick={this.props.handleMenuClick("Approved")}
              />
              <MenuItem label="Captured"/>
              <MenuItem label="Processing"/>
              <MenuItem label="Completed"/>
              <MenuItem label="Canceled"/>
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

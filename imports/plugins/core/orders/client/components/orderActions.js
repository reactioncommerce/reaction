import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, List, ListItem } from "@reactioncommerce/reaction-ui";

class OrderActions extends Component {
  static propTypes = {
    filters: PropTypes.arrayOf(PropTypes.object),
    onActionClick: PropTypes.func,
    selectedIndex: PropTypes.number
  }

  state = {
    isOpen: false
  }

  handleActionClick = (event, value) => {
    if (typeof this.props.onActionClick === "function") {
      this.props.onActionClick(value);
    }
  }

  buttonElement() {
    return (
      <Button className="order-filter-button" style={{ flex: "0 1 auto", marginLeft: "auto" }}
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

  renderList() {
    if (this.state.isOpen) {
      return (
        <List className="tab-list-dropdown">
          <ListItem label="Capture"/>
          <ListItem label="Approve"/>
          <ListItem label="New"/>
        </List>
      );
    }
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

            {this.buttonElement()}
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
        {this.renderList()}
      </div>
    );
  }
}

export default OrderActions;

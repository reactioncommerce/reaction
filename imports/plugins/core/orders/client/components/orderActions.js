import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames/dedupe";
import { Components } from "@reactioncommerce/reaction-components";

class OrderActions extends Component {
  static propTypes = {
    className: PropTypes.object,
    clearFilter: PropTypes.func,
    filter: PropTypes.string,
    handleMenuClick: PropTypes.func,
    onDatesChange: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  onDatesChange = (startDate, endDate) => {
    this.props.onDatesChange(startDate, endDate);
  }

  buttonElement() {
    return (
      <Components.Button
        className="order-filter-dropdown-button"
      >
        <i className="fa fa-angle-down" />
      </Components.Button>
    );
  }

  render() {
    return (
      <div className="order-filter-bar">
        <div className="order-filter-item">
          <div className="order-filter-label">
            <span
              className={classnames({
                "order-filter-name": true
              }, this.props.className.status)}
            >
              {this.props.filter}
            </span>
            <div className="order-filter-icons">
              <Components.Button
                className={ classnames({
                  "order-filter-button": true
                }, this.props.className.status)}
                onClick={() => this.props.clearFilter("status")}
              >
                <i className="fa fa-filter" />
              </Components.Button>
              <Components.DropDownMenu
                buttonElement={this.buttonElement()}
                menuClassName="tab-list-dropdown"
                className="order-menu-item-dropdown"
                onChange={this.props.handleMenuClick}
                attachment="bottom right"
                targetAttachment="top right"
              >
                <Components.MenuItem
                  label="New"
                  i18nKeyLabel="order.filter.new"
                  value="new"
                />
                <Components.MenuItem
                  label="Approved"
                  i18nKeyLabel="order.filter.approved"
                  value="approved"
                />
                <Components.MenuItem
                  label="Captured"
                  i18nKeyLabel="order.filter.captured"
                  value="captured"
                />
                <Components.MenuItem
                  label="Processing"
                  i18nKeyLabel="order.filter.processing"
                  value="processing"
                />
                <Components.MenuItem
                  label="Completed"
                  i18nKeyLabel="order.filter.completed"
                  value="completed"
                />
                <Components.MenuItem
                  label="Canceled"
                  i18nKeyLabel="order.filter.canceled"
                  value="canceled"
                />
              </Components.DropDownMenu>
            </div>
          </div>
        </div>
        <div className="order-filter-item">
          <div className="order-filter-label">
            <span className="order-filter-name"> Date range </span>
            <div className="order-filter-icons">
              <Components.Button
                className={classnames({
                  "order-filter-button": true
                }, this.props.className.date)}
                onClick={() => this.props.clearFilter("date")}
              >
                <i className="fa fa-filter" />
              </Components.Button>
              <Components.DropDownMenu
                buttonElement={this.buttonElement()}
                menuClassName="calender-dropdown"
                className="order-menu-item-dropdown"
                attachment="bottom right"
                targetAttachment="top right"
                isClickable={false}
              >
                <Components.CalendarPicker onDatesChange={this.onDatesChange}/>
              </Components.DropDownMenu>
            </div>
          </div>
        </div>
        <div className="order-filter-item">
          <div className="order-filter-label">
            <span className="order-filter-name">  Shipping Status </span>
            <div className="order-filter-icons">
              <Components.Button className="order-filter-button">
                <i className="fa fa-filter" />
              </Components.Button>
              {this.buttonElement()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default OrderActions;

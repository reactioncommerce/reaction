import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames/dedupe";
import { Components } from "@reactioncommerce/reaction-components";

class OrderActions extends Component {
  static propTypes = {
    classNamesContainer: PropTypes.object,
    clearFilter: PropTypes.func,
    filter: PropTypes.string,
    filterDates: PropTypes.func,
    handleMenuClick: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {
      startDate: null,
      endDate: null
    };
  }

  handleDatesChange = (startDate, endDate) => {
    this.setState({
      startDate,
      endDate
    });
    this.props.filterDates(startDate, endDate);
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

  dateLabel() {
    if (this.state.startDate && this.state.endDate) {
      return (
        <span>{this.state.startDate.format("MM/DD")} - {this.state.endDate.format("MM/DD")}</span>
      );
    }
    return (
      <Components.Translation defaultValue="Date Range" i18nKey="order.filter.dateRange" />
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
              }, this.props.classNamesContainer.status)}
            >
              {this.props.filter}
            </span>
            <div className="order-filter-icons">
              <Components.Button
                className={classnames({
                  "order-filter-button": true
                }, this.props.classNamesContainer.status)}
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
            <span
              className={classnames({
                "order-filter-name": true
              }, this.props.classNamesContainer.date)}
            >
              {this.dateLabel()}
            </span>
            <div className="order-filter-icons">
              <Components.Button
                className={classnames({
                  "order-filter-button": true
                }, this.props.classNamesContainer.date)}
                onClick={() => {
                  this.setState({
                    startDate: null,
                    endDate: null
                  });

                  this.props.clearFilter("date");
                }}
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
                <Components.CalendarPicker
                  initialStartDate={this.state.startDate}
                  initialEndDate={this.state.endDate}
                  onDatesChange={this.handleDatesChange}
                />
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

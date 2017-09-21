import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames/dedupe";
import { Components } from "@reactioncommerce/reaction-components";

class OrderActions extends Component {
  static propTypes = {
    clearFilter: PropTypes.func,
    filterDates: PropTypes.func,
    filterShippingStatus: PropTypes.func,
    filterWorkflowStatus: PropTypes.func
  }

  constructor(props) {
    super(props);
    this.state = {
      startDate: null,
      endDate: null,
      workflowLabel: "status",
      shippingLabel: "shippingStatus",
      classNames: {
        date: "",
        shipping: "",
        workflow: ""
      }
    };
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

  shippingLabel() {
    if (this.state.classNames.shipping === "active") {
      return (
        <Components.Translation
          defaultValue={this.state.shippingLabel}
          i18nKey={`order.${this.state.shippingLabel}`}
        />
      );
    }
    return (
      <Components.Translation
        defaultValue={this.state.shippingLabel}
        i18nKey={`order.filter.${this.state.shippingLabel}`}
      />
    );
  }

  handleDatesChange = (startDate, endDate) => {
    this.setState({
      startDate,
      endDate,
      classNames: { ...this.state.classNames, date: "active" }
    });
    this.props.filterDates(startDate, endDate);
  }

  handleWorkflowChange = (event, value) => {
    this.setState({
      workflowLabel: value,
      classNames: { ...this.state.classNames, workflow: "active" }
    });

    this.props.filterWorkflowStatus(event, value);
  }

  handleShippingChange = (event, value) => {
    this.setState({
      shippingLabel: value,
      classNames: { ...this.state.classNames, shipping: "active" }
    });

    this.props.filterShippingStatus(event, value);
  }

  render() {
    return (
      <div className="order-filter-bar">
        <div className="order-filter-item">
          <div className="order-filter-label">
            <span
              className={classnames({
                "order-filter-name": true
              }, this.state.classNames.workflow)}
            >
              <Components.Translation
                defaultValue={this.state.workflowLabel}
                i18nKey={`order.filter.${this.state.workflowLabel}`}
              />
            </span>
            <div className="order-filter-icons">
              <Components.Button
                className={
                  classnames({
                    "order-filter-button": true
                  }, this.state.classNames.workflow)}
                onClick={() => {
                  this.setState({
                    workflowLabel: "status",
                    classNames: { ...this.state.classNames, workflow: "" }
                  });
                  this.props.clearFilter("workflow");
                }}
              >
                <i className="fa fa-filter" />
              </Components.Button>
              <Components.DropDownMenu
                buttonElement={this.buttonElement()}
                menuClassName="status-dropdown"
                className="order-menu-item-dropdown"
                onChange={this.handleWorkflowChange}
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
              }, this.state.classNames.date)}
            >
              {this.dateLabel()}
            </span>
            <div className="order-filter-icons">
              <Components.Button
                className={
                  classnames({
                    "order-filter-button": true
                  }, this.state.classNames.date)}
                onClick={() => {
                  this.setState({
                    startDate: null,
                    endDate: null,
                    classNames: { ...this.state.classNames, date: "" }
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
            <span
              className={classnames({
                "order-filter-name": true
              }, this.state.classNames.shipping)}
            >
              {this.shippingLabel()}
            </span>
            <div className="order-filter-icons">
              <Components.Button
                className={
                  classnames({
                    "order-filter-button": true
                  }, this.state.classNames.shipping)}
                onClick={() => {
                  this.setState({
                    shippingLabel: "shippingStatus",
                    classNames: { ...this.state.classNames, shipping: "" }
                  });
                  this.props.clearFilter("shipping");
                }}
              >
                <i className="fa fa-filter" />
              </Components.Button>
              <Components.DropDownMenu
                buttonElement={this.buttonElement()}
                menuClassName="status-dropdown"
                className="order-menu-item-dropdown"
                onChange={this.handleShippingChange}
                attachment="bottom right"
                targetAttachment="top right"
              >
                <Components.MenuItem
                  label="Picked"
                  i18nKeyLabel="order.picked"
                  value="picked"
                />
                <Components.MenuItem
                  label="Packed"
                  i18nKeyLabel="order.packed"
                  value="packed"
                />
                <Components.MenuItem
                  label="Labeled"
                  i18nKeyLabel="order.labeled"
                  value="labeled"
                />
                <Components.MenuItem
                  label="Shipped"
                  i18nKeyLabel="order.shipped"
                  value="shipped"
                />
              </Components.DropDownMenu>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default OrderActions;

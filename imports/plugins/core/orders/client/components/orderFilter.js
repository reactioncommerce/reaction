import React, { Component } from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import * as Constants from "../../lib/constants";

class OrderFilter extends Component {
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
      <Components.Translation defaultValue="Date Range" i18nKey="admin.table.filter.dateRange" />
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
        defaultValue="Shipping Status"
        i18nKey={`admin.table.filter.${this.state.shippingLabel}`}
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
    const attachmentDirection = i18next.dir() === "rtl" ? "left" : "right";

    return (
      <div className="order-filter-bar">
        <div className="order-filter-item">
          <div className="order-filter-label">
            <span className={`order-filter-name capitalize ${this.state.classNames.workflow}`}>
              <Components.Translation
                defaultValue={this.state.workflowLabel}
                i18nKey={`admin.table.filter.${this.state.workflowLabel}`}
              />
            </span>
            <div className="order-filter-icons">
              <Components.Button
                className={`order-filter-button ${this.state.classNames.workflow}`}
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
                attachment={`bottom ${attachmentDirection}`}
                targetAttachment={`top ${attachmentDirection}`}
              >
                {Constants.workflowStatus.map((status, index) => (
                  <Components.MenuItem
                    key={index}
                    label={status.label}
                    i18nKeyLabel={`admin.table.filter.${status.value}`}
                    value={status.value}
                  />
                ))}
              </Components.DropDownMenu>
            </div>
          </div>
        </div>

        <div className="order-filter-item">
          <div className="order-filter-label">
            <span className={`order-filter-name ${this.state.classNames.date}`}>
              {this.dateLabel()}
            </span>
            <div className="order-filter-icons">
              <Components.Button
                className={`order-filter-button ${this.state.classNames.date}`}
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
                attachment={`bottom ${attachmentDirection}`}
                targetAttachment={`top ${attachmentDirection}`}
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

        <div className="order-filter-item hidden-xs">
          <div className="order-filter-label">
            <span className={`order-filter-name capitalize ${this.state.classNames.shipping}`}>
              {this.shippingLabel()}
            </span>
            <div className="order-filter-icons">
              <Components.Button
                className={`order-filter-button ${this.state.classNames.shipping}`}
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
                attachment={`bottom ${attachmentDirection}`}
                targetAttachment={`top ${attachmentDirection}`}
              >
                {Constants.shippingStatus.map((status, index) => (
                  <Components.MenuItem
                    key={index}
                    label={status.label}
                    i18nKeyLabel={`order.${status.value}`}
                    value={status.value}
                  />
                ))}
              </Components.DropDownMenu>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

registerComponent("OrderFilter", OrderFilter);

export default OrderFilter;

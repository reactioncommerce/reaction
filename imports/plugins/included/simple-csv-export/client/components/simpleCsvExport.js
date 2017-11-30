import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { Components } from "@reactioncommerce/reaction-components";


class SimpleCSVExport extends Component {
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
  }

  handleOnclick() {
    Meteor.call("orders/orders/FetchExportData", (error) => {
      if (error) {
        console.log(error, "I didnt work");
      } else {
        console.log("I worked");
      }
    });
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

  render() {
    return  (
      <div>
        <Components.CalendarPicker
          initialStartDate={this.state.startDate}
          initialEndDate={this.state.endDate}
          onDatesChange={this.handleDatesChange}
        />
        {this.dateLabel()}
        <br />
        <br />
        <br />
        <button onClick={this.handleOnclick}>
        Export
        </button>
      </div>
    );
  }
}

export default SimpleCSVExport;

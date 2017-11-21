import React, { Component } from "react";
import { Components } from "@reactioncommerce/reaction-components";
import { FetchExportDataSet } from "../../server/jobs";


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
    FetchExportDataSet();
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
        <br />
        {this.dateLabel()}
        <br />
        <button onClick={this.handleOnclick}>
        Export
        </button>
      </div>
    );
  }
}

export default SimpleCSVExport;

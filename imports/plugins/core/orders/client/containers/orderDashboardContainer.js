import React, { Component } from "react";
import { compose } from "recompose";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { filterShippingStatus, filterWorkflowStatus } from "../helpers";
import OrderSubscription from "./orderSubscriptionContainer";

const wrapComponent = (Comp) => (
  class OrderDashboardContainer extends Component {
    constructor(props) {
      super(props);
      this.state = {
        query: {},
        searchQuery: "",
        shippingFilter: "",
        workflowFilter: ""
      };
    }

    filterDates = (startDate, endDate) => {
      const { query } = this.state;

      if (startDate && endDate) {
        // generate time for start and end of day
        const formattedEndDate = endDate.endOf("day");
        const formattedStartDate = startDate.startOf("day");

        query.createdAt = {
          $gte: new Date(formattedStartDate.toISOString()),
          $lte: new Date(formattedEndDate.toISOString())
        };
        this.setState({ query });
      }
    }

    /**
     * handleSearchChange - handler called on search query change
     * @param  {String} value - search field current value
     * @return {null} -
     */
    handleSearchChange = (value) => {
      this.setState({ searchQuery: value });
    }

    filterWorkflowStatus = (event, value) => {
      const query = filterWorkflowStatus(value);
      const { shippingFilter } = this.state;
      if (this.state.query.createdAt) {
        query.createdAt = this.state.query.createdAt;
      }

      if (this.state.query._id) {
        query._id = this.state.query._id;
      }

      this.setState({
        query: { ...filterShippingStatus(shippingFilter.toLowerCase()), ...query },
        workflowFilter: value
      });
    }

    filterShippingStatus = (event, value) => {
      const query = filterShippingStatus(value);
      const { workflowFilter } = this.state;

      if (this.state.query.createdAt) {
        query.createdAt = this.state.query.createdAt;
      }

      if (this.state.query._id) {
        query._id = this.state.query._id;
      }

      this.setState({
        query: { ...filterWorkflowStatus(workflowFilter.toLowerCase()), ...query },
        shippingFilter: value
      });
    }

    clearFilter = (filterString) => {
      let query;
      let { shippingFilter, workflowFilter } = this.state;

      if (filterString === "workflow") {
        workflowFilter = "";
        query = { ...filterWorkflowStatus(workflowFilter), ...filterShippingStatus(shippingFilter.toLowerCase()) };

        if (this.state.query.createdAt) {
          query.createdAt = this.state.query.createdAt;
        }
      } else if (filterString === "date") {
        query = {
          ...filterWorkflowStatus(workflowFilter.toLowerCase()),
          ...filterShippingStatus(shippingFilter.toLowerCase())
        };
      } else if (filterString === "shipping") {
        shippingFilter = "";
        query = { ...filterWorkflowStatus(workflowFilter.toLowerCase()), ...filterShippingStatus(shippingFilter) };

        if (this.state.query.createdAt) {
          query.createdAt = this.state.query.createdAt;
        }
      }

      // If there is an id on the current search appeng it to query
      if (this.state.query._id) {
        query._id = this.state.query._id;
      }

      this.setState({
        query,
        shippingFilter,
        workflowFilter
      });
    }

    render() {
      return (
        <Comp
          searchQuery={this.state.searchQuery}
          query={this.state.query}
          clearFilter={this.clearFilter}
          filterDates={this.filterDates}
          filterShippingStatus={this.filterShippingStatus}
          filterWorkflowStatus={this.filterWorkflowStatus}
          handleChange={this.handleSearchChange}
        />
      );
    }
  }
);

registerComponent("OrderSubscription", OrderSubscription, [wrapComponent]);

export default compose(wrapComponent)(OrderSubscription);

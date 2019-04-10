import React from "react";
import PropTypes from "prop-types";
import { compose, withState } from "recompose";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Counts } from "meteor/tmeasday:publish-counts";
import { Orders } from "/lib/collections";
import { filterShippingStatus, filterWorkflowStatus } from "../helpers";
import OrderDashboard from "../components/orderDashboard";

const wrapComponent = (Comp) => {
  /**
   * Order dashboard HOC
   * @param {Object} props Component props
   * @returns {undefined}
   */
  function OrderDashboardContainer(props) {
    const {
      setQuery,
      workflowFilter,
      shippingFilter,
      setShippingFilter,
      setWorkflowFilter,
      setPagination,
      pagination
    } = props;


    const updatePage = (page) => {
      setPagination({
        ...pagination,
        page
      });
    };

    const updatePageSize = (pageSize) => {
      setPagination({
        ...pagination,
        limit: pageSize
      });
    };

    const filterDates = (startDate, endDate) => {
      if (startDate && endDate) {
        // generate time for start and end of day
        const formattedEndDate = endDate.endOf("day");
        const formattedStartDate = startDate.startOf("day");

        setQuery({
          ...props.query,
          createdAt: {
            $gte: new Date(formattedStartDate.toISOString()),
            $lte: new Date(formattedEndDate.toISOString())
          }
        });

        // Reset to the first page
        updatePage(0);
      }
    };

    const handleFilterWorkflowStatus = (event, value) => {
      setQuery({
        ...props.query,
        ...filterShippingStatus(shippingFilter.toLowerCase()),
        ...filterWorkflowStatus(value)
      });
      setWorkflowFilter(value);

      // Reset to the first page
      updatePage(0);
    };

    const handleFilterShippingStatus = (event, value) => {
      setQuery({
        ...props.query,
        ...filterWorkflowStatus(workflowFilter.toLowerCase()),
        ...filterShippingStatus(value)
      });
      setShippingFilter(value);

      // Reset to the first page
      updatePage(0);
    };

    const clearFilter = (filterString) => {
      let query = {};
      const { createdAt } = props.query;
      const shippingStatus = filterShippingStatus(shippingFilter.toLowerCase());
      const workflowStatus = filterWorkflowStatus(shippingFilter.toLowerCase());

      if (filterString === "workflow") {
        // Reset the workflow filter, leave date and shipping alone
        query = {
          createdAt,
          ...shippingStatus
        };
        setWorkflowFilter("");
      } else if (filterString === "date") {
        // Reset the date filter, leave workflow and shipping alone
        query = {
          ...workflowStatus,
          ...shippingStatus
        };
      } else if (filterString === "shipping") {
        // Reset the shipping filter, leave date and workflow alone
        query = {
          createdAt,
          ...workflowStatus
        };
        setShippingFilter("");
      }

      setQuery(query);

      // Reset to the first page
      updatePage(0);
    };

    return (
      <Comp
        {...props}
        clearFilter={clearFilter}
        filterDates={filterDates}
        filterShippingStatus={handleFilterShippingStatus}
        filterWorkflowStatus={handleFilterWorkflowStatus}
        onPageChange={updatePage}
        onPageSizeChange={updatePageSize}
      />
    );
  }

  OrderDashboardContainer.propTypes = {
    pagination: PropTypes.object,
    query: PropTypes.object,
    setPagination: PropTypes.func,
    setQuery: PropTypes.func,
    setShippingFilter: PropTypes.func,
    setWorkflowFilter: PropTypes.func,
    shippingFilter: PropTypes.string,
    workflowFilter: PropTypes.string
  };

  return OrderDashboardContainer;
};

// State handlers
const stateQuery = withState("query", "setQuery", {});
const stateShipping = withState("shippingFilter", "setShippingFilter", "");
const stateWorkflow = withState("workflowFilter", "setWorkflowFilter", "");
const stateHandler = withState("pagination", "setPagination", {
  page: 0,
  limit: 10
});

/**
 * Reactive composer
 * @param {Object} props Props
 * @param {Function} onData Data callback
 * @returns {undefined}
 */
function composer(props, onData) {
  const { query, pagination } = props;
  const { limit, page } = pagination;
  const options = { limit, page };

  const ordersSubscription = Meteor.subscribe("PaginatedOrders", query, options);
  const totalOrderCount = Counts.get("orders-count");

  if (ordersSubscription.ready()) {
    const results = Orders.find(query, { limit }).fetch();
    onData(null, {
      orders: results,
      totalOrderCount,
      pageSize: limit,
      page
    });
  }
}

registerComponent("OrderSubscription", OrderDashboard, [
  stateQuery,
  stateShipping,
  stateWorkflow,
  stateHandler,
  composeWithTracker(composer),
  wrapComponent
]);

export default compose(
  stateQuery,
  stateShipping,
  stateWorkflow,
  stateHandler,
  composeWithTracker(composer),
  wrapComponent
)(OrderDashboard);

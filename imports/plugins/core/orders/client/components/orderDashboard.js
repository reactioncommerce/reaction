import React from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import OrderTable from "../components/orderTable";
import OrderFilter from "./orderFilter";

/**
 * Order Dashboard component
 * @param {Object} props Component props
 * @returns {React.Component} React component
 */
function OrderDashboard(props) {
  const {
    clearFilter,
    filterDates,
    filterShippingStatus,
    filterWorkflowStatus,
    orders,
    onPageChange,
    onPageSizeChange,
    page,
    pageSize,
    totalOrderCount
  } = props;

  return (
    <Card>
      <CardContent>
        <OrderFilter
          clearFilter={clearFilter}
          filterDates={filterDates}
          filterShippingStatus={filterShippingStatus}
          filterWorkflowStatus={filterWorkflowStatus}
        />
        {orders.length ?
          <OrderTable
            orders={orders}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            page={page}
            pageSize={pageSize}
            totalOrderCount={totalOrderCount}
          /> :
          <div className="container-fluid-sm order-details-list-container">
            <div className="empty-view-message">
              <Components.Icon icon="fa fa-sun-o" />
              <Components.Translation defaultValue={"No orders found"} i18nKey={"order.ordersNotFound"} />
            </div>
          </div>
        }
      </CardContent>
    </Card>
  );
}

OrderDashboard.propTypes = {
  clearFilter: PropTypes.func,
  currentPage: PropTypes.number,
  filterDates: PropTypes.func,
  filterShippingStatus: PropTypes.func,
  filterWorkflowStatus: PropTypes.func,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
  orders: PropTypes.array,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  totalOrderCount: PropTypes.number
};

export default OrderDashboard;

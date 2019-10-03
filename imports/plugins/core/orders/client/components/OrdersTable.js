import React, { Fragment, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import DataTable, { useDataTable } from "@reactioncommerce/catalyst/DataTable";
import { useApolloClient } from "@apollo/react-hooks";
import primaryShopIdQuery from "imports/plugins/core/graphql/lib/queries/getPrimaryShopId";
import { Box, Card, CardHeader, CardContent, makeStyles } from "@material-ui/core";
import OrderDateCell from "./OrderDateCell";
import OrderIdCell from "./OrderIdCell";
import ordersQuery from "../graphql/queries/orders";
import { withRouter } from "react-router";
import { i18next } from "/client/api";

/* eslint-disable react/prop-types */
/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */

const useStyles = makeStyles({
  card: {
    overflow: "visible"
  }
});

/**
 * @name OrdersTable
 * @param {Object} history Browser history API
 * @returns {React.Component} A React component
 */
function OrdersTable({ history }) {
  const apolloClient = useApolloClient();
  // Create and memoize the column data
  const columns = useMemo(() => [
    {
      Header: "Order ID",
      accessor: "referenceId",
      Cell: ({ row }) => <OrderIdCell row={row} />
    },
    {
      Header: "Date",
      accessor: "createdAt",
      Cell: ({ row }) => <OrderDateCell row={row} />
    },
    {
      Header: "Payment",
      accessor: "payments[0].status",
      Cell: ({ row }) => <Fragment>{i18next.t(`admin.table.paymentStatus.${row.values["payments[0].status"]}`)}</Fragment>
    },
    {
      Header: "Fulfillment",
      accessor: "fulfillmentGroups[0].status",
      Cell: ({ row }) => <Fragment>{i18next.t(`admin.table.fulfillmentStatus.${row.values["fulfillmentGroups[0].status"]}`)}</Fragment>
    },
    {
      Header: "Customer",
      accessor: "payments[0].billingAddress.fullName"
    },
    {
      Header: () => <Box textAlign="right">{i18next.t("admin.table.headers.total")}</Box>,
      Cell: ({ cell }) => <Box textAlign="right">{cell.value}</Box>,
      accessor: "payments[0].amount.displayAmount"
    }
  ], []);

  const onFetchData = useCallback(async ({ globalFilter, pageIndex, pageSize }) => {
    const { data: shopData } = await apolloClient.query({
      query: primaryShopIdQuery
    });

    // TODO: Add loading and error handling
    const { data } = await apolloClient.query({
      query: ordersQuery,
      variables: {
        shopIds: [shopData.primaryShopId],
        first: pageSize,
        offset: pageIndex * pageSize,
        filters: {
          searchField: globalFilter
        }
      }
    });

    // Return the fetched data as an array of objects and the calculated page count
    return {
      data: data.orders.nodes,
      pageCount: Math.ceil(data.orders.totalCount / pageSize)
    };
  }, [apolloClient]);

  // Row click callback
  const onRowClick = useCallback(async ({ row }) => {
    history.push(`/operator/orders/${row.values.referenceId}`);
  }, [history]);

  const dataTableProps = useDataTable({
    columns,
    getRowID: (row) => row.referenceId,
    onFetchData,
    onRowClick
  });

  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardHeader title={i18next.t("admin.dashboard.ordersTitle", "Orders")} />
      <CardContent>
        <DataTable
          {...dataTableProps}
          placeholder={"Filter orders"}
          isFilterable
        />
      </CardContent>
    </Card>
  );
}

OrdersTable.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};

export default withRouter(OrdersTable);

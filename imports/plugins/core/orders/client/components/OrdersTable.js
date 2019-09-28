import React, { Fragment, useMemo, useCallback } from "react";
import DataTable, { useDataTable } from "@reactioncommerce/catalyst/DataTable";
import { useApolloClient } from "@apollo/react-hooks";
import primaryShopIdQuery from "imports/plugins/core/graphql/lib/queries/getPrimaryShopId";
import { Card, CardHeader, CardContent, makeStyles } from "@material-ui/core";
import moment from "moment";
import ordersQuery from "../graphql/queries/orders";
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
 * @returns {React.Component} A React component
 */
function OrdersTable() {
  const apolloClient = useApolloClient();
  // Create and memoize the column data
  const columns = useMemo(() => [
    {
      Header: () => i18next.t("admin.table.headers.id"),
      accessor: "referenceId"
    },
    {
      Header: () => i18next.t("admin.table.headers.status"),
      accessor: "status",
      Cell: ({ row }) => <Fragment>{i18next.t(`admin.table.orderStatus.${row.values.status}`)}</Fragment>
    },
    {
      Header: () => i18next.t("admin.table.headers.date"),
      accessor: "createdAt",
      Cell: ({ row }) => <Fragment>{moment && moment(row.values.createdAt).format("MMMM Do YYYY")}</Fragment>
    },
    {
      Header: () => i18next.t("admin.table.headers.payment"),
      accessor: "payments[0].status",
      Cell: ({ row }) => <Fragment>{i18next.t(`admin.table.paymentStatus.${row.values["payments[0].status"]}`)}</Fragment>
    },
    {
      Header: () => i18next.t("admin.table.headers.fulfillment"),
      accessor: "fulfillmentGroups[0].status",
      Cell: ({ row }) => <Fragment>{i18next.t(`admin.table.fulfillmentStatus.${row.values["fulfillmentGroups[0].status"]}`)}</Fragment>
    },
    {
      Header: () => i18next.t("admin.table.headers.customer"),
      accessor: "payments[0].billingAddress.fullName"
    },
    {
      Header: () => i18next.t("admin.table.headers.total"),
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

  const dataTableProps = useDataTable({
    columns,
    onFetchData,
    getRowID: (row) => row.referenceId
  });

  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardHeader title={i18next.t("admin.dashboard.ordersTitle")} />
      <CardContent>
        <DataTable
          {...dataTableProps}
          isFilterable
        />
      </CardContent>
    </Card>
  );
}

export default OrdersTable;

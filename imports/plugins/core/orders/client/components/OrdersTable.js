import React, { useMemo, useCallback } from "react";
import DataTable, { useDataTable } from "@reactioncommerce/catalyst/DataTable";
import { useApolloClient } from "@apollo/react-hooks";
import primaryShopIdQuery from "imports/plugins/core/graphql/lib/queries/getPrimaryShopId";
import { Card, CardHeader, CardContent, makeStyles } from "@material-ui/core";
import ordersQuery from "../graphql/queries/orders";

const useStyles = makeStyles({
  card: {
    overflow: "visible"
  }
});

/**
 * @name OrdersTable
 * @returns {React.Component} A React component
 */
export default function OrdersTable() {
  const apolloClient = useApolloClient();
  // Create and memoize the column data
  const columns = useMemo(() => [
    {
      Header: "ID",
      accessor: "referenceId"
    },
    {
      Header: "Email",
      accessor: "email"
    },
    {
      Header: "Status",
      accessor: "status"
    }
  ], []);

  const onFetchData = useCallback(async ({ globalFilter, setData, pageIndex, pageSize }) => {
    // Get data from an API.
    const { data: shopData } = await apolloClient.query({
      query: primaryShopIdQuery
    });

    const { loading, data, error } = await apolloClient.query({
      query: ordersQuery,
      variables: {
        shopIds: [shopData.primaryShopId],
        first: pageSize,
        offset: pageIndex * pageSize
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
      <CardHeader title="Orders" />
      <CardContent>
        <DataTable
          {...dataTableProps}
          isFilterable
        />
      </CardContent>
    </Card>
  );
}

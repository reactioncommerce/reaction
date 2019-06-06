import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { formatPriceString, i18next } from "/client/api";
import { withMoment } from "@reactioncommerce/reaction-components";
import withStyles from "@material-ui/core/styles/withStyles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import ChevronRightIcon from "mdi-material-ui/ChevronRight";
import { getShippingInfo } from "../helpers";

const styles = (theme) => ({
  root: {
    width: "100%",
    marginTop: theme.spacing.unit * 3
  },
  table: {
    minWidth: 1020
  },
  tableWrapper: {
    overflowX: "auto"
  }
});

/**
 * Order Table component
 * @param {Object} props Component Props
 * @returns {React.Component} React component
 */
function OrderTable(props) {
  const {
    classes,
    orders,
    moment,
    page,
    pageSize,
    onPageSizeChange,
    onPageChange,
    totalOrderCount
  } = props;

  let orderElements;

  if (Array.isArray(orders)) {
    orderElements = orders.map((order) => {
      const { address, invoice, workflow: shippingWorkFlow } = getShippingInfo(order);
      const createdDate = (moment && moment(order.createdAt).format("MM/D/YYYY")) || order.createdAt.toLocaleString();
      const billingTotal = formatPriceString(invoice ? invoice.total : 0);
      const orderLink = `/operator/orders/${order._id}`;

      return (
        <TableRow key={order._id}>
          <TableCell>
            <Link to={orderLink}>
              {address.fullName}
            </Link>
          </TableCell>
          <TableCell>
            <Link to={orderLink}>
              {order.email}
            </Link>
          </TableCell>
          <TableCell>{createdDate}</TableCell>
          <TableCell>
            <Link to={orderLink}>
              {order.referenceId}
            </Link>
          </TableCell>
          <TableCell>{billingTotal}</TableCell>
          <TableCell>{i18next.t(`admin.table.data.status.${shippingWorkFlow.status}`)}</TableCell>
          <TableCell>{i18next.t(`admin.table.data.status.${order.workflow.status}`)}</TableCell>
          <TableCell>
            <Link to={orderLink}>
              <IconButton>
                <ChevronRightIcon />
              </IconButton>
            </Link>
          </TableCell>
        </TableRow>
      );
    });
  }

  return (
    <Fragment>
      <div className={classes.tableWrapper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{i18next.t("admin.table.headers.name")}</TableCell>
              <TableCell>{i18next.t("admin.table.headers.email")}</TableCell>
              <TableCell>{i18next.t("admin.table.headers.date")}</TableCell>
              <TableCell>{i18next.t("admin.table.headers.id")}</TableCell>
              <TableCell>{i18next.t("admin.table.headers.total")}</TableCell>
              <TableCell>{i18next.t("admin.table.headers.shipping")}</TableCell>
              <TableCell>{i18next.t("admin.table.headers.status")}</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody style={{ overflowX: "scroll" }}>
            {orderElements}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        count={totalOrderCount}
        component="div"
        page={page}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[10, 24, 50, 100]}
        backIconButtonProps={{
          "aria-label": "Previous Page"
        }}
        nextIconButtonProps={{
          "aria-label": "Next Page"
        }}
        onChangePage={(event, index) => {
          onPageChange(index);
        }}
        onChangeRowsPerPage={(event) => {
          onPageSizeChange(event.target.value, page);
        }}
      />
    </Fragment>
  );
}

OrderTable.propTypes = {
  classes: PropTypes.object,
  getShippingInfo: PropTypes.func,
  handleClick: PropTypes.func,
  moment: PropTypes.func,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
  orders: PropTypes.array,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  pages: PropTypes.number,
  totalOrderCount: PropTypes.number
};

// Decorate and export
const componentWithStyles = withStyles(styles, { name: "RuiOrderTable" })(OrderTable);
export default withMoment(componentWithStyles);

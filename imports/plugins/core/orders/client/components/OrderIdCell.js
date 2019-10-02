import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import Chip from "@reactioncommerce/catalyst/Chip";
import { Link, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  chip: {
    marginLeft: theme.spacing(2)
  }
}));

/**
 * @name OrderIdCell
 * @param {Object} row A react-table row object
 * @return {React.Component} A date component
 */
export default function OrderIdCell({ row }) {
  const classes = useStyles();

  return (
    <Fragment>
      <Link href={`/operator/orders/${row.values.referenceId}`}>
        {row.values.referenceId}
      </Link>
      <Chip
        className={classes.chip}
        size="small"
        variant="outlined"
        label={i18next.t(`admin.table.orderStatus.${row.original.status}`)}
      />
    </Fragment>
  );
}

OrderIdCell.propTypes = {
  row: PropTypes.object.isRequired
};

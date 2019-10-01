import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import Chip from "@reactioncommerce/catalyst/Chip";
import { makeStyles } from "@material-ui/core";

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
      {row.values.referenceId}
      <Chip
        className={classes.chip}
        variant="outlined"
        label={i18next.t(`admin.table.orderStatus.${row.original.status}`)}
      />
    </Fragment>
  );
}

OrderIdCell.propTypes = {
  row: PropTypes.object.isRequired
};

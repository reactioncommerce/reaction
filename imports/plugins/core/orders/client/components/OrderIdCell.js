import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import { withRouter } from "react-router";
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
 * @param {Object} history Router history API
 * @return {React.Component} A date component
 */
function OrderIdCell({ row, history }) {
  const classes = useStyles();

  const handleClick = () => {
    history.push(`/operator/orders/${row.values.referenceId}`);
  };

  let chipColor;
  switch (row.original.status) {
    case "new":
      chipColor = "success";
      break;
    case "coreOrderWorkflow/processing":
      chipColor = "info";
      break;
    case "coreOrderWorkflow/canceled":
      chipColor = "danger";
      break;
    default:
      chipColor = "info";
      break;
  }

  return (
    <Fragment>
      <Link onClick={handleClick}>
        {row.values.referenceId}
      </Link>
      <Chip
        className={classes.chip}
        color={chipColor}
        size="small"
        label={i18next.t(`admin.table.orderStatus.${row.original.status}`)}
      />
    </Fragment>
  );
}

OrderIdCell.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }),
  row: PropTypes.object.isRequired
};

export default withRouter(OrderIdCell);

import React from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Chip from "@material-ui/core/Chip";

const styles = (theme) => ({
  orderStatusNew: {
    backgroundColor: theme.palette.colors.reactionBlue300,
    color: "white",
    fontWeight: "800"
  },
  orderStatusCanceled: {
    backgroundColor: theme.palette.colors.red300,
    color: "white",
    fontWeight: "800"
  },
  orderStatusCanceledOutlined: {
    borderColor: theme.palette.colors.red300,
    color: theme.palette.colors.red300
  },
  orderStatusProcessing: {
    backgroundColor: theme.palette.colors.reactionBlue300,
    color: "white",
    fontWeight: "800"
  },
  orderStatusShipped: {
    backgroundColor: theme.palette.colors.reactionBlue,
    color: "white",
    fontWeight: "800"
  },
  paymentStatusMultiple: {
    borderColor: theme.palette.colors.red
  },
  shipmentStatus: {
    borderColor: theme.palette.colors.red
  }
});

/**
 * @name OrderStatusChip
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function OrderStatusChip(props) {
  const { classes, displayStatus, status, type } = props;

  let chipVariant;
  let chipClasses;

  if (type === "order") {
    chipVariant = "default";

    if (status === "coreOrderWorkflow/canceled") {
      chipClasses = classes.orderStatusCanceled;
    }

    if (status === "new") {
      chipClasses = classes.orderStatusNew;
    }

    if (status === "coreOrderWorkflow/processing") {
      chipClasses = classes.orderStatusProcessing;
    }

    if (status === "coreOrderWorkflow/completed") {
      chipClasses = classes.orderStatusShipped;
    }
  }

  if (type === "payment") {
    chipVariant = "outlined";
  }

  if (type === "shipment") {
    chipVariant = "outlined";

    if (status === "coreOrderWorkflow/canceled") {
      chipClasses = classes.orderStatusCanceledOutlined;
    }
  }

  const statusChip = <Chip label={displayStatus} className={chipClasses} color="primary" variant={chipVariant} />;

  return statusChip;
}

OrderStatusChip.propTypes = {
  classes: PropTypes.object,
  displayStatus: PropTypes.string,
  status: PropTypes.string,
  type: PropTypes.string
};

export default withStyles(styles, { name: "RuiOrderStatusChip" })(OrderStatusChip);

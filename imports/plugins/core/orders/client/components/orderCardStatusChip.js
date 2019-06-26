import React, { Component } from "react";
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

class OrderCardStatusChip extends Component {
  static propTypes = {
    classes: PropTypes.object,
    displayStatus: PropTypes.string,
    status: PropTypes.string,
    type: PropTypes.string
  };

  orderStatus() {
    const { classes, displayStatus, status } = this.props;
    let chipClasses;

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

    return <Chip label={displayStatus} className={chipClasses} color="primary" />;
  }

  paymentStatus() {
    // const { classes, displayStatus, status } = this.props;
    const { displayStatus } = this.props;
    let chipClasses;

    return <Chip label={displayStatus} className={chipClasses} color="primary" variant="outlined" />;
  }

  shipmentStatus() {
    const { classes, displayStatus, status } = this.props;
    let chipClasses;

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

    return <Chip label={displayStatus} className={chipClasses} color="primary" />;
  }

  render() {
    const { type } = this.props;

    if (type === "order") {
      return this.orderStatus();
    }

    if (type === "payment") {
      return this.paymentStatus();
    }

    if (type === "shipment") {
      return this.shipmentStatus();
    }

    return null;
  }
}

export default withStyles(styles, { name: "OrderCardStatusChip" })(OrderCardStatusChip);

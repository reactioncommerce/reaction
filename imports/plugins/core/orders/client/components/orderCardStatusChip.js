import React, { Component } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Chip from "@material-ui/core/Chip";


const styles = (theme) => ({
  orderStatusNew: {
    backgroundColor: `${theme.palette.colors.reactionBlue300}`,
    color: "white",
    fontWeight: "800"
  },
  orderStatusCanceled: {
    backgroundColor: `${theme.palette.colors.red300}`,
    color: "white",
    fontWeight: "800"
  },
  orderStatusProcessing: {
    backgroundColor: `${theme.palette.colors.reactionBlue300}`,
    color: "white",
    fontWeight: "800"
  },
  orderStatusShipped: {
    backgroundColor: `${theme.palette.colors.reactionBlue}`,
    color: "white",
    fontWeight: "800"
  }
});

class OrderCardStatusChip extends Component {
  static propTypes = {
    classes: PropTypes.object,
    status: PropTypes.String
  };

  render() {
    const { classes, status } = this.props;

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

    return (
      // TODO: EK - add translations here for status
      <Chip label={status} className={chipClasses} />
    );
  }
}

export default withStyles(styles, { name: "OrderCardStatusChip" })(OrderCardStatusChip);

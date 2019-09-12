import React from "react";
import PropTypes from "prop-types";
import InlineAlert from "@reactioncommerce/components/InlineAlert/v1";
import { i18next } from "/client/api";
import CloseIcon from "mdi-material-ui/Close";
import { makeStyles } from "@material-ui/core";
import classNames from "classnames";

const useStyles = makeStyles((theme) => ({
  alert: {
    marginBottom: theme.spacing(3)
  }
}));

/**
 * Notifications component
 * @param {Object} props Component props
 * @returns {React.Component} A React component
 */
function Notifications(props) {
  const {
    isInvalid,
    foundAndNotUpdated,
    operationType,
    tags,
    updatedCount
  } = props;

  const classes = useStyles();
  const alertClass = classNames({ [classes.alert]: (updatedCount > 0 && foundAndNotUpdated > 0) });

  return (
    <React.Fragment>
      {isInvalid && (
        <InlineAlert
          isDismissable
          isAutoClosing
          components={{ iconDismiss: <CloseIcon style={{ fontSize: 14 }} /> }}
          alertType="error"
          message={i18next.t("admin.addRemoveTags.invalidSelection")}
        />
      )}
      {operationType === "ADD" && updatedCount > 0 && (
        <InlineAlert
          className={alertClass}
          isDismissable
          components={{ iconDismiss: <CloseIcon style={{ fontSize: 14 }} /> }}
          alertType="success"
          message={i18next.t(
            "admin.addRemoveTags.addConfirmation",
            { tags, count: updatedCount }
          )}
        />
      )}
      {operationType === "ADD" && foundAndNotUpdated > 0 && (
        <InlineAlert
          isDismissable
          isAutoClosing
          components={{ iconDismiss: <CloseIcon style={{ fontSize: 14 }} /> }}
          alertType="information"
          message={i18next.t(
            "admin.addRemoveTags.addFoundAndNotUpdated",
            { count: foundAndNotUpdated }
          )}
        />
      )}
      {operationType === "REMOVE" && updatedCount > 0 && (
        <InlineAlert
          className={alertClass}
          isDismissable
          components={{ iconDismiss: <CloseIcon style={{ fontSize: 14 }} /> }}
          alertType="success"
          message={i18next.t(
            "admin.addRemoveTags.removeConfirmation",
            { tags, count: updatedCount }
          )}
        />
      )}
      {operationType === "REMOVE" && foundAndNotUpdated > 0 && (
        <InlineAlert
          isDismissable
          isAutoClosing
          components={{ iconDismiss: <CloseIcon style={{ fontSize: 14 }} /> }}
          alertType="information"
          message={i18next.t(
            "admin.addRemoveTags.removeFoundAndNotUpdated",
            { count: foundAndNotUpdated }
          )}
        />
      )}
    </React.Fragment>
  );
}

Notifications.propTypes = {
  foundAndNotUpdated: PropTypes.number,
  isInvalid: PropTypes.bool,
  operationType: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  updatedCount: PropTypes.number
};

export default Notifications;

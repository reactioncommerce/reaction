import React from "react";
import PropTypes from "prop-types";
import InlineAlert from "@reactioncommerce/components/InlineAlert/v1";
import { i18next } from "/client/api";
import CloseIcon from "mdi-material-ui/Close";

/**
 * Notifications component
 * @param {Object} props Component props
 * @returns {React.Component} A React component
 */
function Notifications(props) {
  const {
    foundAndNotUpdated,
    operationType,
    tags,
    updatedCount
  } = props;

  return (
    <React.Fragment>
      {operationType === "ADD" && updatedCount > 0 && (
        <InlineAlert
          isDismissable
          components={{ iconDismiss: <CloseIcon style={{ fontSize: 14 }} /> }}
          alertType="success"
          title={i18next.t(
            "admin.addRemoveTags.productsTagged",
            { count: updatedCount }
          )
          }
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
          title={i18next.t("admin.addRemoveTags.noUpdateNecessary")
          }
          message={i18next.t(
            "admin.addRemoveTags.addFoundAndNotUpdated",
            { count: foundAndNotUpdated }
          )}
        />
      )}
      {operationType === "REMOVE" && updatedCount > 0 && (
        <InlineAlert
          isDismissable
          components={{ iconDismiss: <CloseIcon style={{ fontSize: 14 }} /> }}
          alertType="success"
          title={i18next.t(
            "admin.addRemoveTags.productsUntagged",
            { count: updatedCount }
          )
          }
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
          title={i18next.t("admin.addRemoveTags.noUpdateNecessary")
          }
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
  operationType: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  updatedCount: PropTypes.number
};

export default Notifications;

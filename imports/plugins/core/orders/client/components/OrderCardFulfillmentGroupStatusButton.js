import React, { useState } from "react";
import PropTypes from "prop-types";
import { useMutation } from "@apollo/react-hooks";
import Grid from "@material-ui/core/Grid";
import ConfirmDialog from "@reactioncommerce/catalyst/ConfirmDialog";
import Select from "@reactioncommerce/catalyst/Select";
import { i18next, Reaction } from "/client/api";
import updateOrderFulfillmentGroupMutation from "../graphql/mutations/updateOrderFulfillmentGroup";

/**
 * @name OrderCardFulfillmentGroupStatusButton
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function OrderCardFulfillmentGroupStatusButton({ fulfillmentGroup, order }) {
  const hasPermission = Reaction.hasPermission(["reaction-orders", "order/fulfillment"], Reaction.getUserId(), Reaction.getShopId());
  const [updateOrderFulfillmentGroup] = useMutation(updateOrderFulfillmentGroupMutation);
  const [groupStatus, setGroupStatus] = useState();
  const canUpdateFulfillmentStatus = (fulfillmentGroup.status !== "coreOrderWorkflow/canceled");
  const options = [
    {
      label: i18next.t("status.new"),
      value: "new"
    }, {
      label: i18next.t("status.coreOrderWorkflow/created"),
      value: "coreOrderWorkflow/created"
    }, {
      label: i18next.t("status.coreOrderWorkflow/processing"),
      value: "coreOrderWorkflow/processing"
    }, {
      label: i18next.t("status.coreOrderWorkflow/completed"),
      value: "coreOrderWorkflow/completed"
    }, {
      label: i18next.t("status.coreOrderWorkflow/picked"),
      value: "coreOrderWorkflow/picked"
    }, {
      label: i18next.t("status.coreOrderWorkflow/packed"),
      value: "coreOrderWorkflow/packed"
    }, {
      label: i18next.t("status.coreOrderWorkflow/labeled"),
      value: "coreOrderWorkflow/labeled"
    }, {
      label: i18next.t("status.coreOrderWorkflow/shipped"),
      value: "coreOrderWorkflow/shipped"
    }
  ];

  const handleUpdateFulfillmentGroupStatus = async () => {
    const newGroupStatus = groupStatus;

    if (hasPermission) {
      updateOrderFulfillmentGroup({
        variables: {
          orderFulfillmentGroupId: fulfillmentGroup._id,
          orderId: order._id,
          status: newGroupStatus.value
        }
      });
    }
  };

  const handleSelectChange = (value, openDialog) => {
    // Set value into state to use inside confirm dialog
    setGroupStatus(value);
    openDialog();
  };

  if (hasPermission && canUpdateFulfillmentStatus) {
    return (
      <Grid item>
        <ConfirmDialog
          message={i18next.t("order.updateFulfillmentGroupStatusMessage")}
          title={i18next.t("order.updateFulfillmentGroupStatusTitle", { groupStatus: "holiday" })} // TODO: groupStatus doesn't work here
          onConfirm={handleUpdateFulfillmentGroupStatus}
        >
          {({ openDialog }) => (
            <Select
              options={options}
              onSelection={(value) => handleSelectChange(value, openDialog)} // TODO: get this to reset once updated
              placeholder="Update group status"
            />
          )}
        </ConfirmDialog>

        {/* <Select
          options={options}
          onSelection={handleUpdateFulfillmentGroupStatus}
          placeholder="Update group status"
        /> */}
      </Grid>
    );
  }

  return null;
}

OrderCardFulfillmentGroupStatusButton.propTypes = {
  fulfillmentGroup: PropTypes.shape({
    _id: PropTypes.string,
    status: PropTypes.string
  }),
  order: PropTypes.shape({
    _id: PropTypes.string
  })
};

export default OrderCardFulfillmentGroupStatusButton;

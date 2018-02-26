import React from "react";
import { registerComponent } from "@reactioncommerce/reaction-components";
import IconButton from "./iconButton";

/**
 * Edit button is a special type of Icon Button that is toggable by default
 * and presents a pencil ( or edit icon ) in its of state, and a check ( or success icon)
 * when it is on.
 *
 * Use this button in places where you need a pre-styled button for toggling editing
 * states of components.
 *
 * @param {Object} props Props passed into component
 * @returns {IconButton} Retruns an IconButton component with pre-configured icons for editing
 */
const EditButton = (props) => (
  <IconButton
    icon="fa fa-pencil"
    onIcon="fa fa-check"
    toggle={true}
    primary={true}
    bezelStyle="solid"
    kind="round"
    {...props}
  />
);

registerComponent("EditButton", EditButton);

export default EditButton;

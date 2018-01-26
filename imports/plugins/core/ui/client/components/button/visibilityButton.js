import React from "react";
import { registerComponent } from "@reactioncommerce/reaction-components";
import IconButton from "./iconButton";

/**
 * Visibility button is a special type of Icon Button that is toggable by default
 * and presents a eye icon in its on state, and a eye-slash icon when it is off.
 *
 * Use this button in places where you need a pre-styled button for toggling visibility
 * states of components.
 *
 * @param {Object} props Props passed into component
 * @returns {IconButton} Retruns an IconButton component with pre-configured icons for visibility
 */
const VisibilityButton = (props) => (
  <IconButton
    icon="fa fa-eye-slash"
    onIcon="fa fa-eye"
    bezelStyle="solid"
    primary={true}
    toggle={true}
    {...props}
  />
);

registerComponent("VisibilityButton", VisibilityButton);

export default VisibilityButton;

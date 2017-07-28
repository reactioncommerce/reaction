import React from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";

const FormActions = ({ children }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "flex-end"
    }}
  >
    {children}
  </div>
);

FormActions.propTypes = {
  children: PropTypes.node
};

registerComponent("FormActions", FormActions);

export default FormActions;

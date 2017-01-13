import React, { PropTypes } from "react";

export default function Admin() {
  return (Component) => {
    const AdminComponent = (props, context) => {
      const { adminContext } = context;

      return <Component adminContext={adminContext} {...props} />;
    };

    AdminComponent.contextTypes = {
      adminContext: PropTypes.object.isRequired
    };

    return AdminComponent;
  };
}

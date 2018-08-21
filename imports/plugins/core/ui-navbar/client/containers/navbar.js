import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { Reaction } from "/client/api";

const NavBarContainer = ({ isAdmin }) => {
  if (isAdmin) {
    return <Components.NavBarAdmin />;
  }
  return <Components.NavBarCustomer />;
};

NavBarContainer.propTypes = {
  isAdmin: PropTypes.bool
};

function composer(props, onData) {
  const isAdmin = Reaction.hasAdminAccess();

  onData(null, {
    isAdmin
  });
}

registerComponent("NavBar", NavBarContainer, [
  composeWithTracker(composer)
]);

export default compose(composeWithTracker(composer))(NavBarContainer);

import { Components, registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import React from "react";
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
  onData(null, {
    isAdmin: Reaction.hasAdminAccess()
  });
}

registerComponent("NavBar", NavBarContainer, [
  composeWithTracker(composer)
]);

export default compose(composeWithTracker(composer))(NavBarContainer);

import React from "react";
import PropTypes from "prop-types";
import { registerComponent, Components } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { Meteor } from "meteor/meteor";
import Button from "@material-ui/core/Button";
import withStyles from "@material-ui/core/styles/withStyles";

const styles = (theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh"
  },
  content: {
    width: "100%",
    maxWidth: 480
  },
  logo: {
    display: "flex",
    justifyContent: "center",
    marginBottom: theme.spacing.unit * 3
  },
  logoutButton: {
    textAlign: "center"
  }
});

/**
 * Core layout component
 * This component has been re-commissioned as a login form for admins to redirect
 * to operator 2.0
 * @returns {Node} React component
 */
function CoreLayout({ classes }) {
  // If the current user is an admin then redirect to /operator
  if (Reaction.hasDashboardAccessForAnyShop()) {
    window.location.replace("/operator");
    return null;
  }

  let content = <Components.Login />;

  // If the user is logged in, which makes them no longer anonymous
  // But they aren't an admin, then give them a logout button.
  if (!Reaction.hasPermission(["anonymous"])) {
    content = (
      <div className={classes.logoutButton}>
        <Button
          color="primary"
          onClick={() => Meteor.logout()}
          variant="contained"
        >
          {"Logout"}
        </Button>
      </div>
    );
  }

  return (
    <div id="reactionAppContainer">
      <div className={classes.root}>
        <div className={classes.content}>
          <div className={classes.logo}>
            <img
              alt="Reaction"
              src="/resources/reaction-logo-circular.svg"
              width={200}
            />
          </div>

          {content}
        </div>
      </div>
    </div>
  );
}

CoreLayout.propType = {
  classes: PropTypes.object
};

const componentWithStyles = withStyles(styles, { name: "RuiCoreLayout" })(CoreLayout);

registerComponent("coreLayout", componentWithStyles);

export default componentWithStyles;

import React from "react";
import PropTypes from "prop-types";
import { registerComponent, Components } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { Meteor } from "meteor/meteor";
import Button from "@material-ui/core/Button";
import withStyles from "@material-ui/core/styles/withStyles";
import ShopLogo from "/imports/client/ui/components/ShopLogoWithData/ShopLogoWithData";

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
function CoreLayout({ classes, location }) {
  let content = <Components.Login />;

  const isAdmin = Reaction.hasDashboardAccessForAnyShop();

  // If we're not on /account or /account/login for hydra, and the user is signed in,
  // then we will redirect or show a logout button
  if (location.pathname.startsWith("/account") === false) {
    // If the current user is an admin then redirect to /operator
    if (isAdmin) {
      window.location.replace("/operator");
      return null;
    }

    // If the user is logged in, which makes them no longer anonymous
    // But they aren't an admin, then give them a logout button.
    if (!Reaction.hasPermission(["anonymous"])) {
      // If the user is logged in but not a admin redirect to the storefront.
      if (!isAdmin) {
        const { storefrontUrls } = Reaction.getCurrentShop();
        window.location.href = `${storefrontUrls.storefrontHomeUrl}`;
        return null;
      }

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
  }

  return (
    <div id="reactionAppContainer">
      <div className={classes.root}>
        <div className={classes.content}>
          <div className={classes.logo}>
            <ShopLogo
              linkTo="/"
              size={200}
            />
          </div>
          {content}
        </div>
      </div>
    </div>
  );
}

CoreLayout.propTypes = {
  classes: PropTypes.object,
  location: PropTypes.object
};

const componentWithStyles = withStyles(styles, { name: "RuiCoreLayout" })(CoreLayout);

registerComponent("coreLayout", componentWithStyles);

export default componentWithStyles;

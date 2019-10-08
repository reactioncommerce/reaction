import React, { useState } from "react";
import PropTypes from "prop-types";
import { registerComponent, Components, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import Logger from "/client/modules/logger";
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
    marginBottom: theme.spacing(3)
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
function CoreLayout({ classes, isAdmin, isLoading, isLoggedIn, location, storefrontHomeUrl }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (isLoading || isLoggingOut) return null;

  let content = <Components.Login />;

  // If we're not on /account or /account/login for hydra, and the user is signed in,
  // then we will redirect or show a logout button
  if (!location.pathname.startsWith("/account") && !location.pathname.startsWith("/reset")) {
    // If the current user is an admin then redirect to /operator
    if (!location.pathname.startsWith("/operator") && isAdmin) {
      window.location.replace("/operator");
      return null;
    }

    // If the user is logged in, which makes them no longer anonymous
    // But they aren't an admin, then give them a logout button.
    if (isLoggedIn && !isAdmin) {
      // If the user is logged in but not a admin redirect to the storefront.
      if (storefrontHomeUrl && storefrontHomeUrl.length) {
        window.location.href = storefrontHomeUrl;
        return null;
      }

      Logger.warn("Missing storefront home URL. Please set this from the shop settings panel so that customer users can be redirected to your storefront.");

      content = (
        <div className={classes.logoutButton}>
          <Button
            color="primary"
            onClick={() => {
              setIsLoggingOut(true);
              Meteor.logout((error) => {
                if (error) Logger.error(error);
                setIsLoggingOut(false);
              });
            }}
            variant="contained"
          >
            Logout
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
            <ShopLogo linkTo="/" size={200} />
          </div>
          {content}
        </div>
      </div>
    </div>
  );
}

CoreLayout.propTypes = {
  classes: PropTypes.object,
  isAdmin: PropTypes.bool,
  isLoading: PropTypes.bool,
  isLoggedIn: PropTypes.bool,
  location: PropTypes.object,
  storefrontHomeUrl: PropTypes.string
};

const StyledCoreLayout = withStyles(styles, { name: "RuiCoreLayout" })(CoreLayout);

/**
 * @private
 * @param {Object} props Props
 * @param {Function} onData Call this to update props
 * @returns {undefined}
 */
function composer(props, onData) {
  const isAdmin = Reaction.hasDashboardAccessForAnyShop();
  const shop = Reaction.getCurrentShop();
  const isLoading = (isAdmin !== true && isAdmin !== false) || !shop;
  const isLoggedIn = !!Reaction.getUserId();

  onData(null, {
    isAdmin,
    isLoading,
    isLoggedIn,
    storefrontHomeUrl: (shop && shop.storefrontUrls && shop.storefrontUrls.storefrontHomeUrl) || null
  });
}

registerComponent("coreLayout", StyledCoreLayout, composeWithTracker(composer));

export default composeWithTracker(composer)(StyledCoreLayout);

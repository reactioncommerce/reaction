/* eslint-disable node/no-missing-require, node/no-unpublished-require */
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Accounts } from "/lib/collections";
import { lifecycle } from "recompose";
import { composeWithTracker } from "./composer";

let i18next;
let Reaction;

if (Meteor.isClient) {
  ({ i18next, Reaction } = require("/client/api"));
} else {
  Reaction = require("/imports/plugins/core/core/server/Reaction").default;
}


/**
 * @name withCurrentUser
 * @method
 * @summary A wrapper to reactively inject the current user into a component
 * @param {Function|React.Component} component - the component to wrap
 * @returns {Function} the new wrapped component with a "currentUser" prop
 * @memberof Components/Helpers
 */
export function withCurrentUser(component) {
  return composeWithTracker((props, onData) => {
    onData(null, { currentUser: Meteor.user() });
  })(component);
}


/**
 * @name withMoment
 * @method
 * @summary A wrapper to reactively inject the moment package into a component
 * @param {Function|React.Component} component - the component to wrap
 * @returns {Function} the new wrapped component with a "moment" prop
 * @memberof Components/Helpers
 */
export function withMoment(component) {
  return lifecycle({
    componentDidMount() {
      import("moment")
        .then(({ default: moment }) => {
          moment.locale(i18next.language);
          this.setState({ moment });
          return null;
        })
        .catch((error) => {
          Logger.debug(error, "moment.js async import error");
        });
    }
  })(component);
}


/**
 * @name withMomentTimezone
 * @method
 * @summary A wrapper to reactively inject the moment package into a component
 * @param {Function|React.Component} component - the component to wrap
 * @returns {Function} the new wrapped component with a "moment" prop
 * @memberof Components/Helpers
 */
export function withMomentTimezone(component) {
  return lifecycle({
    componentDidMount() {
      import("moment-timezone")
        .then(({ default: moment }) => {
          this.setState({ momentTimezone: moment.tz });
          return null;
        })
        .catch((error) => {
          Logger.debug(error, "moment.js async import error");
        });
    }
  })(component);
}


/**
 * @name withCurrentAccount
 * @method
 * @summary A wrapper to reactively inject the current account into a component.
 * This assumes you have signed up and are not an anonymous user.
 * @param {Function|React.Component} component - the component to wrap
 * @returns {Function} the new wrapped component with a "currentAccount" prop
 * @memberof Components/Helpers
 */
export function withCurrentAccount(component) {
  return composeWithTracker((props, onData) => {
    const shopId = Reaction.getShopId();
    const user = Meteor.user();

    if (!shopId || !user) return;

    const account = Accounts.findOne({ userId: user._id });
    if (!account) return;

    // shoppers should always be guests
    const isGuest = Reaction.hasPermission("guest");
    // but if a user has never logged in then they are anonymous
    const isAnonymous = Roles.userIsInRole(user, "anonymous", shopId);
    // this check for "anonymous" uses userIsInRole instead of hasPermission because hasPermission
    // always return `true` when logged in as the owner.
    // But in this case, the anonymous check should be false when a user is logged in

    onData(null, { currentAccount: isGuest && !isAnonymous && account });
  }, false)(component);
}


/**
 * @name withIsAdmin
 * @method
 * @summary A wrapper to reactively inject the current user's admin status.
 * Sets a boolean 'isAdmin' prop on the wrapped component.
 * @param {Function|React.Component} component - the component to wrap
 * @returns {Function} the new wrapped component with an "isAdmin" prop
 * @memberof Components/Helpers
 */
export function withIsAdmin(component) {
  return composeWithTracker((props, onData) => {
    onData(null, { isAdmin: Reaction.hasAdminAccess() });
  })(component);
}

/**
 * @name withIsOwner
 * @method
 * @summary A wrapper to reactively inject the current user's owner status.
 * Sets a boolean 'isOwner' prop on the wrapped component.
 * @param {Function|React.Component} component - the component to wrap
 * @returns {Function} the new wrapped component with an "isOwner" prop
 * @memberof Components/Helpers
 */
export function withIsOwner(component) {
  return composeWithTracker((props, onData) => {
    onData(null, { isOwner: Reaction.hasOwnerAccess() });
  })(component);
}

/**
 * @name withCSSTransition
 * @method
 * @summary A wrapper to dynamically import & inject react-transition-group's <CSSTransition /> into a component
 * @param {Function|React.Component} component - the component to wrap
 * @returns {Object} the new wrapped component with a "CSSTransition" prop
 * @memberof Components/Helpers
 */
export function withCSSTransition(component) {
  return lifecycle({
    componentDidMount() {
      import("react-transition-group")
        .then((module) => {
          if (this.willUnmount === true) {
            return null;
          }

          this.setState({
            CSSTransition: module.CSSTransition
          });

          return null;
        })
        .catch((error) => {
          Logger.error(error.message, "Unable to load react-transition-group");
        });
    },
    componentWillUnmount() {
      // Prevent dynamic import from setting state if component is about to unmount
      this.willUnmount = true;
    }
  })(component);
}

/**
 * @name withAnimateHeight
 * @method
 * @summary A wrapper that reactively injects an extended version of react-animate-height's <AnimateHeight />
 *  into a component.
 * @param {Function|React.Component} component - the component to wrap
 * @returns {Function} the new wrapped component with a "AnimateHeight" prop
 * @memberof Components/Helpers
 */
export function withAnimateHeight(component) {
  return lifecycle({
    componentDidMount() {
      import("react-animate-height")
        .then((module) => {
          if (this.willUnmount) {
            return null;
          }

          // Extend AnimateHeight so that setState can't be called when component is unmounted (prevents memory leak)
          const AnimateHeight = module.default;
          class ExtendedAnimateHeight extends AnimateHeight {
            componentWillUnmount() {
              this.willUnmount = true;
              super.componentWillUnmount();
            }

            setState(partialState, callback) {
              if (this.willUnmount) {
                return;
              }
              super.setState(partialState, callback);
            }
          }

          // Pass extended AnimateHeight to child component
          this.setState({
            AnimateHeight: ExtendedAnimateHeight
          });

          return null;
        })
        .catch((error) => {
          Logger.error(error.message, "Unable to load react-animate-height");
        });
    },
    componentWillUnmount() {
      // Prevent dynamic import from setting state if component is about to unmount
      this.willUnmount = true;
    }
  })(component);
}

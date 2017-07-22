import { composeWithTracker } from "./tracker";
import { Meteor } from "meteor/meteor";

let Reaction;

if (Meteor.isClient) {
  Reaction = require("/client/api").Reaction;
} else {
  Reaction = require("/server/api").Reaction;
}

/**
 * A wrapper to reactively inject the current user into a component
 * @param {Function|React.Component} component - the component to wrap
 * @return {Function} the new wrapped component with a "user" prop
 */
export function withCurrentUser(component) {
  return composeWithTracker((props, onData) => {
    onData(null, { currentUser: Meteor.user() });
  })(component);
}


/**
 * A wrapper to reactively inject the current user's admin status.
 * Sets a boolean 'isAdmin' prop on the wrapped component.
 * @param {Function|React.Component} component - the component to wrap
 * @return {Function} the new wrapped component with an "isAdmin" prop
 */
export function withIsAdmin(component) {
  return composeWithTracker((props, onData) => {
    onData(null, { isAdmin: Reaction.hasAdminAccess() });
  })(component);
}


/**
 * A wrapper to reactively inject the current user's owner status.
 * Sets a boolean 'isOwner' prop on the wrapped component.
 * @param {Function|React.Component} component - the component to wrap
 * @return {Function} the new wrapped component with an "isOwner" prop
 */
export function withIsOwner(component) {
  return composeWithTracker((props, onData) => {
    onData(null, { isOwner: Reaction.hasOwnerAccess() });
  })(component);
}

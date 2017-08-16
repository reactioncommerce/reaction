import { Component, Children } from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Accounts, Groups } from "/lib/collections";
import { Reaction } from "/client/api";

class Permission extends Component {
  static propTypes = {
    children: PropTypes.node,
    hasPermission: PropTypes.bool
  }

  render() {
    if (this.props.hasPermission) {
      return Children.only(this.props.children);
    }

    return null;
  }
}

/**
 * withPermissions - Decorator to add permissions to any component
 * withPermissions(["guest"])(MyComponent)
 * @param  {Array|String} roles String or array of strings of permissions to check. default: roles=["guest", "anonymous"]
 * @param  {String} group Slug title of a group to check against. Group option supercedes roles option. default: group="customer".
 * @return {function} Returns a compser higher order component
 */
export function withPermissions(roles = ["guest", "anonymous"], group = "customer") {
  return composeWithTracker((props, onData) => {
    const grpSub = Meteor.subscribe("Groups");
    const userSub = Meteor.subscribe("Accounts", Meteor.userId());
    let hasPermission = Reaction.hasPermission(props.roles || roles);

    if (grpSub.ready() && userSub.ready()) {
      if (group) {
        const grp = Groups.find({ slug: group }).fetch();
        const account = Accounts.find({ _id: Meteor.userId() }).fetch();
        if (grp && grp._id) {
          console.log(account.groups, grp._id);
          hasPermission = account.groups.indexOf(grp._id) > -1;
        }
      }

      onData(null, { hasPermission });
    }
  });
}

registerComponent("Permission", withPermissions()(Permission));

export default withPermissions()(Permission);

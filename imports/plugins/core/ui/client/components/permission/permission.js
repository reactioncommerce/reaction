import { Component, Children } from "react";
import { Meteor } from "meteor/meteor";
import _ from "lodash";
import PropTypes from "prop-types";
import { composeWithTracker, registerComponent } from "@reactioncommerce/reaction-components";
import { Groups } from "/lib/collections";
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
 * Group access is given to users at that group level and above
 * @return {function} Returns a compser higher order component
 */
export function withPermissions(roles = ["guest", "anonymous"], group = "customer") {
  return composeWithTracker((props, onData) => {
    const grpSub = Meteor.subscribe("Groups");

    if (grpSub.ready()) {
      let hasPermission = Reaction.hasPermission(props.roles || roles);

      if (group) {
        hasPermission = false;
        const grp = Groups.findOne({ slug: props.group || group });
        const user = Meteor.user();
        const permissions = user.roles[Reaction.getShopId()] || [];
        if (grp && grp.permissions) {
          // checks that userPermissions includes all elements from groupPermissions
          hasPermission = _.difference(grp.permissions, permissions).length === 0;
        }
      }

      onData(null, { hasPermission });
    }
  });
}

registerComponent("Permission", withPermissions()(Permission));

export default withPermissions()(Permission);

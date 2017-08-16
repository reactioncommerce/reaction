import { Component, Children } from "react";
import PropTypes from "prop-types";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
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
 * @return {function} Returns a compser higher order component
 */
export function withPermissions(roles = ["guest", "anonymous"]) {
  return composeWithTracker((props, onData) => {
    const hasPermission = Reaction.hasPermission(props.roles || roles);

    onData(null, { hasPermission });
  });
}

export default withPermissions()(Permission);

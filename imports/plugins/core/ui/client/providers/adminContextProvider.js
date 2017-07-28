import React, { Component, Children } from "react"; // eslint-disable-line
import PropTypes from "prop-types";
import { composeWithTracker } from "@reactioncommerce/reaction-components";

class AdminContextProvider extends Component {
  static childContextTypes = {
    adminContext: PropTypes.object.isRequired
  };

  static propTypes = {
    adminContext: PropTypes.object.isRequired,
    children: PropTypes.node
  };

  getChildContext() {
    const { adminContext } = this.props;
    return { adminContext };
  }

  render() {
    // `Children.only` enables us not to add a <div /> for nothing
    return Children.only(this.props.children);
  }
}

function composer(props, onData) {
  onData(null, {
    adminContext: {
      isAdminArea: true,
      adminClassName: {
        admin: true
      }
    }
  });
}


export default composeWithTracker(composer)(AdminContextProvider);

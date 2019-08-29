import React, { Component } from "react";
import PropTypes from "prop-types";
import Blaze from "meteor/gadicc:blaze-react-component";
import { getComponent } from "@reactioncommerce/reaction-components";

export default class ReactComponentOrBlazeTemplate extends Component {
  static propTypes = {
    name: PropTypes.string,
    props: PropTypes.object
  };

  render() {
    const { name, props = {} } = this.props;

    if (!name) return null;

    // Render a react component if one has been registered by name.
    // Fall back to a Blaze template.
    try {
      const component = getComponent(name);
      return React.createElement(component, props);
    } catch (error) {
      return <Blaze {...props} template={name} />;
    }
  }
}

/**
 * @param {name} name name of component
 * @returns {Node} React component or Blaze template
 */
export function getReactComponentOrBlazeTemplate(name) {
  if (!name) return null;

  try {
    const component = getComponent(name);
    return React.createElement(component);
  } catch (error) {
    return <Blaze template={name} />;
  }
}

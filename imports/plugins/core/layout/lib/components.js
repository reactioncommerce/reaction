/* eslint-disable react/no-multi-comp */

import React from "react";
import PropTypes from "prop-types";
import Immutable from "immutable";

let registeredComponents = Immutable.Map();

export function registerComponent(componentInfo) {
  const info = {
    ...componentInfo,
    default: false
  };

  registeredComponents = registeredComponents.set(
    info.name,
    info
  );
}

export function replaceComponent(componentInfo) {
  const info = {
    ...componentInfo,
    default: false
  };

  registeredComponents = registeredComponents.set(
    info.name,
    info
  );
}

export function getComponent(name) {
  const componentInfo = registeredComponents.get(name);
  return componentInfo && componentInfo.component || null;
}

export function getComponentDefinition(name) {
  const componentInfo = registeredComponents.get(name);
  return componentInfo || null;
}

export function createElement(name, props) {
  const { component } = getComponentDefinition(name);

  if (component) {
    return React.createElement(component, props);
  }

  return null;
}

export function getAllComponents() {
  return registeredComponents.toObject();
}

export function Component(props) {
  return createElement(props.name, props.componentProps);
}

Component.propTypes = {
  componentProps: PropTypes.object,
  name: PropTypes.string.isRequired
};

export default {
  Component,
  registerComponent,
  getComponent,
  createElement,
  getAllComponents
};

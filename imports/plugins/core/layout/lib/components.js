import Immutable from "immutable";

let registeredComponents = Immutable.Map();

export function registerComponent(componentInfo) {
  registeredComponents = registeredComponents.set(
    componentInfo.name,
    componentInfo
  );
}

export function getComponent(name) {
  return registeredComponents.get(name).component;
}

export function getAllComponents() {
  return registeredComponents.toObject();
}

import Immutable from "immutable";

let registeredComponents = Immutable.Map();

export function registerComponent(componentInfo) {
  registeredComponents = registeredComponents.set(
    componentInfo.name,
    componentInfo
  );
}

export function getComponent(name) {
  const componentInfo = registeredComponents.get(name);
  return componentInfo && componentInfo.component || null;
}

export function getAllComponents() {
  return registeredComponents.toObject();
}

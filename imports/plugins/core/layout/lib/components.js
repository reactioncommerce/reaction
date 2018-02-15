/* eslint-disable no-console */
import {
  Components,
  getComponent as newGetComponent,
  registerComponent as newRegisterComponent
} from "@reactioncommerce/reaction-components/components";


export function registerComponent(componentInfo) {
  console.warn("DEPRECATED registerComponent(). Use new implementation. see: https://docs.reactioncommerce.com/reaction-docs/master/components-api");

  newRegisterComponent(componentInfo.name, componentInfo.component);
}

export function getComponent(name) {
  console.warn("DEPRECATED getComponent(). Use new implementation. see: https://docs.reactioncommerce.com/reaction-docs/master/components-api");

  let component = null;

  try {
    component = newGetComponent(name);
  } catch (e) {
    console.log("Component not found");
  }

  return component;
}

export function getAllComponents() {
  console.warn("DEPRECATED getAllComponents(). Use new implementation. see: https://docs.reactioncommerce.com/reaction-docs/master/components-api");

  return Components;
}

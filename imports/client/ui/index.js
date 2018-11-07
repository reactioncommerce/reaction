import { getReactComponentOrBlazeTemplate } from "/imports/plugins/core/components/lib/ReactComponentOrBlazeTemplate";

export const operatorRoutes = [];

export function registerOperatorRoute(routeInfo) {
  const { mainComponent } = routeInfo;
  let component = mainComponent;

  if (typeof mainComponent === "string") {
    component = () => getReactComponentOrBlazeTemplate(mainComponent);
  }

  operatorRoutes.push({ ...routeInfo, mainComponent: component });
}


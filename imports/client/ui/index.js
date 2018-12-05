import { getReactComponentOrBlazeTemplate } from "/imports/plugins/core/components/lib/ReactComponentOrBlazeTemplate";

export const operatorRoutes = [];

/**
 * @name registerOperatorRoute
 * @summary Registers new route in the operator UI.
 * @param {Object} route - The route
 * @param {String} route.path - The URL path for this route
 * @param {Node|String} route.mainComponent - A react component to render in
 * the main content area or the name of a Blaze template that has been registered
 * by a package.
 * @param {Node} route.SidebarIconComponent - A React component that renders the menu icon for this route
 * @param {String} route.sidebarI18nLabel - The i18n key for this route, i.e. "admin.dashboard.ordersLabel"
 * @returns {undefined}
 */
export function registerOperatorRoute(route) {
  const { mainComponent } = route;
  let component = mainComponent;

  if (typeof mainComponent === "string") {
    component = () => getReactComponentOrBlazeTemplate(mainComponent);
  }

  operatorRoutes.push({ ...route, mainComponent: component });
}


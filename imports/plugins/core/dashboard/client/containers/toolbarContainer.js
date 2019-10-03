import React from "react";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction, i18next } from "/client/api";
import { Shops } from "/lib/collections";
import { AdminContextProvider } from "/imports/plugins/core/ui/client/providers";

/**
 * @summary Handler that fires when the shop selector is changed
 * @param {Object} event - the `event` coming from the select change event
 * @param {String} shopId - The `value` coming from the select change event
 * @returns {undefined}
 * @private
 */
const handleShopSelectChange = (event, shopId) => {
  if (/^[A-Za-z0-9]{17}$/.test(shopId)) { // Make sure shopId is a valid ID
    Reaction.setShopId(shopId);
  }
};

/**
 * @private
 * @param {Object} props Props
 * @param {Function} onData Call this to update props
 * @returns {undefined}
 */
function composer(props, onData) {
  // Reactive data sources
  const routeName = Reaction.Router.getRouteName();
  const shopIds = Reaction.getShopsForUser(["owner", "admin", "dashboard"]);
  const shops = Shops.find({
    _id: { $in: shopIds }
  }).fetch();
  // Standard variables
  const packageButtons = [];

  if (routeName !== "dashboard" && props.showPackageShortcuts) {
    const registryItems = Reaction.Apps({ provides: "settings", container: "dashboard" });

    for (const item of registryItems) {
      if (Reaction.hasPermission(item.route, Reaction.getUserId())) {
        let { icon } = item;
        if (!item.icon && item.provides && item.provides.includes("settings")) {
          icon = "gear";
        }

        packageButtons.push({
          href: item.route,
          icon,
          tooltip: i18next.t(item.i18nKeyLabel, item.i18n),
          tooltipPosition: "left middle",
          onClick() {
            Reaction.showActionView(item);
          }
        });
      }
    }
  }

  onData(null, {
    packageButtons,
    dashboardHeaderTemplate: props.data.dashboardHeader,
    isActionViewAtRootView: Reaction.isActionViewAtRootView(),
    actionViewIsOpen: Reaction.isActionViewOpen(),
    hasCreateProductAccess: Reaction.hasPermission(["createProduct", "product/admin", "product/create"], Reaction.getUserId(), Reaction.getShopId()),
    shopId: Reaction.getShopId(),
    shops,

    // Callbacks
    onShopSelectChange: handleShopSelectChange
  });
}

/**
 * @name ToolbarContainer
 * @param {React.Component} Comp wrapped component
 * @returns {React.Component} returns a React component
 */
export default function ToolbarContainer(Comp) {
  /**
   * @name CompositeComponent
   * @param {Object} props Component props
   * @returns {React.Component} Wrapped Toolbar component
   */
  function CompositeComponent(props) {
    return (
      <AdminContextProvider>
        <Comp {...props} />
      </AdminContextProvider>
    );
  }

  return composeWithTracker(composer)(CompositeComponent);
}

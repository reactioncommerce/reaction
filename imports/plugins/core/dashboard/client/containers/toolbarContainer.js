import React from "react";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction, i18next } from "/client/api";
import { Tags, Shops } from "/lib/collections";
import { AdminContextProvider } from "/imports/plugins/core/ui/client/providers";
import { isRevisionControlEnabled } from "/imports/plugins/core/revisions/lib/api";

const handleAddProduct = () => {
  Reaction.setUserPreferences("reaction-dashboard", "viewAs", "administrator");
  Meteor.call("products/createProduct", (error, productId) => {
    if (Meteor.isClient) {
      let currentTag;
      let currentTagId;

      if (error) {
        throw new Meteor.Error("create-product-error", error);
      } else if (productId) {
        currentTagId = Session.get("currentTag");
        currentTag = Tags.findOne(currentTagId);
        if (currentTag) {
          Meteor.call("products/updateProductTags", productId, currentTag.name, currentTagId);
        }
        // go to new product
        Reaction.Router.go("product", {
          handle: productId
        });
      }
    }
  });
};

/**
* Handler that fires when the shop selector is changed
* @param {Object} event - the `event` coming from the select change event
* @param {String} shopId - The `value` coming from the select change event
* @returns {undefined}
*/
const handleShopSelectChange = (event, shopId) => {
  if (/^[A-Za-z0-9]{17}$/.test(shopId)) { // Make sure shopId is a valid ID
    Reaction.setShopId(shopId);
  }
};

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
      if (Reaction.hasPermission(item.route, Meteor.userId())) {
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
    isPreview: Reaction.isPreview(),
    isEnabled: isRevisionControlEnabled(),
    isActionViewAtRootView: Reaction.isActionViewAtRootView(),
    actionViewIsOpen: Reaction.isActionViewOpen(),
    hasCreateProductAccess: Reaction.hasPermission("createProduct", Meteor.userId(), Reaction.getShopId()),
    shopId: Reaction.getShopId(),
    shops,

    // Callbacks
    onAddProduct: handleAddProduct,
    onShopSelectChange: handleShopSelectChange,
    onViewContextChange: props.handleViewContextChange
  });
}

export default function ToolbarContainer(Comp) {
  function CompositeComponent(props) {
    return (
      <AdminContextProvider>
        <Comp {...props} />
      </AdminContextProvider>
    );
  }

  return composeWithTracker(composer)(CompositeComponent);
}

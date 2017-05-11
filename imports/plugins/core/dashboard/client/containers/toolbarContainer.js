import React from "react";
import { Meteor } from "meteor/meteor";
import { composeWithTracker } from "/lib/api/compose";
import { Reaction, i18next } from "/client/api";
import { Tags } from "/lib/collections";
import { TranslationProvider, AdminContextProvider } from "/imports/plugins/core/ui/client/providers";
import { isRevisionControlEnabled } from "/imports/plugins/core/revisions/lib/api";

const handleAddProduct = () => {
  Reaction.setUserPreferences("reaction-dashboard", "viewAs", "administrator");
  Meteor.call("products/createProduct", (error, productId) => {
    if (Meteor.isClient) {
      let currentTag;
      let currentTagId;

      if (error) {
        throw new Meteor.Error("createProduct error", error);
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

const handleViewContextChange = (event, value) => {
  Reaction.setUserPreferences("reaction-dashboard", "viewAs", value);

  if (Reaction.isPreview() === true) {
    // Save last action view state
    const saveActionViewState = Reaction.getActionView();
    Reaction.setUserPreferences("reaction-dashboard", "savedActionViewState", saveActionViewState);

    // hideActionView during isPreview === true
    Reaction.hideActionView();
  } else {
    // // Reload previous actionView, if saved. Otherwise, don't show.
    // const savedActionViewState = Reaction.getUserPreferences("reaction-dashboard", "savedActionViewState");
    //
    // if (savedActionViewState) {
    //   Reaction.showActionView(savedActionViewState);
    // }
  }
};

function composer(props, onData) {
  // Reactive data sources
  const routeName = Reaction.Router.getRouteName();

  // Standard variables
  const packageButtons = [];

  if (routeName !== "dashboard" && props.showPackageShortcuts) {
    const registryItems = Reaction.Apps({ provides: "settings", container: "dashboard" });

    for (const item of registryItems) {
      if (Reaction.hasPermission(item.route, Meteor.userId())) {
        let icon = item.icon;

        if (!item.icon && item.provides === "settings") {
          icon = "gear";
        }

        packageButtons.push({
          href: item.route,
          icon: icon,
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
    hasCreateProductAccess: Reaction.hasPermission("createProduct", Meteor.userId(), Reaction.shopId),

    // Callbacks
    onAddProduct: handleAddProduct,
    onViewContextChange: handleViewContextChange
  });
}

export default function ToolbarContainer(Comp) {
  function CompositeComponent(props) {
    return (
      <TranslationProvider>
        <AdminContextProvider>
          <Comp {...props} />
        </AdminContextProvider>
      </TranslationProvider>
    );
  }

  return composeWithTracker(composer, null)(CompositeComponent);
}

import React from "react";
import { composeWithTracker } from "/lib/api/compose";
import { Meteor } from "meteor/meteor";
import { Reaction, i18next } from "/client/api";

import { TranslationProvider, AdminContextProvider } from "/imports/plugins/core/ui/client/providers";

const handleAddProduct = () => {
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
  const viewAs = value;

  // Save viewAs status to profile for consistant use across app
  if (Meteor.user()) {
    Meteor.users.update(Meteor.userId(), {
      $set: {
        "profile.preferences.reaction-dashboard.viewAs": viewAs
      }
    });
  }
};

function composer(props, onData) {
  // Reactive data sources
  const viewAs = Meteor.user().profile.preferences["reaction-dashboard"].viewAs || "administrator";
  const routeName = Reaction.Router.getRouteName();

  // Standard variables
  const packageButtons = [];

  if (routeName !== "dashboard") {
    const registryItems = Reaction.Apps({ provides: "settings", container: routeName });

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
    isPreview: viewAs === "customer" ? true : false,
    isActionViewAtRootView: Reaction.isActionViewAtRootView(),
    actionViewIsOpen: Reaction.isActionViewOpen(),

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

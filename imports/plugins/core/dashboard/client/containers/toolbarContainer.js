import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { Toolbar } from "../components"

import { Meteor } from "meteor/meteor";
import { Blaze } from "meteor/blaze";
import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";

import { TranslationProvider, AdminContextProvider } from "/imports/plugins/core/ui/client/providers";
import { Loading } from "/imports/plugins/core/ui/client/components";


function handleActionViewBack() {
  Reaction.popActionView();
}

function handleActionViewClose() {
  Reaction.hideActionView();
}

const handleViewContextChange = (event, value) => {
  Reaction.Router.setQueryParams({ as: value });
};

function composer(props, onData) {
  // Reactive data sources
  const viewAs = Reaction.Router.getQueryParam("as");
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

  console.log("PROPS into toolbar container", props);

  onData(null, {
    packageButtons,
    dashboardHeaderTemplate: props.data.dashboardHeader,
    isPreview: viewAs === "customer" ? true : false,
    isActionViewAtRootView: Reaction.isActionViewAtRootView(),
    actionViewIsOpen: Reaction.isActionViewOpen(),

    // Callbacks
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

  return composeWithTracker(composer, Loading)(CompositeComponent);
}

import React from "react";
import { StyleRoot } from "radium";
import _ from "lodash";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";
import { AdminContextProvider } from "/imports/plugins/core/ui/client/providers";


function handleActionViewBack() {
  Reaction.popActionView();
}

function handleActionViewDetailBack() {
  Reaction.popActionViewDetail();
}

function handleActionViewClose() {
  Reaction.hideActionView();
}

function handleActionViewDetailClose() {
  Reaction.hideActionViewDetail();
}

function composer(props, onData) {
  const shortcuts = Reaction.Apps({ provides: "shortcut", enabled: true });
  const items = [];

  if (_.isArray(shortcuts)) {
    for (const shortcut of shortcuts) {
      if (!shortcut.container) {
        items.push({
          type: "link",
          href: Reaction.Router.pathFor(shortcut.name),
          className: Reaction.Router.isActiveClassName(shortcut.name),
          icon: shortcut.icon,
          tooltip: shortcut.label || "",
          i18nKeyTooltip: shortcut.i18nKeyLabel,
          tooltipPosition: "left middle"
        });
      }
    }
  }

  items.push({ type: "seperator" });

  items.push({
    icon: "plus",
    tooltip: "Create Content",
    i18nKeyTooltip: "app.createContent",
    tooltipPosition: "left middle"
  });

  // calculated here and not in component, as environment dependent.
  const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

  onData(null, {
    isAdminArea: true,
    actionView: Reaction.getActionView(),
    detailView: Reaction.getActionViewDetail(),
    data: props.data,
    buttons: items,
    isActionViewAtRootView: Reaction.isActionViewAtRootView(),
    isDetailViewAtRootView: Reaction.isActionViewDetailAtRootView(),
    actionViewIsOpen: Reaction.isActionViewOpen(),
    detailViewIsOpen: Reaction.isActionViewDetailOpen(),
    viewportWidth,

    // Callbacks
    handleActionViewBack,
    handleActionViewDetailBack,
    handleActionViewClose,
    handleActionViewDetailClose
  });
}

export default function ActionViewContainer(Comp) {
  function CompositeComponent(props) {
    return (
      <AdminContextProvider>
        <StyleRoot>
          <Comp {...props} />
        </StyleRoot>
      </AdminContextProvider>
    );
  }

  return composeWithTracker(composer)(CompositeComponent);
}

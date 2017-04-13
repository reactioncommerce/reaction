import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { Admin } from "../components"

import { Meteor } from "meteor/meteor";
import { Blaze } from "meteor/blaze";
import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";

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
    tooltipPosition: "left middle",
    // onClick(event) {
    //   if (!instance.dropInstance) {
    //     instance.dropInstance = new Drop({ target: event.currentTarget, content: "", constrainToWindow: true, classes: "drop-theme-arrows", position: "right center" });
    //
    //     Blaze.renderWithData(Template.createContentMenu, {}, instance.dropInstance.content);
    //   }
    //
    //   instance.dropInstance.open();
    // }
  });

  onData(null, {
    actionView: Reaction.getActionView(),
    data: props.data,
    buttons: items,
    actionViewIsOpen: Reaction.isActionViewOpen()
  });
}

export default function AdminContainer(component) {
  return composeWithTracker(composer)(component);
}

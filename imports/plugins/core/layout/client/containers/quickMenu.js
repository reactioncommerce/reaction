import React, { Component, PropTypes } from "component";
import { composeWithTracker } from "/lib/api/compose";
import QuickMenu from "../components"
import { Meteor } from "meteor/meteor";
import { Blaze } from "meteor/blaze";
import { Template } from "meteor/templating";
import { Reaction, i18next } from "/client/api";
import { Packages } from "/lib/collections";

class QuickMenu extends Component {
  render() {
    return (
      <QuickMenu
        {...this.props}
      />
    );
  }
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
    buttons: items
  })
}

export default composeWithTracker(composer)(QuickMenu)


// shortcutButtons() {
//   const instance = Template.instance();
//   const shortcuts = Reaction.Apps({ provides: "shortcut", enabled: true });
//   const items = [];
//
//   if (_.isArray(shortcuts)) {
//     for (const shortcut of shortcuts) {
//       if (!shortcut.container) {
//         items.push({
//           type: "link",
//           href: Reaction.Router.pathFor(shortcut.name),
//           className: Reaction.Router.isActiveClassName(shortcut.name),
//           icon: shortcut.icon,
//           tooltip: shortcut.label || "",
//           i18nKeyTooltip: shortcut.i18nKeyLabel,
//           tooltipPosition: "left middle"
//         });
//       }
//     }
//   }
//
//   items.push({ type: "seperator" });
//
//   items.push({
//     icon: "plus",
//     tooltip: "Create Content",
//     i18nKeyTooltip: "app.createContent",
//     tooltipPosition: "left middle",
//     onClick(event) {
//       if (!instance.dropInstance) {
//         instance.dropInstance = new Drop({ target: event.currentTarget, content: "", constrainToWindow: true, classes: "drop-theme-arrows", position: "right center" });
//
//         Blaze.renderWithData(Template.createContentMenu, {}, instance.dropInstance.content);
//       }
//
//       instance.dropInstance.open();
//     }
//   });
//
//   return items;
// },
//
// isSeperator(props) {
//   if (props.type === "seperator") {
//     return true;
//   }
//   return false;
// },
//
// packageButtons() {
//   const routeName = Reaction.Router.getRouteName();
//
//   if (routeName !== "dashboard") {
//     const registryItems = Reaction.Apps({ provides: "settings", container: routeName });
//     const buttons = [];
//
//     for (const item of registryItems) {
//       if (Reaction.hasPermission(item.route, Meteor.userId())) {
//         let icon = item.icon;
//
//         if (!item.icon && item.provides === "settings") {
//           icon = "gear";
//         }
//
//         buttons.push({
//           href: item.route,
//           icon: icon,
//           tooltip: i18next.t(item.i18nKeyLabel, item.i18n),
//           tooltipPosition: "left middle",
//           onClick() {
//             Reaction.showActionView(item);
//           }
//         });
//       }
//     }
//
//     return buttons;
//   }
//   return [];
// },
//
// control: function () {
//   return Reaction.getActionView();
// },
//
// adminControlsClassname: function () {
//   if (Reaction.isActionViewOpen()) {
//     return "show-settings";
//   }
//   return "";
// },
//
// /**
//  * thisApp
//  * @return {Object} Registry entry for item
//  */
// thisApp() {
//   const reactionApp = Packages.findOne({
//     "registry.provides": "settings",
//     "registry.route": Reaction.Router.getRouteName()
//   }, {
//     enabled: 1,
//     registry: 1,
//     name: 1,
//     route: 1
//   });
//
//   if (reactionApp) {
//     const settingsData = _.find(reactionApp.registry, function (item) {
//       return item.route === Reaction.Router.getRouteName() && item.provides === "settings";
//     });
//
//     return settingsData;
//   }
//   return reactionApp;
// }
// });

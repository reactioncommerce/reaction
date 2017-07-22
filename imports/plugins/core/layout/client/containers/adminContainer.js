import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { Reaction } from "/client/api";

function composer(props, onData) {
  const shortcuts = Reaction.Apps({ provides: "shortcut", enabled: true });
  const items = [];

  if (Array.isArray(shortcuts)) {
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

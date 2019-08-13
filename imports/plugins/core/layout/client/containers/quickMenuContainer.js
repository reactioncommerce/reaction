import _ from "lodash";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { QuickMenu } from "../components";
import { Reaction } from "/client/api";

/**
 * @private
 * @param {Object} props Props
 * @param {Function} onData Call this to update props
 * @returns {undefined}
 */
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

  onData(null, {
    buttons: items
  });
}

export default composeWithTracker(composer)(QuickMenu);

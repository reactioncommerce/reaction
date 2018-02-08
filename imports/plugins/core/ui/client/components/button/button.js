import _ from "lodash";
import Tooltip from "tether-tooltip";
import { Template } from "meteor/templating";
import { i18next, i18nextDep } from "/client/api";
import { Icon } from "/imports/plugins/core/ui/client/components";

Template.button.onRendered(function () {
  const buttonElement = this.$("button, a")[0];

  this.createTooltip = () => {
    if (this.data.tooltip) {
      if (this.tooltip) {
        this.tooltip.destroy();
      }
      this.tooltip = new Tooltip({
        target: buttonElement,
        position: this.data.tooltipPosition || "top left",
        content: i18next.t(this.data.i18nKeyTooltip, this.data.tooltip) || this.data.tooltip
      });
    }
  };

  this.autorun(() => {
    i18nextDep.depend();
    this.createTooltip();
  });
});

/* eslint no-unused-vars: 1 */
//
// TODO review Template.button helpers for unused elementProps
//
Template.button.helpers({
  iconComponent() {
    return Icon;
  },

  elementProps() {
    const data = Template.currentData();
    const {
      // Remove unneeded attributes
      className, status, type, href,

      // Pull out invalid HTML attributes / unuesed attributes
      /* eslint-disable */
      title, label, i18nKeyTitle, i18nKeyLabel, i18nKeyTooltip,
      tooltip,  icon, toggle, onIcon, toggleOn, onClick,
      /* eslint-enable */

      // Get the rest of the properties and put them in attrs
      // these will most likely be HTML attributes
      ...attrs
    } = data;

    return {
      buttonAttributes: {
        ...attrs, // Spread the attrs into this object
        // Then override any props from attrs with some better defaults
        class: `rui button btn btn-${status} ${className}`,
        href,
        type: () => {
          if (!href) {
            return type || "button";
          }
        }
      }
    };
  },
  element() {
    const data = Template.currentData();
    if (data.type === "link") {
      return "uiLinkElement";
    }
    return "uiButtonElement";
  },
  i18nKeyTitle() {
    const { data } = Template.instance();
    return data.itemKeyTitle || data.i18nKeyLabel;
  },
  title() {
    const { data } = Template.instance();
    return data.title || data.label;
  },
  toggleOn() {
    const instance = Template.instance();
    const { toggleOn } = instance.data;

    if (toggleOn) {
      if (_.isFunction(toggleOn)) {
        return toggleOn(instance.data);
      }

      return toggleOn;
    }
  }
});

Template.button.events({
  "click .rui.button"(event, instance) {
    if (instance.data.onClick) {
      instance.data.onClick(event);
    }
  }
});

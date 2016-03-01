const Tooltip = ReactionUI.Lib.Tooltip;
const Icon = ReactionUI.Components.Icon;

Template.button.onRendered(function () {
  if (this.data.tooltip) {
    const buttonElement = this.$("button, a")[0];
    this.tooltip = new Tooltip({
      target: buttonElement,
      position: this.data.tooltipPosition || "top left",
      content: this.data.tooltip
    });
  }
});

Template.button.helpers({
  iconComponent() {
    return Icon;
  },

  elementProps() {
    const data = Template.currentData();
    return {
      ...data,
      href: data.href,
      type: data.type || "button",
      status: data.status || "default",
      className: data.className
    };
  },
  element() {
    const data = Template.currentData();
    if (data.type === "link") {
      return "uiLinkElement";
    }
    return "uiButtonElement";
  },
  status() {
    return Template.instance().data.status || "default";
  },
  type() {
    return Template.instance().data.type || "button";
  },
  i18nKeyTitle() {
    const data = Template.instance().data;
    return data.itemKeyTitle || data.i18nKeyLabel;
  },
  title() {
    const data = Template.instance().data;
    return data.title || data.label;
  }
});

Template.button.events({
  "click .rui.button"(event, instance) {
    if (instance.data.onClick) {
      instance.data.onClick(event);
    }
  }
});

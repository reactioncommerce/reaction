import { Reaction, Router, i18next } from "/client/api";
import { Themes } from "/lib/collections";

Template.uiThemeDetails.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    selectedComponent: null,
    theme: {}
  });

  this.subscribe("Themes");

  this.autorun(() => {
    const selectedComponent = Router.getQueryParam("component");
    this.state.set("selectedComponent", selectedComponent);

    if (selectedComponent) {
      Reaction.showActionView({
        label: i18next.t("reactionUI.editTheme", "Edit Theme"),
        props: {
          size: "large"
        },
        template: "uiThemeEditor"
      });
    }
  });

  this.autorun(() => {
    this.theme = Themes.findOne({name: "base"});
    this.state.set("theme", this.theme);
  });
});

Template.uiThemeDetails.onRendered(function () {

});

Template.uiThemeDetails.helpers({
  activeClassName(componentName) {
    if (Template.instance().state.equals("selectedComponent", componentName)) {
      return "active";
    }
    return "";
  },

  components() {
    const instance = Template.instance();
    const theme = instance.state.get("theme");
    let components = [];

    if (theme) {
      components = theme.components.map((component) => {
        return {
          label: i18next.t(`reactionUI.components.${component.name}`, {
            defaultValue: component.label
          }),
          name: component.name
        };
      });
    }

    return components;
  },

  publishTheme() {
    const instance = Template.instance();
    return () => {
      const theme = instance.state.get("theme") || {};
      Meteor.call("ui/publishTheme", theme, (error) => {
        if (error) {
          const alertDescription = i18next.t("reactionUI.publishThemeError", {
            defaultValue: `Couldn't publish theme ${theme.name}`,
            themeName: theme.name
          });
          Alerts.toast(alertDescription, "error");
        }
      });
    };
  }
});

Template.uiThemeDetails.events({
  "click [data-event-action=editComponentTheme]"(event) {
    Router.setQueryParams({
      component: event.currentTarget.dataset.component
    });
  }

});

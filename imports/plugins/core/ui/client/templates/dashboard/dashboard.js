import { i18next, Router } from "/client/api";
import { Themes } from "/lib/collections";

Template.uiDashboard.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    themes: []
  });

  this.autorun(() => {
    this.subscribe("Themes");
    const themes = Themes.find({}).fetch();
    this.state.set("themes", themes);
  });
});

Template.uiDashboard.helpers({
  themeCardProps(theme) {
    return {
      onContentClick() {
        Router.go("dashboard/uiThemeDetails", {
          id: theme.name
        });
      },
      controls: [
        {
          icon: "check-square fa-fw"
        },
        {
          icon: "files-o fa-fw",
          onClick() {
            Alerts.alert({
              title: i18n.t("reactionUI.duplicateTheme", "Duplicate Theme"),
              showCancelButton: true,
              confirmButtonText: "Duplicate"
            }, () => {
              Meteor.call("ui/duplicateTheme", theme.name, (error) => {
                if (error) {
                  const alertDescription = i18next.t("reactionUI.duplicateThemeError", {
                    defaultValue: "Couldn't duplicate theme"
                  });
                  Alerts.toast(alertDescription, "error");
                }
              });
            });
          }
        }
      ]
    };
  },

  themes() {
    return Template.instance().state.get("themes");
  }
});

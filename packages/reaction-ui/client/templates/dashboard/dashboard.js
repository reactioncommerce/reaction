
Template.uiDashboard.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    themes: []
  });

  this.autorun(() => {
    this.subscribe("Themes");
    const themes = ReactionCore.Collections.Themes.find({}).fetch();
    this.state.set("themes", themes);
  });
});

Template.uiDashboard.helpers({
  themeCardProps(theme) {
    return {
      onContentClick() {
        ReactionRouter.go("dashboard/uiThemeDetails", {
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
              title: "Duplicate Theme",
              showCancelButton: true,
              confirmButtonText: "Duplicate"
            }, () => {
              Meteor.call("ui/duplicateTheme", theme.theme, (error) => {
                if (error) {
                  Alerts.toast("Could't duplicate theme", "error");
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

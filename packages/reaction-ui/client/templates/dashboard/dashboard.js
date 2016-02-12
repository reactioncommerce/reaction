
Template.uiDashboard.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    themes: []
  });

  this.autorun(() => {
    const sub = this.subscribe("Themes");

    // if (sub.ready()) {
      const themes = ReactionCore.Collections.Themes.find({}).fetch();
      this.state.set("themes", themes);
    // }
  });
});

Template.uiDashboard.helpers({

  duplicateThemeButtonProps(theme) {
    return {
      icon: "files-o fa-fw",
      onClick() {
        Alerts.alert({
          title: "Duplicate Theme",
          showCancelButton: true,
          confirmButtonText: "Duplicate"
        }, () => {
          Meteor.call("ui/duplicateTheme", theme.theme, (error, result) => {
            if (error) {

            }
          });
        });
      }
    }
  },

  themes() {
    return Template.instance().state.get("themes");
  }
});


Template.uiDashboard.events({
  "click [data-event-action=showTheme]"(event) {
    ReactionRouter.go("dashboard/uiThemeDetails", {
      id: event.currentTarget.dataset.theme
    });
  }
});

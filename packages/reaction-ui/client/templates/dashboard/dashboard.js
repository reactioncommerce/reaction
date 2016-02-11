
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
  themes() {
    return Template.instance().state.get("themes");
  }
});


Template.reactionLayoutSettings.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    selectors: []
  });

  Meteor.subscribe("Themes");

  this.autorun(() => {
    const theme = ReactionCore.Collections.Themes.findOne({name: "base"})

    if (theme) {
      $("#reactionLayoutStyles").text(theme.styles);


      Meteor.call("layout/cssToObject", theme.styles, (error, result) => {
        if (result) {
          let selectors = [];
          this.styles = result;

          for (let selector in result) {
            if (result.hasOwnProperty(selector)) {
              selectors.push(selector);
            }
          }

          this.state.set("selectors", selectors);
        }
      });
    }
  });
});


Template.reactionLayoutSettings.helpers({
  selectors() {
    const instance = Template.instance();
    return instance.state.get("selectors");
  },

  styles(selector) {
    let props = Template.instance().styles[selector] || {};

    const styles = _.map(props, (value, property) => {
      return {
        property,
        value
      };
    });

    return styles;
  },

  updateStyles() {
    return () => {
    }
  }
});

Template.reactionLayoutSettings.events({
  "input input"(event, template) {

    const selector = $(event.target).closest("[data-selector]").data("selector");
    const property = event.target.name;
    const value = event.target.value;

    // Update style value
    template.styles[selector][property] = value

    Meteor.call("layout/processStyles", template.styles, (error, result) => {
      if (result) {
        // console.log(result);
      }
    });
  }
});

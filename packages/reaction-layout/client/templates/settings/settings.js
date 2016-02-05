
Template.reactionLayoutSettings.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    selectors: [],
    annotations: {}
  });

  Meteor.subscribe("Themes");

  this.annotationsBySelector = {}
  this.annotations = new ReactiveDict();

  this.autorun(() => {
    const theme = ReactionCore.Collections.Themes.findOne({theme: "base"})

    if (theme) {
      const styles =  theme.stylesheets[0].stylesheet;

      $("#reactionLayoutStyles").text(styles);

      Meteor.call("layout/processAnnotations", styles, (error, result) => {
        if (result) {
          let annotations = {};

          for (let annotation of result) {
            const {label, rule} = annotation

            if (rule) {
              annotations[rule] = annotation;
            }
          }

          this.annotations.setDefault(annotations);
          this.annotationsBySelector = annotations
        }
      })


      Meteor.call("layout/cssToObject", styles, (error, result) => {
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

  annotation(selector) {
    const instance = Template.instance();
    const result = instance.annotationsBySelector[selector] || {
      label: selector
    };

    return result
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
  "mouseover [data-rule]"(event) {
    const selector = event.currentTarget.dataset.selector;

    $(selector).css({
      boxShadow: "0 0 5px 2px #00dcdd"
    })
  },

  "mouseout [data-rule]"(event) {
    const selector = event.currentTarget.dataset.selector;
    $(selector).css({
      boxShadow: "none"
    })
  },


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

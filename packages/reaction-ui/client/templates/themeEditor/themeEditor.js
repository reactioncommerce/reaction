
Template.uiThemeEditor.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    selectors: [],
    annotations: {},
    selectedComponent: null,
    styles: {},
    theme: {}
  });

  Meteor.subscribe("Themes");

  this.findComponentByName = (name) => {
    const theme = this.state.get("theme");
    if (theme) {
      return _.find(theme.components, (component) => {
        return component.name === name;
      });
    }
  };

  this.selectThemeComponent = (name) => {
    this.state.set("selectedComponent", name);
  };

  this.autorun(() => {
    const componentName = ReactionRouter.getQueryParam("component");
    const component = this.findComponentByName(componentName);
    this.state.set("selectedComponent", component);
    if (component) {
      // Get a freestyle-like object from raw css
      Meteor.call("ui/cssToObject", component.styles, (error, result) => {
        this.state.set("styles", result);
      });

      const annotations = {};

      for (let annotation of component.annotations) {
        if (annotation.rule) {
          annotations[annotation.rule] = annotation;
        }
      }

      this.state.set("annotations", annotations);
    }
  });

  this.previewStyles = (theme) => {
    let output = "";
    for (let stylesheet of theme.stylesheets) {
      output += stylesheet.styles;
    }
    $("#reactionLayoutStyles").text(output);
  };

  this.autorun(() => {
    this.theme = ReactionCore.Collections.Themes.findOne({theme: "base"});
    this.state.set("theme", this.theme);
  });
});


Template.uiThemeEditor.helpers({
  component() {
    const instance = Template.instance();
    const theme = instance.state.get("theme");
    const selectedComponent = instance.state.get("selectedComponent");
    if (theme) {
      return selectedComponent;
    }
  },

  styles() {
    const instance = Template.instance();
    const stylesObject = instance.state.get("styles");
    const annotations = instance.state.get("annotations") || {};

    const stylesArray = _.map(stylesObject, (declarations, selector) => {
      return {
        selector,
        annotation: annotations[selector] || {
          label: selector
        },
        declarations: _.map(declarations, (value, property) => {
          return {
            property,
            value
          };
        })
      };
    });
    return stylesArray;
  },

  updateStyles() {
    return () => {
    };
  },

  componentSelectProps() {
    const instance = Template.instance();
    let options = [];
    const theme = instance.state.get("theme");

    if (theme) {
      options = theme.components.map((component) => {
        return {
          label: component.label || component.name,
          value: component.name
        };
      });
    }

    return {
      options,
      onSelect(value) {
        instance.selectThemeComponent(value);
      }
    };
  }
});

Template.uiThemeEditor.events({
  "mouseover [data-rule]"(event) {
    const selector = event.currentTarget.dataset.selector;

    $(selector).css({
      boxShadow: "0 0 5px 2px #00dcdd"
    });
  },

  "mouseout [data-rule]"(event) {
    const selector = event.currentTarget.dataset.selector;
    $(selector).css({
      boxShadow: "none"
    });
  },


  "input input"(event, template) {
    const selector = $(event.target).closest("[data-selector]").data("selector");
    const property = event.target.name;
    const value = event.target.value;
    const theme = template.state.get("theme");
    const component = template.state.get("selectedComponent");
    const styles = template.state.get("styles");

    styles[selector][property] = value;

    // Update style value
    const data = {
      theme,
      component,
      styles
    };

    Meteor.call("ui/updateStyles", data, (error, result) => {
      if (result) {
        // console.log(result);
      }
    });
  }
});

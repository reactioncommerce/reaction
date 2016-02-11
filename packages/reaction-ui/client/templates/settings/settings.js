
Template.reactionUISettings.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    selectors: [],
    annotations: {},
    selectedComponent: null,
    theme: {}
  });

  Meteor.subscribe("Themes");

  this.findComponentByName = (name) => {
    const theme = this.state.get("theme");

    if (theme) {
      console.log(theme.components, name);
      return _.find(theme.components, (component) => {
        return component.name === name;
      });
    }
  };

  this.selectThemeComponent = (name) => {
    this.state.set("selectedComponent", name);
  };

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

    if (this.state.equals("selectedComponent", null) && this.theme) {
      this.state.set("selectedComponent", this.theme.components[0].name);
    }

    // if (this.theme) {
    //   this.previewStyles(this.theme);
    // }
  });
});


Template.reactionUISettings.helpers({
  component() {
    const instance = Template.instance();
    const theme = instance.state.get("theme");
    const selectedComponent = instance.state.get("selectedComponent");

    if (theme) {
      return instance.findComponentByName(selectedComponent);
    }
  },

  // annotation(selector) {
  //   const instance = Template.instance();
  //   const result = instance.annotationsBySelector[selector] || {
  //     label: selector
  //   };
  //
  //   return result;
  // },

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

Template.reactionUISettings.events({
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

    // Update style value
    template.styles[selector][property] = value;

    const data = {
      theme: template.theme,
      stylesheet: template.currentStylesheet,
      styles: template.styles
    };

    Meteor.call("layout/processStyles", data, (error, result) => {
      if (result) {
        // console.log(result);
      }
    });
  }
});

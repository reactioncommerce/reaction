// https://guide.meteor.com/react.html#using-with-blaze
import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";
import { Template } from "meteor/templating";
import { Blaze } from "meteor/blaze";

// Empty template; logic in `onRendered` below
Template.React = new Template("Template.React", () => []);


Template.React.onRendered(function () {
  const parentTemplate = parentTemplateName();
  const container = this.firstNode.parentNode;
  this.container = container;

  this.autorun(() => {
    const data = Blaze.getData();

    const comp = data && data.component;
    if (!comp) {
      throw new Error(`In template ${parentTemplate}, call to \`{{> React ... }}\` missing \`component\` argument.`);
    }

    const props = _.omit(data, "component");
    ReactDOM.render(React.createElement(comp, props), container);
  });
});

Template.React.onDestroyed(function () {
  if (this.container) {
    ReactDOM.unmountComponentAtNode(this.container);
  }
});

// Gets the name of the template inside of which this instance of `{{> React ...}}`
// is being used. Used to print more explicit error messages
function parentTemplateName() {
  let view = Blaze.getView();
  if (!view || view.name !== "Template.React") {
    throw new Error("Unexpected: called outside of Template.React");
  }
  // find the first parent view which is a template or body
  view = view.parentView;
  while (view) {
    const m = view.name.match(/^Template\.(.*)/);
    // check `view.name.match(/^Template\./)` because iron-router (and
    // maybe other packages) create a view named "yield" that has the
    // `template` property set
    if (view.template && view.name && m) {
      return m[1];
    } else if (view.name === "body") {
      return "<body>";
    }

    view = view.parentView;
  }

  // not sure when this could happen
  return "<unknown>";
}

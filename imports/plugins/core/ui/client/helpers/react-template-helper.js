// https://guide.meteor.com/react.html#using-with-blaze
import React from "react";
import ReactDOM from "react-dom";
import { ApolloProvider } from "react-apollo";
import { ComponentsProvider } from "@reactioncommerce/components-context";
import { ThemeProvider } from "styled-components";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import _ from "lodash";
import { Template } from "meteor/templating";
import { Blaze } from "meteor/blaze";
import appComponents from "/imports/plugins/core/router/client/appComponents";
import theme from "/imports/plugins/core/router/client/theme";
import { defaultTheme } from "@reactioncommerce/catalyst";
import initApollo from "/imports/plugins/core/graphql/lib/helpers/initApollo";

// Ideally this will be done only in browserRouter.js, but we lose context within Blaze templates,
// so until everything is converted to React, we need this here, too.
const apolloClient = initApollo();

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
    const elem = React.createElement(comp, props);

    ReactDOM.render(
      (
        <ApolloProvider client={apolloClient}>
          <ComponentsProvider value={appComponents}>
            <ThemeProvider theme={theme}>
              <MuiThemeProvider theme={defaultTheme}>
                {elem}
              </MuiThemeProvider>
            </ThemeProvider>
          </ComponentsProvider>
        </ApolloProvider>
      ),
      container
    );
  });
});

Template.React.onDestroyed(function () {
  if (this.container) {
    ReactDOM.unmountComponentAtNode(this.container);
  }
});

/**
 * @description Gets the name of the template inside of which this instance of `{{> React ...}}` is being used. Used to print more explicit error messages
 * @returns {String} name of template
 */
function parentTemplateName() {
  let view = Blaze.getView();
  if (!view || view.name !== "Template.React") {
    throw new Error("Unexpected: called outside of Template.React");
  }
  // find the first parent view which is a template or body
  view = view.parentView;
  while (view) {
    const match = view.name.match(/^Template\.(.*)/);
    // check `view.name.match(/^Template\./)` because iron-router (and
    // maybe other packages) create a view named "yield" that has the
    // `template` property set
    if (view.template && view.name && match) {
      return match[1];
    } else if (view.name === "body") {
      return "<body>";
    }

    view = view.parentView;
  }

  // not sure when this could happen
  return "<unknown>";
}

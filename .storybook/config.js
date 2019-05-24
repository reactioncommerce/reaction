import React from "react";
import { addDecorator, configure } from "@storybook/react";
import { ThemeProvider } from "styled-components";
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider";
import theme from "../imports/plugins/core/router/client/theme";
import muiTheme from "../imports/plugins/core/router/client/theme/muiTheme.js";

// automatically import all files ending in *.stories.js
const req = require.context("../imports", true, /\.stories\.js$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

// You can add decorator globally:
addDecorator((story) => (
  <ThemeProvider theme={theme}>
    <MuiThemeProvider theme={muiTheme}>
      {story()}
    </MuiThemeProvider>
  </ThemeProvider>
));

configure(loadStories, module);

import { defaultComponentTheme } from "@reactioncommerce/components";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import colors from "./colors";

const { rui_typography: typography } = defaultComponentTheme;

export const rawMuiTheme = {
  palette: {
    primary: {
      light: colors.coolGrey300,
      main: colors.coolGrey,
      dark: colors.coolGrey400
    },
    secondary: {
      light: colors.coolGrey300,
      main: colors.coolGrey,
      dark: colors.coolGrey400
    }
  },
  typography: {
    fontFamily: typography.bodyText.fontFamily,
    fontWeightLight: 400,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    useNextVariants: true
  },
  shadows: [
    "none",
    "0px 2px 2px 0px rgba(0,0,0,0.05)",
    "0px 3px 6px 0px rgba(0,0,0,0.05)",
    "0px 5px 10px 0 rgba(0,0,0,0.05);",
    "0px 8px 16px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);",
    "0px 13px 26px 0 rgba(0,0,0,0.05);"
  ],
  // Override default props
  props: {
    MuiAppBar: {
      elevation: 3
    }
  },
  // Override defined theme properties
  overrides: {
    MuiAppBar: {
      colorDefault: {
        backgroundColor: colors.white
      }
    },
    MuiCard: {
      root: {
        border: `1px solid ${colors.black10}`
      }
    }
  }
};

export default createMuiTheme(rawMuiTheme);

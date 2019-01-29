import { defaultComponentTheme } from "@reactioncommerce/components";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import createBreakpoints from "@material-ui/core/styles/createBreakpoints";
import colors from "./colors";

const { rui_typography: typography } = defaultComponentTheme;
const breakpoints = createBreakpoints({});
const toolbarHeight = 80;

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
    fontSize: 16,
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
  shape: {
    borderRadius: 2
  },
  mixins: {
    toolbar: {
      minHeight: toolbarHeight,
      [`${breakpoints.up("xs")} and (orientation: landscape)`]: {
        minHeight: toolbarHeight
      },
      [breakpoints.up('sm')]: {
        minHeight: toolbarHeight
      }
    }
  },
  // Override default props
  props: {
    MuiAppBar: {
      elevation: 3
    }
  },
  // Override defined theme properties
  overrides: {
    MuiAppBar: {
      root: {
        height: toolbarHeight
      },
      colorDefault: {
        backgroundColor: colors.white
      }
    },
    MuiButton: {
      root: {
        textTransform: "initial"
      }
    },
    MuiCard: {
      root: {
        border: `1px solid ${colors.black10}`
      }
    },
    MuiCheckbox: {
      root: {
        color: colors.coolGrey500
      },
      colorSecondary: {
        "&$checked": {
          color: colors.coolGrey500
        },
        "&$disabled": {
          color: colors.coolGrey100
        }
      }
    }
  }
};

export default createMuiTheme(rawMuiTheme);

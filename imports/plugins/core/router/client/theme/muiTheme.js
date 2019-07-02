import { defaultComponentTheme } from "@reactioncommerce/components";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import createBreakpoints from "@material-ui/core/styles/createBreakpoints";
import colors from "./colors";

const { rui_typography: typography } = defaultComponentTheme;
const breakpoints = createBreakpoints({});
const toolbarHeight = 80;
const toolbarMobileHeight = 54;

// Colors
export const colorPrimaryMain = colors.coolGrey;
export const colorSecondaryMain = colors.reactionBlue;

// Spacing
export const defaultSpacingUnit = 8;
export const drawerWidth = 280;
export const detailDrawerWidth = 400;

// Typography
export const defaultFontSize = 16;
export const fontWeightLight = 400;
export const fontWeightRegular = 400;
export const fontWeightMedium = 500;
export const fontWeightSemiBold = 600;
export const fontWeightBold = 700;

export const rawMuiTheme = {
  palette: {
    colors, // TODO: De-structure these colors into various MUI properties rather than using them from this object
    primary: {
      light: colors.coolGrey300,
      main: colorPrimaryMain,
      dark: colors.coolGrey400
    },
    secondary: {
      light: colors.coolGrey300,
      main: colorSecondaryMain,
      dark: colors.coolGrey400
    },
    divider: colors.black10,
    text: {
      secondary: colors.black15,
      secondaryActive: colors.white,
      active: "#8acef2"
    }
  },
  typography: {
    fontSize: defaultFontSize,
    fontFamily: typography.bodyText.fontFamily,
    fontWeightLight,
    fontWeightRegular,
    fontWeightMedium,
    fontWeightSemiBold,
    fontWeightBold,
    useNextVariants: true,
    subtitle1: {
      fontSize: defaultFontSize
    },
    body1: {
      fontSize: defaultFontSize
    },
    button: {
      fontSize: 14,
      letterSpacing: 0.8
    },
    caption: {
      color: colors.black30
    },
    h1: {
      fontSize: defaultFontSize * 1.5
    },
    h2: {
      fontSize: defaultFontSize * 1.25
    },
    h3: {
      fontSize: defaultFontSize * 1.125
    },
    h4: {
      fontSize: defaultFontSize,
      fontWeight: fontWeightSemiBold
    },
    h5: {
      fontSize: defaultFontSize * 0.875,
      fontWeight: fontWeightSemiBold
    },
    h6: {
      fontSize: defaultFontSize * 0.75,
      fontWeight: fontWeightSemiBold
    }
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
  spacing: {
    drawerWidth,
    detailDrawerWidth,
    unit: defaultSpacingUnit
  },
  mixins: {
    leadingPaddingWhenPrimaryDrawerIsOpen: {
      paddingLeft: drawerWidth + (defaultSpacingUnit * 2)
    },
    trailingPaddingWhenDetailDrawerIsOpen: {
      paddingRight: detailDrawerWidth + (defaultSpacingUnit * 2)
    },
    toolbar: {
      minHeight: toolbarHeight,
      [`${breakpoints.up("xs")} and (orientation: landscape)`]: {
        minHeight: toolbarMobileHeight,
        paddingLeft: defaultSpacingUnit,
        paddingRight: defaultSpacingUnit
      },
      [`${breakpoints.up("xs")} and (orientation: portrait)`]: {
        minHeight: toolbarMobileHeight,
        paddingLeft: defaultSpacingUnit,
        paddingRight: defaultSpacingUnit
      },
      [breakpoints.up("sm")]: {
        minHeight: toolbarHeight
      }
    }
  },
  // Override default props
  props: {
    MuiAppBar: {
      elevation: 0
    },
    MuiCardHeader: {
      titleTypographyProps: {
        variant: "h4"
      }
    }
  },
  // Override defined theme properties
  overrides: {
    MuiAppBar: {
      root: {
        height: toolbarHeight,
        [`${breakpoints.up("xs")} and (orientation: landscape)`]: {
          height: toolbarMobileHeight
        },
        [`${breakpoints.up("xs")} and (orientation: portrait)`]: {
          height: toolbarMobileHeight
        },
        [breakpoints.up("sm")]: {
          height: toolbarHeight
        }
      },
      colorPrimary: {
        backgroundColor: colors.white,
        borderBottom: `1px solid ${colors.black05}`
      },
      colorSecondary: {
        backgroundColor: "#3C4950" // colors.coolGrey with 20% opacity, opaque
      },
      colorDefault: {
        backgroundColor: colors.white,
        borderBottom: `1px solid ${colors.black05}`
      }
    },
    MuiButton: {
      root: {
        padding: `${defaultSpacingUnit}px ${defaultSpacingUnit * 2}px`,
        textTransform: "initial"
      },
      text: {
        padding: `${defaultSpacingUnit}px ${defaultSpacingUnit * 2}px`
      },
      outlined: {
        // Removed 1px of padding from the top/bottom to account for the border
        // which adds 1px to the top/bottom. This makes the button height even
        // with the contained variant.
        padding: `${defaultSpacingUnit - 1}px ${defaultSpacingUnit * 2}px`
      },
      outlinedPrimary: {
        border: `1px solid ${colorPrimaryMain}`
      },
      outlinedSecondary: {
        border: `1px solid ${colorSecondaryMain}`
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
    },
    MuiDrawer: {
      paper: {
        width: drawerWidth
      },
      paperAnchorLeft: {
        borderRight: "none",
        backgroundColor: colors.darkBlue500,
        color: colors.black15
      },
      paperAnchorDockedLeft: {
        borderRight: "none"
      },
      paperAnchorRight: {
        borderLeft: "none",
        backgroundColor: colors.black02,
        width: detailDrawerWidth
      },
      paperAnchorDockedRight: {
        borderRight: "none"
      }
    },
    MuiFab: {
      sizeSmall: {
        width: 36,
        height: 36
      }
    },
    MuiOutlinedInput: {
      inputMarginDense: {
        paddingTop: 8,
        paddingBottom: 8
      }
    },
    MuiTableCell: {
      root: {
        borderBottom: `1px solid ${colors.black10}`
      }
    }
  }
};

export default createMuiTheme(rawMuiTheme);

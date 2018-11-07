/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import colors from "./colors";
import padding from "./padding";

/**
 * Default Theme Shadows
 */
const depth0 = "none";
const depth1 = `0 0 1rem -0.5rem ${colors.black50}`;
const depth2 = `0 0 1rem ${colors.black50}`;

/**
 * Default Theme
 */
const standardBorderRadius = "2px";
const duration = "250ms";
const ease = "cubic-bezier(0.785, 0.135, 0.15, 0.86)";

/**
 * Default Theme Elements
 */
const rui_components = {
  AppBar: {
    backgroundColor: colors.white,
    burgerMenuBackgroundColor: colors.darkBlue500
  },
  BurgerMenu: {
    color: colors.coolGrey300
  },
  Drawer: {
    zIndex: 1
  },
  Sidebar: {
    drawerWidth: "240px",
    iconBarBackground: colors.darkBlue500,
    menuBarBackgroundColor: colors.coolGrey100,
    iconColor: colors.coolGrey300,
    companyNameColor: colors.reactionBlue,
    companyNameBorderBottom: colors.reactionBlue200
  }
};

export default {
  rui_components
};

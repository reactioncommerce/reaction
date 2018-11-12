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
  Sidebar: {
    activeMenuItemColor: colors.reactionBlue,
    companyNameColor: colors.reactionBlue,
    companyNameBorderBottom: colors.reactionBlue200,
    drawerWidth: "264px",
    iconBarBackgroundColor: colors.darkBlue500,
    iconBarWidth: "80px",
    iconColor: colors.coolGrey300,
    ListItemIconPaddingTop: "10px",
    ListItemIconPaddingRight: "30px",
    ListItemIconPaddingBottom: "10px",
    ListItemIconPaddingLeft: "40px",
    menuBarBackgroundColor: colors.coolGrey100
  }
};

export default {
  rui_components
};

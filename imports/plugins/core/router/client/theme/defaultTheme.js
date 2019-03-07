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
const iconBarWidth = "30%";

/**
 * Default Theme Elements
 */
const rui_components = {
  Layout: {
    burgerIconColor: colors.coolGrey300,
    burgerIconLeft: "28px",
    burgerIconTop: "12px",
    pageBackgroundColor: colors.black02,
    pageContentMaxWidth: "1200px",
    pageContentPaddingBottom: "24px",
    pageContentPaddingLeft: "24px",
    pageContentPaddingRight: "24px",
    pageContentPaddingTop: "80px",
    pageHeaderBackgroundColor: colors.black02
  },
  ProfileImage: {
    backgroundColor: colors.coolGrey100
  },
  ProfileImageInitials: {
    typography: {
      color: colors.coolGrey300
    }
  },
  Sidebar: {
    activeMenuItemColor: colors.reactionBlue,
    companyNameColor: colors.reactionBlue,
    companyNameBorderBottom: colors.reactionBlue200,
    dividerHeight: "20px",
    drawerWidth: "280px",
    iconBarWidth,
    iconColor: colors.coolGrey300,
    listItemIconFontSize: "20px",
    // We could use flex-end here, but that aligns the right edge of all icons and since icons can
    // be a pixel or two different in width from each other, this looks strange. Instead, we use
    // "center" align here, which will align the center of all icons, and then push that to the
    // right using left padding.
    listItemIconHorizontalAlign: "center",
    listItemIconMaxHeight: "40px", // includes the top and bottom padding below
    listItemIconPaddingBottom: "10px",
    listItemIconPaddingLeft: "16px",
    listItemIconPaddingRight: "0",
    listItemIconPaddingTop: "10px",
    // Change "flex-start" to "center" to center the logo in the right side of the sidebar
    logoHorizontalAlign: "flex-start",
    logoPaddingBottom: "32px",
    logoPaddingLeft: "10px",
    logoPaddingRight: "10px",
    logoPaddingTop: "32px",
    menuBarBackground: `linear-gradient(
      to right,
      ${colors.darkBlue500} 0%,
      ${colors.darkBlue500} ${iconBarWidth},
      ${colors.coolGrey100} ${iconBarWidth},
      ${colors.coolGrey100} 100%
    )`
  },
  MediaUploader: {
    backgroundColor: colors.black02,
    border: `1px solid ${colors.black20}`
  },
  HeroMediaSmall: {
    border: `1px solid ${colors.reactionBlue}`
  }
};

export default {
  rui_components
};

import React from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import CircularProgress from "@material-ui/core/CircularProgress";
import MuiButton from "@material-ui/core/Button";

const styles = (theme) => ({
  buttonProgress: {
    marginLeft: theme.spacing(1)
  },
  containedPrimary: {
    "color": theme.palette.primary.contrastText,
    "backgroundColor": theme.palette.colors.red,
    "&:hover": {
      "backgroundColor": theme.palette.colors.redHover,
      // Reset on touch devices, it doesn't add specificity
      "@media (hover: none)": {
        backgroundColor: theme.palette.colors.redHover
      }
    }
  },
  outlinedPrimary: {
    "color": theme.palette.colors.red,
    "border": `1px solid ${theme.palette.colors.red}`,
    "&:hover": {
      "border": `1px solid ${theme.palette.colors.redBorder}`,
      "backgroundColor": theme.palette.colors.redBackground,
      // Reset on touch devices, it doesn't add specificity
      "@media (hover: none)": {
        backgroundColor: "transparent"
      }
    }
  }
});

/**
 * @name Button
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function Button(props) {
  const {
    children,
    classes,
    color,
    disabled,
    isWaiting,
    ...otherProps
  } = props;

  if (color === "danger") {
    return (
      <MuiButton
        classes={{
          containedPrimary: classes.containedPrimary,
          outlinedPrimary: classes.outlinedPrimary
        }}
        color="primary"
        disabled={disabled || isWaiting}
        {...otherProps}
      >
        {children}
        {isWaiting && <CircularProgress size={16} className={classes.buttonProgress} />}
      </MuiButton>
    );
  }

  return (
    <MuiButton
      color={color}
      disabled={disabled || isWaiting}
      {...otherProps}
    >
      {children}
      {isWaiting && <CircularProgress size={16} className={classes.buttonProgress} />}
    </MuiButton>
  );
}

Button.defaultProps = {
  color: "default",
  component: "button",
  disabled: false,
  disableFocusRipple: false,
  disableRipple: false,
  fullWidth: false,
  href: null,
  size: "medium",
  variant: "text"
};

Button.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object,
  color: PropTypes.string,
  disabled: PropTypes.bool, // eslint-disable-line
  isWaiting: PropTypes.bool,
  onClick: PropTypes.func
};

export default withStyles(styles, { name: "RuiButton" })(Button);

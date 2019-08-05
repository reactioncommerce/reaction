import React from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Chip from "@material-ui/core/Chip";


const styles = (theme) => ({
  containedPrimary: {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.colors.red
  },
  outlinedPrimary: {
    color: theme.palette.colors.red,
    border: `1px solid ${theme.palette.colors.red}`
  }
});

/**
 * @name DangerChip
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function DangerChip({ classes, color, label, onClick, size, variant }) {
  return (
    <Chip
      classes={{
        containedPrimary: classes.containedPrimary,
        outlinedPrimary: classes.outlinedPrimary
      }}
      color={color}
      onClick={onClick}
      label={label}
      size={size}
      variant={variant}
    />
  );
}

DangerChip.propTypes = {
  buttonVariant: PropTypes.string,
  children: PropTypes.any,
  classes: PropTypes.object,
  color: PropTypes.string,
  label: PropTypes.string,
  onClick: PropTypes.func,
  size: PropTypes.string,
  variant: PropTypes.string
};


DangerChip.defaultProps = {
  color: "primary",
  variant: "outlined"
};

export default withStyles(styles, { name: "RuiDangerChip" })(DangerChip);

import React, { Component } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";


const styles = (theme) => ({
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

class DangerButton extends Component {
  static propTypes = {
    buttonVariant: PropTypes.string,
    children: PropTypes.any,
    classes: PropTypes.object,
    color: PropTypes.string,
    onClick: PropTypes.func,
    variant: PropTypes.string
  }

  static defaultProps = {
    color: "primary",
    variant: "outlined"
  }

  handleClick = () => {
    this.props.onClick();
  }


  render() {
    const { children, classes, color, variant } = this.props;

    return (
      <Button
        classes={{
          containedPrimary: classes.containedPrimary,
          outlinedPrimary: classes.outlinedPrimary
        }}
        color={color}
        onClick={this.handleClick}
        variant={variant}
      >
        {children}
      </Button>
    );
  }
}

export default withStyles(styles, { name: "RuiDangerButton" })(DangerButton);

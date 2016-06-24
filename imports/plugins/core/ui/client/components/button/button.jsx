import React from "react";
import classnames from "classnames";

class Button extends React.Component {

  renderOnStateIcon() {
    if (this.props.onIcon) {
      const iconClassName = `fa fa-${this.props.onIcon}`;
      return <i className={iconClassName}></i>;
    }
  }

  renderNormalStateIcon() {
    if (this.props.icon) {
      const iconClassName = `fa fa-${this.props.icon}`;
      return <i className={iconClassName}></i>;
    }
  }

  renderIcon() {
    if (this.props.toggle) {
      if (this.props.toggleOn) {
        return this.renderOnStateIcon();
      }
    }

    return this.renderNormalStateIcon();
  }

  render() {
    const classes = classnames({
      "btn": true,
      "btn-default": this.props.status === null || this.props.status === "default",
      "active": this.props.active,
      "btn-success": this.props.status === "success",
      "btn-danger": this.props.status === "danger",
      "btn-info": this.props.status === "info",
      "btn-warning": this.props.status === "warning"
    });

    const {
      title,
      ...props
    } = this.props;

    return (
      <button type="button" className={classes} {...props}>
        {this.renderIcon()}
        {title}
        {this.props.children}
      </button>
    );
  }
}

Button.defaultProps = {
  toggle: false,
  active: false
};

export default Button;

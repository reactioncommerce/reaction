import React, { Component, PropTypes} from "react";
import classnames from "classnames";
import Icon from "../icon/icon.jsx";
import { Tooltip, Translation } from "../";

class Button extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tooltipOpen: false
    };

    this.handleButtonMouseOver = this.handleButtonMouseOver.bind(this);
    this.handleButtonMouseOut = this.handleButtonMouseOut.bind(this);
  }

  get isTooltipOpen() {
    return this.state.tooltipOpen;
  }

  handleButtonMouseOver() {
    this.setState({
      tooltipOpen: this.props.tooltip ? true : false
    });
  }

  handleButtonMouseOut() {
    this.setState({
      tooltipOpen: false
    });
  }

  renderOnStateIcon() {
    if (this.props.onIcon) {
      return (
        <Icon icon={this.props.onIcon} />
      );
    }
    return null;
  }

  renderNormalStateIcon() {
    if (this.props.icon) {
      return (
        <Icon icon={this.props.icon} />
      );
    }
    return null;
  }

  renderIcon() {
    if (this.props.toggle) {
      if (this.props.toggleOn) {
        return this.renderOnStateIcon();
      }
    }

    return this.renderNormalStateIcon();
  }

  renderTooltipContent() {
    if (this.isTooltipOpen) {
      return (
        <div>
          {this.props.tooltip}
        </div>
      );
    }

    return null;
  }

  renderLabel() {
    if (this.props.label) {
      if (this.props.toggle) {
        if (this.props.toggleOn && this.props.toggleOnLabel) {
          return (
            <Translation
              defaultValue={this.props.toggleOnLabel}
              i18nKey={this.props.i18nKeyToggleOnLabel}
            />
          );
        }
      }

      return (
        <Translation
          defaultValue={this.props.label}
          i18nKey={this.props.i18nKeyLabel}
        />
      );
    }

    return null;
  }

  render() {
    const classes = classnames({
      "btn": true,
      "btn-default": this.props.status === null || this.props.status === undefined || this.props.status === "default",
      "active": this.props.active || this.props.toggleOn,
      "btn-success": this.props.status === "success",
      "btn-danger": this.props.status === "danger",
      "btn-info": this.props.status === "info",
      "btn-warning": this.props.status === "warning",
      "btn-link": this.props.status === "link",
      "btn-primary": this.props.primary === true || this.props.status === "primary"
    }, this.props.className);

    const {
      // Destructure these vars as they aren't valid as attributes on the HTML element button
      label, active, className, status, i18nKeyTitle, i18nKeyLabel, i18nKeyTooltip, // eslint-disable-line no-unused-vars
      tooltip, icon, toggle, onIcon, primary, toggleOn, eventAction, // eslint-disable-line no-unused-vars
      toggleOnLabel, i18nKeyToggleOnLabel, // eslint-disable-line no-unused-vars

      // Get the rest of the properties and put them in attrs
      // these will most likely be HTML attributes
      ...attrs
    } = this.props;

    const button = (
      <button
        className={classes}
        data-event-action={eventAction}
        onMouseOut={this.handleButtonMouseOut}
        onMouseOver={this.handleButtonMouseOver}
        type="button"
        {...attrs}
      >
        {this.renderIcon()}
        {this.renderLabel()}
        {this.props.children}
      </button>
    );


    if (tooltip) {
      return (
        <Tooltip tooltipContent={this.renderTooltipContent()}>
          {button}
        </Tooltip>
      );
    }

    return button;
  }
}

Button.propTypes = {
  active: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
  eventAction: PropTypes.string,
  i18nKeyLabel: PropTypes.string,
  i18nKeyTitle: PropTypes.string,
  i18nKeyToggleOnLabel: PropTypes.string,
  i18nKeyTooltip: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
  onIcon: PropTypes.string,
  primary: PropTypes.bool,
  status: PropTypes.string,
  title: PropTypes.string,
  toggle: PropTypes.bool,
  toggleOn: PropTypes.bool,
  toggleOnLabel: PropTypes.string,
  tooltip: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.node])
};

Button.defaultProps = {
  toggle: false,
  active: false
};

export default Button;

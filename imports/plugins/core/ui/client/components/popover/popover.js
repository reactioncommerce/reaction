import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import TetherComponent from "react-tether";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class Popover extends Component {
  state = {
    isOpen: false
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.isControlled) {
      this.setState({
        isOpen: nextProps.isOpen
      });
    }
  }

  get isOpen() {
    return this.props.isOpen || this.state.isOpen;
  }

  get isControlled() {
    return typeof this.props.isOpen === "boolean";
  }

  /**
   * attachment
   * @description Return the attachment for the tooltip or the default
   * @returns {String} attachment
   */
  get attachment() {
    return this.props.attachment || Components.Tooltip.defaultProps.attachment;
  }

  handleDisplayButtonClick = (event, value) => {
    if (this.props.onDisplayButtonClick) {
      this.props.onDisplayButtonClick(event, value);
    }
  }

  handleOpen = () => {
    if (this.isControlled) {
      if (this.props.onRequestOpen) {
        this.props.onRequestOpen(true);
      }
    } else {
      this.setState({
        isOpen: true
      });
    }
  }

  handleClickOutside = () => {
    if (this.isControlled) {
      if (this.props.onRequestOpen) {
        this.props.onRequestOpen(false);
      }
    } else {
      this.setState({
        isOpen: false
      });
    }
  }

  renderPopoverChildren() {
    if (this.isOpen) {
      return (
        <Components.PopoverContent
          children={this.props.children}
          onClickOutside={this.props.onClick}
        />
      );
    }
    return null;
  }

  renderButtons() {
    if (this.props.showDropdownButton) {
      return (
        <Components.ButtonGroup>
          {this.props.buttonElement}
          <Components.Button
            key="dropdown-button"
            icon="fa fa-chevron-down"
            onClick={this.props.onClick}
            status={this.props.buttonElement.props.status}
          />
        </Components.ButtonGroup>
      );
    } else if (this.props.buttonElement) {
      return React.cloneElement(this.props.buttonElement, {
        onClick: this.props.onClick
      });
    }

    return <div />;
  }

  render() {
    return (
      <TetherComponent
        style={{
          maxHeight: "100vh",
          overflowY: "auto",
          boxShadow: this.props.showShadow ? "0 0 4px 2px rgba(0, 0, 0, 0.16)" : "none"
        }}
        attachment={this.attachment}
        classPrefix="popover"
        className={classnames({
          "rui": true,
          "popover-element": true,
          "popover-open": true,
          "popover-theme-arrows": this.props.showArrow || false
        })}
        constraints={this.props.constraints || [{
          to: "scrollParent",
          attachment: "together",
          pin: true
        }]}
        targetAttachment={this.props.targetAttachment}
      >
        {this.renderButtons()}
        {this.renderPopoverChildren()}
      </TetherComponent>
    );
  }
}

Popover.propTypes = {
  attachment: PropTypes.string,
  buttonElement: PropTypes.node,
  children: PropTypes.node,
  constraints: PropTypes.array,
  isOpen: PropTypes.bool,
  onClick: PropTypes.func,
  onDisplayButtonClick: PropTypes.func,
  onRequestOpen: PropTypes.func,
  showArrow: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  showDropdownButton: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  showShadow: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  targetAttachment: PropTypes.string,
  tooltipContent: PropTypes.node
};

Popover.defaultProps = {
  attachment: "bottom left",
  showArrow: false,
  targetAttachment: "top left"
};

registerComponent("Popover", Popover);

export default Popover;

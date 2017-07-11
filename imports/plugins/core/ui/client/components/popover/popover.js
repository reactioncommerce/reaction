import React, { Component } from "react";
import PropTypes from "prop-types";
import { Tooltip } from "/imports/plugins/core/ui/client/components";
import classnames from "classnames";
import TetherComponent from "react-tether";
import PopoverContent from "./popoverContent";
import { Button, ButtonGroup } from "/imports/plugins/core/ui/client/components/";

class Popover extends Component {
  state = {
    isOpen: false
  }

  componentWillReceiveProps(nextProps) {
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
   * @return {String} attachment
   */
  get attachment() {
    return this.props.attachment || Tooltip.defaultProps.attachment;
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
      return  (
        <PopoverContent
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
        <ButtonGroup>
          {this.props.buttonElement}
          <Button
            key="dropdown-button"
            icon="fa fa-chevron-down"
            onClick={this.props.onClick}
            status={this.props.buttonElement.props.status}
          />
        </ButtonGroup>
      );
    }

    return React.cloneElement(this.props.buttonElement, {
      onClick: this.props.onClick
    });
  }

  render() {
    return (
      <TetherComponent
        attachment={this.attachment}
        classPrefix="popover"
        className={classnames({
          "rui": true,
          "popover-element": true,
          "popover-open": true,
          "popover-theme-arrows": this.props.showArrow || false
        })}
        constraints={[{
          to: "scrollParent",
          attachment: "together"
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
  isOpen: PropTypes.bool,
  onClick: PropTypes.func,
  onDisplayButtonClick: PropTypes.func,
  onRequestOpen: PropTypes.func,
  showArrow: PropTypes.bool,
  showDropdownButton: PropTypes.bool,
  targetAttachment: PropTypes.string,
  tooltipContent: PropTypes.node
};

Popover.defaultProps = {
  attachment: "bottom left",
  showArrow: false,
  targetAttachment: "top left"
};


export default Popover;

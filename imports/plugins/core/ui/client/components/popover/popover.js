import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import onclickOutside from "react-onclickoutside";
import TetherComponent from "react-tether";
import PopoverContent from "./popoverContent"
import { Button, ButtonGroup } from "/imports/plugins/core/ui/client/components/";

class Popover extends Component {
  state = {
    isOpen: false
  }
  //
  // componentDidMount() {
  //   document.addEventListener("click", this.handleClickOutside);
  // }
  //
  // componentWillUnmount() {
  //   document.removeEventListener("click", this.handleClickOutside);
  // }

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
      this.props.onDisplayButtonClick(event, value)
    }
  }

  handleOpen = () => {
    this.setState({
      isOpen: true
    });
  }

  handleClickOutside = () => {
    this.setState({
      isOpen: false
    });
  }

  renderPopoverChildren() {
    if (this.state.isOpen) {
      return  (
        <PopoverContent
          children={this.props.children}
          onClickOutside={this.handleClickOutside}
        />
      );
    }
    return null;
  }

  render() {
    let buttons;

    if (this.props.showDropdownButton) {
      buttons = [
        this.props.buttonElement,
        <Button
          icon="fa fa-chevron-down"
          onClick={this.handleOpen}
          status={this.props.buttonElement.props.status}
        />
      ];
    } else {
      buttons = [
        React.cloneElement(this.props.buttonElement, {
          onClick: this.handleOpen
        })
      ];
    }

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
        <ButtonGroup>
          {buttons}
        </ButtonGroup>
        {this.renderPopoverChildren()}
      </TetherComponent>
    );
  }
}

Popover.propTypes = {
  attachment: PropTypes.string,
  buttonElement: PropTypes.node,
  children: PropTypes.node,
  showArrow: PropTypes.boolen,
  tooltipContent: PropTypes.node
};

Popover.defaultProps = {
  attachment: "bottom left",
  targetAttachment: "top left"
};


export default Popover;

import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import onclickOutside from "react-onclickoutside";
import TetherComponent from "react-tether";
import PopoverContent from "./popoverContent"

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
    const button = React.cloneElement(this.props.buttonElement, {
      onClick: this.handleOpen
    });

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
        {button}
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

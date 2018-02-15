import React, { Component } from "react";
import PropTypes from "prop-types";
import onclickOutside from "react-onclickoutside";
import { registerComponent } from "@reactioncommerce/reaction-components";

class PopoverContent extends Component {
  handleClickOutside(event) {
    if (this.props.onClickOutside) {
      this.props.onClickOutside(event);
    }
  }

  render() {
    return (
      <div className="rui popover-content">
        {this.props.children}
      </div>
    );
  }
}

PopoverContent.propTypes = {
  children: PropTypes.node,
  onClickOutside: PropTypes.func
};

registerComponent("PopoverContent", onclickOutside(PopoverContent));

export default onclickOutside(PopoverContent);

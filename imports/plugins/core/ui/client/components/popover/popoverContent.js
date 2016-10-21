import React, { Component, PropTypes } from "react";
import classnames from "classnames";
import onclickOutside from "react-onclickoutside";

class PopoverContent extends Component {
  handleClickOutside(event) {
    if (this.props.onClickOutside) {
      this.props.onClickOutside(event);
    }
  }

  render() {
    return  (
      <div className="rui popover-content">
        {this.props.children}
      </div>
    );
  }
}

PopoverContent.propTypes = {
  onClickOutside: PropTypes.func
};

export default onclickOutside(PopoverContent);

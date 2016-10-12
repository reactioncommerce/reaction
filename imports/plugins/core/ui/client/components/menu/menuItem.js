import React, { Component, PropTypes } from "react";
import { Button } from "../button";

class MenuItem extends Component {

  handleClick = (event) => {
    console.log("lolol", this.props.value);
    event.preventDefault();
    if (this.props.onClick) {
      this.props.onClick(event, this.props.value);
    }
  }

  render() {
    return (
      <Button
        {...this.props}
        onClick={this.handleClick}
        className={{
          "btn": false,
          "btn-default": false
        }}
        tagName="a"
      />
    );
  }
}

MenuItem.propTypes = {
  attachment: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func,
  value: PropTypes.any
};

MenuItem.defaultProps = {
  attachment: "top"
};

export default MenuItem;

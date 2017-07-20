import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "/imports/plugins/core/ui/client/components";


class PaginationButtons extends Component {
  constructor(props) {
    super(props);
  }

  renderIcon() {
    const { children } = this.props;

    if (children === "Previous") {
      return "fa fa-angle-left";
    }

    if (children === "Next") {
      return "fa fa-angle-right";
    }

    return null;
  }


  renderIconPosition() {
    const { children } = this.props;

    if (children === "Previous") {
      return false;
    }

    if (children === "Next") {
      return true;
    }

    return false;
  }

  renderText() {
    const { children } = this.props;

    if (children === "Previous") {
      return " Previous";
    }

    if (children === "Next") {
      return "Next ";
    }

    return null;
  }

  render() {
    const { disabled, onClick } = this.props;

    return (
      <Button
        bezelStyle="flat"
        icon={this.renderIcon()}
        iconAfter={this.renderIconPosition()}
        label={this.renderText()}
        status="default"
        tagName="button"
        onClick={onClick}
        disabled={disabled}
        className="sortableTable-pagination"
      />
    );
  }
}

PaginationButtons.propTypes = {
  children: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func
};

export default PaginationButtons;

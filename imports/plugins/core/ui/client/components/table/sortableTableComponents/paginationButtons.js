import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "/imports/plugins/core/ui/client/components";
import { i18next } from "/client/api";


class PaginationButtons extends Component {
  renderIcon() {
    const { children } = this.props;

    if (children === "Previous") {
      const angleDirection = i18next.dir() === "rtl" ? "right" : "left";
      return `fa fa-angle-${angleDirection}`;
    }

    if (children === "Next") {
      const angleDirection = i18next.dir() === "rtl" ? "left" : "right";
      return `fa fa-angle-${angleDirection}`;
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

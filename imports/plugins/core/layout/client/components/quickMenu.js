import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button } from "/imports/plugins/core/ui/client/components";

class QuickMenu extends Component {
  static propTypes = {
    buttons: PropTypes.array
  }

  renderButtons() {
    if (Array.isArray(this.props.buttons)) {
      return this.props.buttons.map((buttonProps, index) => {
        if (buttonProps.type === "seperator") {
          return (
            <div className="rui separator padding xs" key={index}>
              <hr />
            </div>
          );
        }

        const { type, ...otherButtonProps } = buttonProps;

        return (
          <Button
            key={index}
            tagName={type === "link" ? "a" : "button"}
            {...otherButtonProps}
          />
        );
      });
    }
  }

  render() {
    return (
      <div className="rui toolbar toolbar-vertical admin-controls-menu">
        <nav className="rui toolbar-group admin-controls-quicklinks">
          {this.renderButtons()}
        </nav>
      </div>

    );
  }
}

export default QuickMenu;

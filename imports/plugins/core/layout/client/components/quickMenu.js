import React, { Component, PropTypes } from "react";
import Blaze from "meteor/gadicc:blaze-react-component";
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
            <div className="rui separator padding xs">
              <hr />
            </div>
          )
        } else {

          const {type, ...otherButtonProps} = buttonProps

          return (
            <Button
              tagName={ type === "link" ? "a" : "button" }
              {...otherButtonProps}
            />
          )
        }
      })
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

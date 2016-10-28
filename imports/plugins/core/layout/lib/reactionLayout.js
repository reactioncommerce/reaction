import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "react-komposer";
import { Reaction, Logger } from "/client/api";
import classnames from "classnames";

class ReactionLayout extends Component {

  get layout() {
    return this.props.layout;
  }

  checkElementPermissions(block) {
    let permissions;
    const hasAdminAccess = Reaction.hasAdminAccess();

    if ((!block.audience || !block.permissions) && hasAdminAccess) {
      Logger.warn({block: block}, "Permissions not set for element on screen");
      // console.warn("Permissions not set for element on screen", block);
    }

    if (hasAdminAccess === false) {
      permissions = block.audience || this.props.defaultAudience;
    } else {
      permissions = block.permissions || this.props.defaultPermissions;
    }

    return Reaction.hasPermission(permissions || []);
  }

  renderLayout(children) {
    if (!Array.isArray(children)) {
      return null;
    }

    const elements = children.map((block, index) => {
      let childElements;

      if (Array.isArray(block.children)) {
        childElements = block.children.map((child, childIndex) => {
          if (child.type === "block") {
            return this.renderLayout([child]);
          }

          if (this.checkElementPermissions(child)) {
            return React.createElement(child.component, {
              key: childIndex,
              ...(child.props || {})
            });
          }

          return null;
        });
      }

      if (this.checkElementPermissions(block)) {
        return React.createElement(block.element || "div", {
          key: index,
          className: classnames(`rui col-xs-${block.columns || 12}`, block.className),
          style: block.style
        },
          <div className="row">
            {childElements}
          </div>
        );
      }

      return null;
    });

    return elements;
  }

  render() {
    return (
      <div className="rui layout-base">
        {this.renderLayout(this.layout)}
      </div>
    );
  }
}

ReactionLayout.propTypes = {
  defaultAudience: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  defaultPermissions: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  layout: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
};

function composer(props, onData) {
  onData(null, {
    defaultPermissions: ["admin"],
    defaultAudience: ["guest", "anonymous"],
    layout: props.layout
  });
}

export default composeWithTracker(composer)(ReactionLayout);

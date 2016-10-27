import React, { Component, PropTypes } from "react";
import { Reaction } from "/client/api";
import classnames from "classnames";

class ReactionLayout extends Component {

  get layout() {
    return this.props.layout;
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

          return React.createElement(child.component, {
            key: childIndex,
            ...(child.props || {})
          });
        });
      }

      let permissions;
      const hasAdminAccess = Reaction.hasAdminAccess();

      if (block.audience && hasAdminAccess === false) {
        permissions = block.audience;
      } else {
        permissions = block.permissions;
      }

      if (Reaction.hasPermission(permissions || [])) {
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
  layout: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
};

export default ReactionLayout;

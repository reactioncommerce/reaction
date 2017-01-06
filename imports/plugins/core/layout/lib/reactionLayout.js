import React, { Component, PropTypes } from "react";
import Radium from "radium";
import { composeWithTracker } from "/lib/api/compose";
import { Reaction } from "/client/api";
import classnames from "classnames";
import { getComponent } from "/imports/plugins/core/layout/lib/components";
import { Templates } from "/lib/collections";
import { Loading } from "/imports/plugins/core/ui/client/components";

class ReactionLayout extends Component {

  get layout() {
    return this.props.layout;
  }

  checkElementPermissions(block) {
    let permissions;
    const hasAdminAccess = Reaction.hasAdminAccess();

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
            let component = child.component;

            if (typeof child.component === "string") {
              component = getComponent(child.component);
            }

            return React.createElement(component, {
              key: childIndex,
              ...(child.props || {}),
              ...this.props.layoutProps
            });
          }

          return null;
        });
      }


      if (this.checkElementPermissions(block)) {
        return React.createElement(block.element || "div", {
          key: index,
          // className: classnames(`rui col-xs-${block.columns || 12}`, block.className),
          className: classnames({
            rui: true,
            item: true,
            [block.size || "full"]: true,
            align: typeof block.align === "string",
            [block.align || "start"]: true,
            justify: typeof block.align === "string",
            [block.justify || "start"]: true,
            axis: true, // typeof block.axis === "string",
            horizontal: block.axis === "horizontal",
            vertical: block.axis !== "horizontal"
          }, block.className),
          style: block.style,
          children: childElements
        });
      }

      return null;
    });

    return elements;
  }

  render() {
    return (
        <div className="rui layout-base items flex">
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
  layout: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  layoutProps: PropTypes.object
};

function composer(props, onData) {
  const sub = Meteor.subscribe("Templates");

  if (sub.ready()) {
    const templateInfo = Templates.findOne({
      name: props.layoutName
    });

    if (templateInfo) {
      const templateData = templateInfo.template;

      onData(null, {
        defaultPermissions: ["admin"],
        defaultAudience: ["guest", "anonymous"],
        layout: templateData
      });
    }
  }
}

export default composeWithTracker(composer, Loading)(Radium(ReactionLayout));

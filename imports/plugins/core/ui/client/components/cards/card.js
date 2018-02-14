import React, { Children, Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { registerComponent } from "@reactioncommerce/reaction-components";

class Card extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: true
    };
  }

  get isControlled() {
    return typeof this.props.expanded === "boolean";
  }

  get isExpanded() {
    if (this.isControlled) {
      return this.props.expanded;
    }

    return this.state.expanded;
  }

  handleExpanderClick = (event) => {
    if (this.isControlled) {
      if (typeof this.props.onExpand === "function") {
        this.props.onExpand(event, this, this.props.name, !this.isExpanded);
      }
    } else {
      this.setState({
        expanded: !this.state.expanded
      }, () => {
        if (typeof this.props.onExpand === "function") {
          this.props.onExpand(event, this, this.props.name, this.isExpanded);
        }
      });
    }
  }

  render() {
    const { className } = this.props;
    const elements = Children.map(this.props.children, (child) => {
      const newProps = {};

      if (child.props.actAsExpander) {
        newProps.actAsExpander = true;
        newProps.onClick = this.handleExpanderClick;
      }

      if (child.props.expandable || child.props.actAsExpander) {
        newProps.expanded = this.isExpanded;
      }

      return React.cloneElement(child, newProps);
    });

    const baseClassName = classnames({
      "panel": true,
      "panel-default": true,
      "panel-active": this.isExpanded,
      "closed": this.isExpanded === false
    }, className);

    return (
      <div className={baseClassName} style={this.props.style}>
        {elements}
      </div>
    );
  }
}

Card.defaultProps = {
  expandable: false
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  expandable: PropTypes.bool,
  expanded: PropTypes.bool,
  name: PropTypes.string,
  onExpand: PropTypes.func,
  style: PropTypes.object
};

registerComponent("Card", Card);

export default Card;

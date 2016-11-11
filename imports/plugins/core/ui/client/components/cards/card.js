import React, { Children, Component, PropTypes } from "react";
import classnames from "classnames";

class Card extends Component {

  constructor(props) {
    super(props);

    this.state = {
      expanded: props.expanded
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      expanded: nextProps.expanded
    });
  }

  handleExpanderClick = () => {
    this.setState({
      expanded: !this.state.expanded
    });
  }

  render() {
    const elements = Children.map(this.props.children, (child) => {
      const newProps = {};

      if (child.props.actAsExpander) {
        newProps.actAsExpander = true;
        newProps.onClick = this.handleExpanderClick;
      }

      if (child.props.expandable) {
        newProps.expanded = this.state.expanded;
      }

      return React.cloneElement(child, newProps);
    });

    const baseClassName = classnames({
      "panel": true,
      "panel-default": !this.state.expanded,
      "panel-active": this.state.expanded
    });

    return (
      <div className={baseClassName}>
        {elements}
      </div>
    );
  }
}

Card.defaultProps = {
  expandable: false,
  expanded: true
};

Card.propTypes = {
  children: PropTypes.node,
  expandable: PropTypes.bool,
  expanded: PropTypes.bool
};

export default Card;

import React, { Children, Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames/dedupe";
import { registerComponent } from "@reactioncommerce/reaction-components";

class TabList extends Component {
  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    selectedTab: PropTypes.oneOfType([PropTypes.any])
  }

  render() {
    const { className, selectedTab, ...otherProps } = this.props;

    const baseClassName = classnames({
      "rui": true,
      "tab-list": true,
      "nav": true,
      "nav-pills": true
    }, className);

    const elements = Children.map(this.props.children, (child, index) => {
      const newProps = {
        index,
        active: false
      };

      if (selectedTab === child.props.value || selectedTab === index) {
        newProps.active = true;
      }

      return React.cloneElement(child, newProps);
    });

    return (
      <ul {...otherProps} className={baseClassName} role="tablist">
        {elements}
      </ul>
    );
  }
}

registerComponent("TabList", TabList);

export default TabList;

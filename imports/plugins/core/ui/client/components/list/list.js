import React, { Component, PropTypes } from "react";
import classnames from "classnames";

class List extends Component {
  static propTypes = {
    children: PropTypes.node,
    isAdmin: PropTypes.bool
  }

  render() {
    const listClassName = classnames({
      "rui": true,
      "admin": this.props.isAdmin,
      "list-group": true
    });

    return (
      <div className={listClassName}>
        {this.props.children}
      </div>
    );
  }
}

export default List;

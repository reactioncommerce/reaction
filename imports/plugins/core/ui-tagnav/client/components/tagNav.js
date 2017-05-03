import React, { Component, PropTypes } from "react";

class TagNav extends Component {
  static propTypes = {
    tags: PropTypes.arrayOf(PropTypes.object)
  };

  render() {
    return (
      <div>
        <h3>Test</h3>
      </div>
    );
  }
}

export default TagNav;

import React, { Component, PropTypes } from "react";

class TagTree extends Component {
  static propTypes = {
    showId: PropTypes.bool
  }

  render() {
    return (
      <div class="rui tagtree">
        <div class="header">
          <span class="title">{{parentTag.name}}</span>
          <a href="#">View All <i class="fa fa-angle-right"></i></a>
        </div>
        <div class="content">
        </div>
      </div>
    );
  }
}

export default TagTree;

import React, { Component } from "react";
import { composeWithTracker } from "/lib/api/compose";

class GridItemControlsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>Hey</div>
    );
  }
}

function composer(props, onData) {
  onData(null, {});
}

export default composeWithTracker(composer)(GridItemControlsContainer);

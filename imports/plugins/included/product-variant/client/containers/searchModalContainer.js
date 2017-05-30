import React, { Component } from "react";
import { composeWithTracker } from "/lib/api/compose";
import SearchModal from "../components/searchModal";

class SearchModalContainer extends Component {
  render() {
    return (
      <div>
        <SearchModal />
      </div>
    );
  }
}

function composer(props, onData) {
  onData(null, {
  });
}

export default composeWithTracker(composer)(SearchModalContainer);

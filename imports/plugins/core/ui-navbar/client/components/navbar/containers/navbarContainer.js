import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { Reaction } from "/client/api";
import NavBar from "../components/navbar";

class NavBarContainer extends Component {
  constructor(props) {
    super(props);

    this.isSearchEnabled = this.isSearchEnabled.bind(this);
  }

  isSearchEnabled = () => {
    return this.props.searchEnabled;
  }

  render() {
    return (
      <div>
        <NavBar
          {...this.props}
          isSearchEnabled={this.isSearchEnabled}
        />
      </div>
    );
  }
}

function composer(props, onData) {
  const searchPackage = Reaction.Apps({ provides: "ui-search" });
  let searchEnabled;
  let searchTemplate;
  if (searchPackage.length) {
    searchEnabled = true;
    searchTemplate = searchPackage[0].template;
  } else {
    searchEnabled = false;
  }

  const searchIcon = "fa fa-search";
  const searchKind =  "flat";

  onData(null, {
    icon: searchIcon,
    kind: searchKind,
    searchEnabled,
    searchTemplate
  });
}

NavBarContainer.propTypes = {
  searchEnabled: PropTypes.bool
};

export default composeWithTracker(composer)(NavBarContainer);

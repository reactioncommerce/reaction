import React, { Component } from "react";
import { composeWithTracker } from "/lib/api/compose";
import { Reaction } from "/client/api";
import NavBar from "../components/navbar";

class NavBarContainer extends Component {
  render() {
    return (
      <div>
        <NavBar
          {...this.props}
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

  const hasProperPermission = Reaction.hasPermission("account/profile");

  onData(null, {
    icon: searchIcon,
    kind: searchKind,
    searchEnabled,
    searchTemplate,
    hasProperPermission
  });
}

export default composeWithTracker(composer)(NavBarContainer);

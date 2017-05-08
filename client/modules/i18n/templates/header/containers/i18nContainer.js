import React, { Component } from "react";
import { composeWithTracker } from "/lib/api/compose";
import Language from "../components/i18n";

class LanguageDropdownContainer extends Component {
  render() {
    return (
      <div>
        <Language />
      </div>
    );
  }
}

const composer = (props, onData) => {

  onData(null, {
  });
};

export default composeWithTracker(composer, null)(LanguageDropdownContainer);



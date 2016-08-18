import React, { Component, PropTypes, Children } from "react"; // eslint-disable-line
import { composeWithTracker } from "react-komposer";
import { i18next, i18nextDep } from "/client/api";

class TranslationProvider extends Component {
  getChildContext() {
    const { translations } = this.props;
    return { translations };
  }
  render() {
    // `Children.only` enables us not to add a <div /> for nothing
    return Children.only(this.props.children);
  }
}

TranslationProvider.childContextTypes = {
  translations: PropTypes.object.isRequired
};

TranslationProvider.propTypes = {
  children: PropTypes.node,
  translations: PropTypes.object.isRequired
};

function composer(props, onData) {
  i18nextDep.depend();

  onData(null, {
    translations: {
      language: Session.get("language")
    }
  });
}


export default composeWithTracker(composer)(TranslationProvider);

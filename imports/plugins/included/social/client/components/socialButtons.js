import React, { Component } from "react";
import PropTypes from "prop-types";
import { Facebook, Twitter, GooglePlus, Pinterest } from "./";

export function getProviderComponentByName(providerName) {
  switch (providerName) {
    case "facebook":
      return Facebook;
    case "twitter":
      return Twitter;
    case "googleplus":
      return GooglePlus;
    case "pinterest":
      return Pinterest;
    default:
      return null;
  }
}


class SocialButtons extends Component {
  buttonSettngs(provider) {
    return this.props.settings.apps[provider];
  }

  renderEditButton() {
    if (this.props.editButton) {
      return (
        <span className="social-buttons-controls">
          {this.props.editButton}
        </span>
      );
    }

    return null;
  }

  renderButtons() {
    if (this.props.providers) {
      return this.props.providers.map((provider) => {
        const buttonComponent = getProviderComponentByName(provider);

        if (buttonComponent) {
          const component = React.createElement(
            getProviderComponentByName(provider),
            {
              key: provider,
              title: this.props.title,
              description: this.props.description,
              url: this.props.url,
              settings: this.buttonSettngs(provider)
            }
          );

          return component;
        }
        return null;
      });
    }
    return null;
  }

  render() {
    return (
      <div className="rui social-buttons">
        {this.renderButtons()}
        {this.renderEditButton()}
      </div>
    );
  }
}

SocialButtons.propTypes = {
  description: PropTypes.string,
  editButton: PropTypes.node,
  providers: PropTypes.arrayOf(PropTypes.string),
  settings: PropTypes.shape({
    apps: PropTypes.object
  }),
  title: PropTypes.string,
  url: PropTypes.string
};

export default SocialButtons;

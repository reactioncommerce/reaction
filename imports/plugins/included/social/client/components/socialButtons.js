import React, { Component, PropTypes } from "react";
import ReactDOM from "react-dom";
import { Facebook, Twitter, GooglePlus } from "./";

export function getProviderComponentByName(providerName) {
  console.log("providername", providerName);
  switch (providerName) {
    case "facebook":
      return Facebook;
    case "twitter":
      return Twitter;
    case "googleplus":
      return GooglePlus;
    default:
      return null
  }
}


class SocialButtons extends Component {

  buttonSettngs(provider) {
    return this.props.settings.apps[provider]
  }

  renderButtons() {
    if (this.props.providers) {
      return this.props.providers.map((provider, index) => {
        console.log("--button", this.buttonSettngs(provider));

        const buttonComponent = getProviderComponentByName(provider);

        if (buttonComponent) {
          const component = React.createElement(
            getProviderComponentByName(provider),
            {
              key: provider,
              title: this.props.title,
              description: this.props.description,
              url: this.props.url,
              meta: this.props.meta,
              settings: this.buttonSettngs(provider)
            }
          );

          return component;
        }
      });
    }
  }

  render() {
    console.log(this.props);
    return (
      <div>
        {this.renderButtons()}
      </div>
    );
  }
}

export default SocialButtons

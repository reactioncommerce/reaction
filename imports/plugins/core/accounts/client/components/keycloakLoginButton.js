import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class KeycloakLoginButton extends Component {
  static propTypes = {
    keycloakClientID: PropTypes.string,
    keycloakRealm: PropTypes.string,
    keycloakServerUrl: PropTypes.string
  }

  handleKeycloakLogin = () => {
    window.keycloak.login({ redirectUri: window.location.href });
  };

  render() {
    return (
      <div>
        <Components.Button
          className="btn-block"
          primary={true}
          bezelStyle="solid"
          i18nKeyLabel=""
          label="Sign in with Keycloak"
          onClick={this.handleKeycloakLogin}
        />
      </div>
    );
  }
}

registerComponent("KeycloakLoginButton", KeycloakLoginButton);

export default KeycloakLoginButton;

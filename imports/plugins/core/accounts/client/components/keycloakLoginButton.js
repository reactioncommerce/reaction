import React, { Component } from "react";
import PropTypes from "prop-types";
import Keycloak from "keycloak-js";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class KeycloakLoginButton extends Component {
  static propTypes = {
    keycloakClientID: PropTypes.string,
    keycloakRealm: PropTypes.string,
    keycloakRedirectUri: PropTypes.string,
    keycloakServerUrl: PropTypes.string
  }

  handleKeycloakLogin = () => {
    const keycloak = new Keycloak({
      realm: this.props.keycloakRealm,
      clientId: this.props.keycloakClientID,
      url: this.props.keycloakServerUrl
    });

    keycloak
      .init({ flow: "implicit" })
      .success(() => {
        keycloak.login({ redirectUri: this.props.keycloakRedirectUri });
      })
      .error(() => {});
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

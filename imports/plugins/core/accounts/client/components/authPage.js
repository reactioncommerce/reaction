import React, { Component } from "react";
import { Router } from "/client/modules/router";
import Keycloak from "keycloak-js";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

export function getUrlParams(urlhash = "") {
  return urlhash
    .substring(1)
    .split("&")
    .map((el) => el.split("="))
    .reduce((pre, cur) => {
      pre[cur[0]] = cur[1]; // eslint-disable-line prefer-destructuring
      return pre;
    }, {});
}

class AuthPage extends Component {
  constructor(props) {
    super(props);
  }


  render() {
    const authParams = getUrlParams(Router.current().payload.hash);
    console.log(authParams);
    return (
      <div className="container">
        <h3>Access Token</h3>
        <p style={{ wordBreak: "break-all" }}>
          {authParams.access_token}
        </p>

        <h3>ID Token</h3>
        <p style={{ wordBreak: "break-all" }}>
          {authParams.id_token}
        </p>
      </div>
    );
  }
}

registerComponent("AuthPage", AuthPage);

export default AuthPage;

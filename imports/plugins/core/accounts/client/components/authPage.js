import React from "react";
import { Router } from "/client/modules/router";
import { registerComponent } from "@reactioncommerce/reaction-components";

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

const AuthPage = () => {
  const authParams = getUrlParams(Router.current().payload.hash);

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
};

registerComponent("AuthPage", AuthPage);

export default AuthPage;

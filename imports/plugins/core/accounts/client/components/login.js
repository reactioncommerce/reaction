import React, { Component } from "react";
import PropTypes from "prop-types";
import Random from "@reactioncommerce/random";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";
import { Router } from "/client/api";

import { StyledAuth, StyledAuthLink } from "./styles.js";

class Login extends Component {
  static propTypes = {
    credentials: PropTypes.object,
    loginFormCurrentView: PropTypes.string,
    uniqueId: PropTypes.string
  }

  static defaultProps = {
    credentials: {},
    loginFormCurrentView: "loginFormSignInView",
    get uniqueId() { return Random.id(); }
  }

  constructor(props) {
    super(props);

    const currentRoute = Router.current().route;
    const isPasswordReset = ["reset-password", "account/enroll"].includes(currentRoute.name);

    this.state = {
      currentView: isPasswordReset ? "loginFormUpdatePasswordView" : props.loginFormCurrentView
    };

    this.showForgotPasswordView = this.showForgotPasswordView.bind(this);
    this.showSignUpView = this.showSignUpView.bind(this);
    this.showSignInView = this.showSignInView.bind(this);
  }

  showForgotPasswordView(event) {
    event.preventDefault();

    this.setState({
      currentView: "loginFormResetPasswordView"
    });
  }

  showSignUpView(event) {
    event.preventDefault();

    this.setState({
      currentView: "loginFormSignUpView"
    });
  }

  showSignInView(event) {
    event.preventDefault();

    this.setState({
      currentView: "loginFormSignInView"
    });
  }

  render() {
    const currentRoute = Router.current().route;
    const isOauthFlow = currentRoute.options && currentRoute.options.meta && currentRoute.options.meta.oauthLoginFlow;
    const idpFormClass = isOauthFlow ? "idp-form" : "";
    const { currentView } = this.state;
    const isLogin = window.location.search.includes("signin");
    const isSignup = window.location.search.includes("signup");
    const windowUrl = window.location.href;
    const signupUrl = windowUrl.replace('signin', "signup");
    const signinUrl = windowUrl.replace('signup', "signin");

    if (currentView === "loginFormSignInView" || currentView === "loginFormSignUpView" || currentView === "loginFormUpdatePasswordView") {
      if (isOauthFlow) {
        return (
          <StyledAuth>
            <Components.OAuthFormContainer
              credentials={this.props.credentials}
              uniqueId={this.props.uniqueId}
              onForgotPasswordClick={this.showForgotPasswordView}
            />
            {isLogin && <StyledAuthLink>
              <p>Don't have an account?</p>
              <a className="auth-option" href={signupUrl}>Sign Up</a>
            </StyledAuthLink>}

            {isSignup && <StyledAuthLink>
              <p>Already have an account?</p>
              <a className="auth-option" href={signinUrl}>Login</a>
            </StyledAuthLink>}
          </StyledAuth>
        );
      }
      return (
        <StyledAuth>
          <Components.AuthContainer
            credentials={this.props.credentials}
            uniqueId={this.props.uniqueId}
            currentView={currentView}
            onForgotPasswordClick={this.showForgotPasswordView}
            onSignUpClick={this.showSignUpView}
            onSignInClick={this.showSignInView}
          />
        </StyledAuth>
      );
    } else if (currentView === "loginFormResetPasswordView") {
      return (
        <StyledAuth>
          <div className={idpFormClass}>
            <Components.ForgotPassword
              credentials={this.props.credentials}
              uniqueId={this.props.uniqueId}
              currentView={currentView}
              onSignInClick={this.showSignInView}
            />
          </div>
        </StyledAuth>
      );
    }

    return null;
  }
}

registerComponent("Login", Login);

export default Login;

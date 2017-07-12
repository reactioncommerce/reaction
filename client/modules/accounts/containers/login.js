import React, { Component } from "react";
import PropTypes from "prop-types";
import { registerComponent } from "@reactioncommerce/reaction-components";
import { Random } from "meteor/random";
import AuthContainer from "./auth";
import ForgotPassword from "./forgotPassword";

class LoginContainer extends Component {
  static propTypes = {
    credentials: PropTypes.object,
    loginFormCurrentView: PropTypes.string,
    uniqueId: PropTypes.string
  }

  static defaultProps = {
    credentials: {},
    loginFormCurrentView: "loginFormSignInView",
    uniqueId: Random.id()
  }

  constructor(props) {
    super(props);

    this.state = {
      currentView: props.loginFormCurrentView
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
    if (this.state.currentView === "loginFormSignInView" || this.state.currentView === "loginFormSignUpView") {
      return (
        <AuthContainer
          credentials={this.props.credentials}
          uniqueId={this.props.uniqueId}
          currentView={this.state.currentView}
          onForgotPasswordClick={this.showForgotPasswordView}
          onSignUpClick={this.showSignUpView}
          onSignInClick={this.showSignInView}
        />
      );
    } else if (this.state.currentView === "loginFormResetPasswordView") {
      return (
        <ForgotPassword
          credentials={this.props.credentials}
          uniqueId={this.props.uniqueId}
          currentView={this.state.currentView}
          onSignInClick={this.showSignInView}
        />
      );
    }
  }
}

registerComponent("Login", LoginContainer);

export default LoginContainer;

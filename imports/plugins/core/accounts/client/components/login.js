import React, { Component } from "react";
import PropTypes from "prop-types";
import Random from "@reactioncommerce/random";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

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
        <Components.AuthContainer
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
        <Components.ForgotPassword
          credentials={this.props.credentials}
          uniqueId={this.props.uniqueId}
          currentView={this.state.currentView}
          onSignInClick={this.showSignInView}
        />
      );
    }
  }
}

registerComponent("Login", Login);

export default Login;

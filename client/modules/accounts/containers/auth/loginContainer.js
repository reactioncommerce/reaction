import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import AuthContainer from "./authContainer";
import { ForgotContainer } from "../passwordReset";

class LoginContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentView: props.loginFormCurrentView
    };

    this.showForgotPasswordView = this.showForgotPasswordView.bind(this);
    this.showSignUpView = this.showSignUpView.bind(this);
    this.showSignInView = this.showSignInView.bind(this);
  }

  showForgotPasswordView(e) {
    e.preventDefault();

    this.setState({
      currentView: "loginFormResetPasswordView"
    });
  }

  showSignUpView(e) {
    e.preventDefault();

    this.setState({
      currentView: "loginFormSignUpView"
    });
  }

  showSignInView(e) {
    e.preventDefault();

    this.setState({
      currentView: "loginFormSignInView"
    });
  }

  render() {
    if (this.state.currentView === "loginFormSignInView" || this.state.currentView === "loginFormSignUpView") {
      return (
        <AuthContainer
          {...this.props}
          currentView={this.state.currentView}
          onForgotPasswordClick={this.showForgotPasswordView}
          onSignUpClick={this.showSignUpView}
          onSignInClick={this.showSignInView}
        />
      );
    } else if (this.state.currentView === "loginFormResetPasswordView") {
      return (
        <ForgotContainer
          {...this.props}
          currentView={this.state.currentView}
          onSignInClick={this.showSignInView}
        />
      );
    }
  }

}

function composer(props, onData) {
  let startView = "loginFormSignInView";

  if (props) {
    if (props.startView) {
      startView = props.startView;
    }
  }
  uniqueId = Random.id();
  credentials = {};

  onData(null, {
    loginFormCurrentView: startView,
    uniqueId,
    credentials
  });
}

LoginContainer.propTypes = {
  loginFormCurrentView: PropTypes.string
};

export default composeWithTracker(composer)(LoginContainer);

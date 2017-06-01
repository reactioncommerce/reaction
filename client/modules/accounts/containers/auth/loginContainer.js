import React, { Component, PropTypes } from "react";
import { composeWithTracker } from "/lib/api/compose";
import AuthContainer from "./authContainer";
import { ForgotContainer } from "../passwordReset";

class LoginContainer extends Component {
  static propTypes = {
    credentials: PropTypes.object,
    loginFormCurrentView: PropTypes.string,
    uniqueId: PropTypes.string
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
        <ForgotContainer
          credentials={this.props.credentials}
          uniqueId={this.props.uniqueId}
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
  const uniqueId = Random.id();
  const credentials = {};

  onData(null, {
    loginFormCurrentView: startView,
    uniqueId,
    credentials
  });
}

export default composeWithTracker(composer)(LoginContainer);

import React, { Component, PropTypes } from "react";

class LoginButtons extends Component {

  constructor(props) {
    super(props);
  }

  renderLoginButtons() {
    const enabledServices = this.props.loginServices().filter((service) =>{
      return service.enabled;
    });

    return (
      <div>
        {this.props.loginServices &&
          enabledServices.map((service) => (
            <button
              key={service._id}
              className={`btn btn-primary btn-block provider-${service.name}`}
              type="button"
              data-event-action="signInWithProvider"
              data-provider={`${service.name}`}
            >
              <i className={`fa fa-${service.name}`} />

              {this.props.currentView === "loginFormSignInView" &&
                <span data-i18n="accountsUI.signInWith">Sign in with</span>}
              {this.props.currentView === "loginFormSignUpView" &&
                <span data-i18n="accountsUI.signUpWith">Sign up with</span>}

              &nbsp;<span data-i18n={`social.${service.name}`}>{service.name}</span>
            </button>
          ))
        }
      </div>
    );
  }

  renderSeparator() {
    if (this.props.onSeparator()) {
      return (
        <div className="loginForm-seperator">
          <span />
          <span className="text" data-i18n="accountsUI.or">or</span>
          <span />
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        {this.renderLoginButtons()}
        {this.renderSeparator()}
      </div>
    );
  }
}

LoginButtons.propTypes = {
  currentView: PropTypes.string,
  loginServices: PropTypes.func,
  onSeparator: PropTypes.func
};

export default LoginButtons;

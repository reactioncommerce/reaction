import React, { Component, PropTypes } from "react";
import {
  Button
} from "/imports/plugins/core/ui/client/components";

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
            <Button
              key={service._id}
              className={`btn-block provider-${service.name}`}
              primary={true}
              bezelStyle="solid"
              type="button"
              data-provider={`${service.name}`}
              onClick={() => this.props.onSocialClick(service.name)}
            >
              <i className={`fa fa-${service.name}`} />

              {this.props.currentView === "loginFormSignInView" &&
                <span data-i18n="accountsUI.signInWith">Sign in with</span>}
              {this.props.currentView === "loginFormSignUpView" &&
                <span data-i18n="accountsUI.signUpWith">Sign up with</span>}

              &nbsp;<span data-i18n={`social.${service.name}`}>{this.props.capitalizeName(service.name)}</span>
          </Button>
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
  capitalizeName: PropTypes.func,
  currentView: PropTypes.string,
  loginServices: PropTypes.func,
  onSeparator: PropTypes.func,
  onSocialClick: PropTypes.func
};

export default LoginButtons;

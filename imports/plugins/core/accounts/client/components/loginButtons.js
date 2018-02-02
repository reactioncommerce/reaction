import React, { Component } from "react";
import PropTypes from "prop-types";
import { Components, registerComponent } from "@reactioncommerce/reaction-components";

class LoginButtons extends Component {
  static propTypes = {
    capitalizeName: PropTypes.func,
    currentView: PropTypes.string,
    loginServices: PropTypes.func,
    onSeparator: PropTypes.func,
    onSocialClick: PropTypes.func
  }

  renderLoginButtons() {
    const enabledServices = this.props.loginServices().filter((service) => service.enabled);

    return (
      <div>
        {this.props.loginServices &&
          enabledServices.map((service) => (
            <Components.Button
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
                <span>
                  &nbsp;
                  <Components.Translation defaultValue="Sign in with" i18nKey="accountsUI.signInWith" />
                </span>
              }
              {this.props.currentView === "loginFormSignUpView" &&
                <span>
                  <Components.Translation defaultValue="Sign up with" i18nKey="accountsUI.signUpWith" />
                </span>
              }

              <span>
                &nbsp;
                <Components.Translation defaultValue={this.props.capitalizeName(service.name)} i18nKey={`social.${service.name}`} />
              </span>
            </Components.Button>
          ))
        }
      </div>
    );
  }

  renderSeparator() {
    if (this.props.onSeparator()) {
      return (
        <div className="loginForm-seperator">
          <Components.Divider id="auth-divider" label="or" i18nKeyLabel="accountsUI.or" />
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

registerComponent("LoginButtons", LoginButtons);

export default LoginButtons;

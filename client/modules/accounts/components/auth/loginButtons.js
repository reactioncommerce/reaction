import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Divider, Translation } from "/imports/plugins/core/ui/client/components";

class LoginButtons extends Component {
  static propTypes = {
    capitalizeName: PropTypes.func,
    currentView: PropTypes.string,
    loginServices: PropTypes.func,
    onSeparator: PropTypes.func,
    onSocialClick: PropTypes.func
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
                <span>
                  &nbsp;
                  <Translation defaultValue="Sign in with"  i18nKey="accountsUI.signInWith" />
                </span>
              }
              {this.props.currentView === "loginFormSignUpView" &&
                <span>
                  <Translation defaultValue="Sign up with" i18nKey="accountsUI.signUpWith" />
                </span>
              }

              <span>
                &nbsp;
                <Translation defaultValue={this.props.capitalizeName(service.name)} i18nKey={`social.${service.name}`} />
              </span>
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
          <Divider id="auth-divider" label="or" i18nKeyLabel="accountsUI.or" />
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

export default LoginButtons;

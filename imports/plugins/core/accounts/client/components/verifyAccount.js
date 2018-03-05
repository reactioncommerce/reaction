import React from "react";
import PropType from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import classnames from "classnames";

class VerifyAccount extends React.Component {
  static propTypes = {
    error: PropType.object
  }

  render() {
    const classNames = classnames({
      "fa": true,
      "fa-times-circle-o": !!this.props.error,
      "fa-check-circle-o": !this.props.error
    });

    return (
      <div className="container-fluid-sm verify-account">
        <div className="rui empty-view-message">
          <i className={classNames}/>
          <p className="message">
            {this.props.error ?
              <Components.Translation
                defaultValue={this.props.error.reason}
                i18nKey={this.props.error.i18nKey}
              /> :
              <Components.Translation
                defaultValue="Email verified"
                i18nKey="accountsUI.info.emailVerified"
              />
            }
          </p>
        </div>
      </div>
    );
  }
}

export default VerifyAccount;

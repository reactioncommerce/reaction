import React, { Component, PropTypes } from "react";

class LoginFormMessages extends Component {
  constructor(props) {
    super(props);
  }

  renderFormMessages() {
    if (this.props.loginFormMessages) {
      if (this.props.formMessages.info) {
        return (
          <div className="alert alert-info">
            <p>
              {this.props.loginFormMessages()}
            </p>
          </div>
        );
      } else if (this.props.formMessages.alerts) {
        return (
          <div className="alert alert-danger">
            <p>
              {this.props.loginFormMessages()}
            </p>
          </div>
        );
      }
    }
  }

  render() {
    return (
      <div>
        {this.renderFormMessages()}
      </div>
    );
  }
}

LoginFormMessages.propTypes = {
  formMessages: PropTypes.object,
  loginFormMessages: PropTypes.func
};

export default LoginFormMessages;

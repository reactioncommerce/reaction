import React from "react";
import PropTypes from "prop-types";

const LoginFormMessages = (props) => {
  if (props.loginFormMessages) {
    if (props.formMessages.info) {
      return (
        <div className="alert alert-info">
          <p>
            {props.loginFormMessages()}
          </p>
        </div>
      );
    } else if (props.formMessages.alerts) {
      return (
        <div className="alert alert-danger">
          <p>
            {props.loginFormMessages()}
          </p>
        </div>
      );
    }
  }
  return null;
};

LoginFormMessages.propTypes = {
  formMessages: PropTypes.object,
  loginFormMessages: PropTypes.func
};

export default LoginFormMessages;

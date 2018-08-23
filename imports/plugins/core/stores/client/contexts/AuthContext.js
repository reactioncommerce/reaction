import React, { Component } from "react";
import PropTypes from "prop-types";

const AuthContext = React.createContext();

export class AuthProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ctxViewerId: ""
    };
  }

  setViewerId = (ctxViewerId) => {
    this.setState({ ctxViewerId });
  };

  render() {
    return (
      <AuthContext.Provider
        value={{
          ...this.state,
          ctxSetViewerId: this.setViewerId
        }}
      >
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const AuthConsumer = AuthContext.Consumer;

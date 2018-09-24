import React, { Component } from "react";
import { AuthConsumer } from "../contexts/AuthContext";

export default (Comp) => {
  class AuthConsumerWrapper extends Component {
    render() {
      return <AuthConsumer>{(values) => <Comp {...this.props} {...values} />}</AuthConsumer>;
    }
  }
  return AuthConsumerWrapper;
};

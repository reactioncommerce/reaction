import React, { Component } from "react";
import { Mutation } from "react-apollo";
import createCartMutation from "../mutations/createCart";

export default (Comp) => (
  class CreateCart extends Component {
    render() {
      return (
        <Mutation mutation={createCartMutation} onError={() => undefined}>
          {(createCart) => (
            <Comp
              {...this.props}
              createCart={createCart}
            />
          )}
        </Mutation>
      );
    }
  }
);

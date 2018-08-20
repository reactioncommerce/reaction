import React, { Component } from "react";
import { Mutation } from "react-apollo";
import createCartMutation from "../mutations/createCart";

export default (Comp) => (
  class CreateCart extends Component {
    render() {
      return (
        <Mutation mutation={createCartMutation} onError={() => undefined}>
          {(createCart, { data, loading }) => (
            <Comp
              {...this.props}
              createCartData={data}
              isLoadingCreateCart={loading}
              createCart={createCart}
            />
          )}
        </Mutation>
      );
    }
  }
);

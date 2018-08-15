import React, { Component } from "react";
import { Mutation } from "react-apollo";
import addCartItemsMutation from "../mutations/addCartItems";

export default (Comp) => (
  class AddCartItems extends Component {
    render() {
      return (
        <Mutation mutation={addCartItemsMutation} onError={() => undefined}>
          {(addCartItems) => (
            <Comp
              {...this.props}
              addCartItems={addCartItems}
            />
          )}
        </Mutation>
      );
    }
  }
);

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import createCartMutation from "../mutations/createCart";

export default (Comp) => (
  class CreateCart extends Component {
    static propTypes = {
      refetchCartData: PropTypes.func
    }

    constructor(props) {
      super(props);
      this.handleRefetchCartData = this.handleRefetchCartData.bind(this);
    }

    // This is a workaround for realoading cart data into the components
    // Cart data will have to be tracked in global state in the future
    handleRefetchCartData() {
      this.props.refetchCartData();
    }

    render() {
      return (
        <Mutation mutation={createCartMutation} onError={() => undefined} onCompleted={this.handleRefetchCartData}>
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

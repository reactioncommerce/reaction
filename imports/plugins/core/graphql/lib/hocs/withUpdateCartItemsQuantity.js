import React, { Component } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import updateCartItemsQuantityMutation from "../mutations/updateCartItemsQuantity";

export default (Comp) => (
  class UpdateCartItemsQuantity extends Component {
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
        <Mutation mutation={updateCartItemsQuantityMutation} onError={() => undefined} onCompleted={this.handleRefetchCartData}>
          {(updateCartItemsQuantity, { error, data, loading }) => {
            if (error) {
              Logger.error(error);
              throw new ReactionError("query-error");
            }
            return <Comp
              {...this.props}
              updateCartItemsQuantityData={data}
              isLoadingUpdateCartItemsQuantity={loading}
              updateCartItemsQuantity={updateCartItemsQuantity}
            />;
          }}
        </Mutation>
      );
    }
  }
);

import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import withOpaqueShopId from "/imports/plugins/core/graphql/lib/hocs/withOpaqueShopId";
import OrderCard from "../components/orderCard";
import orderByReferenceId from "../graphql/queries/orderByReferenceId";


class OrderCardContainer extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        _id: PropTypes.string
      })
    }),
    shopId: PropTypes.string
  }

  render() {
    const { match: { params: { _id } }, shopId } = this.props;
    const variables = {
      id: _id,
      language: "en", // TODO: EK - get language from Shop
      shopId,
      token: null
    };

    return (
      <Query errorPolicy="all" query={orderByReferenceId} variables={variables}>
        {({ loading: isLoading, data: orderData }) => {
          if (isLoading) return null;
          const { order } = orderData || {};

          console.log(" ----- ----- ----- order ----- ----- -----", order);

          return (
            <OrderCard
              order={order}
            />
          );
        }}
      </Query>
    );
  }
}

export default compose(
  withOpaqueShopId,
  withRouter
)(OrderCardContainer);

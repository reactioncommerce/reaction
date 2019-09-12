import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import withPrimaryShopId from "/imports/plugins/core/graphql/lib/hocs/withPrimaryShopId";
import withShop from "/imports/plugins/core/graphql/lib/hocs/withShop";
import OrderPrint from "../components/OrderPrint";
import orderByReferenceId from "../graphql/queries/orderByReferenceId";

/**
 * @name OrderContainer
 * @param {Object} props Component props
 * @returns {React.Component} returns a React component
 */
function OrderContainer(props) {
  const { match: { params }, shop } = props;

  if (!shop) return null; // Data may not have loaded yet

  const variables = {
    id: params._id,
    language: shop.language,
    shopId: shop._id,
    token: null
  };

  return (
    <Query errorPolicy="all" query={orderByReferenceId} variables={variables}>
      {({ data: orderData, loading: isLoading }) => {
        if (isLoading) return null;
        const { order } = orderData || {};

        if (!order) {
          return <div>Order not found</div>;
        }

        return (
          <OrderPrint
            order={order}
          />
        );
      }}
    </Query>
  );
}

OrderContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      _id: PropTypes.string
    })
  }),
  shop: PropTypes.shape({
    _id: PropTypes.string,
    language: PropTypes.string
  })
};

export default compose(
  withPrimaryShopId,
  withShop,
  withRouter
)(OrderContainer);

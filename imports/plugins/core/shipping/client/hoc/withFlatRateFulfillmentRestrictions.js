import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";

const getShippingRestrictions = gql`
  query getShippingRestrictions($shopId: ID!) {
    getFlatRateFulfillmentRestrictions(shopId: $shopId) {
      nodes {
        shopId
        methodIds
        type
        destination {
          country
          region
          postal
        }
        attributes {
          property
          value
          propertyType
          operator
        }
      }
    }
  }
`;

export default (Component) => (
  class ShippingRestrictionsQuery extends React.Component {
    static propTypes = {
      shopId: PropTypes.string.isRequired
    };

    render() {
      const { shopId } = this.props;

      return (
        <Query query={getShippingRestrictions} variables={{ shopId }}>
          {({ loading, data }) => {
            const props = {
              ...this.props,
              isLoadingShippingRestrictions: loading
            };

            if (!loading && data) {
              props.data = data;
            }

            return (
              <Component {...props} />
            );
          }}
        </Query>
      );
    }
  }
);

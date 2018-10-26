import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";

const getTaxServices = gql`
  query getTaxServices($shopId: ID!) {
    taxServices(shopId: $shopId) {
      displayName
      name
    }
  }
`;

export default (Component) => (
  class TaxServicesQuery extends React.Component {
    static propTypes = {
      shopId: PropTypes.string.isRequired
    };

    render() {
      const { shopId } = this.props;

      return (
        <Query query={getTaxServices} variables={{ shopId }}>
          {({ loading, data }) => {
            const props = {
              ...this.props,
              isLoadingTaxServices: loading
            };

            if (!loading && data) {
              props.taxServices = data.taxServices;
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

import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";

const getTaxCodes = gql`
  query getTaxCodes($shopId: ID!) {
    taxCodes(shopId: $shopId) {
      code
      label
    }
  }
`;

export default (Component) => (
  class TaxCodesQuery extends React.Component {
    static propTypes = {
      shopId: PropTypes.string.isRequired
    };

    render() {
      const { shopId } = this.props;

      return (
        <Query query={getTaxCodes} variables={{ shopId }}>
          {({ loading, data }) => {
            const props = {
              ...this.props,
              isLoadingTaxCodes: loading
            };

            if (!loading && data) {
              props.taxCodes = data.taxCodes;
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

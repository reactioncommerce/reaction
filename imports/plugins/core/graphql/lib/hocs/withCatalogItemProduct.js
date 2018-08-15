import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import getCatalogItemProduct from "../queries/getCatalogItemProduct";

export default (Comp) => (

  class CatalogItemProduct extends Component {
    static propTypes = {
      productId: PropTypes.string,
      shouldSkipGraphql: PropTypes.bool
    };

    render() {
      const { shouldSkipGraphql, productId } = this.props;

      if (shouldSkipGraphql) {
        return (
          <Component {...this.props} />
        );
      }

      const variables = { slugOrId: productId };

      return (
        <Query query={getCatalogItemProduct} variables={variables}>
          {({ loading, data }) => {
            const props = {
              isLoading: true,
              ...this.props
            };

            if (loading === false) {
              props.isLoading = false;
              const { catalogItemProduct } = data;
              const { product } = catalogItemProduct || {};
              if (product) {
                props.product = product;
              } else {
                props.shouldSkipGraphql = true;
              }
            }

            return (
              <Comp {...props} />
            );
          }}
        </Query>
      );
    }
  }
);

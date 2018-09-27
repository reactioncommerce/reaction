import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
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
          <Comp {...this.props} />
        );
      }

      const variables = { slugOrId: productId };

      return (
        <Query query={getCatalogItemProduct} variables={variables} errorPolicy="all">
          {({ error, loading, data }) => {
            if (error) {
              Logger.error(error);
              throw new ReactionError("query-error");
            }
            const props = {
              isLoadingCatalogItemProduct: true,
              ...this.props
            };

            if (loading === false) {
              props.isLoadingCatalogItemProduct = false;
              const { catalogItemProduct } = data;
              const { product } = catalogItemProduct || {};
              if (product) {
                props.catalogItemProduct = product;
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

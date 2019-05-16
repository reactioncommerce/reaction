import React from "react";
import { Query } from "react-apollo";
import PropTypes from "prop-types";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import getInventoryInfo from "./getInventoryInfo";

export default (Component) => (
  class InventoryInfoQuery extends React.Component {
    static propTypes = {
      variant: PropTypes.object
    }

    state = {
      variantId: null,
      variables: null
    }

    componentDidMount() {
      this._isMounted = true;
    }

    componentWillUnmount() {
      this._isMounted = false;
    }

    getOpaqueIds(variant) {
      this.isGettingIds = true;
      getOpaqueIds([
        { namespace: "Product", id: variant.ancestors[0] },
        { namespace: "Product", id: variant._id },
        { namespace: "Shop", id: variant.shopId }
      ])
        .then(([productId, productVariantId, shopId]) => {
          if (this._isMounted) {
            this.setState({
              variantId: variant._id,
              variables: {
                productConfiguration: {
                  productId,
                  productVariantId
                },
                shopId
              }
            });
          }
          this.isGettingIds = false;
          return null;
        })
        .catch((error) => {
          throw error;
        });
    }

    render() {
      const { variant } = this.props;

      if (!variant) return null;

      if (variant._id !== this.state.variantId && !this.isGettingIds) {
        this.getOpaqueIds(variant);
        return null;
      }

      const { variables } = this.state;

      if (!variables) return null; // still getting them

      return (
        <Query query={getInventoryInfo} variables={variables}>
          {({ loading, data }) => {
            const props = {
              ...this.props,
              isLoadingInventoryInfo: loading,
              variables
            };

            if (!loading && data) {
              props.inventoryInfo = data.simpleInventory;
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

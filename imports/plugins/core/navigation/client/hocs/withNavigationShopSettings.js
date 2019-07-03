import React from "react";
import { Query } from "react-apollo";
import PropTypes from "prop-types";
import getOpaqueIds from "/imports/plugins/core/core/client/util/getOpaqueIds";
import shopSettingsQuery from "./shopSettingsQuery";

export default (Component) => (
  class NavigationShopSettingsQuery extends React.Component {
    static propTypes = {
      shopId: PropTypes.string
    }

    state = {
      shopId: null
    }

    componentDidMount() {
      this._isMounted = true;
    }

    componentWillUnmount() {
      this._isMounted = false;
    }

    getOpaqueIds(shopId) {
      this.isGettingIds = true;
      getOpaqueIds([
        { namespace: "Shop", id: shopId }
      ])
        .then(([opaqueShopId]) => {
          if (this._isMounted) {
            this.setState({
              opaqueShopId,
              shopId
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
      const { shopId } = this.props;

      if (!shopId) return null;

      if (shopId !== this.state.shopId && !this.isGettingIds) {
        this.getOpaqueIds(shopId);
        return null;
      }

      const { opaqueShopId } = this.state;

      if (!opaqueShopId) return null; // still getting them

      return (
        <Query query={shopSettingsQuery} variables={{ shopId: opaqueShopId }}>
          {({ loading, data }) => {
            const props = {
              ...this.props,
              isLoadingNavigationShopSettings: loading,
              shopId: opaqueShopId
            };

            if (!loading && data) {
              props.navigationShopSettings = data.shopSettings;
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

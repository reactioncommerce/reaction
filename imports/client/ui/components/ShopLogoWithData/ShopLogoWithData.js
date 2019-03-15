import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import { Link } from "react-router-dom";
import { withComponents } from "@reactioncommerce/components-context";
import withPrimaryShopId from "/imports/plugins/core/graphql/lib/hocs/withPrimaryShopId";

const getShop = gql`
  query getShop($id: ID!) {
    shop(id: $id) {
      brandAssets {
        navbarBrandImage {
          thumbnail
        }
      }
      name
    }
  }
`;

/**
 * ShopLogoWithData
 * @params {Object} props Component props
 * @returns {Node} React component
 */
function ShopLogoWithData({ shopId }) {
  if (!shopId) return null;

  return (
    <Query query={getShop} variables={{ id: shopId }}>
      {({ loading, data }) => {
        if (loading) return null;

        const { shop } = data;
        const customLogo = shop.brandAssets && shop.brandAssets.navbarBrandImage && shop.brandAssets.navbarBrandImage.thumbnail;
        const defaultLogo = "/resources/reaction-logo-circular.svg";

        return (
          <Link to="/operator">
            <img
              alt={shop.name}
              src={customLogo || defaultLogo}
              width={60}
            />
          </Link>
        );
      }}
    </Query>
  );
}

ShopLogoWithData.propTypes = {
  shopId: PropTypes.string
};

export default withPrimaryShopId(withComponents(ShopLogoWithData));

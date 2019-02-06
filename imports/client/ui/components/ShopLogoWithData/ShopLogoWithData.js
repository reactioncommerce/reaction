import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import styled from "styled-components";
import { withComponents } from "@reactioncommerce/components-context";
import { CustomPropTypes } from "@reactioncommerce/components/utils";
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

class ShopLogoWithData extends Component {
  static propTypes = {
    components: PropTypes.shape({
      ShopLogo: CustomPropTypes.component.isRequired
    }),
    shopId: PropTypes.string
  };

  render() {
    const { components: { ShopLogo }, shopId } = this.props;

    if (!shopId) return null;

    return (
      <Query query={getShop} variables={{ id: shopId }}>
        {({ loading, data }) => {
          if (loading) return null;

          // These styles should be applied in the component library, but workaround for now
          const StyledShopLogo = styled(ShopLogo)`
            & img {
              max-height: 100%;
              max-width: 100%;
            }
          `;

          const { shop } = data;
          return (
            <StyledShopLogo
              shopLogoUrl={shop.brandAssets && shop.brandAssets.navbarBrandImage && shop.brandAssets.navbarBrandImage.thumbnail}
              shopName={shop.name}
            />
          );
        }}
      </Query>
    );
  }
}

export default withPrimaryShopId(withComponents(ShopLogoWithData));

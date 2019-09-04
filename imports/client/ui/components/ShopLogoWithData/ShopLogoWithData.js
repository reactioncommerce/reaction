import React from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import classNames from "classnames";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import { Link } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import withStyles from "@material-ui/core/styles/withStyles";
import { withComponents } from "@reactioncommerce/components-context";
import withPrimaryShopId from "/imports/plugins/core/graphql/lib/hocs/withPrimaryShopId";
import GenericErrorBoundary from "../GenericErrorBoundary";

const getShop = gql`
  query getShop($id: ID!) {
    shop(id: $id) {
      brandAssets {
        navbarBrandImage {
          large
        }
      }
      name
      shopLogoUrls {
        primaryShopLogoUrl
      }
    }
  }
`;

const styles = (theme) => ({
  root: {
    display: "flex",
    alignItems: "center"
  },
  logo: {
    marginRight: theme.spacing(2)
  },
  logoName: {
    color: theme.palette.colors.black15
  }
});

/**
 * ShopLogoWithData
 * @param {Object} props Component props
 * @returns {Node} React component
 */
function ShopLogoWithData({ className, classes, shopId, shouldShowShopName, linkTo, size }) {
  if (!shopId) return null;

  return (
    <GenericErrorBoundary>
      <Query query={getShop} variables={{ id: shopId }}>
        {({ loading, data }) => {
          if (loading) return null;
          if (data && data.shop) {
            const { shop } = data;
            const customLogoFromUpload = shop.brandAssets && shop.brandAssets.navbarBrandImage && shop.brandAssets.navbarBrandImage.large;
            const customLogoFromUrlInput = shop.shopLogoUrls && shop.shopLogoUrls.primaryShopLogoUrl;
            const defaultLogo = "/resources/reaction-logo-circular.svg";

            return (
              <Link
                className={classNames(classes.root, className)}
                to={linkTo}
              >
                <img
                  alt={shop.name}
                  className={classes.logo}
                  src={customLogoFromUrlInput || customLogoFromUpload || defaultLogo}
                  width={size}
                />
                {shouldShowShopName &&
                  <Typography
                    variant="h3"
                    component="span"
                    className={classes.logoName}
                  >
                    {shop.name}
                  </Typography>
                }
              </Link>
            );
          }

          // Return null if the shop data couldn't be found.
          return null;
        }}
      </Query>
    </GenericErrorBoundary>
  );
}

ShopLogoWithData.propTypes = {
  className: PropTypes.string,
  classes: PropTypes.object,
  linkTo: PropTypes.string,
  shopId: PropTypes.string,
  shouldShowShopName: PropTypes.bool,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

ShopLogoWithData.defaultProps = {
  linkTo: "/operator",
  shouldShowShopName: false,
  size: 60
};

export default compose(
  withPrimaryShopId,
  withComponents,
  withStyles(styles, { name: "RuiShopLogoWithData" })
)(ShopLogoWithData);

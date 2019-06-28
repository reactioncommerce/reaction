import React, { Fragment } from "react";
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
    }
  }
`;

const styles = (theme) => ({
  root: {
    display: "flex",
    alignItems: "center"
  },
  logo: {
    marginRight: theme.spacing.unit * 2
  }
});

/**
 * ShopLogoWithData
 * @params {Object} props Component props
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
            const customLogo = shop.brandAssets && shop.brandAssets.navbarBrandImage && shop.brandAssets.navbarBrandImage.large;
            const defaultLogo = "/resources/reaction-logo-circular.svg";

            return (
              <Fragment>
                <Link
                  className={classNames(classes.root, className)}
                  to={linkTo}
                >
                  <img
                    alt={shop.name}
                    className={classes.logo}
                    src={customLogo || defaultLogo}
                    width={size}
                  />
                  {shouldShowShopName &&
                    <Typography
                      color="textSecondary"
                      display="display"
                      variant="h3"
                      component="span"
                    >
                      {shop.name}
                    </Typography>
                  }
                </Link>
              </Fragment>
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

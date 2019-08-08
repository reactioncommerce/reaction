import React, { Fragment } from "react";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import MuiLink from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import ShopLogoWithData from "/imports/client/ui/components/ShopLogoWithData/ShopLogoWithData";

/**
 * OperatorLanding
 * @param {Object} props Component props
 * @returns {Node} React component
 */
function OperatorLanding() {
  return (
    <Fragment>
      <Helmet title="Reaction Admin" />
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        spacing={5}
      >
        <Grid item />
        <Grid item>
          <ShopLogoWithData size={100} />
        </Grid>
        <Grid item>
          <Typography align="center" variant="body1">
            {/* eslint-disable-next-line max-len */}
            Use Reaction Admin to manage <Link to="/operator/orders">Orders</Link>, <Link to="/operator/products">Products</Link>, <Link to="/operator/tags">Tags</Link>, <Link to="/operator/accounts">Accounts</Link>, and <Link to="/operator/navigation">Navigation</Link>, or change shop settings.
          </Typography>
        </Grid>
        <Grid item>
          <Typography align="center" variant="body1">
            See our <MuiLink href="https://docs.reactioncommerce.com/docs/dashboard">Store Operator’s Guide</MuiLink> for more information.
          </Typography>
        </Grid>
      </Grid>
    </Fragment>
  );
}

export default OperatorLanding;

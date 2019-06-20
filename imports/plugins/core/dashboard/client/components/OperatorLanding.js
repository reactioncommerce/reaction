import React from "react";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import ShopLogoWithData from "/imports/client/ui/components/ShopLogoWithData/ShopLogoWithData";

/**
 * OperatorLanding
 * @params {Object} props Component props
 * @returns {Node} React component
 */
function OperatorLanding() {
  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
      spacing={40}
    >
      <Grid item>
        <ShopLogoWithData size={100} />
      </Grid>
      <Grid item>
        <Typography align="center" variant="body2">
            Use the navigation menu at the left to manage <Link href="/operator/orders">Orders</Link>, <Link href="/operator/products">Products</Link>, <Link href="/operator/tags">Tags</Link>, <Link href="/operator/accounts">Accounts</Link>, and <Link href="/operator/navigation">Navigation</Link>, or change shop settings.
        </Typography>
      </Grid>
      <Grid item>
        <Typography align="center" variant="body2">
          See our <Link href="https://docs.reactioncommerce.com/docs/dashboard">Store Operator's Guide</Link> for more information.
        </Typography>
      </Grid>
    </Grid>
  );
}

export default OperatorLanding;

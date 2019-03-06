import React from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { i18next } from "/client/api";
import withCreateProduct from "../hocs/withCreateProduct";

/**
 * ProductList component
 * @param {Object} props Component props
 * @return {Node} React node
 */
function ProductList({ onCreateProduct }) {
  return (
    <Grid container spacing={24}>
      <Grid item sm={12}>
        <Button
          color="primary"
          onClick={onCreateProduct}
          variant="contained"
        >
          {i18next.t("admin.createProduct")}
        </Button>
      </Grid>
      <Grid item sm={12}>
        <Components.ProductsAdmin />
      </Grid>
    </Grid>
  );
}

ProductList.propTypes = {
  onCreateProduct: PropTypes.func
};

export default withCreateProduct(ProductList);

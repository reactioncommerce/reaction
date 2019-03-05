import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import Grid from "@material-ui/core/Grid";
import withProduct from "../hocs/withProduct";
import ProductList from "./ProductList";
import ProductAdminForm from "./productAdmin";
import ProductHeader from "./ProductHeader";

/**
 * ProductDetail component
 * @param {Object} props Component props
 * @return {Node} React node
 */
function ProductDetail(props) {
  return (
    <Fragment>
      <Components.ProductPublish />
      <Grid container spacing={24}>
        <Grid item sm={12}>
          <ProductHeader
            product={props.product}
            title="Variants"
            onCreate={props.onCreateVariant}
          />
        </Grid>
        <Grid item sm={4}>
          <ProductList
            items={props.variants}
          />
        </Grid>
        <Grid item sm={8}>
          <ProductAdminForm {...props} />
        </Grid>
      </Grid>
    </Fragment>
  );
}

ProductDetail.propTypes = {
  onCreateVariant: PropTypes.func,
  product: PropTypes.object,
  variants: PropTypes.arrayOf(PropTypes.object)
};

export default withProduct(ProductDetail);

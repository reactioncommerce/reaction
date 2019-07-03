import React from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import ProductMediaGallery from "../components/ProductMediaGallery";

/**
 * Product media form block component
 * @param {Object} props Component props
 * @returns {React.Component} React component
 */
function ProductMediaForm(props) {
  const { product = {} } = props;

  return (
    <Card>
      <CardHeader title={i18next.t("admin.productAdmin.mediaGallery")} />
      <CardContent>
        <ProductMediaGallery productId={product._id} />
      </CardContent>
    </Card>
  );
}

ProductMediaForm.propTypes = {
  product: PropTypes.object
};


export default ProductMediaForm;

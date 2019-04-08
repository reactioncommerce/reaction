import React from "react";
import PropTypes from "prop-types";
import { i18next } from "/client/api";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import ProductMediaGallery from "../components/ProductMediaGallery";

/**
 * Variant media form block component
 * @param {Object} props Component props
 * @returns {Node} React component
 */
function VariantMediaForm(props) {
  const { variant } = props;

  return (
    <Card>
      <CardHeader title={i18next.t("admin.productAdmin.mediaGallery")} />
      <CardContent>
        <ProductMediaGallery
          {...props}
          variantId={variant._id}
        />
      </CardContent>
    </Card>
  );
}

VariantMediaForm.propTypes = {
  variant: PropTypes.object
};

export default VariantMediaForm;

import React from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";

/**
 * Product metadata form block component
 * @param {Object} props Component props
 * @returns {Node} React component
 */
function ProductMetadataForm(props) {
  const {
    newMetafield,
    onProductMetaChange,
    onProductMetaRemove,
    onProductMetaSave,
    product
  } = props;

  return (
    <Card>
      <CardHeader title={i18next.t("admin.productAdmin.metadata")} />
      <CardContent>
        <Components.Metadata
          metafields={product.metafields}
          newMetafield={newMetafield}
          onMetaChange={onProductMetaChange}
          onMetaRemove={onProductMetaRemove}
          onMetaSave={onProductMetaSave}
        />
      </CardContent>
    </Card>
  );
}

ProductMetadataForm.propTypes = {
  newMetafield: PropTypes.object,
  onProductFieldChange: PropTypes.func,
  onProductMetaChange: PropTypes.func,
  onProductMetaRemove: PropTypes.func,
  onProductMetaSave: PropTypes.func,
  onProductSelectChange: PropTypes.func,
  onSitemapCheckboxChange: PropTypes.func,
  product: PropTypes.object
};

export default ProductMetadataForm;

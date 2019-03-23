import React from "react";
import PropTypes from "prop-types";
import { Components } from "@reactioncommerce/reaction-components";
import { i18next } from "/client/api";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";

/**
 * Tag form block component
 * @param {Object} props Component props
 * @returns {React.Component} React component
 */
function ProductTagForm(props) {
  const { editable, product } = props;

  return (
    <Card>
      <CardHeader title={i18next.t("productDetail.tags")} />
      <CardContent>
        <Components.TagList
          editable={editable}
          enableNewProductTagForm={true}
          product={product}
          tagProps={{
            fullWidth: true
          }}
        />
      </CardContent>
    </Card>
  );
}

ProductTagForm.propTypes = {
  editable: PropTypes.bool, // eslint-disable-line react/boolean-prop-naming
  product: PropTypes.object
};

export default ProductTagForm;

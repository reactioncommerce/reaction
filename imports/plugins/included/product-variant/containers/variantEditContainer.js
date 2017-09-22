import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";
import { Reaction, i18next } from "/client/api";
import { applyProductRevision } from "/lib/api/products";
import VariantEdit from "../components/variantEdit";


const wrapComponent = (Comp) => (
  class VariantEditContainer extends Component {
    static propTypes = {
      childVariants: PropTypes.arrayOf(PropTypes.object),
      variant: PropTypes.object
    };

    handleCreateNewChildVariant(variant) {
      Meteor.call("products/createVariant", variant._id, function (error, result) {
        if (error) {
          Alerts.alert({
            text: i18next.t("productDetailEdit.addVariantFail", { title: variant.title }),
            confirmButtonText: i18next.t("app.close", { defaultValue: "Close" })
          });
        } else if (result) {
          console.log("what's going on?");
          const newVariantId = result;
          const selectedProduct = ReactionProduct.selectedProduct();
          const handle = selectedProduct.__published && selectedProduct.__published.handle || selectedProduct.handle;
          ReactionProduct.setCurrentVariant(newVariantId);
          // Session.set("variant-form-" + newVariantId, true);
          const cardName = `variant-${newVariantId}`;
          Reaction.state.set("edit/focus", cardName);

          Reaction.Router.go("product", {
            handle: handle,
            variantId: newVariantId
          });
        }
      });
    }

    render() {
      return (
        <Comp
          childVariants={this.props.childVariants}
          handleCreateNewChildVariant={this.handleCreateNewChildVariant}
          variant={this.props.variant}
        />
      );
    }
  }
);

function composer(props, onData) {
  const productHandle = Reaction.Router.getParam("handle");

  if (!productHandle) {
    Reaction.clearActionView();
  }

  if (ReactionProduct.selectedTopVariant()) {
    const variant = Products.findOne({
      _id: ReactionProduct.selectedTopVariant()._id
    });

    const revisedVariant = applyProductRevision(variant);
    const childVariants = ReactionProduct.getVariants(revisedVariant._id);

    onData(null, {
      childVariants: childVariants,
      variant: revisedVariant
    });
  }
}


registerComponent("variantForm", VariantEdit, [
  composeWithTracker(composer),
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  wrapComponent
)(VariantEdit);

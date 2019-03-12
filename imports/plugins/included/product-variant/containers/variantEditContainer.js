import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { registerComponent, composeWithTracker } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";
import { Countries } from "/client/collections";
import { Reaction, i18next } from "/client/api";
import VariantEdit from "../components/variantEdit";


const wrapComponent = (Comp) => (
  class VariantEditContainer extends Component {
    static propTypes = {
      childVariants: PropTypes.arrayOf(PropTypes.object),
      countries: PropTypes.arrayOf(PropTypes.object),
      editFocus: PropTypes.string,
      variant: PropTypes.object
    };

    handleCreateNewChildVariant(variant) {
      Meteor.call("products/createVariant", variant._id, (error, result) => {
        if (error) {
          Alerts.alert({
            text: i18next.t("productDetailEdit.addVariantFail", { title: variant.title }),
            confirmButtonText: i18next.t("app.close", { defaultValue: "Close" })
          });
        } else if (result) {
          const newVariantId = result;
          const selectedProduct = ReactionProduct.selectedProduct();
          const handle = (selectedProduct.__published && selectedProduct.__published.handle) || selectedProduct.handle;
          ReactionProduct.setCurrentVariant(newVariantId);
          // Session.set("variant-form-" + newVariantId, true);
          const cardName = `variant-${newVariantId}`;
          Reaction.state.set("edit/focus", cardName);

          Reaction.Router.go("product", {
            handle,
            variantId: newVariantId
          });
        }
      });
    }

    render() {
      return (
        <Comp
          childVariants={this.props.childVariants}
          countries={this.props.countries}
          editFocus={this.props.editFocus}
          handleCreateNewChildVariant={this.handleCreateNewChildVariant}
          variant={this.props.variant}
        />
      );
    }
  }
);

/**
 *
 * @param {*} props
 * @param {*} onData
 */
function composer(props, onData) {
  if (props.variant) {
    const variant = Products.findOne({
      _id: props.variant._id
    });

    const childVariants = ReactionProduct.getVariants(variant._id);

    onData(null, {
      countries: Countries.find({}).fetch(),
      editFocus: Reaction.state.get("edit/focus"),
      childVariants,
      variant
    });
  } else {
    onData(null, {
      countries: Countries.find({}).fetch()
    });
  }
}


registerComponent("VariantEditForm", VariantEdit, [
  composeWithTracker(composer),
  wrapComponent
]);

export default compose(
  composeWithTracker(composer),
  wrapComponent
)(VariantEdit);

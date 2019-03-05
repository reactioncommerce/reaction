import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { composeWithTracker } from "@reactioncommerce/reaction-components";
import { withRouter } from "react-router";
import { Meteor } from "meteor/meteor";
import { ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";
import { Countries } from "/client/collections";
import { Reaction, i18next } from "/client/api";
import { Media } from "/imports/plugins/core/files/client";
import { getVariantIds } from "/lib/selectors/variants";

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
          handleCreateNewChildVariant={this.handleCreateNewChildVariant}
          {...this.props}
        />
      );
    }
  }
);

/**
 * Composer function to fetch variants and options
 * @param {Object} props Props
 * @param {Function} onData Data callback
 * @returns {undefined} no return
 */
function composer(props, onData) {
  const { variantId, optionId } = props.match.params;

  // Get the toplevel varaint
  const variant = Products.findOne({
    _id: variantId
  });

  // Get the current variant or option;
  let option;
  let optionMedia = [];

  if (optionId) {
    option = Products.findOne({
      _id: optionId
    });
  }

  let options = ReactionProduct.getVariants(variantId);

  if (options) {
    if (Array.isArray(options)) {
      optionMedia = Media.findLocal(
        {
          "metadata.variantId": {
            $in: getVariantIds(options)
          }
        },
        {
          sort: {
            "metadata.priority": 1
          }
        }
      );
    }

    options = options.map((optionData) => ({
      ...optionData,
      media: optionMedia && optionMedia.filter((media) => (
        media.metaData.variantId === optionData._id
      ))
    }));
  }

  onData(null, {
    countries: Countries.find({}).fetch(),
    editFocus: Reaction.state.get("edit/focus"),
    options,
    variant,
    option,
    optionMedia
  });
}

export default compose(
  withRouter,
  composeWithTracker(composer),
  wrapComponent
);

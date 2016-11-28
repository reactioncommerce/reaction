import Sortable from "sortablejs";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Products, Media } from "/lib/collections";
import { EditButton, VisibilityButton } from "/imports/plugins/core/ui/client/components";

function variantIsSelected(variantId) {
  const current = ReactionProduct.selectedVariant();
  if (typeof current === "object" && (variantId === current._id || ~current.ancestors.indexOf(variantId))) {
    return true;
  }

  return false;
}

function variantIsInActionView(variantId) {
  const actionViewVariant = Reaction.getActionView().data;

  if (actionViewVariant) {
    // Check if the variant is selected, and also visible & selected in the action view
    return variantIsSelected(variantId) && variantIsSelected(actionViewVariant._id) && Reaction.isActionViewOpen();
  }

  return false;
}

/**
 * variant onRendered
 */

Template.variantList.onRendered(function () {
  const instance = this;

  return this.autorun(function () {
    if (Reaction.hasPermission("createProduct")) {
      const variantSort = $(".variant-list")[0];

      this.sortable = Sortable.create(variantSort, {
        group: "variant-list",
        handle: ".variant-list-item",
        onUpdate() {
          const positions = instance.$(".variant-list-item")
            .toArray()
            .map((element) => {
              return element.getAttribute("data-id");
            });

          Meteor.defer(function () {
            Meteor.call("products/updateVariantsPosition", positions);
          });

          Tracker.flush();
        }
      });
    }
  });
});


/**
 * variantList helpers
 */
Template.variantList.helpers({
  media: function () {
    const media = Media.findOne({
      "metadata.variantId": this._id
    }, {
      sort: {
        "metadata.priority": 1
      }
    });

    return media instanceof FS.File ? media : false;
  },
  variants: function () {
    let inventoryTotal = 0;
    const variants = ReactionProduct.getTopVariants();
    if (variants.length) {
      // calculate inventory total for all variants
      for (const variant of variants) {
        if (variant.inventoryManagement) {
          const qty = ReactionProduct.getVariantQuantity(variant);
          if (typeof qty === "number") {
            inventoryTotal += qty;
          }
        }
      }
      // calculate percentage of total inventory of this product
      for (const variant of variants) {
        const qty = ReactionProduct.getVariantQuantity(variant);
        variant.inventoryTotal = inventoryTotal;
        if (variant.inventoryManagement && inventoryTotal) {
          variant.inventoryPercentage = parseInt(qty / inventoryTotal * 100, 10);
        } else {
          // for cases when sellers doesn't use inventory we should always show
          // "green" progress bar
          variant.inventoryPercentage = 100;
        }
        if (variant.title) {
          variant.inventoryWidth = parseInt(variant.inventoryPercentage -
            variant.title.length, 10);
        } else {
          variant.inventoryWidth = 0;
        }
      }
      // sort variants in correct order
      variants.sort((a, b) => a.index - b.index);

      return variants;
    }
    return [];
  },
  childVariants: function () {
    const childVariants = [];
    const variants = ReactionProduct.getVariants();
    if (variants.length > 0) {
      const current = ReactionProduct.selectedVariant();

      if (!current) {
        return [];
      }

      if (current.ancestors.length === 1) {
        variants.map(variant => {
          if (typeof variant.ancestors[1] === "string" &&
            variant.ancestors[1] === current._id &&
            variant.optionTitle &&
            variant.type !== "inventory") {
            childVariants.push(variant);
          }
        });
      } else {
        // TODO not sure we need this part...
        variants.map(variant => {
          if (typeof variant.ancestors[1] === "string" &&
            variant.ancestors.length === current.ancestors.length &&
            variant.ancestors[1] === current.ancestors[1] &&
            variant.optionTitle
          ) {
            childVariants.push(variant);
          }
        });
      }

      return childVariants;
    }

    return null;
  },
  selectedVariant() {
    if (variantIsSelected(this._id)) {
      return "variant-detail-selected";
    }

    return null;
  },
  ChildVariantEditButton() {
    const variant = Template.currentData();
    const parentVariant = Products.findOne(variant.ancestors[1]);

    return {
      component: EditButton,
      toggleOn: variantIsInActionView(variant._id),
      onClick() {
        ReactionProduct.setCurrentVariant(variant._id);
        Session.set("variant-form-" + parentVariant._id, true);

        if (Reaction.hasPermission("createProduct")) {
          Reaction.showActionView({
            label: "Edit Variant",
            i18nKeyLabel: "productDetailEdit.editVariant",
            template: "variantForm",
            data: parentVariant
          });
        }
      }
    };
  },
  ChildVariantRevisionButton() {
    const variant = Template.currentData();
    // const parentVariant = Products.findOne(variant.ancestors[1]);

    return {
      component: VisibilityButton,
      toggleOn: variant.isVisible,
      onClick() {
        ReactionProduct.toggleVisibility(variant);
      }
    };
  }
});

/**
 * variantList events
 */

Template.variantList.events({
  "click #create-variant": function () {
    return Meteor.call("products/createVariant", this._id);
  },
  "click .variant-select-option": function (event, templateInstance) {
    templateInstance.$(".variant-select-option").removeClass("active");
    $(event.target).addClass("active");
    Alerts.removeSeen();

    const selectedProduct = ReactionProduct.selectedProduct();
    Reaction.Router.go("product", { handle: selectedProduct.handle, variantId: this._id });

    return ReactionProduct.setCurrentVariant(this._id);
  }
});

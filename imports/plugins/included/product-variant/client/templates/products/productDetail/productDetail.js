import _ from "lodash";
import { ReactiveDict } from "meteor/reactive-dict";
import { $ } from "meteor/jquery";
import { Reaction, i18next, Logger } from "/client/api";
import { ReactionProduct } from "/lib/api";
import { Tags } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";
import { EditButton } from "/imports/plugins/core/ui/client/components";
import { PublishContainer } from "/imports/plugins/core/revisions";
import { ProductDetailContainer } from "/imports/plugins/included/product-detail-simple/client/containers";
import { isRevisionControlEnabled } from "/imports/plugins/core/revisions/lib/api";

Template.productDetail.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    product: {},
    tags: []
  });
  this.subscribe("Tags");
  this.productId = () => Reaction.Router.getParam("handle");
  this.variantId = () => Reaction.Router.getParam("variantId");
  this.autorun(() => {
    if (this.productId()) {
      this.subscribe("Product", this.productId());
    }
  });

  this.autorun(() => {
    if (this.subscriptionsReady()) {
      // Get the product
      const product = ReactionProduct.setProduct(this.productId(), this.variantId());
      this.state.set("product", product);

      if (Reaction.hasPermission("createProduct")) {
        if (!Reaction.getActionView() && Reaction.isActionViewOpen() === true) {
          Reaction.setActionView({
            template: "productDetailForm",
            data: product
          });
        }
      }

      // Get the product tags
      if (product) {
        if (_.isArray(product.hashtags)) {
          const tags = _.map(product.hashtags, function (id) {
            return Tags.findOne(id);
          });

          this.state.set("tags", tags);
        }
      }
    }
  });
});

/**
 * productDetail helpers
 * see helper/product.js for
 * product data source
 */
Template.productDetail.helpers({
  PDC() {
    return {
      component: ProductDetailContainer
    };
  },
  tagListProps() {
    const instance = Template.instance();
    const product = instance.state.get("product") || {};
    const tags = instance.state.get("tags");
    const productId = product._id;
    const canEdit = Reaction.hasPermission("createProduct");

    return {
      tags,
      isEditing: canEdit,
      controls: [
        {
          type: "button",
          icon: "bookmark-o",
          onIcon: "bookmark",
          toggle: true,
          toggleOn(tag) {
            const handle = product.handle;
            if (Reaction.getSlug(handle) === tag.slug) {
              return true;
            }
            return false;
          },
          onClick(event, tag) {
            Meteor.call("products/setHandleTag", productId, tag._id,
              function (error, result) {
                if (result) {
                  return Reaction.Router.go("product", {
                    handle: result
                  });
                }
                return null;
              });
          }
        }
      ],
      onTagCreate(tagName) {
        Meteor.call("products/updateProductTags", productId, tagName, null,
          function (error) {
            if (error) {
              Alerts.toast(i18next.t("productDetail.tagExists"), "error");
            }
          });
      },
      onTagRemove(tag) {
        Meteor.call("products/removeProductTag", productId, tag._id,
          function (error) {
            if (error) {
              Alerts.toast(i18next.t("productDetail.tagExists"), "error");
            }
          });
      },
      onTagSort(tagIds) {
        Meteor.call("products/updateProductField", productId, "hashtags", _.uniq(tagIds));
      },
      onTagUpdate(tagId, tagName) {
        Meteor.call("products/updateProductTags", productId, tagName, tagId,
          function (error) {
            if (error) {
              Alerts.toast(i18next.t("productDetail.tagExists"), "error");
            }
          });
      }
    };
  },
  SocialEditButton() {
    return {
      component: EditButton,
      toggleOn: Reaction.getActionView().template === "productDetailSocialForm" && Reaction.isActionViewOpen(),
      onClick() {
        if (Reaction.hasPermission("createProduct")) {
          Reaction.showActionView({
            label: "Social",
            i18nKeyLabel: "social.socialTitle",
            template: "productDetailSocialForm"
          });
        }
      }
    };
  },

  showTagTitle() {
    const instance = Template.instance();
    const product = instance.state.get("product") || {};

    if (Reaction.hasPermission("createProduct")) {
      return true;
    }

    if (_.isArray(product.hashtags) && product.hashtags.length) {
      return true;
    }

    return false;
  },

  showDetailTitle() {
    const instance = Template.instance();
    const product = instance.state.get("product") || {};

    if (Reaction.hasPermission("createProduct")) {
      return true;
    }

    if (_.isArray(product.metafields) && product.metafields.length) {
      return true;
    }

    return false;
  },
  product: function () {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      return ReactionProduct.setProduct(instance.productId(),
        instance.variantId());
    }

    return null;
  },
  tags: function () {
    const product = ReactionProduct.selectedProduct();
    if (product) {
      if (product.hashtags) {
        return _.map(product.hashtags, function (id) {
          return Tags.findOne(id);
        });
      }
    }

    return null;
  },
  tagsComponent: function () {
    if (Reaction.hasPermission("createProduct")) {
      return Template.productTagInputForm;
    }
    return Template.productDetailTags;
  },
  actualPrice: function () {
    const current = ReactionProduct.selectedVariant();
    if (typeof current === "object") {
      const childVariants = ReactionProduct.getVariants(current._id);
      // when top variant has no child variants we display only its price
      if (childVariants.length === 0) {
        return current.price;
      }
      // otherwise we want to show child variants price range
      return ReactionProduct.getVariantPriceRange();
    }

    return null;
  },
  fieldComponent: function () {
    if (Reaction.hasPermission("createProduct")) {
      return Template.productDetailEdit;
    }
    return Template.productDetailField;
  },
  metaComponent: function () {
    if (Reaction.hasPermission("createProduct")) {
      return Template.productMetaFieldForm;
    }
    return Template.productMetaField;
  }
});

/**
 * productDetail events
 */

Template.productDetail.events({
  "click #price": function () {
    let formName;
    if (Reaction.hasPermission("createProduct")) {
      const variant = ReactionProduct.selectedVariant();
      if (!variant) {
        return;
      }

      if (typeof variant.ancestors[1] === "string") {
        formName = variant.ancestors[1];
      } else {
        formName = variant._id;
      }

      formName = "variant-form-" + formName;
      Session.set(formName, true);
      $(`#${formName}[name="price"]`).focus();
    }
  },
  "click #add-to-cart-quantity": function (event) {
    event.preventDefault();
    return event.stopPropagation();
  },
  "change #add-to-cart-quantity": function (event, template) {
    event.preventDefault();
    event.stopPropagation();
    let qtyField;
    let quantity;
    const currentVariant = ReactionProduct.selectedVariant();
    if (currentVariant) {
      qtyField = template.$('input[name="addToCartQty"]');
      quantity = qtyField.val();
      if (quantity < 1) {
        quantity = 1;
      }
      if (currentVariant.inventoryManagement && quantity > currentVariant.inventoryQuantity) {
        qtyField.val(currentVariant.inventoryQuantity);
      }
    }
  },
  "click .js-add-to-cart": function (event, template) {
    let productId;
    let qtyField;
    let quantity;
    const currentVariant = ReactionProduct.selectedVariant();
    const currentProduct = ReactionProduct.selectedProduct();

    if (currentVariant) {
      if (currentVariant.ancestors.length === 1) {
        const options = ReactionProduct.getVariants(currentVariant._id);

        if (options.length > 0) {
          Alerts.inline("Please choose options before adding to cart", "warning", {
            placement: "productDetail",
            i18nKey: "productDetail.chooseOptions",
            autoHide: 10000
          });
          return [];
        }
      }

      if (currentVariant.inventoryPolicy && currentVariant.inventoryQuantity < 1) {
        Alerts.inline("Sorry, this item is out of stock!", "warning", {
          placement: "productDetail",
          i18nKey: "productDetail.outOfStock",
          autoHide: 10000
        });
        return [];
      }

      qtyField = template.$('input[name="addToCartQty"]');
      quantity = parseInt(qtyField.val(), 10);

      if (quantity < 1) {
        quantity = 1;
      }

      if (!this.isVisible) {
        Alerts.inline("Publish product before adding to cart.", "error", {
          placement: "productDetail",
          i18nKey: "productDetail.publishFirst",
          autoHide: 10000
        });
      } else {
        productId = currentProduct._id;

        if (productId) {
          Meteor.call("cart/addToCart", productId, currentVariant._id, quantity,
            function (error) {
              if (error) {
                Logger.error("Failed to add to cart.", error);
                return error;
              }

              return true;
            }
          );
        }

        template.$(".variant-select-option").removeClass("active");
        ReactionProduct.setCurrentVariant(null);
        qtyField.val(1);
        // scroll to top on cart add
        $("html,body").animate({
          scrollTop: 0
        }, 0);
        // slide out label
        const addToCartText = i18next.t("productDetail.addedToCart");
        const addToCartTitle = currentVariant.title || "";
        $(".cart-alert-text").text(`${quantity} ${addToCartTitle} ${addToCartText}`);

        // Grab and cache the width of the alert to be used in animation
        const alertWidth = $(".cart-alert").width();
        const direction = i18next.dir() === "rtl" ? "left" : "right";
        const oppositeDirection = i18next.dir() === "rtl" ? "right" : "left";

        // Animate
        return $(".cart-alert")
          .show()
          .css({
            [oppositeDirection]: "auto",
            [direction]: -alertWidth
          })
          .animate({
            [oppositeDirection]: "auto",
            [direction]: 0
          }, 600)
          .delay(4000)
          .animate({
            [oppositeDirection]: "auto",
            [direction]: -alertWidth
          }, {
            duration: 600,
            complete() {
              $(".cart-alert").hide();
            }
          });
      }
    } else {
      Alerts.inline("Select an option before adding to cart", "warning", {
        placement: "productDetail",
        i18nKey: "productDetail.selectOption",
        autoHide: 8000
      });
    }

    return null;
  },
  "click [data-event-action=publishProduct]": function (event, template) {
    let errorMsg = "";
    const self = this;
    if (!self.title) {
      errorMsg += `${i18next.t("error.isRequired", { field: i18next.t("productDetailEdit.title") })} `;
      template.$(".title-edit-input").focus();
    }
    const variants = ReactionProduct.getVariants(self._id);
    variants.forEach((variant, index) => {
      if (!variant.title) {
        errorMsg +=
          `${i18next.t("error.variantFieldIsRequired", { field: i18next.t("productVariant.title"), number: index + 1 })} `;
      }
      // if top variant has children, it is not necessary to check its price
      if (variant.ancestors.length === 1 && !ReactionProduct.checkChildVariants(variant._id) ||
        variant.ancestors.length !== 1) {
        if (!variant.price) {
          errorMsg +=
            `${i18next.t("error.variantFieldIsRequired", { field: i18next.t("productVariant.price"), number: index + 1 })} `;
        }
      }
    });
    if (errorMsg.length > 0) {
      Alerts.inline(errorMsg, "warning", {
        placement: "productManagement",
        i18nKey: "productDetail.errorMsg"
      });
    } else {
      Meteor.call("products/publishProduct", self._id, function (error) {
        if (error) {
          return Alerts.inline(error.reason, "error", {
            placement: "productManagement",
            id: self._id,
            i18nKey: "productDetail.errorMsg"
          });
        }

        return true;
      });
    }
  },
  "click [data-event-action=cloneProduct]": function () {
    ReactionProduct.cloneProduct(this);
  },
  "click [data-event-action=deleteProduct]": function () {
    ReactionProduct.maybeDeleteProduct(this);
  }
});

Template.productDetailForm.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    product: {}
  });

  this.autorun(() => {
    this.state.set({
      product: ReactionProduct.selectedProduct()
    });

    const handle = Reaction.Router.getParam("handle");

    if (!handle) {
      Reaction.clearActionView();
    }
  });
});

Template.productDetailForm.helpers({
  PublishContainerComponent() {
    const instance = Template.instance();
    const product = instance.state.get("product") || {};

    return {
      component: PublishContainer,
      documentIds: [product._id]
    };
  },
  product() {
    return Template.instance().state.get("product");
  },
  productTitle() {
    const product = Template.instance().state.get("product") || {};
    return product.title || i18next.t("productDetailEdit.untitledProduct", "Untitled Product");
  }
});

Template.productDetailForm.events({
  "click [data-event-action=publishProduct]": function (event, instance) {
    let errorMsg = "";
    const self = instance.state.get("product");
    if (!self.title) {
      errorMsg += `${i18next.t("error.isRequired", { field: i18next.t("productDetailEdit.title") })} `;
      instance.$(".title-edit-input").focus();
    }
    const variants = ReactionProduct.getVariants(self._id);
    variants.forEach((variant, index) => {
      if (!variant.title) {
        errorMsg +=
          `${i18next.t("error.variantFieldIsRequired", { field: i18next.t("productVariant.title"), number: index + 1 })} `;
      }
      // if top variant has children, it is not necessary to check its price
      if (variant.ancestors.length === 1 && !ReactionProduct.checkChildVariants(variant._id) ||
        variant.ancestors.length !== 1) {
        if (!variant.price) {
          errorMsg +=
            `${i18next.t("error.variantFieldIsRequired", { field: i18next.t("productVariant.price"), number: index + 1 })} `;
        }
      }
    });
    if (errorMsg.length > 0) {
      Alerts.inline(errorMsg, "warning", {
        placement: "productManagement",
        i18nKey: "productDetail.errorMsg"
      });
    } else {
      Meteor.call("products/publishProduct", self._id, function (error) {
        if (error) {
          return Alerts.inline(error.reason, "error", {
            placement: "productManagement",
            id: self._id,
            i18nKey: "productDetail.errorMsg"
          });
        }

        return true;
      });
    }
  },
  "click [data-event-action=deleteProduct]": function (event, instance) {
    const product = instance.state.get("product");
    ReactionProduct.maybeDeleteProduct(product);
  },
  "click [data-event-action=cloneProduct]": function (event, instance) {
    const product = instance.state.get("product");
    ReactionProduct.cloneProduct(product);
  }
});

Template.productDetailSocialForm.onCreated(function () {
  this.state = new ReactiveDict();

  this.autorun(() => {
    this.state.set({
      product: ReactionProduct.selectedProduct()
    });
  });
});

Template.productDetailSocialForm.helpers({
  product() {
    return Template.instance().state.get("product");
  }
});

Template.productDetailSocialForm.events({
  "blur [name=twitterMsg]"(event) {
    const rawMessage = event.currentTarget.value || "";
    const message = rawMessage.trim();

    if (message.length > 140) {
      Alerts.toast("Message is over 140 characters", "warning");
    }
  }
});

Template.productDetailDashboardControls.onCreated(function () {
  this.state = new ReactiveDict();

  this.autorun(() => {
    this.state.set({
      product: ReactionProduct.selectedProduct()
    });
  });
});

/**
 * productDetailDashboardControls helpers
 */
Template.productDetailDashboardControls.helpers({
  product() {
    return Template.instance().state.get("product");
  }
});

/**
 * productDetailDashboardControls events
 */
Template.productDetailDashboardControls.events({
  "click [data-event-action=publishProduct]": function (event, template) {
    const instance = Template.instance();
    const self = instance.state.get("product") || {};

    if (isRevisionControlEnabled()) {
      Meteor.call("products/updateProductField", self._id, "isVisible", !self.isVisible);
    } else {
      let errorMsg = "";
      if (!self.title) {
        errorMsg += `${i18next.t("error.isRequired", { field: i18next.t("productDetailEdit.title") })} `;
        template.$(".title-edit-input").focus();
      }
      const variants = ReactionProduct.getVariants(self._id);
      variants.forEach((variant, index) => {
        if (!variant.title) {
          errorMsg +=
            `${i18next.t("error.variantFieldIsRequired", { field: i18next.t("productVariant.title"), number: index + 1 })} `;
        }
        // if top variant has children, it is not necessary to check its price
        if (variant.ancestors.length === 1 && !ReactionProduct.checkChildVariants(variant._id) ||
          variant.ancestors.length !== 1) {
          if (!variant.price) {
            errorMsg +=
              `${i18next.t("error.variantFieldIsRequired", { field: i18next.t("productVariant.price"), number: index + 1 })} `;
          }
        }
      });
      if (errorMsg.length > 0) {
        Alerts.inline(errorMsg, "warning", {
          placement: "productManagement",
          i18nKey: "productDetail.errorMsg"
        });
      } else {
        Meteor.call("products/publishProduct", self._id, function (error) {
          if (error) {
            return Alerts.inline(error.reason, "error", {
              placement: "productManagement",
              id: self._id,
              i18nKey: "productDetail.errorMsg"
            });
          }

          return true;
        });
      }
    }
  }
});

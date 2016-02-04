/**
* productSocial helpers
*/

Template.productSocial.helpers({
  customSocialSettings: function () {
    const product = Template.parentData();
    const current = ReactionProduct.selectedVariant();
    const settings = {
      placement: "productDetail",
      faClass: "",
      faSize: "fa-lg",
      media: Session.get("variantImgSrc"),
      url: window.location.href,
      title: current.title || product.title,
      description: typeof product.description === "string" ? product.description.substring(0, 254) : void 0,
      apps: {
        facebook: {
          description: product.facebookMsg
        },
        twitter: {
          title: product.twitterMsg
        },
        googleplus: {
          itemtype: "Product",
          description: product.googleplusMsg
        },
        pinterest: {
          description: product.pinterestMsg
        }
      }
    };
    return settings;
  }
});

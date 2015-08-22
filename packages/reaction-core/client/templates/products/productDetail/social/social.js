/**
* productSocial helpers
*/

Template.productSocial.helpers({
  customSocialSettings: function() {
    var current, product, settings, _ref;
    product = selectedProduct();
    current = selectedVariant();
    settings = {
      placement: 'productDetail',
      faClass: '',
      faSize: 'fa-lg',
      media: Session.get('variantImgSrc'),
      url: window.location.href,
      title: current.title,
      description: (_ref = product.description) != null ? _ref.substring(0, 254) : void 0,
      apps: {
        facebook: {
          description: product.facebookMsg
        },
        twitter: {
          title: product.twitterMsg
        },
        googleplus: {
          itemtype: 'Product',
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

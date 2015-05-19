Template.productSocial.helpers
  customSocialSettings: ->
    product = selectedProduct()
    current = selectedVariant()
    settings =
      placement: 'productDetail'
      faClass: ''
      faSize: 'fa-lg'
      media: Session.get('variantImgSrc')
      url: window.location.href
      title: current.title
      description: product.description?.substring(0, 254)
      apps:
        facebook:
          description: product.facebookMsg
        twitter:
          title: product.twitterMsg
        googleplus:
          itemtype: 'Product'
          description: product.googleplusMsg
        pinterest:
          description: product.pinterestMsg
    return settings

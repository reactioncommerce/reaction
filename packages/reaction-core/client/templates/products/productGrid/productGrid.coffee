Media = ReactionCore.Collections.Media

Template.productGrid.helpers
  products: ->
    ###
    # take natural sort, sorting by updatedAt
    # then resort using positions.position for this tag
    # retaining natural sort of untouched items
    ###
    #sort method
    compare = (a, b) ->
      if a.position.position is b.position.position
        x = a.position.updatedAt
        y = b.position.updatedAt
        return (if x > y then -1 else (if x < y then 1 else 0))
      a.position.position - b.position.position

    share.tag = @tag?._id ? ""
    selector = {}
    if @tag
      hashtags = []
      relatedTags = [@tag]
      while relatedTags.length
        newRelatedTags = []
        for relatedTag in relatedTags
          if hashtags.indexOf(relatedTag._id) == -1
            hashtags.push(relatedTag._id)
            if relatedTag.relatedTagIds?.length
              newRelatedTags = _.union(newRelatedTags, Tags.find({_id: {$in: relatedTag.relatedTagIds}}).fetch())
        relatedTags = newRelatedTags
      selector.hashtags = {$in: hashtags}
    gridProducts = Products.find(selector).fetch()

    for gridProduct, index in gridProducts
      if gridProducts[index].positions? then gridProducts[index].position = (position for position in gridProduct.positions when position.tag is share.tag)[0]
      unless gridProducts[index].position
        gridProducts[index].position =
          position: "-"
          updatedAt: gridProduct.updatedAt

    ## helpful debug
    # for i,index in gridProducts.sort(compare)
    #   console.log index,i.position.position,i._id, i.title,i.position.updatedAt
    # return gridProducts
    return gridProducts.sort(compare)


Template.productGridItems.helpers
  media: (variant) ->
    # find first parent variant and default the image
    variants = (variant for variant in this.variants when not variant.parentId )
    if variants.length > 0
      variantId = variants[0]._id
      defaultImage = Media.findOne({'metadata.variantId':variantId, "metadata.priority": 0})
    if defaultImage
      return defaultImage
    else
      return false

Template.gridNotice.helpers
  
  isLowQuantity: () ->
    # product is low quantity if any parent variant is below its set threshold
    variants = (variant for variant in this.variants when not variant.parentId)
    if variants.length > 0
      for variant in variants
        if variant.inventoryQuantity <= variant.lowInventoryWarningThreshold
          return true
    else
      return false

  isSoldOut: () ->
    # product is only sold out if all parent variants are qty 0
    # and have inventory management turned on
    variants = (variant for variant in this.variants when not variant.parentId)
    if variants.length > 0
      for variant in variants
        if not variant.inventoryManagement or (variant.inventoryQuantity > 0)
          return false
      return true

  isBackorder: () ->
    # product is on backorder if all variants are sold out
    # and at least one does not deny when out of stock
    variants = (variant for variant in this.variants when not variant.parentId)
    if variants.length > 0
      for variant in variants
        if not variant.inventoryManagement or (variant.inventoryQuantity > 0)
          return false
      for variant in variants
        if not variant.inventoryPolicy
          return true
      return false

Template.productGridItems.events
  'click .clone-product': () ->
    title = @.title
    Meteor.call "cloneProduct", this, (error, productId) ->
      console.log error if error
      Router.go "product",
        _id: productId
      Alerts.add "Cloned " + title

  'click .delete-product': (event, template) ->
    event.preventDefault()
    maybeDeleteProduct @
    return

  'click .publish-product': () ->
    self = @
    if self.variants[0].price and self.variants[0].title and self.title
      Products.update self._id, {$set: {isVisible: !self.isVisible}}, (error,result) ->
        isVisible = Products.findOne(self._id).isVisible
        if isVisible is true
          visible = "visible"
        else
          visible = "hidden"
        Alerts.add self.title + " is now " + visible, "info", type: "prod-visible-" + self._id
    else
      Alerts.add "This product hasn't been configured yet, and cannot be made visible.", "danger", type: "prod-visible-" + self._id


Template.productGridItems.rendered = () ->
  # *****************************************************
  #  drag grid products and save tag+position
  # *****************************************************
  if Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
    productSort = $(".product-grid-list")
    productSort.sortable
        items: "> li.product-grid-item"
        cursor: "move"
        opacity: 0.5
        revert: true
        scroll: false
        update: (event, ui) ->
          productId = ui.item[0].id
          uiPositions = $(this).sortable("toArray",attribute:"data-id")
          index = _.indexOf uiPositions, productId
          #TODO: loop through and update each product position for this tag, we should do this with client update (vs method)
          for productId, index in uiPositions
            position =
              tag: share.tag
              position: index
              weight: 0
              updatedAt: new Date()
            Meteor.call "updateProductPosition", productId, position
          Deps.flush()


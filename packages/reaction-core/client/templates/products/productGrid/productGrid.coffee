# =============================================================================
# Product Grid

# ---------------------------------------------------------
# Product grid helpers
#
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
            #if relatedTag.relatedTagIds?.length
            #  newRelatedTags = _.union(newRelatedTags, Tags.find({_id: {$in: relatedTag.relatedTagIds}}).fetch())

        relatedTags = newRelatedTags
      selector.hashtags = {$in: hashtags}
    gridProducts = Products.find(selector).fetch()

    for gridProduct, index in gridProducts
      if gridProducts[index].positions? then gridProducts[index].position = (position for position in gridProduct.positions when position.tag is share.tag)[0]

      unless gridProducts[index].position
        gridProducts[index].position =
          position: 0
          weight: 0
          pinned: false
          updatedAt: gridProduct.updatedAt

    ## helpful debug
    # for i,index in gridProducts.sort(compare)
    #   console.log index,i.position.position,i._id, i.title,i.position.updatedAt
    # return gridProducts
    return gridProducts.sort(compare)




# =============================================================================
# Product Grid Items

# ---------------------------------------------------------
# Product grid item helpers
#
Template.productGridItems.helpers
  media: (variant) ->
    # find first parent variant and default the image
    variants = (variant for variant in this.variants when not variant.parentId )
    
    if variants.length > 0
      variantId = variants[0]._id
      defaultImage = ReactionCore.Collections.Media.findOne({
        'metadata.variantId': variantId, 
        'metadata.priority': 0
      })
    
    if defaultImage
      return defaultImage
    else
      return false

  #
  # Get additional images for a product card in the product grid
  #
  additionalMedia: (variant) ->

    variants = (variant for variant in this.variants when not variant.parentId )

    if variants.length > 0
      variantId = variants[0]._id
      mediaArray = ReactionCore.Collections.Media.find({
        'metadata.variantId':variantId,
        'metadata.priority': {
          '$gt': 0
        }
      }, {
        limit: 3
      })

    if mediaArray.count() > 1
      return mediaArray
    else
      return false

  weightClass: () ->
    switch this.position.weight
      when 1 then return 'product-medium'
      when 2 then return 'product-large'
      else return 'product-small'

  isMediumWeight: () ->
    if this.position.weight == 1
      return true
    return false

  isLargeWeight: () ->
    if this.position.weight == 3
      return true
    return false

  shouldShowAdditionalImages: () ->
    if this.isMediumWeight and this.mediaArray
      return true
    return false


# ---------------------------------------------------------
# Product grid item events
#
Template.productGridItems.events

  # *******************************************************
  # Show advanced options
  #
  'click .more-options': (event, template) ->
    event.preventDefault()

    # Data required for the product advanced controls
    Session.set('advancedControls', {
      type: 'product',
      data: this
    })

    # Create the popover and attach it to the body
    # We'll move it into place later
    Blaze.renderWithData(
      Template.productExtendedControls, 
      {
        shouldPopover: true,
        affectsTemplate: template,
        type: 'product'
      }, 
      $('body')[0]
    )

    return

  # *******************************************************
  # Create a copy if a product
  #
  # This clone is techincally a child of the parent it was 
  # cloned from.
  #
  'click .clone-product': () ->

    title = @.title

    Meteor.call "cloneProduct", this, (error, productId) ->
      
      throw new Meteor.Error "error cloning product", error if error
      
      Router.go "product",
        _id: productId

      Alerts.add "Cloned " + title,
        "success",
          'placement': "productManagement"
          'id': productId
          'i18n_key': "productDetail.cloneMsg"
          'autoHide': true
          'dismissable': false


  # *******************************************************
  # Remove the product
  'click .delete-product': (event, template) ->
    event.preventDefault()
    maybeDeleteProduct @
    return


  # *******************************************************
  # Sticky a product in position
  'click .pin-product': (event, template) ->
    event.preventDefault()

    # Toggle the pinned state
    if this.position.pinned is true
      pin = false
    else
      pin = true

    position = {
      tag: share.tag,
      pinned: pin,
      updatedAt: new Date()
    }

    Meteor.call "updateProductPosition", @._id, position
    Tracker.flush()


  # *******************************************************
  # Toggle the products weight
  # (makes the product bigger in size in the grid)
  'click .update-product-weight': (event, template) ->
    event.preventDefault()

    weight = this.position.weight || 0

    if weight < 2
      weight++
    else
      weight = 0

    position = {
      tag: share.tag,
      weight: weight,
      updatedAt: new Date()
    }

    Meteor.call "updateProductPosition", @._id, position
    Tracker.flush()


  # *******************************************************
  # Make the product visible to everyone
  # (toggles product visibility)
  'click .publish-product': () ->
    self = @
    Meteor.call "publishProduct", @._id, (error, result) ->
      if error
        Alerts.add error, "danger", placement: "productGridItem", 'id': self._id
        return
      if result is true
        Alerts.add self.title + " is now visible",
          "success",
            'placement': "productGridItem"
            'type': self._id
            'id': self._id
            'i18n_key': "productDetail.publishProductVisible"
            'autoHide': true
            'dismissable': false
      else
        Alerts.add self.title + " is hidden",
          "warning",
            'placement': "productGridItem",
            'type': self._id
            'id': self._id
            'i18n_key': "productDetail.publishProductHidden"
            'autoHide': true
            'dismissable': false


# =============================================================================
# Product Grid Notice

# ---------------------------------------------------------
# Product grid notice helpers
# 
# Shows various status informaton about a particular product
# (sold out, low quantity, etc)
#
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




# =============================================================================
# Product Grid Cintent

# ---------------------------------------------------------
# Product grid content helpers
# 
Template.gridContent.helpers
  displayPrice: () ->
    getProductPriceRange(@_id) if @_id




# =============================================================================
# Control bar

Template.gridControls.onRendered ->
  this.$('[data-toggle="tooltip"]').tooltip({position: 'top'})




# =============================================================================
# Popover controls for products

# ---------------------------------------------------------
# Extended controls popover
#
Template.productExtendedControls.onRendered ->

  # TODO: is jQuery the best way?
  # Before we show this popover, close all the others
  $(document).trigger('closeAllPopovers')

  # Close this popover and clean up
  $(document).on('closeAllPopovers', () => 
    Blaze.remove(this.view)
    tether.destroy()
  )

  # Tether this popover to the product card in the grid
  tether = new Tether({
    element: this.firstNode,
    target: this.data.affectsTemplate.firstNode,
    attachment: 'center left',
    targetAttachment: 'center right',
    constraints: [
      {
        to: 'scrollParent',
        attachment: 'together'
      }
    ]
  })


# ---------------------------------------------------------
# Extended controls popover events
#
Template.productExtendedControls.events
  
  'click .delete-product': (event, template) ->
    session = Session.get('advancedControls')

    # Attempt to delete if its actually a product
    if session.type is 'product'
      Blaze.remove(template.view)
      maybeDeleteProduct session.data

  'click .close': (event, template) ->
    Blaze.remove(template.view)



# =============================================================================
# Product Grid Items

# ---------------------------------------------------------
# Product grid item render
#
Template.productGridItems.onRendered  ->

  # *****************************************************
  #  drag grid products and save tag+position
  # *****************************************************
  if ReactionCore.hasPermission('createProduct')
    
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
              updatedAt: new Date()

            Meteor.call "updateProductPosition", productId, position

          Tracker.flush()



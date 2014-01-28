Template.variant.events
  "click .remove-link": (event, template) ->
    if confirm($(event.target).closest("a").data("confirm"))
      Products.update (currentProduct.get "product")._id,
        $pull:
          variants: template.data

  "click .edit-link": (event) ->
    $("#variants-modal").modal()

  "dblclick .variant-list": (event) ->
    $("#variants-modal").modal() if Roles.userIsInRole(Meteor.user(), "admin") or @isOwner

  "click .variant-list > *": (event) ->
    $('.variant-list #'+(currentProduct.get "variant")._id).removeClass("variant-detail-selected")
    this.index = $(event.target).closest("li").prevAll().length
    currentProduct.set "variant", this
    currentProduct.set "index", this.index
    $('.variant-list #'+this._id).addClass("variant-detail-selected")


Template.variant.helpers
  maxQty: () ->
    qty = 0
    variants = (currentProduct.get "product").variants
    _.map variants, (value,key) ->
      qty += variants[key].inventoryQuantity if variants[key].inventoryQuantity?
    qty

  maxLength: (max) ->
    if this.inventoryQuantity? and this.title?
      titleWidth = this.title.length
      inventoryPercentage = (this.inventoryQuantity / max) * 100
      console.log inventoryPercentage
      inventoryWidth = (inventoryPercentage - titleWidth)
      console.log inventoryWidth
      # inventoryWidth  = (100 - (this.title.length * 2)) if (inventoryPercentage  + this.title.length > 100)
      inventoryWidth
    else
      return "90"


Template.variantList.events
  "click #add-variant": (event) ->
    #clone last variant
    if _.last((currentProduct.get "product").variants)
      lastVariant = _.last((currentProduct.get "product").variants)
      delete lastVariant._id
      delete lastVariant.updatedAt
      delete lastVariant.createdAt
      delete lastVariant.inventoryQuantity
      delete lastVariant.title
      clonedLastVariant = _.clone(lastVariant)
    #If no existing variants, add new
    else
      clonedLastVariant =
        _id: Random.id()
        title: "New product variant"
        price: 0
    index = ((currentProduct.get "product").variants.length)
    Meteor.call "cloneVariant", (currentProduct.get "product")._id, clonedLastVariant, (error, result) ->
      Deps.flush()
      @setVariant result
      currentProduct.set "index",index

    #wait for the variant to succeed.
    setTimeout (->
      $("#variants-modal").modal()
    ), 500
    # DOM manipulation defer
    event.preventDefault()


Template.variantList.rendered = ->
  # *****************************************************
  # Editable variants entry
  # Format
  #    :description => 'Author of book',
  #    :namespace => 'book',
  #    :key => 'author',
  #    :value => 'Kurt Vonnegut',
  #    :value_type => 'string'
  # *****************************************************
  $("#variants").editable
    inputclass: "input-large"
    select2:
      width: "250px"
      initSelection: (element, callback) ->
        data = []
        data =
          id: "1"
          text: "text"

        callback data

      data: (element, callback) ->
        data = []
        data =
          id: "2"
          text: "text2"

        callback data

    success: (response, newValue) ->
      updateProduct variants: newValue

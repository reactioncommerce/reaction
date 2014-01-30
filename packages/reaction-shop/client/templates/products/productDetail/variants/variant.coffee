Template.variant.helpers
  progressBar: () ->
    if @.inventoryPercentage <= 10 then "progress-bar-danger"
    else if @.inventoryPercentage <= 30 then "progress-bar-warning"
    else "progress-bar-success"

Template.variant.events
  "click .remove-variant": (event, template) ->
    if confirm($(event.target).closest("a").data("confirm"))
      Products.update (currentProduct.get "product")._id,
        $pull:
          variants:
            _id: @._id

  "click .edit-variant": (event) ->
    event.preventDefault()
    $('#variant-edit-form-'+@._id).toggle()

  "dblclick .variant-list": (event) ->
    event.preventDefault()
    if Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
      $('#variant-edit-form-'+@._id).toggle()

  "click .variant-list > *": (event) ->
    $('.variant-list #'+(currentProduct.get "variant")._id).removeClass("variant-detail-selected")
    this.index = $(event.target).closest("li").prevAll().length
    currentProduct.set "variant", this
    currentProduct.set "index", this.index
    $('.variant-list #'+this._id).addClass("variant-detail-selected")

  "click .clone-variant": (event,template) ->
    #clone last variant
    newVariant = _.clone @
    delete newVariant._id
    delete newVariant.updatedAt
    delete newVariant.createdAt
    delete newVariant.inventoryQuantity
    delete newVariant.inventoryTotal
    delete newVariant.inventoryPercentage
    delete newVariant.inventoryWidth
    delete newVariant.title

    index = ((currentProduct.get "product").variants.length)
    Meteor.call "cloneVariant", (currentProduct.get "product")._id, newVariant, (error, result) ->
      Deps.flush()
      @setVariant result
      currentProduct.set "index",index

    template = Meteor.render Template.variantFormModal @
    $('#variant-'+@._id).html(template)
    #wait for the variant to succeed.
    # setTimeout (->
    #   $("#variants-modal").modal()
    # ), 500
    # DOM manipulation defer
    event.preventDefault()

Template.variantList.helpers
  variants: () ->
    inventoryTotal = 0
    (inventoryTotal +=  variant.inventoryQuantity) for variant in @.variants
    for variant in @.variants
      @variant
      variant.inventoryTotal = inventoryTotal
      variant.inventoryPercentage = parseInt((variant.inventoryQuantity / inventoryTotal) * 100)
      variant.inventoryWidth = parseInt((variant.inventoryPercentage - variant.title?.length ))
    @.variants

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


Template.variantList.events
  "click #create-variant": (event) ->
    newVariant= [
            {
              _id: Random.id()
              title: ""
              price: 0.00
            }
          ]
    Products._collection.update(@._id,{$set:{variants:newVariant}})

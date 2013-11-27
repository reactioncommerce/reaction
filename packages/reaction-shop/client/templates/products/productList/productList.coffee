#**********************************************************************************************************
# All product js is here.
#**********************************************************************************************************

# *****************************************************
# general helper to return products data
# returns object
# *****************************************************
Template.productGrid.helpers
  products: ->
    Products.find()

Template.productList.helpers
  products: ->
    Products.find()

Template.productGrid.rendered = ->
  new Packery(document.querySelector('.productGrid'), {gutter: 2})

Template.productListGrid.events
  'click #productListView': ->
    $('.productGrid').hide()
    $('.productList').show()

Template.productListGrid.events
  'click #productGridView': ->
    $('.productList').toggle()
    $('.productGrid').show()

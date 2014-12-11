###
# Spiderable method to set meta tags for crawl
# accepts current iron-router route
###
ReactionCore.MetaData =
  settings: {
    title: ''
    meta: []
    ignore: ['viewport','fragment']
  }
  #render and append new metadata
  render:(route) ->
    metaContent =  Blaze.toHTMLWithData(Template.coreHead, Router.current().getName )
    $('head').append(metaContent)
    return  metaContent


  #clear all previously added metadata
  clear: ->
    $("title").remove()
    for m in $("meta")
      $m = $(m)
      property = $m.attr('name') or $m.attr('property')
      if property and property not in ReactionCore.MetaData.settings.ignore
        $m.remove()

  # update meta data
  update: (route, params, meta) ->
    return false unless Router.current()

    product = selectedProduct()
    shop = Shops.findOne(ReactionCore.shopId)
    meta = []
    title = ""
    # set meta data
    ReactionCore.MetaData.name = shop.name if shop?.name
    # tag/category titles
    if params._id
      title = params._id.charAt(0).toUpperCase() + params._id.substring(1)
    else
      routeName = Router.current().route.getName() #route name
      title = routeName.charAt(0).toUpperCase() + routeName.substring(1) # Uppercase
    # product specific
    if product and product.handle is params._id
      meta.push 'name': 'description', 'content': product.description
      keywords = (key.value for key in product.metafields)
      meta.push 'name': 'keywords',  'content': keywords.toString()
      title = product.title
    else
      meta.push 'description': shop.description if shop?.description
      meta.push 'keywords': shop.keywords if shop?.keywords
    #export meta to ReactionCore.MetaData
    ReactionCore.MetaData.title = title
    ReactionCore.MetaData.meta = meta

  #wrap clear,update,render into single method
  refresh: (route, params, meta) ->
    ReactionCore.MetaData.clear(route)
    ReactionCore.MetaData.update(route, params, meta)
    ReactionCore.MetaData.render(route)
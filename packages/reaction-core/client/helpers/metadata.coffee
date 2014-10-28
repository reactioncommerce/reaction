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
    metaContent =  Blaze.toHTMLWithData(Template.coreHead, route)
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
  update: (route, meta) ->
    return false unless route
    product = selectedProduct()
    meta = []
    # set meta data
    ReactionCore.MetaData.title = route.name.charAt(0).toUpperCase() + route.name.substring(1)
    if product
      meta.push 'name': 'description', 'content': product.description
      keywords = (key.value for key in product.metafields)
      meta.push 'name': 'keywords',  'content': keywords.toString()
      ReactionCore.MetaData.title = product.title
    else
      meta.push 'description': "This description"
    #export meta to ReactionCore.MetaData
    ReactionCore.MetaData.meta = meta
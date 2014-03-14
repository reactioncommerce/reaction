###
# quick and easy snippet for toggling sessions
###
@toggleSession = (session_variable) ->
  if Session.get(session_variable)
    Session.set session_variable, false
  else
    Session.set session_variable, true
  return

###
# method to return tag specific product
###
@getProductsByTag = (tag) ->
  selector = {}
  if tag
    tagIds = []
    relatedTags = [tag]
    while relatedTags.length
      newRelatedTags = []
      for relatedTag in relatedTags
        if tagIds.indexOf(relatedTag._id) == -1
          tagIds.push(relatedTag._id)
          if relatedTag.relatedTagIds?.length
            newRelatedTags = _.union(newRelatedTags, Tags.find({_id: {$in: relatedTag.relatedTagIds}}).fetch())
      relatedTags = newRelatedTags
    selector.tagIds = {$in: tagIds}
  cursor = Products.find(selector)

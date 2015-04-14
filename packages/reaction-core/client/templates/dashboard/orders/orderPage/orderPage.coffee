Template.orderPage.events
  'click .save-order-pdf': () ->
    saveOrderAsPDF Orders.findOne(this._id)
    return
  'click .save-label-pdf': () ->
    #TODO: Add label printing capability
    return
  'click .btn-add-note': (event, template) ->
    date = new Date()
    content = template.find("textarea[name=note]").value
    note = 
      content: content,
      userId: Meteor.userId()
      updatedAt: date
    if @.notes 
      if note.content && note.content != @.notes[@.notes.length-1].content
        Orders.update @._id,
          $addToSet:
            "notes": note
    else if note.content
      Orders.update @._id,
        $addToSet:
          "notes": note
    return
Template.orderPage.helpers
  getNote: ->
    if @.notes
      latestNote = @.notes.length - 1
      return @.notes[latestNote].content
    else 
      return
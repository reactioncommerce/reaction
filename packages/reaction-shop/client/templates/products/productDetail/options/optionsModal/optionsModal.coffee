Template.optionsModal.default =
  cls: "form-group-template"
  key: "__KEY__"
  nameFieldAttributes: "disabled=\"disabled\""
  defaultValueFieldAttributes: "disabled=\"disabled\""

Template.optionsModal.rendered = ->

Template.optionsModal.events
  "click .add-option-link": (e, template) ->
    $template = $(e.target).closest(".row").prev(".form-group-template")
    html = $("<div />").append($template.clone()).html()
    html = html.replace(/__KEY__/g, template.findAll(".form-group").length - 1).replace("form-group-template", "option-form-group")
    $template.before html
    _.defer ->
      $formGroup = $template.prev()
      $formGroup.find("input").prop "disabled", false
      $formGroup.find(".label-form-control").focus()

    # DOM manipulation defer
    e.preventDefault()

  "click .remove-button": (e, template) ->
    $(e.target).closest(".form-group").remove()
    $(template.find("form")).find("input").each (index, input) ->
      $input = $(input)
      embeddedDocumentIndex = Math.floor(index / 2)
      _.each [
        "id"
        "name"
      ], (attr) ->
        $input.attr attr, $input.attr(attr).replace(/\d+/, embeddedDocumentIndex)


    e.preventDefault()
    e.stopPropagation()

  "submit form": (e, template) ->
    form = template.find("form")
    $form = $(form)
    data = $form.serializeHash()
    Products.update Session.get("currentProductId"),
      $set: data
    ,
      validationContext: "options"
    , (error, result) ->
      $form.find(".has-error").removeClass "has-error"
      $form.find(".error-block li").remove()
      if error
        invalidKeys = Products.namedContext("options").invalidKeys()
        _.each invalidKeys, (invalidKey) ->
          id = invalidKey.name.replace(/\./g, "-")
          $formGroup = $form.find("#" + id).closest(".form-group")
          $errorBlock = undefined
          if $formGroup
            $errorBlock = $formGroup.find(".error-block")
            $formGroup.addClass "has-error"
          else
            $errorBlock = $form.find(".error-block")
          $errorBlock.append "<li>" + invalidKey.message + "</li>"

      else
        $(template.find(".modal")).modal "hide" # manual hide fix for Meteor reactivity



variantSchema = new AutoForm ProductVariantSchema

Template.variantForm.helpers
  variantFormSchema: ->
    variantSchema
  data: ->
    @
  nowDate: ->
    new Date()
  inventoryManagementOptions: ->
    options = [
      {label: "Manual",value: "manual"},
      {label: "Reaction",value: "reaction"}
    ]
    options
  inventoryPolicyOptions: ->
    options = [
      {label: "Continue",value: "continue"},
      {label: "Deny",value: "deny"}
    ]
    options

Template.variantForm.events
  "change [name=checkbox-im]": (event, template) ->
    inventoryManagement = ""
    _.each template.findAll("[name=checkbox-im]:checked"), (checkbox) ->
      inventoryManagement += checkbox.value + ", "

    inventoryManagement = inventoryManagement.slice(0, -2)  if inventoryManagement.length
    $(template.find("[data-schema-key=inventoryManagement]")).val inventoryManagement

  "reset form": (event, template) ->
    $(template.find("[data-schema-key=inventoryManagement]")).val ""
# UserProfile = new Meteor.Collection("UserProfile")
Meteor.subscribe "UserProfile",this.userId

Template.orders.helpers
  orders: () ->
    Orders.find()

  fulfillmentStatus: () ->
    fulfillmentStatus = [
      { value: "new", label: "new" }
      { value: "new", label: "new" }
      { value: "new", label: "new" }
    ]

  fulfillmentWorkflow: ->
    fulfillmentWorkflow = [
      { value: "new", title: "NEW", next: "new" }
      { value: "packed", title: "PICK N PACK", next: "shipped", required: true  }
      { value: "shipped", label: "SHIPPED" }
      { value: "servicing", label: "CM" }
    ]
    fulfillmentWorkflow

Template.orderDetail.helpers
  userProfile: (userId) ->
    userId = this.userId
    Meteor.subscribe "UserProfile",userId
    Users.findOne userId

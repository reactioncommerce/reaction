
###
#  Cart Methods
###
Meteor.methods
  "cart/processPayment": (paymentMethod) ->
    ReactionCore.Events.info 'Begin Process Payment'
    check paymentMethod, Object
    # @unblock()

    # before payment really should be async
    cartId = Cart.findOne()._id

    # Step 1:
    Meteor.call "paymentMethod", cartId, paymentMethod, (error, result) ->

      # Original order ID
      orderId = result

      if error
        throw new Meteor.Error "An error occurred saving the payment method", error
        return

      # Step 2
      Meteor.call "copyCartToOrder", cartId, (error, result) ->

        ReactionCore.Events.info 'Attempt to copy cart to order:', result

        if error
          throw new Meteor.Error "An error occurred saving the order", error
          return

        ReactionCore.Events.info '-- (SUCCESS) Copy cart to order:', result
        ReactionCore.Events.info 'Attempt to adjust inventory for order:', result

        # Step 4
        # go to order success
        Meteor.call "inventoryAdjust", orderId, (error, result) ->
          console.log 'Attempt to show completion page', error, result

          if error
            throw new Meteor.Error "An error occurred while updating inventory", error
            return

          # return unless orderId

          console.log 'Show Completion page with orderID: ', orderId

          # ******** FINISH  ********
          Router.go "cartCompleted", _id: orderId

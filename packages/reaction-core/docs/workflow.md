#ReactionWorkflow

# Shops.defaultWorkflows

```
    "defaultWorkflows": [
        {
            "provides": "simple",
            "workflow": [
                "checkoutLogin",
                "checkoutAddressBook",
                "coreCheckoutShipping",
                "checkoutReview",
                "checkoutPayment",
                "checkoutCompleted"
            ]
        }
    ]
```

Where "provides" is the name of the the matching product types, and the workflow array contains an ordered array of independant workflow templates that will apply for this product during checkout.

`Product.type = 'simple' #by default`

On checkout, review product.type (s) and merge matching workflows into single workflow (could also later be a grouped cart flow)

So if you had an item.type = 'simple' and item.type = 'download' and the download workflow was defined as:

```
    "defaultWorkflows": [
        {
            "provides": "download",
            "workflow": [
                "checkoutLogin",
                "checkoutReview",
                "checkoutPayment",
                "checkoutDownload"
            ]
        }
    ]
```

If the cart then has two items, one 'download' and one 'simple' you would end up with a merged workflow
1. "checkoutLogin"
2. "checkoutAddressBook"
3. "coreCheckoutShipping"
4. "checkoutReview"
5. "checkoutPayment"
6. "checkoutDownload"
7. "checkoutCompleted"

Where each workflow entry represents the appearance order and the template to load.

##Client helpers See: `client/helpers/cart.coffee`

###cartWorkFlow Describes current status of cart checkout workflow. Returns object with workflow, status(boolean)

###cartWorkflowPosition Returns index+1 for actual "human" workflow order.

###cartWorkflowCompleted

Returns false if the currently active status has not yet been set in the cart.

##Meteor.methods

See:  `server/methods/cart.coffee`

##

'layout/pushWorkflow', 'coreCartWorkflow', workflowSte

`Meteor.call('layout/pushWorkflow', workflow , status, cartId, userId)`

`workflow` and `status` are required.

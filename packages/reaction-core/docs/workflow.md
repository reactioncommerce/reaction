# Layout and Workflows
Reaction template display (layout) and workflow rules are created and stored in the Package registry.

A workflow is essentially a registry entry with the following properties:
- It does not control routes anywhere.
- only used for views
- For each workflow in the package registry
  - needs to be a stored status, workflow on the target collection
  - exists cart.workflow, orders.workflow
  - the template helper

- parallel split pattern
- audience is just another label for 'permissions', essentially just permissions for UIX.
- can be used to control page layout for the content manager
- does it make sense that audience could be used to control different check out, different product views,  for users with different roles..
- status and workflow combine to create a workflow state (status = where I am, workflow = [where I've been])
- has a detailed enough dataset to trigger events from analytics events
- to disable a workflow template you'd just remove audience roles
- a registry entry is a functional components
- a workflow controls "the how and where" of layout components
- routes can be dynamically generated from registry

Example package.layout and package.layout.workflow definition:

## Shops Collection

```
  "layout" : [
      {
          "layout" : "coreLayout",
          "workflow" : "coreLayout",
          "theme" : "default",
          "enabled" : true
      },
      {
          "layout" : "coreLayout",
          "workflow" : "coreCartWorkflow",
          "theme" : "default",
          "enabled" : true
      },
      {
          "layout" : "coreLayout",
          "workflow" : "coreOrderWorkflow",
          "theme" : "default",
          "enabled" : true
      }
  ]
```

## Package Registry
**Available in the Packages collection, ie: `package.layout`**

```json

  layout: [
    {
      template: "checkoutLogin",
      label: "Account",
      provides: 'coreCartWorkflow',
      container: 'cartWorkflow.main',
      audience: ["guest", "anonymous"]
    },
    {
      template: "checkoutAddressBook",
      label: "Address Details",
      provides: 'coreCartWorkflow',
      container: 'cartWorkflow.main',
      audience: ["guest", "anonymous"]
    },
    {
      template: "coreCheckoutShipping",
      label: "Shipping Options",
      provides: 'coreCartWorkflow',
      container: 'cartWorkflow.main',
      audience: ["guest", "anonymous"]
    },
    {
      template: "checkoutReview",
      label: "Review",
      provides: 'coreCartWorkflow',
      container: 'cartWorkflow.aside',
      audience: ["guest", "anonymous"]
    },
    {
      template: "checkoutPayment",
      label: "Complete",
      provides: 'coreCartWorkflow',
      container: 'cartWorkflow.aside',
      audience: ["guest", "anonymous"]
    },
    {
      template: "orderCreated",
      label: "Created",
      provides: 'coreOrderWorkflow'
    },
    {
      template: "shipmentTracking",
      label: "Tracking",
      provides: 'coreOrderWorkflow'
    },
    {
      template: "shipmentPrepare",
      label: "Preparation",
      provides: 'coreOrderWorkflow'
    },
    {
      template: "processPayment",
      label: "Process Payments",
      provides: 'coreOrderWorkflow'
    },
    {
      template: "shipmentShipped",
      label: "Shipped",
      provides: 'coreOrderWorkflow'
    },
    {
      template: "orderCompleted",
      label: "Completed",
      provides: 'coreOrderWorkflow'
    },
    {
      template: "orderAdjustments",
      label: "Adjusted",
      provides: 'coreOrderWorkflow'
    }
  ]
```

## Collection Workflows
For each collection using a workflow, a workflow schema is attached.  The state/status of a workflow is stored as an object on each document in the collection.

```
"workflow" : {
    "status" : "checkoutLogin"
    "workflow": ["new", "checkoutLogin"]
},
```

Where **status** is the current workflow, and **workflow** are the workflow steps that have begun, or finished processing.

If `workflow.workflow` contains the current `workflow.status`, that means the workflow is processing, and when status now longer contains the workflow, but it exists in `workflow.workflow` the workflow has been completed.

## Workflow Schema
For reference, the Workflow schema is:

```
ReactionCore.Schemas.Workflow = new SimpleSchema({
  template: {
    type: String,
    optional: true
  },
  label: {
    type: String,
    optional: true
  },
  provides: {
    type: String,
    optional: true
  },
  audience: {
    type: [String],
    optional: true
  },
  status: {
    type: String,
    optional: true
  },
  workflow: {
    type: [String],
    optional: true
  }
});
```

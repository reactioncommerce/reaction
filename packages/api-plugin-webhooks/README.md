## Summary
Webhooks plugin for the [Reaction API](https://github.com/reactioncommerce/reaction)

## Brief overview
Webhooks notify applications when specific events occur on a Reaction store.
This plugin exposes graphQL API to register, update & deregister webhooks.
Following events types are supported

```
AFTER_PRODUCT_CREATE
AFTER_PRODUCT_UPDATE
AFTER_PRODUCT_SOFT_DELETE
AFTER_VARIANT_CREATE
AFTER_VARIANT_UPDATE
AFTER_VARIANT_SOFT_DELETE
AFTER_TAG_CREATE
AFTER_TAG_UPDATE
AFTER_TAG_DELETE
AFTER_SET_TAG_HERO_MEDIA
```
## Usage

### Register a webhook

To create a webhook, use registerWebhook mutation. Set the topic equal to the Name of the webhook you want to create.

```graphql
mutation {
  registerWebhook(input: {
    topic: AFTER_PRODUCT_CREATE,
    address: "https://83e1-103-208-69-14.in.ngrok.io/webhooks",
    shopId: "gEyjEpYWGJWxFWBzj"
  }) {
    webhook {
      _id
      address
      topic
      createdAt
      updatedAt
    }
  }
}
```

When a webhook is triggered, plugin will POST a payload containing event details to the destination address.

### Update a webhook

To update a webhook, use updateWebhook mutation. Webhook address or shopId can be updated.

```graphql
mutation {
  updateWebhook(input: {
    id:"cmVhY3Rpb24vd2ViaG9vazprQTRMR01XQ0N5ODhxSFBRWQ=="
    shopId: "qE5gG2c3SzjjTLrGj"
    address: "https://250d-103-208-69-14.in.ngrok.io/webhooks"
  }) {
    webhook {
      _id
      address
      updatedAt
    }
  }
}
```

### Deregister a webhook

Webhook can be de-registered using deregisterWebhook mutation.

```graphql
mutation {
  deregisterWebhook(input: {
    id: "cmVhY3Rpb24vd2ViaG9vazprQTRMR01XQ0N5ODhxSFBRWQ=="
  }) {
    webhook {
      _id
      address
      topic
      createdAt
      updatedAt
    }
  }
}
```
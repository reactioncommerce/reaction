# api-plugin-fulfillment

This is the base fulfillment plugin which would enable other fulfillment types (like shipping, pickup, digital) and fulfillment-methods (like shipping, store, download etc) to be introduced via their own separate plugins. This plugin provides the common functionalities required for implementing fulfillment.

Each of the newly introduced fulfillment type plugin would need to have the specific fulfillment methods also to be added as separate plugins. Example, fulfillment type 'pickup' could have fulfillment methods like 'store pickup' and 'curb-side pickup' and each of them would be separate plugins.
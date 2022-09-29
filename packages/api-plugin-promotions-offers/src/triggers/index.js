import noopTriggerHandler from "./noopTriggerHandler.js";
import offerTriggerHandler from "./offerTriggerHandler.js";

export default [
  { key: 'noop', handler: noopTriggerHandler },
  { key: 'offers', handler: offerTriggerHandler }
]

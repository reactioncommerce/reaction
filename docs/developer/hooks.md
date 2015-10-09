# Hooks

The method hooks utlized in ReactionCore are based on [Workpop/meteor-method-hooks
](https://github.com/Workpop/meteor-method-hooks) which itself is based on [hitchcott/meteor-method-hooks](https://github.com/hitchcott/meteor-method-hooks)

Much of this documentation is forked from or based on [Workpop/meteor-method-hooks
](https://github.com/Workpop/meteor-method-hooks) docs.

ReactionCore method hooks allow you to interact with a ReactionCore method **before** and **after** the method is called.
You can pass either a single method name and hook function or pass a dictionary of `Object.<string, hook>` like you were setting up
original Meteor methods.

ReactionCore order hooks are called in the following order:

1) **Before** hooks `before` and `beforeMethods`

2) The original method body

3) **After** hooks `after` and `afterMethods` 
*note these hooks occur regardless of error but you can catch errors within your hook function*

4) Callbacks, if any.

### Components of the Reaction Hook

There are four properties that are accessible within the ReactionCore method hooks options parameter:

1) `result` - the result of the method you called *note in before hooks, this will be undefined*

2) `error` - if the method executed returned an error, else will be undefined.

3) `arguments` - An array of the argument passed into the method. This can be accessed via options.arguments[0]

4) `hooksProcessed` - A counter of how many times the method has been modified.

### Example

#### Single Method Hook Example:
This example hooks into the `orders/orderCompleted` method which takes one parameter `order` which is an Order object

```javascript

/**
 A hook to be run before or after a method.
 @name Hook
 @function
 @param {{result: *, error: *, arguments: Array, hooksProcessed: Number}}
 @return {*} The result of the method
  An options parameter that has the result and error from calling the method
  and the arguments used to call that method. `result` and `error` are null
  for before hooks, since the method has not yet been called. On the client,
  after hooks are called when the method returns from the server, but before
  the callback is invoked. `hooksProcessed` gives you the number of hooks
  processed so far, since previous hooks may have mutated the arguments.

  After hooks can change the result values. Use `hooksProcessed` to keep
  track of how many modifications have been made.
 */

  // pass a method name and a hook function
  ReactionCore.MethodHooks.after('orders/orderCompleted', function(options){

    // after function here
    
    // options.arguments is an array that carries all params on the original method.
    // For example with `orders/orderCompleted` the order param is the first (and only) param.
    var order = options.arguments[0];

    console.log('Results:', options.result); //Result of orderCompleted method
    console.log('Error:', options.error); // original method Error or `undefined` if successful
    console.log('arguments[0]:', order); // first param from original method (order object in this case)
    console.log('hooksProcessed:', options.hooksProcessed); // Tracker that looks at amount times result was modified previously
    
    // To be safe, return the options.result in an after hook.
    return options.result;
  };

/* 
// CONSOLE
*/
Results: 1
Error: undefined
arguments[0]: {_id: 'a123456ABC', etc: {}}}
hooksProcessed: 0 

// You can also pass a dictionary of Object.<String, Hook> like typical Meteor.methods.
// The two functions available are `ReactionCore.MethodHooks.beforeMethods` and `ReactionCore.MethodHooks.afterMethods`.
//
// Original example method: "cart/addToCart": function (cartId, productId, variantData, quantity)
//
ReactionCore.MethodHooks.afterMethods({
  "cart/addToCart": function(options) {
    // The hook will run even if the method threw an error, so you must always check for an error!
    if (options.error) {
      return;
    }
    
    const cartId = options.arguments[0];
    const productId = options.arguments[1];
    const variantData = options.arguments[2];
    const quantity = options.arguments[3];
    
    // Do something after something is addedToCart

    // You should return the result at the end of an after. You will receive a warning if a result was expected.
    return options.result;
  }
});
```

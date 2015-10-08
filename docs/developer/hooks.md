# Hooks

The method hooks utlized in ReactionCore are based from [Workpop/meteor-method-hooks
](https://github.com/Workpop/meteor-method-hooks) which is based on [hitchcott/meteor-method-hooks](https://github.com/hitchcott/meteor-method-hooks)

ReactionCore method hooks are offered **before** and **after** the method is called. They can be utilized as a single function attached to method or as a dictionary of objects attached to the method.

ReactionCore order hooks are called in the following order:

1) **Before and BeforeMethods**

2) The actual method

3) **After and AfterMethods** *note these occure regardless of error*

4) Callbacks

###Components of the Reaction Hook

There are four key's that are included in the Reaction Hook:

1) **Result** - the result of the method you called *note in before hooks, this will be undefined*

2) **Error** - if the method executed returned an error, else will be undefined.

3) **Arguments** - An array of the argument passed into the method. This can be accessed via options.arguments[0]

4) **hooksProcessed** - A counter of how many times the method has been modified.

### Example and Returns

#### Example:
```javascript
  ReactionCore.MethodHooks.after('orders/orderCompleted', function(options){

    // Your after function would go here:

    console.log('Results:', options.result);
    console.log('Error:', options.error);
    var order = options.arguments[0];
    console.log('Arguments:', order);
    console.log('hooksProcessed:', options.hooksProcessed);
  };

```
#### Returns:
```javascript
  Results: 1 // Result of orderCompleted Method
  Error: undefined // Verifiction that method was succcessful
  Argument: {Order Object} // First argument that was passed into OrderCompleted
  hooksProcessed: 0 // Tracker that looks at amount times result was modified previously

```

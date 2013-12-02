Meteor.subscribe 'products'
Meteor.subscribe 'orders'
Meteor.subscribe 'customers'


Deps.autorun ->
  if Session.get('serverSession')
    Meteor.subscribe 'cart', Session.get('serverSession')._id
Meteor.subscribe 'staff'
Meteor.subscribe 'products'
Meteor.subscribe 'orders'
Meteor.subscribe 'customers'
Meteor.subscribe 'tags'


Deps.autorun ->
  if Session.get('serverSession')
    Meteor.subscribe 'cart', Session.get('serverSession')._id

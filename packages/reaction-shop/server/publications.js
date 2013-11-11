// *****************************************************
// product collection
// *****************************************************

Meteor.publish('products', function () {
    return Products.find();
});

Meteor.publish('product', function (id) {
    return Products.findOne({_id: id});
});

// *****************************************************
// Client access rights for products
// *****************************************************
Products.allow({
    insert: function (userId, doc) {
        // the user must be logged in, and the document must be owned by the user
        //return (userId && doc.owner === userId);
        return true;
    },
    update: function (userId, doc, fields, modifier) {
        // can only change your own documents
        return true;
        //return doc.owner === userId;
    },
    remove: function (userId, doc) {
        // can only remove your own documents
        return doc.owner === userId;
    }
    //fetch: ['owner']
});

// *****************************************************
// orders collection
// *****************************************************

Meteor.publish('orders', function () {
    return Orders.find();
});

Meteor.publish('order', function (id) {
    return Orders.findOne({_id: id});
});

// *****************************************************
// Client access rights for orders
// *****************************************************
Orders.allow({
    insert: function (userId, doc) {
        // the user must be logged in, and the document must be owned by the user
        //return (userId && doc.owner === userId);
        return true;
    },
    update: function (userId, doc, fields, modifier) {
        // can only change your own documents
        return true;
        //return doc.owner === userId;
    },
    remove: function (userId, doc) {
        // can only remove your own documents
        return doc.owner === userId;
    }
    //fetch: ['owner']
});


// *****************************************************
// customers collection
// *****************************************************

Meteor.publish('customers', function () {
    return Customers.find();
});

Meteor.publish('customer', function (id) {
    return Customers.findOne({_id: id});
});

// *****************************************************
// Client access rights for customers
// *****************************************************
Customers.allow({
    insert: function (userId, doc) {
        // the user must be logged in, and the document must be owned by the user
        //return (userId && doc.owner === userId);
        return true;
    },
    update: function (userId, doc, fields, modifier) {
        // can only change your own documents
        return true;
        //return doc.owner === userId;
    },
    remove: function (userId, doc) {
        // can only remove your own documents
        return doc.owner === userId;
    }
    //fetch: ['owner']
});




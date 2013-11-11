// *****************************************************
// general helper to count data for nav badges
// returns int
// *****************************************************
Template.shopnav.helpers({
    pcount: function () {
        return Products.find().count();
    },
    ocount: function () {
        return Orders.find().count();
    },
    ccount: function () {
        return Customers.find().count();
    }
});

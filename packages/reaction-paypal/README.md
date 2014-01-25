reaction-paypal
=============

This is based on David Brear's [meteor-paypal](https://github.com/DavidBrear/meteor-paypal.git)
but heavily refactored for Reaction.

Meteor/Reaction Package for Paypal integration


### Usage
```console
mrt add reaction-
paypal
```

#### Basic

Format is `Meteor.Paypal.*transaction_type*({ {/*card data*/}, {/*transaction data*/}, function(err, res){...})`

```javascript
  Meteor.Paypal.authorize({
      name: 'Buster Bluth',
      number: '4111111111111111',
      cvv2: '123',
      expire_year: '2015',
      expire_month: '01'
    },
    {
      total: '100.10',
      currency: 'USD'
    },
    function(error, results){
      if(error)
        //Deal with Error
      else
        //results contains boolean for saved
        // and a payment object with information about the transaction
    });
```

For information on the **payment** object returned see [Paypal's Payment Option Documentation](https://developer.paypal.com/webapps/developer/docs/api/#common-payments-objects)

Transaction types are: `Meteor.Paypal.authorize` and
`Meteor.Paypal.purchase` for the difference, see [Paypal's
Documentation](https://developer.paypal.com/webapps/developer/docs/api/#payments)
#### Extras

Include `{{> paypalCreditCardForm }}` in a template. In the template's javascript file, include:
``` javascript
  Template.paypalCreditCardForm.events({
    'submit #paypal-payment-form': function(evt, tmp){
      evt.preventDefault();

      var card_data = Template.paypalCreditCardForm.card_data();

      //Probably a good idea to disable the submit button here to prevent multiple submissions.

      Meteor.Paypal.purchase(card_data, {total: '100.50', currency: 'USD'}, function(err, results){
        if (err) console.error(err);
        else console.log(results);
      });
    }
  });
```

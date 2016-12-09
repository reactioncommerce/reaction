import { Packages } from "/lib/collections";
import { ShippoPackageConfig } from "../../lib/collections/schemas";
import shippoModule from 'shippo';

Meteor.methods({
  "shippo/updateApiKey"(modifier, _id) {
    // Important server-side check for security and data integrity
    check(modifier, ShippoPackageConfig);
    check(_id, String);
    let shippoApiKey = modifier.$set["settings.api_key"];
    let shippo = shippoModule(shippoApiKey);

    shippo.address.list().then(function(address){
      console.log("addreses : %s", JSON.stringify(address));
    }, function(err) {
      console.log("There was an error creating transaction : %s", err.detail);
    });

    if (shippo) {
      console.log('euge');
      console.log(shippo);
    } else {
      console.log('skatoules');
    }

    //return Packages.update(_id, modifier);

    // let shippo = shippoModule('shippo_test_34a14d633bd04f39faf27b6d136b87f5264f513f');
    // console.log(shippo);
    //
    // let shippo2 = shippoModule('asdfasdfasdfsdffas');
    // console.log("I am shippo2":shippo2);
    // console.log("I am the end of shippo2");



    return Packages.update(_id, modifier);
    // // Build the e-mail text
    // var text = "Name: " + doc.name + "\n\n"
    //   + "Email: " + doc.email + "\n\n\n\n"
    //   + doc.message;
    //
    // this.unblock();
    //
    // // Send the e-mail
    // Email.send({
    //   to: "test@example.com",
    //   from: doc.email,
    //   subject: "Website Contact Form - Message From " + doc.name,
    //   text: text
    // });
  }
});

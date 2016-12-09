import "./init";
import "./methods/methods.js";
//import shippoModule from 'shippo';
// let shippo = shippoModule('shippo_test_34a14d633bd04f39faf27b6d136b87f5264f513f');
//
// var addressFrom  = {
//   "object_purpose":"PURCHASE",
//   "name":"Ms Hippo",
//   "company":"Shippo",
//   "street1":"215 Clayton St.",
//   "city":"San Francisco",
//   "state":"CA",
//   "zip":"94117",
//   "country":"US", //iso2 country code
//   "phone":"+1 555 341 9393",
//   "email":"ms-hippo@goshippo.com",
// }
//
// // example address_to object dict
// var addressTo = {
//   "object_purpose":"PURCHASE",
//   "name":"Mr Hippo",
//   "company":"London Zoo",
//   "street1":"Regent's Park",
//   "street2":"Outer Cir",
//   "city":"LONDON",
//   "state":"",
//   "zip":"NW1 4RY",
//   "country":"GB", //iso2 country code
//   "phone":"+1 555 341 9393",
//   "email":"mrhippo@goshippo.com",
//   "metadata" : "Hippos dont lie"
// }
//
// // parcel object dict
// var parcel = {
//   "length":"5",
//   "width":"5",
//   "height":"5",
//   "distance_unit":"in",
//   "weight":"2",
//   "mass_unit":"lb",
// }
//
// // example CustomsItems object. This is required for int'l shipment only.
// var customsItem = {
//   "description":"T-Shirt",
//   "quantity":2,
//   "net_weight":"0.3",
//   "mass_unit":"lb",
//   "value_amount":"20",
//   "value_currency":"USD",
//   "origin_country":"US",
// }
//
// // Creating the CustomsDeclaration
// // (CustomsDeclaration are NOT required for domestic shipments)
// shippo.customsdeclaration.create({
//   "contents_type": "MERCHANDISE",
//   "contents_explanation": "T-Shirt purchase",
//   "non_delivery_option": "RETURN",
//   "certify": true,
//   "certify_signer": "Laura Behrens Wu",
//   "items": [customsItem],
// })
//   .then(function(customsDeclaration) {
//     console.log("customs Declaration : %s", JSON.stringify(customsDeclaration, null, 4));
//     // Creating the shipment object. In this example, the objects are directly passed to the
//     // shipment.create method, Alternatively, the Address and Parcel objects could be created
//     // using address.create(..) and parcel.create(..) functions respectively.
//     // adding the async:false makes this call synchronous
//     return shippo.shipment.create({
//       "object_purpose": "PURCHASE",
//       "address_from": addressFrom,
//       "address_to": addressTo,
//       "parcel": parcel,
//       "submission_type": "DROPOFF",
//       "customs_declaration": customsDeclaration.object_id,
//       "async": false
//     })
//
//   }, function(err) {
//     // Deal with an error
//     console.log("There was an error creating customs declaration: %s", err);
//   })
//   .then(function(shipment) {
//     console.log("shipment : %s", JSON.stringify(shipment, null, 4));
//     shippo.shipment.rates(shipment.object_id)
//       .then(function(rates) {
//         console.log("rates : %s", JSON.stringify(rates, null, 4));
//         // Get the first rate in the rates results for demo purposes.
//         rate = rates.results[0];
//         // Purchase the desired rate
//         return shippo.transaction.create({"rate": rate.object_id, "async": false})
//       }, function(err) {
//         // Deal with an error
//         console.log("There was an error retrieving rates : %s", err);
//       })
//       .then(function(transaction) {
//         console.log("transaction : %s", JSON.stringify(transaction, null, 4));
//         // print label_url and tracking_number
//         if(transaction.object_status == "SUCCESS") {
//           console.log("Label URL: %s", transaction.label_url);
//           console.log("Tracking Number: %s", transaction.tracking_number);
//         }else{
//           //Deal with an error with the transaction
//           console.log("Message: %s", transaction.messages);
//         }
//
//       }, function(err) {
//         // Deal with an error
//         console.log("There was an error creating transaction : %s", err);
//       });
//   },function(err) {
//     // Deal with an error
//     console.log("There was an error creating shipment: %s", err);
//   });

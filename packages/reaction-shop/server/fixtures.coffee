# *****************************************************
# fixtures for empty / test stores
# documents api / json structure
# based on http://docs.shopify.com/api
# attempting to maintain compatability with original
#
# modifications made:
# original: 'tags': 'Emotive, Flash Memory, MP3, Music' is now an array 'tags'
# original:  'option1': 'Red', 'option2': null,'option3': null is now an array 'options'
# original:  'image' (main image) and images(secondary) replaced with single array 'images'
#
# *****************************************************

now = new Date()

unless Meteor.users.find().count()
  console.log("Adding roles fixture data")
  Roles.createRole("admin")
  ShopRoles.createRole("owner")
  ShopRoles.createRole("manager")
  ShopRoles.createRole("vendor")
  Roles.createRole("view-campaigns")
  Roles.createRole("manage-users")
  users = [
      {
        "_id": "ydFCbJ3TbRXcRJBQ2",
        "services": {
          "password": {
            "srp": {
              "identity": "rJQGKDQ3PWFAYjGKc",
              "salt": "oWTKBszTykSthpERd",
              "verifier": "aad725f1b1d3f35f6afe3e730d648306512b023f1d0e94aa71904a4377b9e5402a5166a8f0eef204db63621b9824fe7a78c2c0e8137a26a2b56e3083f916eba83c7b6eaa4c56de6051e51a120ba99854419654383d143e6c08ca79b7035e450d36658e43f7cbcc5869b62dc9e112308b3850c73e5ef0992ee5a3edb5326e46ea"
            }
          }
        },
        "emails": [
          {
            "address": "normal@ongoworks.com",
            "verified": true
          }
        ],
        "profile": {
          "name": "Normal User"
        },
        "shopRoles": [
          {
            "shopId": "WvrKDomkYth3THbDD",
            "name": "owner"
          }
        ]
      },
      {
        "_id": "Cpx5zeNixb9jmePQx",
        "emails": [
          {
            "address": "view@ongoworks.com",
            "verified": true
          }
        ],
        "profile": {
          "name": "View Campaigns User"
        },
        "roles": [
          "view-campaigns"
        ],
        "services": {
          "password": {
            "srp": {
              "identity": "ZmBXJH6rSoARphto6",
              "salt": "FtwWQLWCZ42xvYGCX",
              "verifier": "dd2ebb3652dc6d7c5a0c510314ede562686e90e8f7ac8ff757efc6acf3e32d9da41078d2563da55a72d83ad72717322379800c0afb37b146d041b391ed464b3275c1aeadaab45c56ada07724a34fb6472a14aab630f0c2be961253b39316a0200090e9a7f5e862c44d8b322b0a1be02bf3ee796eebaf713bd2aaab077dbbda55"
            }
          }
        }
      },
      {
        "_id": "WZNkqBaZLRqACDLZ2",
        "emails": [
          {
            "address": "manage@ongoworks.com",
            "verified": true
          }
        ],
        "profile": {
          "name": "Manage-Users User"
        },
        "roles": [
          "manage-users"
        ],
        "services": {
          "password": {
            "srp": {
              "identity": "GeDzsgPvrZn6ZCqk5",
              "salt": "8NRSKnqN7687bPaSh",
              "verifier": "2311f16977567cf0b42b954e8798fb1b1a2cc87dfbd67ae298b44b63d5259a1313aef8465cfd9fbabeaef672e29eab843a6c1cc4ff85b9c1adf765fc7e993b76db7da51ace79cbd7b3339347816ce9b7cab6794435ec5863fd04c9f56251334c91d74460127d8a2ea424d9681baeecd01575f3af1c60db4fd4e4fee4a1521b0f"
            }
          }
        }
      },
      {
        "_id": "sp8nAatBMw7cXKLjc",
        "emails": [
          {
            "address": "admin1@ongoworks.com",
            "verified": true
          }
        ],
        "profile": {
          "name": "Admin User1"
        },
        "roles": [
          "admin"
        ],
        "services": {
          "password": {
            "srp": {
              "identity": "K8TCLJrT8zTLbWEN5",
              "salt": "L7vgT6SkS4rpbxAbr",
              "verifier": "8ba76a949bd25e34199fce68bb2257c09af4b69bef91bf2b8bb229409b5e77b4f72fcec67c9db2b5d59a434015d45342bf6b3321b3171bae2ec65616d5d10f812826507cc7823fae1eefb7d8e1ed247efb8dd87419422760286d2b20e984aec411b1804bd573e6a00854fa81d67a81bf2c092f690d5b25fb204df939050e42ee"
            }
          }
        }
      },
      {
        "_id": "fLZ4NiDYpbT8dZXQe",
        "emails": [
          {
            "address": "admin2@ongoworks.com",
            "verified": true
          }
        ],
        "profile": {
          "name": "Admin User2"
        },
        "roles": [
          "admin"
        ],
        "services": {
          "password": {
            "srp": {
              "identity": "6dserefHaNK2ZRBnd",
              "salt": "F3doYJTaZ3cJAoihW",
              "verifier": "82d42c546dc057b5fc4f3f75d1da02277876f8a5893a8d72ccc0c82f1113e0e227f883b55082f44ce01a65f66997944a47839a9c71655f22e59d8eebad42c1301b5824c946c9fbda4c72ca0b390b8ce0cc7a00bf189a123a7ba49baf1745cb7ac8d98f9ac250fc1230ae0100f572021411f24509a35b1997c34cdbf24d319c7"
            }
          }
        }
      }
    ]
  for user in users
    Meteor.users.insert(user)

unless Shops.find().count()
  console.log 'Adding shops fixture data'
  Shops.insert
    "_id": "WvrKDomkYth3THbDD",
    "address1": "1 Infinite Loop"
    "city": "Cupertino"
    "country": "US"
    "customerEmail": "customers@normal.com"
    "domains": ["localhost", "shop.normal.com", "reaction.meteor.com", "shop.zingfizz.com", "zingfizz.meteor.com"]
    "email": "steve@normal.com"
    "id": 690933842
    "latitude": "45.45"
    "longitude": "-75.43"
    "name": "Normal Computers"
    "phone": "1231231234"
    "primaryLocationId": null
    "province": "California"
    "public": null
    "source": null
    "zip": "95014"
    "countryCode": "US"
    "countryName": "United States"
    "currency": "USD"
    "timezone": "(GMT-05:00) Eastern Time (US & Canada)"
    "shopOwner": "Steve Normal"
    "moneyFormat": "$ "
    "moneyWithCurrencyFormat": "$  USD"
    "provinceCode": "CA"
    "taxesIncluded": null
    "taxShipping": null
    "countyTaxes": true
    "planDisplayName": "enterprise"
    "planName": "enterprise"
    "myshopifyDomain": "normal.myshopify.com"
    "googleAppsDomain": null
    "googleAppsLoginEnabled": null
    "moneyInEmailsFormat": "$"
    "moneyWithCurrencyInEmailsFormat": "$ USD"
    "eligibleForPayments": true
    "requiresExtraPaymentsAgreement": false
    "createdAt": now

unless Products.find().count()
  console.log 'Adding products fixture data'
  Products.insert
    #'_id': 'fhnqEEfMaESexc26F',
    shopId: "WvrKDomkYth3THbDD"
    'bodyHtml': 'The almost legendary Chuck Taylor All Star shoe has been given a high profile makeover by the world’s most expensive living artist, Damien Hirst. Forming part of the Converse (PRODUCT)RED series, the colourway is based on a transposition of Hirst’s “All You Need is Love” painting which features blue and yellow butterflies dance over a red backdrop, which was sold at a RED exhibition back in 2007. Limited to just 400 pairs, look out for a release at colette on November 5. 100% of proceedings will be donated to the RED foundation.',
    'createdAt': now,
    'handle': 'converse-chuck-taylor-all-star',
    'id': 632910392,
    'productType': 'Converse',
    'publishedAt': now,
    'publishedScope': 'global',
    'templateSuffix': null,
    'title': 'Damien Hirst HiTops',
    'updatedAt': now,
    'vendor': 'Converse',
    'tags': ['Converse', 'Shoes', 'Legendary', 'RED'],
    'variants': [
      {
        '_id': new Meteor.Collection.ObjectID()._str,
        'barcode': '1234_pink',
        'compareAtPrice': null,
        'createdAt': now,
        'fulfillmentService': 'manual',
        'grams': 200,
        'id': 808950810,
        'inventoryManagement': 'reaction',
        'inventoryPolicy': 'continue',
        'inventoryQuantity': 10,
        'option1': 'Pink',
        'option2': null,
        'option3': null,
        'position': 1,
        'price': '199.00',
        'requiresShipping': true,
        'sku': 'M9160',
        'taxable': true,
        'title': 'Pink',
        'metafields': [
          {'key': 'new', 'value': 'newvalue', 'namespace': 'global'}
        ],
        'medias': [
          {
            'createdAt': now,
            'position': 1,
            'src': '/resources/sample/converse-1.jpg',
            'updatedAt': now,
            'mimeType': 'image/jpeg'
          }
          {
            'createdAt': now,
            'position': 2,
            'src': '/resources/sample/converse-2.jpg',
            'updatedAt': now,
            'mimeType': 'image/jpeg'
          }
        ],
        'updatedAt': now
      },
      {
        '_id': new Meteor.Collection.ObjectID()._str,
        'barcode': '1234Red',
        'compareAtPrice': null,
        'createdAt': now,
        'fulfillmentService': 'manual',
        'grams': 200,
        'id': 49148385,
        'inventoryManagement': 'manual',
        'inventoryPolicy': 'continue',
        'inventoryQuantity': 20,
        'option1': 'Red',
        'option2': null,
        'option3': null,
        'position': 2,
        'price': '199.00',
        'requiresShipping': true,
        'sku': 'IPOD2008RED',
        'taxable': true,
        'title': 'Red',
        'metafields': [
          {'createdAt': '2013-10-25T13:52:21-04:00', 'description': null, 'id': 915396092, 'key': 'warehouse', 'namespace': 'inventory', 'ownerId': 690933842, 'updatedAt': '2013-10-25T13:52:21-04:00', 'value': '25', 'ownerResource': 'shop'}
        ],
        'medias': [
          {
            'createdAt': now,
            'position': 3,
            'src': '/resources/sample/converse-3.jpg',
            'updatedAt': now,
            'mimeType': 'image/jpeg'
          }
          {
            'createdAt': now,
            'position': 4,
            'src': '/resources/sample/converse-4.jpg',
            'updatedAt': now,
            'mimeType': 'image/jpeg'
          }
        ],
        'updatedAt': now
      },
      {
        '_id': new Meteor.Collection.ObjectID()._str,
        'barcode': '1234_green',
        'compareAtPrice': null,
        'createdAt': now,
        'fulfillmentService': 'manual',
        'grams': 200,
        'id': 39072856,
        'inventoryManagement': 'manual',
        'inventoryPolicy': 'continue',
        'inventoryQuantity': 30,
        'option1': 'Green',
        'option2': null,
        'option3': null,
        'position': 3,
        'price': '199.00',
        'requiresShipping': true,
        'sku': 'IPOD2008GREEN',
        'taxable': true,
        'title': 'Green',
        'updatedAt': now
      },
      {
        '_id': new Meteor.Collection.ObjectID()._str,
        'barcode': '1234Black',
        'compareAtPrice': null,
        'createdAt': now,
        'fulfillmentService': 'manual',
        'grams': 200,
        'id': 457924702,
        'inventoryManagement': 'manual',
        'inventoryPolicy': 'continue',
        'inventoryQuantity': 40,
        'option1': 'Black',
        'option2': null,
        'option3': null,
        'position': 4,
        'price': '199.00',
        'requiresShipping': true,
        'sku': 'IPOD2008BLACK',
        'taxable': true,
        'title': 'Black',
        'updatedAt': now
      }
    ],
    'options': [
      {
        'id': 594680422,
        'name': 'Title',
        'defaultValue': 'Default Title'
      }
    ],
    isVisible: true

#unless Orders.find().count()
#  console.log 'Adding orders fixture data'
#  Orders.insert
#    '_id': 'DnXxWAD5C7T8jZiW8',
#    'buyerAcceptsMarketing': false,
#    'cancelReason': null,
#    'cancelledAt': null,
#    'cartToken': '68778783ad298f1c80c3bafcddeea02f',
#    'checkoutToken': null,
#    'closedAt': null,
#    'confirmed': false,
#    'createdAt': now,
#    'currency': 'USD',
#    'email': 'bob.norman@hostmail.com',
#    'financialStatus': 'authorized',
#    'fulfillmentStatus': null,
#    'gateway': 'authorizeNet',
#    'id': 450789469,
#    'landingSite': 'http://www.example.com?source=abc',
#    'locationId': null,
#    'name': '#1001',
#    'note': null,
#    'number': 1,
#    'reference': 'fhwdgads',
#    'referringSite': 'http://www.otherexample.com',
#    'source': null,
#    'subtotalPrice': '398.00',
#    'taxesIncluded': false,
#    'test': false,
#    'token': 'b1946ac92492d2347c6235b4d2611184',
#    'totalDiscounts': '0.00',
#    'totalLineItemsPrice': '398.00',
#    'totalPrice': '409.94',
#    'totalPriceUsd': '409.94',
#    'totalTax': '11.94',
#    'totalWeight': 0,
#    'updatedAt': now,
#    'userId': null,
#    'browserIp': null,
#    'landingSiteRef': 'abc',
#    'orderNumber': 1001,
#    'discountCodes': [
#      {
#        'code': 'TENOFF',
#        'amount': '10.00'
#      }
#    ],
#    'noteAttributes': [
#      {
#        'name': 'custom engraving',
#        'value': 'Happy Birthday'
#      },
#      {
#        'name': 'colour',
#        'value': 'green'
#      }
#    ],
#    'processingMethod': 'direct',
#    'checkoutId': 450789469,
#    'sourceName': 'web',
#    'lineItems': [
#      {
#        'fulfillmentService': 'manual',
#        'fulfillmentStatus': null,
#        'grams': 200,
#        'id': 466157049,
#        'price': '199.00',
#        'productId': 632910392,
#        'quantity': 1,
#        'requiresShipping': true,
#        'sku': 'IPOD2008GREEN',
#        'title': 'IPod Nano - 8gb',
#        'variantId': 39072856,
#        'variantTitle': 'green',
#        'vendor': null,
#        'name': 'IPod Nano - 8gb - green',
#        'variantInventoryManagement': 'manual',
#        'properties': [
#          {
#            'name': 'Custom Engraving',
#            'value': 'Happy Birthday'
#          }
#        ],
#        'productExists': true
#      },
#      {
#        'fulfillmentService': 'manual',
#        'fulfillmentStatus': null,
#        'grams': 200,
#        'id': 518995019,
#        'price': '199.00',
#        'productId': 632910392,
#        'quantity': 1,
#        'requiresShipping': true,
#        'sku': 'IPOD2008RED',
#        'title': 'IPod Nano - 8gb',
#        'variantId': 49148385,
#        'variantTitle': 'red',
#        'vendor': null,
#        'name': 'IPod Nano - 8gb - red',
#        'variantInventoryManagement': 'manual',
#        'properties': [
#
#        ],
#        'productExists': true
#      },
#      {
#        'fulfillmentService': 'manual',
#        'fulfillmentStatus': null,
#        'grams': 200,
#        'id': 703073504,
#        'price': '199.00',
#        'productId': 632910392,
#        'quantity': 1,
#        'requiresShipping': true,
#        'sku': 'IPOD2008BLACK',
#        'title': 'IPod Nano - 8gb',
#        'variantId': 457924702,
#        'variantTitle': 'black',
#        'vendor': null,
#        'name': 'IPod Nano - 8gb - black',
#        'variantInventoryManagement': 'manual',
#        'properties': [
#
#        ],
#        'productExists': true
#      }
#    ],
#    'shippingLines': [
#      {
#        'code': 'Free Shipping',
#        'price': '0.00',
#        'source': 'manual',
#        'title': 'Free Shipping'
#      }
#    ],
#    'taxLines': [
#      {
#        'price': '11.94',
#        'rate': 0.06,
#        'title': 'State Tax'
#      }
#    ],
#    'paymentDetails': {
#      'avsResultCode': null,
#      'creditCardBin': null,
#      'cvvResultCode': null,
#      'creditCardNumber': 'XXXX-XXXX-XXXX-4242',
#      'creditCardCompany': 'Visa'
#    },
#    'billingAddress': {
#      'address1': 'Chestnut Street 92',
#      'address2': '',
#      'city': 'Louisville',
#      'company': null,
#      'country': 'United States',
#      'firstName': 'Bob',
#      'lastName': 'Norman',
#      'latitude': '45.41634',
#      'longitude': '-75.6868',
#      'phone': '555-625-1199',
#      'province': 'Kentucky',
#      'zip': '40202',
#      'name': 'Bob Norman',
#      'countryCode': 'US',
#      'provinceCode': 'KY'
#    },
#    'shippingAddress': {
#      'address1': 'Chestnut Street 92',
#      'address2': '',
#      'city': 'Louisville',
#      'company': null,
#      'country': 'United States',
#      'firstName': 'Bob',
#      'lastName': 'Norman',
#      'latitude': '45.41634',
#      'longitude': '-75.6868',
#      'phone': '555-625-1199',
#      'province': 'Kentucky',
#      'zip': '40202',
#      'name': 'Bob Norman',
#      'countryCode': 'US',
#      'provinceCode': 'KY'
#    },
#    'fulfillments': [
#      {
#        'createdAt': now,
#        'id': 255858046,
#        'orderId': 450789469,
#        'service': 'manual',
#        'status': 'failure',
#        'trackingCompany': null,
#        'updatedAt': now,
#        'trackingNumber': '1Z2345',
#        'trackingNumbers': [
#          '1Z2345'
#        ],
#        'trackingUrl': 'http://www.google.com/search?q=1Z2345',
#        'trackingUrls': ['http://www.google.com/search?q=1Z2345'],
#        'receipt': {
#          'testcase': true,
#          'authorization': '123456'
#        },
#        'lineItems': [
#          {
#            'fulfillmentService': 'manual',
#            'fulfillmentStatus': null,
#            'grams': 200,
#            'id': 466157049,
#            'price': '199.00',
#            'productId': 632910392,
#            'quantity': 1,
#            'requiresShipping': true,
#            'sku': 'IPOD2008GREEN',
#            'title': 'IPod Nano - 8gb',
#            'variantId': 39072856,
#            'variantTitle': 'green',
#            'vendor': null,
#            'name': 'IPod Nano - 8gb - green',
#            'variantInventoryManagement': 'manual',
#            'properties': [
#              {
#                'name': 'Custom Engraving',
#                'value': 'Happy Birthday'
#              }
#            ],
#            'productExists': true
#          }
#        ]
#      }
#    ],
#    'clientDetails': {
#      'acceptLanguage': null,
#      'browserIp': '0.0.0.0',
#      'sessionHash': null,
#      'userAgent': null
#    },
#    'customer': {
#      'acceptsMarketing': false,
#      'createdAt': now,
#      'email': 'bob.norman@hostmail.com',
#      'firstName': 'Bob',
#      'id': 207119551,
#      'lastName': 'Norman',
#      'lastOrderId': null,
#      'multipassIdentifier': null,
#      'note': null,
#      'ordersCount': 0,
#      'state': 'disabled',
#      'totalSpent': '0.00',
#      'updatedAt': now,
#      'verifiedEmail': true,
#      'tags': '',
#      'lastOrderName': null,
#      'imageUrl': 'resources/avatar.gif',
#      'defaultAddress': {
#        'address1': 'Chestnut Street 92',
#        'address2': '',
#        'city': 'Louisville',
#        'company': null,
#        'country': 'United States',
#        'firstName': null,
#        'id': 207119551,
#        'lastName': null,
#        'phone': '555-625-1199',
#        'province': 'Kentucky',
#        'zip': '40202',
#        'name': null,
#        'provinceCode': 'KY',
#        'countryCode': 'US',
#        'countryName': 'United States',
#        'default': true
#      }
#    }
#
unless Customers.find().count()
  console.log 'Adding customers fixture data'
  Customers.insert
    '_id': 'y2ZGmxjuMDGxuxYB2',
    shopId: "WvrKDomkYth3THbDD"
    'acceptsMarketing': false,
    'createdAt': now,
    'email': 'bob.norman@hostmail.com',
    'fullName': 'Bob Normal',
    'id': 207119551,
    'lastOrderId': null,
    'multipassIdentifier': null,
    'note': null,
    'ordersCount': 0,
    'state': 'disabled',
    'totalSpent': '0.00',
    'updatedAt': now,
    'verifiedEmail': true,
    'lastOrderName': null,
    'imageUrl': 'resources/avatar.gif',
    'defaultAddress':
      'fullName': 'Bob Normal',
      'address1': 'Chestnut Street 92',
      'address2': 'Apartment 2',
      'city': 'Louisville',
      'company': null,
      'country': 'United States',
      'id': 207119551,
      'phone': '555-625-1199',
      'province': 'Kentucky',
      'zip': '40202',
      'provinceCode': 'KY',
      'countryCode': 'US',
      'countryName': 'United States',
      'default': true
    'addresses': [
      {
        'fullName': 'Bob Normal1',
        'address1': 'Chestnut Street 92',
        'address2': 'Apartment 2',
        'city': 'Louisville',
        'company': null,
        'country': 'United States',
        'id': 207119551,
        'phone': '555-625-1199',
        'province': 'Kentucky',
        'zip': '40202',
        'provinceCode': 'KY',
        'countryCode': 'US',
        'countryName': 'United States',
        'default': true
      }
    ]

unless Tags.find().count()
  console.log 'Adding tags fixture data'
  clothingTagId = Tags.insert
    name: "Clothing"
    isTopLevel: false
    shopId: "WvrKDomkYth3THbDD"
    createdAt: now
    updatedAt: now
  shoesTagId = Tags.insert
    name: "Shoes"
    isTopLevel: false
    shopId: "WvrKDomkYth3THbDD"
    createdAt: now
    updatedAt: now
  accessoriesTagId = Tags.insert
    name: "Accessories"
    isTopLevel: false
    shopId: "WvrKDomkYth3THbDD"
    createdAt: now
    updatedAt: now
  Tags.insert
    name: "Men's"
    isTopLevel: true
    relatedTagIds: [clothingTagId, shoesTagId, accessoriesTagId]
    shopId: "WvrKDomkYth3THbDD"
    createdAt: now
    updatedAt: now
  Tags.insert
    name: "Women's"
    isTopLevel: true
    shopId: "WvrKDomkYth3THbDD"
    createdAt: now
    updatedAt: now
  Tags.insert
    name: "Tech"
    isTopLevel: true
    shopId: "WvrKDomkYth3THbDD"
    createdAt: now
    updatedAt: now

# unless Cart.find().count()
#   console.log 'Adding empty cart collection'
#   Cart.insert
#     shopId: 'default',
#     sessionId: 'default',
#     userId: null,
#     createdAt: now,
#     updatedAt: now

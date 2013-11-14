# *****************************************************
# fixtures for empty / test stores
# documents api / json structure
# based on http://docs.shopify.com/api
# attempting to maintain compatability with original
#
# modifications made:
# original: 'tags': 'Emotive, Flash Memory, MP3, Music' is now an array 'tags'
# original:  'option1': 'Red', 'option2': null,'option3': null is now an array 'options'
#
#
# *****************************************************

now = new Date()

unless @Products.find().count()
  console.log 'Adding products fixture data'
  @Products.insert
    '_id': 'fhnqEEfMaESexc26F',
    'bodyHtml': 'The almost legendary Chuck Taylor All Star shoe has been given a high profile makeover by the world’s most expensive living artist, Damien Hirst. Forming part of the Converse (PRODUCT)RED series, the colourway is based on a transposition of Hirst’s “All You Need is Love” painting which features blue and yellow butterflies dance over a red backdrop, which was sold at a RED exhibition back in 2007. Limited to just 400 pairs, look out for a release at colette on November 5. 100% of proceedings will be donated to the RED foundation.',
    'createdAt': now,
    'handle': 'converse-chuck-taylor-all-star',
    'id': 632910392,
    'productType': 'Converse',
    'publishedAt': now,
    'publishedScope': 'global',
    'templateSuffix': null,
    'title': 'Damien Hirst x Chuck Taylor HiTops',
    'updatedAt': now,
    'vendor': 'Converse',
    'tags': ['Converse', 'Shoes', 'Legendary', 'RED'],
    'variants': [
      {
        'barcode': '1234_pink',
        'compareAtPrice': null,
        'createdAt': now,
        'fulfillmentService': 'manual',
        'grams': 200,
        'id': 808950810,
        'inventoryManagement': 'manual',
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
          {'key': 'new', 'value': 'newvalue', 'valueType': 'string', 'namespace': 'global'}
        ],
        'updatedAt': now
      },
      {
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
          {'createdAt': '2013-10-25T13:52:21-04:00', 'description': null, 'id': 915396092, 'key': 'warehouse', 'namespace': 'inventory', 'ownerId': 690933842, 'updatedAt': '2013-10-25T13:52:21-04:00', 'value': '25', 'valueType': 'integer', 'ownerResource': 'shop'}
        ],
        'updatedAt': now
      },
      {
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
        'defaultValue': ''
      }
    ]
    # 'images': [
    #   {
    #     'createdAt': now,
    #     'id': 850703190,
    #     'position': 2,
    #     'src': 'http://streetgiant.com/files/damien-hirst-x-converse-product-red-chuck-taylor-hi-1.jpg',
    #     'metafields':[{'createdAt':'2013-10-25T13:51:38-04:00','description':'French product image title','id':625663657,'key':'title_fr','namespace':'translation','ownerId':850703190,'updatedAt':'2013-10-25T13:51:38-04:00','value':'tbn','valueType':'string','ownerResource':'productImage'}],
    #     'updatedAt': now
    #   },
    #   {
    #     'createdAt': now,
    #     'id': 562641783,
    #     'position': 1,
    #     'src': 'http://streetgiant.com/files/damien-hirst-x-converse-product-red-chuck-taylor-hi-2.jpg',
    #     'metafields':[{'createdAt':'2013-10-25T13:51:38-04:00','description':'French product image title','id':625663657,'key':'title_fr','namespace':'translation','ownerId':850703190,'updatedAt':'2013-10-25T13:51:38-04:00','value':'tbn','valueType':'string','ownerResource':'productImage'}],
    #     'updatedAt': now
    #   },
    #   {
    #     'createdAt': now,
    #     'id': 562641783,
    #     'position': 1,
    #     'src': 'http://streetgiant.com/files/damien-hirst-x-converse-product-red-chuck-taylor-hi-3.jpg',
    #     'updatedAt': now
    #   }
    # ],
    # 'image': {
    #   'createdAt': now,
    #   'id': 850703190,
    #   'position': 1,
    #   'src': 'http://streetgiant.com/files/damien-hirst-x-converse-product-red-chuck-taylor-hi-0.jpg',
    #   'updatedAt': now
    # }

#unless @Orders.find().count()
#  console.log 'Adding orders fixture data'
#  @Orders.insert
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
#unless @Customers.find().count()
#  console.log 'Adding customers fixture data'
#  @Customers.insert
#    '_id': 'y2ZGmxjuMDGxuxYB2',
#    'acceptsMarketing': false,
#    'createdAt': now,
#    'email': 'bob.norman@hostmail.com',
#    'firstName': 'Bob',
#    'id': 207119551,
#    'lastName': 'Norman',
#    'lastOrderId': null,
#    'multipassIdentifier': null,
#    'note': null,
#    'ordersCount': 0,
#    'state': 'disabled',
#    'totalSpent': '0.00',
#    'updatedAt': now,
#    'verifiedEmail': true,
#    'tags': '',
#    'lastOrderName': null,
#    'imageUrl': 'resources/avatar.gif',
#    'defaultAddress': {
#      'address1': 'Chestnut Street 92',
#      'address2': '',
#      'city': 'Louisville',
#      'company': null,
#      'country': 'United States',
#      'firstName': null,
#      'id': 207119551,
#      'lastName': null,
#      'phone': '555-625-1199',
#      'province': 'Kentucky',
#      'zip': '40202',
#      'name': null,
#      'provinceCode': 'KY',
#      'countryCode': 'US',
#      'countryName': 'United States',
#      'default': true
#    },
#    'addresses': [
#      {
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
#    ]

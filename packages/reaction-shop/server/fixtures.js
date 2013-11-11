// *****************************************************
// fixtures for empty / test stores
// documents api / json structure
// based on http://docs.shopify.com/api
// attempting to maintain compatability with original
//
// modifications made:
// original: "tags": "Emotive, Flash Memory, MP3, Music" is now an array "tags"
// original:  "option1": "Red", "option2": null,"option3": null is now an array "options"
//
//
// *****************************************************

var now = new Date();

if (!Products.find().count()) {
    console.log("Adding products fixture data");
    Products.insert({
        "_id": "fhnqEEfMaESexc26F",
        "body_html": "The almost legendary Chuck Taylor All Star shoe has been given a high profile makeover by the world’s most expensive living artist, Damien Hirst. Forming part of the Converse (PRODUCT)RED series, the colourway is based on a transposition of Hirst’s “All You Need is Love” painting which features blue and yellow butterflies dance over a red backdrop, which was sold at a RED exhibition back in 2007. Limited to just 400 pairs, look out for a release at colette on November 5. 100% of proceedings will be donated to the RED foundation.",
        "created_at": now,
        "handle": "converse-chuck-taylor-all-star",
        "id": 632910392,
        "product_type": "Converse",
        "published_at": now,
        "published_scope": "global",
        "template_suffix": null,
        "title": "Damien Hirst x Chuck Taylor HiTops",
        "updated_at": now,
        "vendor": "Converse",
        "tags": ["Converse", "Shoes", "Legendary", "RED"],
        "variants": [
            {
                "barcode": "1234_pink",
                "compare_at_price": null,
                "created_at": now,
                "fulfillment_service": "manual",
                "grams": 200,
                "id": 808950810,
                "inventory_management": "manual",
                "inventory_policy": "continue",
                "inventory_quantity": 10,
                "option1": "Pink",
                "option2": null,
                "option3": null,
                "options": ["Red", "Mens", "8", "RED"],
                "position": 1,
                "price": "199.00",
                "requires_shipping": true,
                "sku": "M9160",
                "taxable": true,
                "title": "Pink",
                "metafields": [
                    {"key": "new", "value": "newvalue", "value_type": "string", "namespace": "global"}
                ],
                "updated_at": now
            },
            {
                "barcode": "1234_red",
                "compare_at_price": null,
                "created_at": now,
                "fulfillment_service": "manual",
                "grams": 200,
                "id": 49148385,
                "inventory_management": "manual",
                "inventory_policy": "continue",
                "inventory_quantity": 20,
                "option1": "Red",
                "option2": null,
                "option3": null,
                "position": 2,
                "price": "199.00",
                "requires_shipping": true,
                "sku": "IPOD2008RED",
                "taxable": true,
                "title": "Red",
                "metafields": [
                    {"created_at": "2013-10-25T13:52:21-04:00", "description": null, "id": 915396092, "key": "warehouse", "namespace": "inventory", "owner_id": 690933842, "updated_at": "2013-10-25T13:52:21-04:00", "value": "25", "value_type": "integer", "owner_resource": "shop"}
                ],
                "updated_at": now
            },
            {
                "barcode": "1234_green",
                "compare_at_price": null,
                "created_at": now,
                "fulfillment_service": "manual",
                "grams": 200,
                "id": 39072856,
                "inventory_management": "manual",
                "inventory_policy": "continue",
                "inventory_quantity": 30,
                "option1": "Green",
                "option2": null,
                "option3": null,
                "position": 3,
                "price": "199.00",
                "requires_shipping": true,
                "sku": "IPOD2008GREEN",
                "taxable": true,
                "title": "Green",
                "updated_at": now
            },
            {
                "barcode": "1234_black",
                "compare_at_price": null,
                "created_at": now,
                "fulfillment_service": "manual",
                "grams": 200,
                "id": 457924702,
                "inventory_management": "manual",
                "inventory_policy": "continue",
                "inventory_quantity": 40,
                "option1": "Black",
                "option2": null,
                "option3": null,
                "position": 4,
                "price": "199.00",
                "requires_shipping": true,
                "sku": "IPOD2008BLACK",
                "taxable": true,
                "title": "Black",
                "updated_at": now
            }
        ],
        "options": [
            {
                "id": 594680422,
                "name": "Title",
                "position": 1,
                "product_id": 632910392
            }
        ]
        // "images": [
        //   {
        //     "created_at": now,
        //     "id": 850703190,
        //     "position": 2,
        //     "src": "http://streetgiant.com/files/damien-hirst-x-converse-product-red-chuck-taylor-hi-1.jpg",
        //     "metafields":[{"created_at":"2013-10-25T13:51:38-04:00","description":"French product image title","id":625663657,"key":"title_fr","namespace":"translation","owner_id":850703190,"updated_at":"2013-10-25T13:51:38-04:00","value":"tbn","value_type":"string","owner_resource":"product_image"}],
        //     "updated_at": now
        //   },
        //   {
        //     "created_at": now,
        //     "id": 562641783,
        //     "position": 1,
        //     "src": "http://streetgiant.com/files/damien-hirst-x-converse-product-red-chuck-taylor-hi-2.jpg",
        //     "metafields":[{"created_at":"2013-10-25T13:51:38-04:00","description":"French product image title","id":625663657,"key":"title_fr","namespace":"translation","owner_id":850703190,"updated_at":"2013-10-25T13:51:38-04:00","value":"tbn","value_type":"string","owner_resource":"product_image"}],
        //     "updated_at": now
        //   },
        //   {
        //     "created_at": now,
        //     "id": 562641783,
        //     "position": 1,
        //     "src": "http://streetgiant.com/files/damien-hirst-x-converse-product-red-chuck-taylor-hi-3.jpg",
        //     "updated_at": now
        //   }
        // ],
        // "image": {
        //   "created_at": now,
        //   "id": 850703190,
        //   "position": 1,
        //   "src": "http://streetgiant.com/files/damien-hirst-x-converse-product-red-chuck-taylor-hi-0.jpg",
        //   "updated_at": now
        // }
    });
}

if (!Orders.find().count()) {
    console.log("Adding orders fixture data");
    Orders.insert({
        "_id": "DnXxWAD5C7T8jZiW8",
        "buyer_accepts_marketing": false,
        "cancel_reason": null,
        "cancelled_at": null,
        "cart_token": "68778783ad298f1c80c3bafcddeea02f",
        "checkout_token": null,
        "closed_at": null,
        "confirmed": false,
        "created_at": now,
        "currency": "USD",
        "email": "bob.norman@hostmail.com",
        "financial_status": "authorized",
        "fulfillment_status": null,
        "gateway": "authorize_net",
        "id": 450789469,
        "landing_site": "http://www.example.com?source=abc",
        "location_id": null,
        "name": "#1001",
        "note": null,
        "number": 1,
        "reference": "fhwdgads",
        "referring_site": "http://www.otherexample.com",
        "source": null,
        "subtotal_price": "398.00",
        "taxes_included": false,
        "test": false,
        "token": "b1946ac92492d2347c6235b4d2611184",
        "total_discounts": "0.00",
        "total_line_items_price": "398.00",
        "total_price": "409.94",
        "total_price_usd": "409.94",
        "total_tax": "11.94",
        "total_weight": 0,
        "updated_at": now,
        "user_id": null,
        "browser_ip": null,
        "landing_site_ref": "abc",
        "order_number": 1001,
        "discount_codes": [
            {
                "code": "TENOFF",
                "amount": "10.00"
            }
        ],
        "note_attributes": [
            {
                "name": "custom engraving",
                "value": "Happy Birthday"
            },
            {
                "name": "colour",
                "value": "green"
            }
        ],
        "processing_method": "direct",
        "checkout_id": 450789469,
        "source_name": "web",
        "line_items": [
            {
                "fulfillment_service": "manual",
                "fulfillment_status": null,
                "grams": 200,
                "id": 466157049,
                "price": "199.00",
                "product_id": 632910392,
                "quantity": 1,
                "requires_shipping": true,
                "sku": "IPOD2008GREEN",
                "title": "IPod Nano - 8gb",
                "variant_id": 39072856,
                "variant_title": "green",
                "vendor": null,
                "name": "IPod Nano - 8gb - green",
                "variant_inventory_management": "manual",
                "properties": [
                    {
                        "name": "Custom Engraving",
                        "value": "Happy Birthday"
                    }
                ],
                "product_exists": true
            },
            {
                "fulfillment_service": "manual",
                "fulfillment_status": null,
                "grams": 200,
                "id": 518995019,
                "price": "199.00",
                "product_id": 632910392,
                "quantity": 1,
                "requires_shipping": true,
                "sku": "IPOD2008RED",
                "title": "IPod Nano - 8gb",
                "variant_id": 49148385,
                "variant_title": "red",
                "vendor": null,
                "name": "IPod Nano - 8gb - red",
                "variant_inventory_management": "manual",
                "properties": [

                ],
                "product_exists": true
            },
            {
                "fulfillment_service": "manual",
                "fulfillment_status": null,
                "grams": 200,
                "id": 703073504,
                "price": "199.00",
                "product_id": 632910392,
                "quantity": 1,
                "requires_shipping": true,
                "sku": "IPOD2008BLACK",
                "title": "IPod Nano - 8gb",
                "variant_id": 457924702,
                "variant_title": "black",
                "vendor": null,
                "name": "IPod Nano - 8gb - black",
                "variant_inventory_management": "manual",
                "properties": [

                ],
                "product_exists": true
            }
        ],
        "shipping_lines": [
            {
                "code": "Free Shipping",
                "price": "0.00",
                "source": "manual",
                "title": "Free Shipping"
            }
        ],
        "tax_lines": [
            {
                "price": "11.94",
                "rate": 0.06,
                "title": "State Tax"
            }
        ],
        "payment_details": {
            "avs_result_code": null,
            "credit_card_bin": null,
            "cvv_result_code": null,
            "credit_card_number": "XXXX-XXXX-XXXX-4242",
            "credit_card_company": "Visa"
        },
        "billing_address": {
            "address1": "Chestnut Street 92",
            "address2": "",
            "city": "Louisville",
            "company": null,
            "country": "United States",
            "first_name": "Bob",
            "last_name": "Norman",
            "latitude": "45.41634",
            "longitude": "-75.6868",
            "phone": "555-625-1199",
            "province": "Kentucky",
            "zip": "40202",
            "name": "Bob Norman",
            "country_code": "US",
            "province_code": "KY"
        },
        "shipping_address": {
            "address1": "Chestnut Street 92",
            "address2": "",
            "city": "Louisville",
            "company": null,
            "country": "United States",
            "first_name": "Bob",
            "last_name": "Norman",
            "latitude": "45.41634",
            "longitude": "-75.6868",
            "phone": "555-625-1199",
            "province": "Kentucky",
            "zip": "40202",
            "name": "Bob Norman",
            "country_code": "US",
            "province_code": "KY"
        },
        "fulfillments": [
            {
                "created_at": now,
                "id": 255858046,
                "order_id": 450789469,
                "service": "manual",
                "status": "failure",
                "tracking_company": null,
                "updated_at": now,
                "tracking_number": "1Z2345",
                "tracking_numbers": [
                    "1Z2345"
                ],
                "tracking_url": "http://www.google.com/search?q=1Z2345",
                "tracking_urls": [
                    "http://www.google.com/search?q=1Z2345"
                ],
                "receipt": {
                    "testcase": true,
                    "authorization": "123456"
                },
                "line_items": [
                    {
                        "fulfillment_service": "manual",
                        "fulfillment_status": null,
                        "grams": 200,
                        "id": 466157049,
                        "price": "199.00",
                        "product_id": 632910392,
                        "quantity": 1,
                        "requires_shipping": true,
                        "sku": "IPOD2008GREEN",
                        "title": "IPod Nano - 8gb",
                        "variant_id": 39072856,
                        "variant_title": "green",
                        "vendor": null,
                        "name": "IPod Nano - 8gb - green",
                        "variant_inventory_management": "manual",
                        "properties": [
                            {
                                "name": "Custom Engraving",
                                "value": "Happy Birthday"
                            }
                        ],
                        "product_exists": true
                    }
                ]
            }
        ],
        "client_details": {
            "accept_language": null,
            "browser_ip": "0.0.0.0",
            "session_hash": null,
            "user_agent": null
        },
        "customer": {
            "accepts_marketing": false,
            "created_at": now,
            "email": "bob.norman@hostmail.com",
            "first_name": "Bob",
            "id": 207119551,
            "last_name": "Norman",
            "last_order_id": null,
            "multipass_identifier": null,
            "note": null,
            "orders_count": 0,
            "state": "disabled",
            "total_spent": "0.00",
            "updated_at": now,
            "verified_email": true,
            "tags": "",
            "last_order_name": null,
            "image_url": "resources/avatar.gif",
            "default_address": {
                "address1": "Chestnut Street 92",
                "address2": "",
                "city": "Louisville",
                "company": null,
                "country": "United States",
                "first_name": null,
                "id": 207119551,
                "last_name": null,
                "phone": "555-625-1199",
                "province": "Kentucky",
                "zip": "40202",
                "name": null,
                "province_code": "KY",
                "country_code": "US",
                "country_name": "United States",
                "default": true
            }
        }
    });
}

if (!Customers.find().count()) {
    console.log("Adding customers fixture data");
    Customers.insert({
        "_id": "y2ZGmxjuMDGxuxYB2",
        "accepts_marketing": false,
        "created_at": now,
        "email": "bob.norman@hostmail.com",
        "first_name": "Bob",
        "id": 207119551,
        "last_name": "Norman",
        "last_order_id": null,
        "multipass_identifier": null,
        "note": null,
        "orders_count": 0,
        "state": "disabled",
        "total_spent": "0.00",
        "updated_at": now,
        "verified_email": true,
        "tags": "",
        "last_order_name": null,
        "image_url": "resources/avatar.gif",
        "default_address": {
            "address1": "Chestnut Street 92",
            "address2": "",
            "city": "Louisville",
            "company": null,
            "country": "United States",
            "first_name": null,
            "id": 207119551,
            "last_name": null,
            "phone": "555-625-1199",
            "province": "Kentucky",
            "zip": "40202",
            "name": null,
            "province_code": "KY",
            "country_code": "US",
            "country_name": "United States",
            "default": true
        },
        "addresses": [
            {
                "address1": "Chestnut Street 92",
                "address2": "",
                "city": "Louisville",
                "company": null,
                "country": "United States",
                "first_name": null,
                "id": 207119551,
                "last_name": null,
                "phone": "555-625-1199",
                "province": "Kentucky",
                "zip": "40202",
                "name": null,
                "province_code": "KY",
                "country_code": "US",
                "country_name": "United States",
                "default": true
            }
        ]
    });
}

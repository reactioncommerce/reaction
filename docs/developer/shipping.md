# Shipping
Partial implementation, please review current Github Issues.

## Methods:
- flat rate - line item
- flat rate - order value over/under
- carrier - line item calculated / weight
- carrier - bundled box, dimensions + weight
- percentage - line item
- percentage - order value

## Usages Scenarios:
- bundled box dimensions + weight
- different originations
- different destinations
- destination fees (example: charge more for international)
- flat rate
- mixed carrier rates
- mixed carrier per line item (one flat rate+ one calculated)
- per vendor
- per vendor + method

## Shop results
- Rates, per order, per line:
- available (carrier / method title / rate)
- Estimated Delivery Dates
- Estimate Shipping Dates

## Order Results:
- Tracking Code
- Label PDF
- Customs Documents

## Schema

```
{
   "shipping": [
       {
           "name": "Flat Rate Service",
           "serviceAuth": "",
           "serviceSecret": "",
           "serviceUrl": "",
           "format": "json",
           "methods": [
               {
                   "name": "free",
                   "group": "Ground",
                   "label": "Free Shipping",
                   "rate": "1.99",
                   "handling": "0",
                   "validRanges": [
                       {
                           "begin": "0",
                           "end": "0"
                       }
                   ],
                   "validDestinations": [
                       {
                           "US": true,
                           "CA": true,
                           "UK": false
                       }
                   ],
                   "validOrigination": [
                       {
                           "US": true
                       }
                   ]
               }
           ],
           "containers": [
               {
                   "envelope": true
               }
           ]
       }
   ]
}
```

Export from an existing mongodb/meteor reaction collection:
See: http://docs.mongodb.org/v2.2/reference/mongoexport/

  mongoexport --port 3002 --db meteor --collection Products --jsonArray --out ~/Projects/reaction/private/products.json
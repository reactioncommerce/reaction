Export from an existing mongodb/meteor reaction collection:
See: http://docs.mongodb.org/v2.2/reference/mongoexport/

  mongoexport --port 3001 --db meteor --collection Products --jsonArray --out packages/reaction-core/private/data/Products.json
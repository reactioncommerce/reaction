export const transformations = {};
transformations.products = {};

transformations.products.metafields = function (fieldData) {
  const values = [];
  if (fieldData) {
    for (const field of fieldData) {
      values.push(field.value);
    }
  }
  return values;
};

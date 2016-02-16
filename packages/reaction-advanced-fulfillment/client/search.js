const options = {
  keepHistory: 1000 * 5,
  localSearch: true
};
const fields = ['shopifyOrderNumber'];

OrderSearch = new SearchSource('orders', fields, options);

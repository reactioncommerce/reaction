// Uses variantForm helpers instead of rentalVariantForm helpers
// because we are replacing the template and leveraging all original helpers.
Template.variantForm.helpers({
  isProductType: function (productType) {
    let product = selectedProduct();
    if (product) {
      if (product.type === productType) {
        return true;
      }
    }
    return false;
  }
});

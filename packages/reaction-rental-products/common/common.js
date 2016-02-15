RentalProducts = {
  /**
   * RentalProducts.schemaIdAutoValue
   * @summary used for schemea injection autoValue
   * @example autoValue: RentalProducts.schemaIdAutoValue
   * @return {String} returns randomId
   */
  schemaIdAutoValue: function () {
    if ((this.value) || (this.isUpdate && Meteor.isServer) || (this.isUpsert && Meteor.isServer)) {
      return this.value;
    } else if (Meteor.isServer || Meteor.isClient && this.isInsert) {
      return Random.id();
    }
    return this.unset();
  }
};

export const ReactionEventsEnumMapping = {
  afterProductCreate: "AFTER_PRODUCT_CREATE",
  afterProductUpdate: "AFTER_PRODUCT_UPDATE",
  afterProductSoftDelete: "AFTER_PRODUCT_SOFT_DELETE",
  afterVariantCreate: "AFTER_VARIANT_CREATE",
  afterVariantUpdate: "AFTER_VARIANT_UPDATE",
  afterVariantSoftDelete: "AFTER_VARIANT_SOFT_DELETE",
  afterTagCreate: "AFTER_TAG_CREATE",
  afterTagUpdate: "AFTER_TAG_UPDATE",
  afterTagDelete: "AFTER_TAG_DELETE",
  afterSetTagHeroMedia: "AFTER_SET_TAG_HERO_MEDIA",
  afterAddTagsToProducts: "AFTER_ADD_TAGS_TO_PRODUCTS",
  afterRemoveTagsFromProducts: "AFTER_REMOVE_TAGS_FROM_PRODUCTS"
};

export const WEBHOOK_VALIDATION_HEADER = "X-Authorization-Content-SHA256";

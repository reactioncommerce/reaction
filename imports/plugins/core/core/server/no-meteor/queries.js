export default {
  shopById: (context, _id) => context.collections.Shops.findOne({ _id }),
  shopBySlug: (context, slug) => context.collections.Shops.findOne({ slug })
};

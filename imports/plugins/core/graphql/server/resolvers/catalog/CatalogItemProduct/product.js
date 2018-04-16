
export default async function product(item) {
  return {
    ...item,
    tagIds: item.hashtags,
    slug: item.handle,
    updatedAt: item.updatedAt || item.createdAt
  };
}

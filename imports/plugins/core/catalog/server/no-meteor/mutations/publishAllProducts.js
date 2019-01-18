import publishProducts from "./publishProducts";


export default async function publishAllProducts(context) {
  const { collections } = context;
  const { Products } = collections;
  const allProducts = await Products.find({ type: "simple" }, { _id: 1 }).toArray();
  const allProductIds = allProducts.map((product) => product._id);
  return publishProducts(context, allProductIds);
}

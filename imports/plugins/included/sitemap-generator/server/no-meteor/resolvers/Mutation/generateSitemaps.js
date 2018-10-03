export default async function generateSitemaps(_, input, context) {
  await context.mutations.generateSitemaps(context);
  return true;
}

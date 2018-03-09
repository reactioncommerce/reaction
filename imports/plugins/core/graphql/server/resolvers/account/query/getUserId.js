export default function getUserId(_, __, context) {
  const userId = context && context.user && context.user._id;
  if (!userId) throw new Error("access-denied");
  return userId;
}

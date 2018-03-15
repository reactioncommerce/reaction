import account from "./account";

export default function viewer(_, __, context) {
  const userId = (context && context.user && context.user._id) || {};
  return account(_, { _id: userId }, context)
}

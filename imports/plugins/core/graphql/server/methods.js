import runMeteorMethodWithContext from "./runMeteorMethodWithContext";

const methods = {};

[
  "accounts/addressBookAdd",
  "accounts/addressBookRemove",
  "accounts/addressBookUpdate",
  "accounts/inviteShopMember",
  "group/addUser",
  "group/removeUser"
].forEach((methodName) => {
  methods[methodName] = (context, args) => (
    runMeteorMethodWithContext(context, methodName, args)
  );
});

export default methods;

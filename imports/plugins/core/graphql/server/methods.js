import runMeteorMethodWithContext from "./runMeteorMethodWithContext";

const methods = {};

[
  "accounts/addressBookRemove",
  "accounts/addressBookUpdate",
  "accounts/inviteShopMember",
  "accounts/setProfileCurrency",
  "group/addUser",
  "group/removeUser"
].forEach((methodName) => {
  methods[methodName] = (context, args) => (
    runMeteorMethodWithContext(context, methodName, args)
  );
});

export default methods;

productWorkflow = StateMachine.create(
  initial: "new"
  events: [
    { name: "create",  from: "new" , to: "publish" }
    { name: "clone", from: "create", to: "publish"}
    { name: "publish", from: ["create","clone"], to: "archive" }
    { name: "archive", from: "publish", to: "publish"}
  ]
)

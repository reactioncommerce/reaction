###
# client integration tests for layouts
# integration tests are those that check client
# interactions with the server
###

# New user signup

signUp = (user, callback) ->
  $('.dropdown-toggle').trigger 'click'
  $('#signup-link').trigger 'click'
  $('#login-email').val user.email
  $('#login-password').val user.password
  $('#login-buttons-password').trigger 'click'
  callback
  return

describe 'User signup', ->
  user =
    email: Fake.email
    password: Fake.password

  it 'should return a meteor userId users by one', ->
    signUp(user)
    expect(Meteor.userId()).not.toBeNull
    return
  it 'should automatically log-in new user', ->
    expect(Meteor.userId()).not.toBeNull
    return
  return

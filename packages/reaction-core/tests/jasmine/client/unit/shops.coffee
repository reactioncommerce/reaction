###
# client unit tests
#
###

describe 'client layout', ->
  describe 'coreLayout template', ->
    it 'loads navigation header', ->
      expect($('body > nav.reaction-navigation-header').text()).not.toBeNull()
      return

    it 'loads product pricing'
      expect($('div.currency-symbol').text()).not.toBeNull()
      return

    return
  return


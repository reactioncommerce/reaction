unless typeof MochaWeb is "undefined"
  MochaWeb.testOnly ->

    describe "using factory", ->

      it "should be possible to build and create shop", ->
        chai.assert.isObject Factory.build 'shop'
        chai.assert.isObject Factory.create 'shop'

      it "should be possible to build and create product", ->
        chai.assert.isObject Factory.build 'product'
        chai.assert.isObject Factory.create 'product'

      it "should be possible to build and create tag", ->
        chai.assert.isObject Factory.build 'tag'
        chai.assert.isObject Factory.create 'tag'

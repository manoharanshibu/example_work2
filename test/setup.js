import 'babel-polyfill';

import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import dirtyChai from 'dirty-chai'
import sinonChai from 'sinon-chai'
import * as enzyme from 'enzyme'
import sinon from 'sinon'
import App from 'app/App'
import config from 'config/config'

//
// App
//
global.config = config
global.App = App

//
// Enzyme
//
global.enzyme = enzyme
global.shallow = enzyme.shallow
global.render = enzyme.render
global.mount = enzyme.mount

//
// Mocha
//
mocha.setup({
  ui: 'bdd',
})

//
// Chai
//
global.expect = chai.expect
global.sinon = sinon

chai.should()
chai.use(chaiEnzyme())
chai.use(dirtyChai)
chai.use(sinonChai)

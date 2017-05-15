import 'config/plugins'
import config from 'config/configuration.json'
import babaConfig from 'config/customer/baba.json'
import defaultConfig from 'config/customer/default.json'

import globals from 'backoffice/Globals'
import Radio from 'backbone.radio'
import commands from './AppCommands'
import resolver from 'app/bootstrap/DomainResolver'
import BootStrapper from 'common/system/bootstrap/BootStrapper'
import { leadingSlashes as slashes } from 'common/util/RegEx'
import { props } from 'common/decorators/react-decorators'
import { isLocal } from 'common/util/AppUtil'
import { createHistory} from 'history';
import { useRouterHistory } from 'react-router'

import 'styles/styles.scss'

@props({
	boot: [
		'SingleSignOn'
	]
})

class Application {
	constructor() {
		this.session = Radio.channel('session')
		this.socket  = Radio.channel('socket')
		this.router  = Radio.channel('router')
		this.bus 	 = Radio.channel('bus')
		this.init()
	}

	/**
	 * Initialize the app layout
	 */
	init() {
		_.bindAll(this, 'start')
		window.App = this
		this.browserHistory = useRouterHistory(createHistory)({basename: process.env.BASENAME_ENV});
		this.BaseName = process.env.BASENAME_ENV.replace('/','');
		this.Bridge  = { dispatch: _.noop }
		this.Urls     = resolver.init(config, this);
		this.Config   = Object.assign(config, this.getCustomerConfig(this.Settings.Customer));
		this.Globals  = new globals;
		//temp fix, needs to set it on the server
		if (this.BaseName === 'baja-cms') {
			this.Settings.Customer = 'baja';
		}
		this.commands = commands

		if (isLocal()) {
			const domain = App.Urls.node
			const endpoint = App.Endpoints.nodepath
			this.Urls.nodepath = `${domain}${endpoint}`
		}

		this.prestart()
	}

	getCustomerConfig(customer) {
		let config = defaultConfig;
		switch(customer) {
			case 'baba':
				config = babaConfig;
				break
			default:
				break;
		}
		return config;
	}

	/**
	 * kick the boot sequence off
	 */
	prestart() {
		console.log('App: PreStart')
		BootStrapper.boot(this.boot, false)
			.then(this.start)
	}

	/**
	 * On start kick off the views
	 */
	start() {
		require.ensure([], (require) => {
			require('app/containers/App')
		})
	}

	/**
	 * Shortcut for navigating to specified route
	 */
	navigate(pathName = '', state = null) {
		pathName = pathName.replace(slashes, '')
		if (pathName != '') {
			pathName = `/${pathName}`
		}
		console.log('PushState: '+pathName)
		this.browserHistory.pushState(state, pathName);
	}
}

// exports singleton instance
let inst = new Application()
export default inst

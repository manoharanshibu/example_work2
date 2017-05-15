const token = /^@+(.*)@+$/

class DomainResolver {
	init(config, app) {
		const {config: map} = window
		const domains = config.endpoints
		const urls = this.getRoot()

		// create object for storing unconfigured endpoints
		app.Endpoints = {}

		Object.keys(domains).forEach(function (key) {
			let val = domains[key]
			let url = map && map[key] && map[key].url
			// map out main url for this domain
			urls[key] = this.resolve(val.url, url)
			// console.log(`Bootstrap: ${key} - ${urls[key]}`);

			const subs = val.endpoints
			const ovrs = map && map[key] && map[key].endpoints

			Object.keys(subs).forEach(function (subkey) {
				let subval = subs[subkey]
				// don't allow name clashes
				if (!!urls[subkey]) {
					throw new Error(
						`App.Urls.${subkey} is already defined.` +
						`Check configuration.json endpoint key names.` +
						`Should be unique.`
					)
				}
				// resolve whether to use default or override endpoint
				const endVal = this.resolveEndpoint(urls[key], subval, ovrs, key, subkey, app)
				urls[subkey] = endVal
			}, this)
		}, this)

		this.resolveEnvs(app, domains, config.env, map && map.env)
		return urls
	}

	/**
	 * @param urls
	 * @returns {{}}
	 */
	getRoot(urls = {}) {
		const {hostname, protocol, port} = window.location
		const portNum = _.isEmpty(port) ? '' : `:${port}`
		urls.Root = `${protocol}//${hostname}${portNum}`
		return urls
	}

	/**
	 * @param url
	 * @param def
	 * @param over
	 * @param key
	 * @param subkey
	 * @returns {*}
	 */
	resolveEndpoint(url, def, over, key, subkey, app) {
		const match = url.match(/(?:(?:https?|ftp|wss?))/i)
		const proto = match ? match[0] : 'https'

		let defProtocol, defPathname
		let override = over && over[subkey]

		if (_.isObject(def)) {
			if (!def.hasOwnProperty('pathname')) {
				throw new Error(
					`Endpoint ${key}::${subkey}, is configured as an Object in 'configuration.json',` +
					`and therefore must contain a 'pathname' and 'protocol' property.` +
					`ie. {pathname: "/websocket", protocol: "wss"}`
				)
			}
			defProtocol = def.protocol
			defPathname = def.pathname
		}
		else {
			defProtocol = proto
			defPathname = def
		}

		if (_.isObject(override)) {
			if (!override.hasOwnProperty('pathname')) {
				throw new Error(
					`Endpoint ${key}::${subkey}, is configured as an Object in 'config.json', ` +
					`and therefore must contain a 'pathname' and 'protocol' property.` +
					`ie. {pathname: "/websocket", protocol: "wss"}`
				)
			}
			defPathname = this.resolve(defPathname, override.pathname)
			defProtocol = this.resolve(defProtocol, override.protocol)
		}
		else {
			defPathname = this.resolve(defPathname, override)
			defProtocol = this.resolve(defProtocol, proto)
		}

		// store actual endpoint
		app.Endpoints[subkey] = `/${defPathname}`

		const newUrl = url.replace(/(?:(?:https?|ftp|wss?):\/\/)/, '')
		return `${defProtocol}://${newUrl}/${defPathname}`
	}

	/**
	 * @param def
	 * @param over
	 * @returns {*}
	 */
	resolve(def, over) {
		if (_.isNull(over) || _.isUndefined(over)) return def
		if (over === '') return over
		const isToken = token.test(over)
		return isToken ? def : over
	}

	/**
	 * @param app
	 * @param def
	 * @param ovr
	 */
	resolveEnvs(app, domains, def, ovr) {
		app.Settings = app.Settings || {}
		Object.keys(def).forEach(function (key) {
			let val = def[key]
			app.Settings[key] = this.resolve(val, ovr && ovr[key])
		}, this)
	}
}

export default new DomainResolver()

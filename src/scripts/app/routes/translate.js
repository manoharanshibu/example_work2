import { indexRoute, checkAuth } from 'app/util/RouteUtil'

export default {
    path: 'translate',
	indexRoute: indexRoute('translate/external'),
	onEnter: (next, replace) => checkAuth(next, replace),
	getComponent(location, cb) {
		require.ensure([], (require) => {
			cb(null, require('translate/TranslationsView'))
		})
	},
	childRoutes: [{
		path: 'markets',
		getComponent(location, cb) {
			require.ensure([], (require) => {
				cb(null, require('translate/markets/MarketsTranslationsView'))
			})
		}
	},
		{
			path: 'selections',
			getComponent(location, cb) {
				require.ensure([], (require) => {
					cb(null, require('translate/selections/SelectionsTranslationsView'))
				})
			}
		},
		{
			path: 'countries',
			getComponent(location, cb) {
				require.ensure([], (require) => {
					cb(null, require('translate/CountryTranslations'))
				})
			}
		},
		{
			path: 'external',
			getComponent(location, cb) {
				require.ensure([], (require) => {
					cb(null, require('translate/ExternalizedTranslationsContainer'))
				})
			}
		}]
}


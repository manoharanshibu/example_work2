import { indexRoute } from 'app/util/RouteUtil'
import AppView from 'app/AppView'

export default {
	path: '/',
	component: AppView,
	indexRoute: indexRoute('search'),
	childRoutes: [
		require('app/routes/admin'),
		require('app/routes/agent'),
		require('app/routes/bonus'),
		require('app/routes/cms'),
		require('app/routes/login'),
		require('app/routes/search'),
		require('app/routes/segment'),
		require('app/routes/settingsTemplate'),
		require('app/routes/transactions'),
		require('app/routes/translate')
	]
}

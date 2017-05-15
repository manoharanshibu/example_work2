import { indexRoute } from 'app/util/RouteUtil'
import AppView from 'app/AppView'

export default {
	indexRoute: indexRoute('search'),
	childRoutes: [
		require('app/routes/account'),
		require('app/routes/app')
	]
}

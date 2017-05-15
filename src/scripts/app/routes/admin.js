import { indexRoute, checkAuth } from 'app/util/RouteUtil'

export default {
    path: 'admin',
    indexRoute: indexRoute('admin/internalUsers'),
    onEnter: (next, replace) => checkAuth(next, replace),
    childRoutes: [{
        path: 'adminTicker',
        getComponent(location, cb) {
            require.ensure([], (require) => {
                cb(null, require('adminTicker/AdminTicker'))
            })
        }
    },
    {
        path: 'internalUsers',
        getComponent(location, cb) {
            require.ensure([], (require) => {
                cb(null, require('app/view/main/admin-ticker/InternalUsers'))
            })
        }
    }]
}

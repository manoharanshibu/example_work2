import { indexRoute, checkAuth } from 'app/util/RouteUtil'

export default {
    path: 'segment',
    indexRoute: indexRoute('segment/account'),
    onEnter: (next, replace) => checkAuth(next, replace),
    childRoutes: [{
        path: 'regional',
        getComponent(location, cb) {
            require.ensure([], (require) => {
                cb(null, require('segment/RegionalSegmentsView'))
            })
        }
    },
    {
        path: 'account',
        getComponent(location, cb) {
            require.ensure([], (require) => {
                cb(null, require('segment/AccountSegmentsView'))
            })
        }
    },
    {
        path: 'settings',
        getComponent(location, cb) {
            require.ensure([], (require) => {
                cb(null, require('segment/SportsbookSettingsView'))
            })
        }
    }]
}

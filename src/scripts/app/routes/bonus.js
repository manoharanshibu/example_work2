import { indexRoute, checkAuth } from 'app/util/RouteUtil'

export default {
    path: 'bonus',
    indexRoute: indexRoute('bonus/manage'),
    onEnter: (next, replace) => checkAuth(next, replace),
    childRoutes: [{
        path: 'manage',
        getComponent(location, cb) {
            require.ensure([], (require) => {
                cb(null, require('bonus/BonusManage'))
            })
        }
    },
    {
        path: 'creation',
        getComponent(location, cb) {
            require.ensure([], (require) => {
                cb(null, require('bonus/BonusCreation'))
            })
        }
    },
    {
        path: 'templates',
        getComponent(location, cb) {
            require.ensure([], (require) => {
                cb(null, require('bonus/BonusTemplates'))
            })
        }
    }]
}

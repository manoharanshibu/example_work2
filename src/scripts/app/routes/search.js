import { checkAuth } from 'app/util/RouteUtil'

export default {
    path: 'search',
    onEnter: (next, replace) => checkAuth(next, replace),
    getComponent(location, cb) {
        require.ensure([], (require) => {
            cb(null, require('app/view/account/AccountPageSearch'))
        })
    }
}

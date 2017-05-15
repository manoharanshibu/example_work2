import { checkAuth } from 'app/util/RouteUtil'

export default {
    path: 'settingsTemplate',
    onEnter: (next, replace) => checkAuth(next, replace),
    getComponent(location, cb) {
        require.ensure([], (require) => {
            cb(null, require('settingsTemplate/SettingsTemplateView'))
        })
    }
}

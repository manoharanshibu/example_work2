import { checkAuth } from 'app/util/RouteUtil'

export default {
    path: 'agent',
    onEnter: (next, replace) => checkAuth(next, replace)
}

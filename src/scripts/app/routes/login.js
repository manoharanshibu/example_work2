export default {
    path: 'login',
    getComponent(location, cb) {
        require.ensure([], (require) => {
            cb(null, require('app/view/login/LoginView'))
        })
    }
}

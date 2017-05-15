import { indexRoute, checkAuth } from 'app/util/RouteUtil'

export default {
    path: 'transactions',
    indexRoute: indexRoute('transactions/payments'),
    onEnter: (next, replace) => checkAuth(next, replace),
    childRoutes: [{
        path: 'payments',
        getComponent(location, cb) {
            require.ensure([], (require) => {
                cb(null, require('transactions/TransactionsPayments'))
            })
        }
    },
    {
        path: 'account',
        getComponent(location, cb) {
            require.ensure([], (require) => {
                cb(null, require('transactions/TransactionsAccount'))
            })
        }
    },
    {
        path: 'details(/:transactionid)',
        getComponent(location, cb) {
            require.ensure([], (require) => {
                cb(null, require('transactions/TransactionDetails'))
            })
        }
    }]
}

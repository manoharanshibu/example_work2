import { indexRoute, checkAuth } from 'app/util/RouteUtil'

export default {
    path: 'cms',
    indexRoute: indexRoute('cms/sport'),
    onEnter: (next, replace) => checkAuth(next, replace),
    childRoutes: [{
        path: 'sport',
        getComponent(location, cb) {
            require.ensure([], (require) => {
                cb(null, require('cms/sports/CmsSportsView.js'))
            })
        }
    }, {
        path: 'highlights',
        getComponent(location, cb) {
            require.ensure([], (require) => {
                cb(null, require('cms/highlights/CmsHighlightsView.js'))
            })
        }
    },
    {
        path: 'promotions',
        indexRoute: indexRoute('cms/promotions/list'),
        childRoutes: [{
            path: 'list',
            getComponent(location, cb) {
                require.ensure([], (require) => {
                    cb(null, require('cms/promotions/PromotionsList.js'))
                })
            }
        }, {
            path: 'creation',
            getComponent(location, cb) {
                require.ensure([], (require) => {
                    cb(null, require('cms/promotions/PromotionCreation.js'))
                })
            }
        }, {
            path: 'edit(/:id)',
            getComponent(location, cb) {
                require.ensure([], (require) => {
                    cb(null, require('cms/promotions/PromotionCreation'))
                })
            }
        }]
    },
	{
		path: 'bonustiles',
		indexRoute: indexRoute('cms/bonustiles/list'),
		childRoutes: [{
			path: 'list',
			getComponent(location, cb) {
				require.ensure([], (require) => {
					cb(null, require('cms/promotions/BonusTilesList.js'))
				})
			}
		}, {
			path: 'creation',
			getComponent(location, cb) {
				require.ensure([], (require) => {
					cb(null, require('cms/promotions/BonusTileCreation.js'))
				})
			}
		}, {
			path: 'edit(/:id)',
			getComponent(location, cb) {
				require.ensure([], (require) => {
					cb(null, require('cms/promotions/BonusTileCreation.js'))
				})
			}
		}]
	},
    {
        path: 'rules',
        indexRoute: indexRoute('cms/rules/list'),
        childRoutes: [{
            path: 'list',
            getComponent(location, cb) {
                require.ensure([], (require) => {
                    cb(null, require('cms/rules/GameRulesList'))
                })
            }
        }, {
            path: 'creation',
            getComponent(location, cb) {
                require.ensure([], (require) => {
                    cb(null, require('cms/rules/GameRulesCreation'))
                })
            }
        }, {
            path: 'edit(/:id)',
            getComponent(location, cb) {
                require.ensure([], (require) => {
                    cb(null, require('cms/rules/GameRulesCreation'))
                })
            }
        }]
    }, {
        path: 'modules',
        indexRoute: indexRoute('cms/modules/selector'),
        childRoutes: [{
            path: 'selector',
            getComponent(location, cb) {
                require.ensure([], (require) => {
                    cb(null, require('cms/stageOne/SelectorView'))
                })
            }
        }, {
            path: 'layouts/:id',
            getComponent(location, cb) {
                require.ensure([], (require) => {
                    cb(null, require('cms/stageOne/ModuleBuilderView'))
                })
            }
        }]
    }]
}

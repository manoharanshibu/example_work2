/**
 * Created by jamie on 18/04/2016.
 */

import { Router } from 'react-router'
import rootRoute from 'app/routes/root'

import 'common/controller/ApiController'
import 'common/controller/CommandController'

/**
 * Scrolls the window to the top on every route change
 * Firing a route change event
 */
const update = () => {
    App.bus.trigger('route:change')
    window.scrollTo(0, 0)
}

const newProps = {
    routes: rootRoute,
    history: App.browserHistory,
    onUpdate: update
}

export default (props) => {
    return (
        <Router { ...newProps } />
    )
}

import React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import Router from 'app/containers/Router'
import PopupController from 'common/view/popup/PopupController'

const rootEl = document.getElementById('body-content')
const popupEl = document.getElementById('modal-content')

render(<PopupController/>, popupEl)
render(
    <AppContainer>
        <Router />
    </AppContainer>,
    rootEl
)


if (module.hot) {
    module.hot.accept('app/containers/Router', () => {
        const NewRouter = require('app/containers/Router')
        render(
            <AppContainer>
                <NewRouter />
            </AppContainer>,
            rootEl
        )
    })
}
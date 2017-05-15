import translate from 'translate/translateReducer.js';
import modal from 'translate/modalReducer.js';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';

const loggerMiddleware = createLogger();

const reducer = combineReducers({
	translate,
	modal
});

const store = createStore(
	reducer,
	applyMiddleware(
		thunkMiddleware,   // Let's us dispatch functions
		loggerMiddleware   // neat middleware that logs actions
	)
);

export default store;

import { CLEAR_ERRORS } from './modalActions';
import {
	REMOVE_TRANSLATION_KEY_FAILURE, REMOVE_TRANSLATION_KEY_RECEIVE,
	CHANGE_TRANSLATION_KEY_FAILURE,
	ADD_TRANSLATION_KEY_RECEIVE } from './translateActions';

const modalReducer = (state, action) => {
	if (!state){
		return {
			error: false
		};
	}

	switch (action.type){
		case CLEAR_ERRORS:
			return Object.assign({}, state, {
				error: ''
			});

		case REMOVE_TRANSLATION_KEY_RECEIVE:
			return Object.assign({}, state, {
				error: 'The key has been successfully removed',
				msgType: 'success'
			});

		case REMOVE_TRANSLATION_KEY_FAILURE:
			return Object.assign({}, state, {
				error: action.errorMsg
			});

		case CHANGE_TRANSLATION_KEY_FAILURE:
			return Object.assign({}, state, {
				error: 'There has been a problem changing the translation'
			});

		case ADD_TRANSLATION_KEY_RECEIVE:
			return Object.assign({}, state, {
				error: 'The key has been successfully added',
				msgType: 'success'
			});

		default:
			return state;
	}
};

export default modalReducer;

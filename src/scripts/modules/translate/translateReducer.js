import {
	TRANSLATIONS_REQUEST, TRANSLATIONS_RECEIVE, TRANSLATIONS_FAILURE,
	// ADD_TRANSLATION_KEY_REQUEST,
	ADD_TRANSLATION_KEY_RECEIVE, ADD_TRANSLATION_KEY_FAILURE,
	REMOVE_TRANSLATION_KEY_REQUEST, REMOVE_TRANSLATION_KEY_RECEIVE, REMOVE_TRANSLATION_KEY_FAILURE,
	CHANGE_TRANSLATION_RECEIVE, CHANGE_TRANSLATION_REQUEST
} from './translateActions';

import {parseTranslations, sortAlpha, removeTranslationById} from './translateUtils';

const translateReducer = (state, action) => {
	if (!state){
		return {
			translations: [],
			isFetching: false,
			error: false
		};
	}
	switch (action.type){
		case TRANSLATIONS_REQUEST:
			return Object.assign({}, state, {
				isFetching: true,
			});

		case TRANSLATIONS_RECEIVE:
			return Object.assign({}, state, {
				isFetching: false,
				translations: parseTranslations(action.translations),
			});

		case TRANSLATIONS_FAILURE:
			return Object.assign({}, state, {
				isFetching: false,
				translations: [],
			});

		case ADD_TRANSLATION_KEY_FAILURE:
			return Object.assign({}, state, {
				isFetching: false,
			});

		case ADD_TRANSLATION_KEY_RECEIVE:
			const {newKeyId, key, values} = action;
			const {translations} = state;

			const newTrans = { id: newKeyId, key };

			for (const lang in values){
				newTrans[lang] = values[lang] || '';
			}

			// We add the new translation to the list
			const enhancedTranslations = [...translations, newTrans].sort( sortAlpha );

			return Object.assign({}, state,
				{translations: enhancedTranslations});

		case CHANGE_TRANSLATION_REQUEST:
			// We add a 'fetching' flag to the translation in the list
			const changingTranslations = state.translations.map( t => {
				if (t.id === action.id){
					t.fetching = true;
				}
				return t;
			});

			return Object.assign({}, state,
				{translations: changingTranslations});

		case CHANGE_TRANSLATION_RECEIVE:
			const {id} = action.data;

			// We replace the translation in the list
			const changedTranslations = state.translations.map( t => {

				if (t.id === id){
					//TODO: This is wrong, 'values' should be a nested prop
					const changedObj = action.data.values;
					changedObj.id = t.id;
					changedObj.key = t.key;
					return Object.assign({}, changedObj);
				}
				return t;
			});

			return Object.assign({}, state,
				{translations: changedTranslations});

		case REMOVE_TRANSLATION_KEY_REQUEST:
			console.warn('action:' , action);
			return state;

		case REMOVE_TRANSLATION_KEY_RECEIVE:
			const newTranslations = removeTranslationById(state.translations, action.translationId);

			return Object.assign({}, state,
				{translations: newTranslations});

		case REMOVE_TRANSLATION_KEY_FAILURE:
			return Object.assign({}, state, {
				isFetching: false,
			});

			return state;
		default:
			return state;
	}
};

export default translateReducer;

import fetch from 'isomorphic-fetch';

const {defaultTranslationsLang} = App.Config;

const translationsAPIbaseURL = `${App.Urls.nodepath}/translations`;
// const translationsAPIbaseURL = 'https://localhost:3000/translations';

export const ADD_TRANSLATION_KEY_REQUEST = 'ADD_TRANSLATION_KEY_REQUEST';
export const ADD_TRANSLATION_KEY_RECEIVE = 'ADD_TRANSLATION_KEY_RECEIVE';
export const ADD_TRANSLATION_KEY_FAILURE = 'ADD_TRANSLATION_KEY_FAILURE';
export const REMOVE_TRANSLATION_KEY_REQUEST = 'REMOVE_TRANSLATION_KEY_REQUEST';
export const REMOVE_TRANSLATION_KEY_RECEIVE = 'REMOVE_TRANSLATION_KEY_RECEIVE';
export const REMOVE_TRANSLATION_KEY_FAILURE = 'REMOVE_TRANSLATION_KEY_FAILURE';
export const CHANGE_TRANSLATION_REQUEST = 'CHANGE_TRANSLATION_REQUEST';
export const CHANGE_TRANSLATION_RECEIVE = 'CHANGE_TRANSLATION_RECEIVE';
export const CHANGE_TRANSLATION_FAILURE = 'CHANGE_TRANSLATION_FAILURE';
export const TRANSLATIONS_REQUEST = 'TRANSLATIONS_REQUEST';
export const TRANSLATIONS_RECEIVE = 'TRANSLATIONS_RECEIVE';
export const TRANSLATIONS_FAILURE = 'TRANSLATIONS_FAILURE';

const requestAddTranslationKey = () => {
	return { type: ADD_TRANSLATION_KEY_REQUEST };
};

const receiveAddTranslationKey = (newKeyId, key, values) => {
	return {
		type: ADD_TRANSLATION_KEY_RECEIVE,
		newKeyId,
		key,
		values
	};
};

export const addTranslationKey = (key, defaultTranslation = '') => {
	return function (dispatch) {

		dispatch(requestAddTranslationKey(key, defaultTranslation));
		const values = {[defaultTranslationsLang]: defaultTranslation};

		return fetch(`${translationsAPIbaseURL}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({key, values})
		}).then(response => response.json())
			.then(json => {
				return dispatch(receiveAddTranslationKey(json.data.id, key, values));
			} );

		//TODO: Catch errors in the API
	};
};

const requestRemoveTranslationKey = () => {
	return { type: REMOVE_TRANSLATION_KEY_REQUEST };
};

const failureRemoveTranslationKey = () => {
	return {
		type: REMOVE_TRANSLATION_KEY_FAILURE ,
		errorMsg: 'There has been an error removing the translation entry'
	};
};

const receiveRemoveTranslationKey = (status, translationId) => {
	if (status === 'success'){
		return {
			type: REMOVE_TRANSLATION_KEY_RECEIVE,
			translationId
		};
	}

	return {
		type: REMOVE_TRANSLATION_KEY_FAILURE,
		translationId
	};
};

export const removeTranslationKey = (translationId) => {
	return function (dispatch) {
		dispatch(requestRemoveTranslationKey(translationId));

		return fetch(`${translationsAPIbaseURL}/${translationId}`, {
			method: 'DELETE',
		}).then(response => response.json())
			.then(json => {
				return dispatch(receiveRemoveTranslationKey(json.status, translationId));
			}, json => {
				return dispatch(failureRemoveTranslationKey(json.status, translationId));
				}
			);
		//TODO: Catch errors in the API
	};
};

const requestTranslations = () => {
	return { type: TRANSLATIONS_REQUEST };
};

const receiveTranslations = (translations) => {
	return {
		type: TRANSLATIONS_RECEIVE,
		translations
	};
};

export const changeTranslation = (translationId, changeObj) => {
	return function (dispatch) {
		dispatch(requestChangeTranslation(translationId, changeObj));

		return fetch(`${translationsAPIbaseURL}/changeVal/${translationId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(changeObj)
		}).then(response => response.json())
			.then(json => {
				return dispatch(receiveChangeTranslation(json.status, json.data));
			});
		//TODO: Catch errors in the API
	};
};

const requestChangeTranslation = (id, changeObj) => {
	return {
		type: CHANGE_TRANSLATION_REQUEST,
		id,
		changeObj
	};
};

const receiveChangeTranslation = (status, data) => {
	if (status === 'success'){
		return {
			type: CHANGE_TRANSLATION_RECEIVE,
			data
		};
	}
	console.warn('data:' , data);
	return {
		type: CHANGE_TRANSLATION_FAILURE,
		data
	};
};

export function getAllTranslations() {
	return function (dispatch) {
		dispatch(requestTranslations());

		//TODO: Catch the error
		return fetch(`${translationsAPIbaseURL}`)
			.then(response => response.json())
			.then(json =>
					dispatch(receiveTranslations(json.data))
			);
		//TODO: Catch the error
	};
}

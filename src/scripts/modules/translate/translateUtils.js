export const sortAlpha = (a, b) => {
  var nameA = a.key.toUpperCase(); // ignore upper and lowercase
  var nameB = b.key.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }

  // names must be equal
  return 0;
};


export const parseTranslations = translations =>
	translations.map( trans => {
		// We provide sensible defaults in case
		// the API response is in a bad shape
		const {id, key='', values={}} = trans;

		// If there is no 'id', we don't want the key
		if (id){
			const row = Object.assign({}, values, {id, key});
			return row;
		}

		console.warn('found translation key without a valid id');
	})
	// We remove the 'undefined' translations
		.filter( trans => !!trans )
		.sort( sortAlpha );


export const removeTranslationById = (translations, id) => {
	const indexInArray = translations.findIndex( t => (t.id === id) );


	if (indexInArray === -1){
		return translations;
	}

	const removedArray = translations.slice(0,indexInArray).concat(
		translations.slice(indexInArray+1, translations.length));

	return removedArray;
};

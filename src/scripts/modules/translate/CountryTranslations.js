import React from 'react';
import UnauthorizedMessage from 'app/view/UnauthorizedMessage';
// import service from 'backoffice/service/ApiService';

export default class CountryTranslations extends React.Component {
	constructor(props) {
		super(props);
	}

	render(){
		return <UnauthorizedMessage />;
	}
}

CountryTranslations.displayName = 'CountryTranslations';

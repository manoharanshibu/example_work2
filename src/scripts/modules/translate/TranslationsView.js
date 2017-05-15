import React from 'react';
import translationsModel from 'backoffice/model/MarketsTranslationsModel';

export default class TranslationsView extends React.Component {
	constructor(props) {
		super(props);
	}

	render(){
		return (
			<div>
				{this.props.children}
			</div>
		);
	}
}

TranslationsView.displayName = 'TranslationsView';

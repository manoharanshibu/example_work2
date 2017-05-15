import React from 'react';
import AddTranslationView from './AddTranslationView';
import UnauthorizedMessage from 'app/view/UnauthorizedMessage';
import ReactDataGrid from 'react-data-grid';
import {confirm} from 'common/util/PopupUtil.js';
import Loader from 'app/view/Loader';
import TranslateToolbar from './TranslateToolbar';

export default class ExternalizedTranslations extends React.Component {
	constructor(props) {
		super(props);

		// Temporary permission until we have a dedicated one
		this.canAccess = App.session.request('canCmsSportMatrix');
		this.state = {
			language: 'en',
		};

		_.bindAll(this, 'rowGetter', 'onRowUpdated', 'onSelectLanguage');
	}

	onSelectLanguage(language){
		this.setState({language});
		this.forceUpdate();
	}

	onRemoveKey(index){
		const translation = this.props.translations[index];
		const message = `Are you sure you want to remove the "${translation.key}" translation key?`;

		confirm('Are you sure',message,
			this.confirmedRemoveKey.bind(this, translation.id)
		);
	}

	confirmedRemoveKey(translationId){
		this.props.onRemoveKey(translationId);
	}

	onRowUpdated(cell){
		const {cellKey, rowIdx, updated} = cell;
		const value = updated[cellKey];
		const {translations} = this.props;
		const {language} = this.state;
		const translation = translations[rowIdx];
		const changeObj = {
			[language]: value
		};

		this.props.onChangeTranslation(translation.id, changeObj);
	}

	rowGetter(index){
		const deleteBtn = (
			<div className="btn red"
				onClick={this.onRemoveKey.bind(this, index)} >Delete</div>
		);

		const {language} = this.state;
		const translation = this.props.translations[index];
		const {key, fetching} = translation;
		const val = translation[language] || '';
		const displayVal = fetching ? <Loader /> : val;
		const row = { key, val: displayVal, deleteBtn };

		return row;
	}

	render(){
		if (!this.canAccess){
			return <UnauthorizedMessage />;
		}

		const rows = this.props.translations;

		const columns = [
			{ key: 'key', name: 'Key', cellClass: 'left' },
			{ key: 'val', name: `Translation`, editable: true, cellClass: 'left editable'},
			{ key: 'deleteBtn', name: 'Actions'}
		];

		return (
			<div>
				<TranslateToolbar
					language={this.state.language}
					onSelectLanguage={this.onSelectLanguage} />

				<AddTranslationView
					translations={rows}
					onAddKey={this.props.onAddTranslationKey} />

				<ReactDataGrid
					enableCellSelect
					columns={columns}
					rowGetter={this.rowGetter}
					rowsCount={rows.length}
					onRowUpdated={this.onRowUpdated}
					minHeight={500} />;
			</div>
		);
	}

}

ExternalizedTranslations.displayName = 'ExternalizedTranslations';


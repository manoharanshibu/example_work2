import TextInput from 'backoffice/components/elements/TextInput';
import React from 'react';

const {defaultTranslationsLang} = App.Config;

export default class AddTranslationView extends React.Component {
	constructor(props) {
		super(props);

		// maybe we don't need to move this to redux
		this.state = {
			showForm: false,
			translationKey: '',
			defaultTranslationValue: '',
			errorMsg: ''
		};

		this.onAddKey = ::this.onAddKey;
		this.onChangeKey = ::this.onChangeKey;
		this.onChangeValue = ::this.onChangeValue;
		this.onShowForm = ::this.onShowForm;
	}

	onShowForm(){
		this.setState({showForm: true});
	}

	onChangeKey(rawTranslationKey){
		const translationKey = rawTranslationKey.trim();
		this.setState({translationKey, errorMsg: ''});
	}

	onChangeValue(defaultTranslationValue){
		this.setState({defaultTranslationValue});
	}

	onAddKey(value){
		const {translationKey, defaultTranslationValue} = this.state;
		if (!translationKey){
			this.setState({errorMsg: 'The translation key cannot be empty'});
			return;
		}

		const {translations} = this.props;
		const keys = translations.map(t => (t.key || '').toLowerCase());
		const alreadyInList = keys.includes(translationKey.toLowerCase());

		if (alreadyInList){
			this.setState({errorMsg: 'This key already exists'});
			return;
		}

		if (!defaultTranslationValue){
			this.setState({errorMsg: 'The default translation cannot be empty'});
			return;
		}

		this.setState({
			errorMsg: '',
			showForm: false
		});
		this.props.onAddKey(translationKey, defaultTranslationValue);
	}

	render(){
		const activeView = this.state.showForm ?
			this.renderForm() :
			this.renderShowFormButton();

		return (
			<div>
				{activeView}
			</div>
		);
	}

	renderShowFormButton(){
		return (
			<div className="flex-row padding bottom-line">
			<span className="">
				<div className="btn green"
					onClick={this.onShowForm}>Add new key</div>
			</span>
		</div>
		);
	}

	renderAddTranslationButton(){
		return (
			<span className="g5 center">
				<div className="btn green"
					onClick={this.onAddKey}>Add key</div>
			</span>
		);
	}

	renderForm() {
		const defaultTransLabel = `Default Translation (${defaultTranslationsLang})`;
		return (
			<div className="bottom-line">
				<div className="flex-row wrap padding">
					<label className="g1">Key:</label>
					<span className="g1">
						<TextInput
							focus
							placeholder="(can't be left empty)"
							value={this.state.translationKey}
							onChange={this.onChangeKey}
						/>
					</span>
					<label className="g1">{defaultTransLabel}</label>
					<span className="g1">
						<TextInput
							placeholder="(can't be left empty)"
							value={this.state.defaultTranslationValue}
							onChange={this.onChangeValue}
						/>
					</span>
					{this.renderAddTranslationButton()}
				</div>
				<div className="flex-row wrap">
					{this.renderErrorMsg()}
				</div>
			</div>
		);
	}

	renderErrorMsg(){
		const {errorMsg} = this.state;

		if (!errorMsg){
			return null;
		}

		return (
			<div className="error-box padding">{errorMsg}</div>
		);
	}
}

AddTranslationView.displayName = 'AddTranslationView';

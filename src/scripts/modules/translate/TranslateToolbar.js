import LanguageSelector from 'backoffice/components/LanguageSelector';

export default class TranslateToolbar extends React.Component {
	constructor(props) {
		super(props);

		this.onSelectLanguage = ::this.onSelectLanguage;
		this.onSearch = ::this.onSearch;
		this.onClear = ::this.onClear;
	}

	onSelectLanguage(language){
		this.setState({language});

		this.props.onSelectLanguage(language);
	}

	onSearch(){
		console.warn('on search');
	}

	onClear(){
		console.warn('on clear');
	}


	render(){
		return (
			<div className="table">
				<div className="table-row">
					{/* <div className="table-cell"> */}
					{/* 	<div style={{paddingTop: 0}}> */}
					{/* 		<label>Search</label> */}
					{/* 		<input ref="name" type="text" name="text" onChange={this.onSearch}/> */}
					{/* 		<a href="#_" className="btn blue filled" onClick={this.onClear}>Clear</a> */}
					{/* 	</div> */}
					{/* </div> */}
					<div className="table-cell">
						<LanguageSelector
							styles={{padding: 0}}
							value={this.props.language}
							onChange={this.onSelectLanguage} />
					</div>
					{this.renderSaveButton()}
				</div>
			</div>
		);
	}

	renderSaveButton(){
		const {unsavedChanges} = this.props;

		//if the 'imsavechanged props is not passed, we don't show the
		//'unsaved-changes' functionality
		if (typeof unsavedChanges === 'undefined'){
			return null;
		}

		const saveButton = (
			<a
				href="#_"
				className="btn red filled"
				onClick={this.onSaveChanges}>Save Changes</a>
		);

		const allSavedMessage = 'All saved';
		const content = unsavedChanges ? saveButton : allSavedMessage;

		return (
			<div className="table-cell">
				<div className="inline-form-elements" style={{paddingTop: 10}}>
					{content}
				</div>
			</div>
		);
	}
}

TranslateToolbar.displayName = 'TranslateToolbar';

TranslateToolbar.propTypes = {
	onSelectLanguage: React.PropTypes.func.isRequired,
	language: React.PropTypes.string.isRequired,
	unsavedChanges: React.PropTypes.bool
};

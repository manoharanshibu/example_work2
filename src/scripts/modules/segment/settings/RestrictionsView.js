import Component from 'common/system/react/BackboneComponent';
import TextInput from 'backoffice/components/elements/TextInput';
import CheckBox from 'backoffice/components/elements/CheckBox';
import ComboBox from 'backoffice/components/elements/ComboBox';
import MarketGroupSelector from 'backoffice/components/MarketGroupSelector';
import model from 'backoffice/model/CustomerSegmentModel';
import settings from 'backoffice/model/SportsbookSettingsModel';

export default class BettingRestrictionsView extends Component {
	constructor(props) {
		super(props);
		this.state = {changed: !!settings.changed};
	}

	/**
	 *
	 */
	onSave() {
		settings.saveSettings();
		this.setState({changed: false});
	}

	/**
	 *
	 */
	onReset() {
		settings.resetSettings();
		this.setState({changed: false});
	}

	/**
	 * @param bracket
	 */
	onDeleteBracket(bracket) {

	}

	/**
	 *
	 */
	onAddBracket() {
		var min = ReactDOM.findDOMNode(this.refs.addMin).value,
			max = ReactDOM.findDOMNode(this.refs.addMax).value,
			tax = ReactDOM.findDOMNode(this.refs.addTax).value;
		settings.tollsAndTaxes.addGradedTax(min, max, tax);
	}

	/**
	 * Reference the name and code inputs
	 */
	//componentDidMount() {
	//	super.componentDidMount();
	//	settings.on('change', () => {
	//		this.setState({changed: true});
	//	}).bind(this);
	//}

	/**
	 *
	 */
	//componentWillUnmount() {
	//	super.componentWillUnmount();
	//	settings.off(null, null, this);
	//}

	/**
	 * @returns {XML}
	 */
	render() {
		var tollsAndTaxes = settings.tollsAndTaxes,
			registration = settings.registrationSettings;

		var saveStyle = this.state.changed ? {} : {pointerEvents: 'none', cursor: 'default', opacity: '0.6'};
		return (
			<div className="box">
				<div style={{minHeight: '700px'}}>
					<div className="table toolbar">
						<div className="table-row">

							<div className="table-cell">
								<div className="inline-form-elements">
									<ComboBox label='Settings Region' valueLink={this.bindTo(settings, 'country')}>
										{this.renderRegions()}
									</ComboBox>
								</div>
							</div>

							<div className="table-cell right">
								<div className="inline-form-elements">
									<a className="btn green filled" style={saveStyle} onClick={this.onSave.bind(this)}>Save settings</a>
									<a className="btn red filled" style={saveStyle} onClick={this.onReset.bind(this)}>Reset settings</a>
								</div>
							</div>
						</div>
					</div>

					<div className="table">
						<div className="table-row">
							<div className="table-cell" style={{width: '50%', maxWidth: '50%'}}>
								<div className="vertical-form">
									<div className="inline-form-elements">
										<label className="g-label section-title">Tolls and Taxes</label>
									</div>
									<div className="vertical-form">
										<div className="inline-form-elements">
											<CheckBox label="Option 1 - Tax on stake (%)" valueLink={this.bindTo(tollsAndTaxes.taxOnStake, 'enabled')}/>
											<TextInput label="Tax level" type="number" valueLink={this.bindTo(tollsAndTaxes.taxOnStake, 'taxLevel')}/>
										</div>
										<div className="inline-form-elements">
											<CheckBox label="Option 2 - Tax on Winnings (%)" valueLink={this.bindTo(tollsAndTaxes.taxOnWinnings, 'enabled')}/>
											<TextInput label="Tax level" type="number" valueLink={this.bindTo(tollsAndTaxes.taxOnWinnings, 'taxLevel')}/>
										</div>
										<CheckBox label="Option 3 - Graded Tax on Winnings" value={!!tollsAndTaxes.gradedTaxOnWinnings.length}/>
									</div>

									<div className="table inner" style={{maxWidth: '240px'}}>
										<div className="table-row header larger">
											<div className="table-cell" >
												Number
											</div>
											<div className="table-cell center">
												Min
											</div>
											<div className="table-cell center">
												Max
											</div>
											<div className="table-cell center">
												Tax Level (%)
											</div>
											<div className="table-cell center">

											</div>
										</div>
										{this.renderGradedTax()}
									</div>

								</div>
							</div>

							<div className="table-cell" style={{width: '50%'}}>
								<div className="vertical-form">
									{App.Settings.Customer !== 'baba' &&
									<div className="inline-form-elements">
										<label className="g-label section-title">Product visibility</label>
										{this.renderVisibilityOptions()}
									</div>}
									<div className="inline-form-elements">
										<label className="g-label section-title">Registration Settings</label>
									</div>

									<div className="inline-form-elements">
										<CheckBox label="DOB Required" valueLink={this.bindTo(registration, 'dob')}/>
										<TextInput label="Minimum age" type="number" className='half-width-inputs' valueLink={this.bindTo(registration, 'minAge')}/>
									</div>

									<div className="vertical-form">
										<div className="inline-form-elements">
											<label className="g-label section-title">Required attributes:</label>
										</div>
										<CheckBox label="BirthName" valueLink={this.bindTo(registration, 'birthName')}/>
										<CheckBox label="Document Upload" valueLink={this.bindTo(registration, 'documentUpload')}/>
										<CheckBox label="Nationality" valueLink={this.bindTo(registration, 'nationality')}/>
										<CheckBox label="Place of Birth" valueLink={this.bindTo(registration, 'placeOfBirth')}/>
										<CheckBox label="Double OptIn" valueLink={this.bindTo(registration, 'doubleOptIn')}/>
										<CheckBox label="Use iOvation Validation" valueLink={this.bindTo(registration, 'useIOvationValidation')}/>
										<CheckBox label="Use 192 Validation" valueLink={this.bindTo(registration, 'use192Validation')}/>
									</div>

									<br></br>
								</div>
							</div>
						</div>

					</div>

					<div className="table">
						<div className="table-row">
							<div className="table-cell">
								<div className="vertical-form" style={{maxWidth: '640px', float: 'left'}}>
									<label className="g-label section-title">Restriction on Sports / Leagues / Markets</label>
									<MarketGroupSelector id="1" openField="openSportRestriction"/>
								</div>
								<div className="vertical-form" style={{maxWidth: '640px', float: 'left'}}>
									<label className="g-label section-title">Restriction on Bet Types</label>
									<MarketGroupSelector id="2" openField="openBetType"/>
								</div>
							</div>
						</div>
					</div>

				</div>
			</div>
		);
	}

	/**
	 *
	 */
	renderRegions() {
		return _.map(this.props.collection.allSettingsRegions(), (region) => {
			return (
				<option value={region.get('code')}>{_.humanize(region.get('name'))}</option>
			);
		}, this);
	}

	/**
	 * @returns {*}
	 */
	renderVisibilityOptions() {
		var visibility = settings.productVisibility;
		return _.map(visibility.options(), function(option)  {
			return <CheckBox label={_.titleize(option.name)} valueLink={this.bindTo(visibility, option.name)}/>;
		}, this);
	}

	/**
	 * @returns {*}
	 */
	renderGradedTax() {
		var brackets = settings.tollsAndTaxes.get('gradedTaxOnWinnings'),
			rows = _.map(brackets, (bracket, i) => {
				return (
					<div className="table-row">
						<div className="table-cell">
							{'Bracket '+(i+1)}
						</div>
						<div className="table-cell center">
							<input type="number" step="1" valueLink={this.bindTo(bracket, 'lowerBracket')} style={{width: '60px'}}/>
						</div>
						<div className="table-cell center">
							<input type="number" step="1" valueLink={this.bindTo(bracket, 'upperBracket')} style={{width: '60px'}}/>
						</div>
						<div className="table-cell center">
							<input type="number" step="1" valueLink={this.bindTo(bracket, 'taxLevel')} style={{width: '60px'}}/>
						</div>
						<div className="table-cell center">
							<a className="btn red small" onClick={this.onDeleteBracket.bind(this, bracket)} style={{width: '40px'}}> Delete </a>
						</div>
					</div>
				);
			});
		return rows.concat(
			<div className="table-row">
				<div className="table-cell">
					{'New Bracket'}
				</div>
				<div className="table-cell center">
					<input ref="addMin" type="number" step="1"  style={{width: '60px'}}/>
				</div>
				<div className="table-cell center">
					<input ref="addMax" type="number" step="1"  style={{width: '60px'}}/>
				</div>
				<div className="table-cell center" >
					<input ref="addTax" type="number" step="1" style={{width: '60px'}}/>
				</div>
				<div className="table-cell center" style={{width: '40px'}}>
					<a className="btn green small" onClick={this.onAddBracket.bind(this)}> Add </a>
				</div>
			</div>
		);
	}

};


BettingRestrictionsView.defaultProps = {
	collection: model.customerSegments
};















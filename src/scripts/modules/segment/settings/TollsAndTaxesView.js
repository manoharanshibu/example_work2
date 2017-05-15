import Component from 'common/system/react/BackboneComponent';
import TextInput from 'backoffice/components/elements/TextInput';
import CheckBox from 'backoffice/components/elements/CheckBox';
import settings from 'backoffice/model/SportsbookSettingsModel';

export default class TollsAndTaxesView extends Component {
	constructor(props) {
		super(props);

		this.bracketWidth = '90px';

		this.state = {
			changed: !!settings.changed
		};
	}

	/**
	 *
	 */
	onAddBracket() {
		var tollsAndTaxes = settings.tollsAndTaxes;
		var taxOnWinsEnabled = (tollsAndTaxes.taxOnWinnings && tollsAndTaxes.taxOnWinnings.get('enabled'));
		var min = ReactDOM.findDOMNode(this.refs.addMin).value,
			max = ReactDOM.findDOMNode(this.refs.addMax).value,
			tax = ReactDOM.findDOMNode(this.refs.addTax).value;

		tollsAndTaxes.addGradedTax(min, max, tax);

		if (taxOnWinsEnabled){
			tollsAndTaxes.taxOnWinnings.set('enabled', false);
		}
	}

	/**
	 * @param bracket
	 */
	onDeleteBracket(bracket) {
		settings.tollsAndTaxes.removeGradedTax(bracket);
	}

	onToggleGradedTax(){
		var tollsAndTaxes = settings.tollsAndTaxes;
		var gradedTaxEnabled = tollsAndTaxes.attributes.gradedTaxOnWinnings.length;
		var taxOnWinsEnabled = (tollsAndTaxes.taxOnWinnings && tollsAndTaxes.taxOnWinnings.get('enabled'));

		if (gradedTaxEnabled){
			if (taxOnWinsEnabled){
				tollsAndTaxes.taxOnWinnings.set('enabled', false);
			} else {
				App.bus.trigger('popup:confirm', {
					content: 'Disabling graded tax on Winnings will remove the brackets?\nAre you happy to proceed?',
					onConfirm: () => {
						tollsAndTaxes.set('gradedTaxOnWinnings', []);
				}});
			}
		} else {
		   App.bus.trigger('popup:notification', {
				   title: 'Not allowed',
				   content: 'You need to define at least one bracket before you can enable Graded Tax on Winnings',
				   autoDestruct: 2000});
		}
	}

	onKeyDown(e){
		let { value } = e.currentTarget;

		value = value.replace(/[a-z]/gi, "");

		if (value.length > 0) { // Assess value entered into field
			if (value.length === 5) { // Can't be more than 5 chars long
				if (event.keyCode !== 8) { // Backspace key
					e.preventDefault();
				}
			}
		}
	}



	/**
	 * @returns {XML}
	 */
	render() {
		var tollsAndTaxes = settings.tollsAndTaxes;
		var registrationSettings = settings.registrationSettings;
		var taxOnStakeEnabled = (tollsAndTaxes.taxOnStake && tollsAndTaxes.taxOnStake.get('enabled'));
		var taxOnWinsEnabled = (tollsAndTaxes.taxOnWinnings && tollsAndTaxes.taxOnWinnings.get('enabled'));
		var gradedTaxEnabled = tollsAndTaxes.attributes.gradedTaxOnWinnings.length;

		if (taxOnWinsEnabled) {
			gradedTaxEnabled = false;
		} else if (gradedTaxEnabled) {
			taxOnWinsEnabled = false;
		}

		return (
			<div className="vertical-form">
    				<div className="inline-form-elements">
    					<label className="section-title">Tolls and Taxes</label>
    				</div>
					<div className="inline-form-elements">
						<label htmlFor="withdrawal-aml-limit">Withdrawal AML Limit</label>
						<input id="withdrawal-aml-limit"
							   ref="withdrawal-aml-limit"
							   type="number"
							   valueLink={this.bindTo(registrationSettings, 'documentUploadAML')}
							   onKeyDown={e => this.onKeyDown(e)}
						/>
						{/*<input type="text" pattern="\d*" maxLength="4">*/}
					</div>
                    <div className="inline-form-elements">
    					<CheckBox label="Option 1 - Tax on stake (%)" valueLink={this.bindTo(tollsAndTaxes.taxOnStake, 'enabled')}/>
    					<TextInput disabled={!taxOnStakeEnabled} label="Tax level" type="number" valueLink={this.bindTo(tollsAndTaxes.taxOnStake, 'taxLevel')}/>
                    </div>
                    <div className="inline-form-elements">
    					<CheckBox label="Option 2 - Tax on Winnings (%)" valueLink={this.bindTo(tollsAndTaxes.taxOnWinnings, 'enabled')}/>
    					<TextInput disabled={!taxOnWinsEnabled} label="Tax level" type="number" valueLink={this.bindTo(tollsAndTaxes.taxOnWinnings, 'taxLevel')}/>
                    </div>
                    <div className="inline-form-elements">
        				<CheckBox label="Option 3 - Graded Tax on Winnings" value={gradedTaxEnabled}
        					onChange={this.onToggleGradedTax.bind(this)}/>
                    </div>
    				<div className="table grid inner">
    					<div className="table-row header larger">
    						<div className="table-cell" > Number </div>
    						<div className="table-cell center"> Min </div>
    						<div className="table-cell center"> Max </div>
    						<div className="table-cell center"> Tax Level (%) </div>
    						<div className="table-cell center"> </div>
    					</div>
    					{this.renderGradedTax()}
    				</div>
			</div>
		);
	}

	/**
	 * @returns {*}
	 */
	renderGradedTax() {
		var brackets = settings.tollsAndTaxes.get('gradedTaxOnWinnings'),
			rows = _.map(brackets, (bracket, i) => {
				return (
					<div className="table-row" key={'bracket_' +i}>
						<div className="table-cell">
							<span style={{width: '80px', display: 'inline-block'}}>{'Bracket '+(i+1)}</span>
						</div>
						<div className="table-cell center" style={{padding: '10px'}}>
							<TextInput type="number" step="1" valueLink={this.bindTo(bracket, 'lowerBracket')} inputStyle={{width: this.bracketWidth}}/>
						</div>
						<div className="table-cell center" style={{padding: '10px'}}>
							<TextInput type="number" step="1" valueLink={this.bindTo(bracket, 'upperBracket')} inputStyle={{width: this.bracketWidth}}/>
						</div>
						<div className="table-cell center" style={{padding: '10px'}}>
							<TextInput type="number" step="1" valueLink={this.bindTo(bracket, 'taxLevel')} inputStyle={{width: this.bracketWidth}}/>
						</div>
						<div className="table-cell center">
							<a className="btn red small" onClick={this.onDeleteBracket.bind(this, bracket)} style={{width: '50px'}}> Delete </a>
						</div>
					</div>
				);
			});
		return rows.concat(this.renderNewRow());
	}

	onChangeBracket(){
		// console.warn('settings changed');
		// console.warn(settings.changed);
	}

	/**
	 * @returns {*}
	 */
	renderNewRow() {
		return (
			<div key="new_row" className="table-row">
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
				<div className="table-cell center" style={{width: '60px'}}>
					<a className="btn green small" onClick={this.onAddBracket.bind(this)}> Add </a>
				</div>
			</div>
		);
	}

};

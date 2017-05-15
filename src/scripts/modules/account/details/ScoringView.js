import Component from 'common/system/react/BackboneComponent';
import ComboBox from 'backoffice/components/elements/ComboBox';
import model from 'backoffice/model/CustomerModel';
import RejectedDocumentsPopup from 'account/details/RejectedDocumentsPopup';
export default class ScoringView extends Component {
	constructor() {
		super();
		this.canSetPaymentBehaviour = App.session.request('canSetNormalPaymentBehavior');
		this.canSetBettingBehaviour = App.session.request('canSetNormalBettingBehavior');
		this.changeVisibleScoringOptions = App.session.request('canChangeVisibleScoringOptions');
	}

	/**
	 *
	 */
	componentDidMount() {
		var that = this;

		model.currentAccount.Scoring.on('change', () => {
			that.forceUpdate();
		}, this);

		model.currentAccount.Finance.on('change', () => {
			that.forceUpdate();
		}, this);
	}

	componentWillUnmount(){
		model.currentAccount.Scoring.off(null, null, this);
		model.currentAccount.Finance.off(null, null, this);
	}

	/**
	 *
	 */
	onSave() {
		if(this.changeVisibleScoringOptions) {
			if(model.currentAccount.Scoring.get('idCopy') === 'REJECTED' || model.currentAccount.Scoring.get('dataPlausible') === 'REJECTED'){
				//show the reject reason popup
				App.bus.trigger('popup:view', RejectedDocumentsPopup, {
					model: model.currentAccount.Scoring,
					accountId : model.currentAccount.id,
					onConfirmed: this.onConfirmed,
					onRejectedError: this.onRejectedError
				});

			}else{
				model.saveScoring();
			}

		}
	}

	onRejectedError() {
		//we have failed in the save of the rejection reason, do not procede with the save of the scoreing data.
		model.onScoringDataError();
	}

	onConfirmed() {
		model.saveScoring();
	}
	/**
	 *
	 * @returns {XML}
	 */
	renderPaymentTypes(attribs) {
		var payments = attribs.get('deposits');

		return _.map(payments, function(payment){
			return <div className="inline-form-elements">
				<label>{payment.paymentBrand}: {payment.total}</label>
			</div>;
		});
	}

	/**
	 * Renders compeition container
	 * @returns {XML}
	 */
	render() {
		var attribs = model.currentAccount.Scoring;
		var fAttribs = model.currentAccount.Finance;

		return (
			<div>
				<div className="table inner toolbar no-border-bottom">
					<div className="table-row" >
						<div className="table-cell">
							<div className="inline-form-elements">
								<label>Scoring</label>
							</div>
						</div>
						<div className="table-cell right">
							<a onClick={this.onSave.bind(this)}
								className="btn green right filled"
								style={{display:this.changeVisibleScoringOptions  ? 'block' : 'none' , cursor: this.changeVisibleScoringOptions ? 'default' : 'no-drop'}}>Save</a>
						</div>
					</div>
				</div>
				<div className="table inner no-border-bottom">
					<div className="table-row">
						<div className="vertical-form" style={{marginLeft: '5%'}}>
							<ComboBox label="ID Copy:"
									  labelStyle={{verticalAlign: 'top', minWidth: '210px'}}
									  readOnly={!this.changeVisibleScoringOptions}
									  valueLink={this.bindTo(attribs, 'idCopy')}
									  style={{minWidth:'120px'}}>
								<option value="PENDING">-</option>
								<option value="APPROVED">Approved</option>
								<option value="REJECTED">Rejected</option>
							</ComboBox>
							<ComboBox label="Address Copy:"
									  labelStyle={{verticalAlign: 'top', minWidth: '210px'}}
									  readOnly={!this.changeVisibleScoringOptions}
									  valueLink={this.bindTo(attribs, 'dataPlausible')}
									  style={{minWidth:'120px'}}>
								<option value="PENDING">-</option>
								<option value="APPROVED">Approved</option>
								<option value="REJECTED">Rejected</option>
							</ComboBox>
							<ComboBox label="Callback:"
									  labelStyle={{verticalAlign: 'top', minWidth: '210px'}}
									  readOnly={!this.changeVisibleScoringOptions}
									  valueLink={this.bindTo(attribs, 'callback')}
									  style={{minWidth:'120px'}}>
								<option value="-">-</option>
								<option value="true">Yes</option>
								<option value="false">No</option>
								<option value="pending">Pending</option>
							</ComboBox>
							<ComboBox label="Fraud colour:"
									  labelStyle={{verticalAlign: 'top', minWidth: '210px'}}
									  readOnly={!this.changeVisibleScoringOptions}
									  valueLink={this.bindTo(attribs, 'fraudColour')}
									  style={{minWidth:'120px'}}>
								<option value="-">-</option>
								<option value="GREEN">Green</option>
								<option value="YELLOW">Yellow</option>
								<option value="RED">Red</option>
							</ComboBox>
							<ComboBox label={this.canSetPaymentBehaviour ? 'Normal Payment Behaviour:' : ''}
									  labelStyle={{verticalAlign: 'top', minWidth: '210px'}}
									  readOnly={!this.changeVisibleScoringOptions}
									  valueLink={this.bindTo(attribs, 'normalPaymentBehaviour')}
									  style={{display: this.canSetPaymentBehaviour ? 'block':'none', minWidth:'120px'}}>
								<option value="-">-</option>
								<option value="true">Yes</option>
								<option value="false">No</option>
								<option value="pending">Pending</option>
								<option value="used3rdParty">used 3rd Party</option>
							</ComboBox>
						</div>

						<div className="table-cell" style={{width: '40%'}}>
							<div className="vertical-form">
								<div className="inline-form-elements">
									<label>Available for betting: {fAttribs.get('availableForBetting')}</label>
								</div>
								<div className="inline-form-elements">
									<label>Available to withdraw: {fAttribs.get('availableToWithdraw')}</label>
								</div>
								<div className="inline-form-elements">
									<label>Withdrawals: {fAttribs.get('withdrawals')}</label>
								</div>
								<div className="inline-form-elements">
									<label>Reserved: {fAttribs.get('reserved')}</label>
								</div>

								{this.renderPaymentTypes(fAttribs)}

							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
};

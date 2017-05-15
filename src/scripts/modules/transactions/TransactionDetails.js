import Component from 'common/system/react/BackboneComponent';
import Model from 'backoffice/model/Payment';
import TextInput from 'backoffice/components/elements/TextInput';
import service from 'backoffice/service/BackofficeRestfulService';
import {Link} from 'react-router';
import Loader from 'app/view/Loader';

export default class TransactionDetails extends Component {

	constructor() {
		super();
		// this.canConfirmTransaction = App.session.request('canInitiateTransaction');
		this.canPayoutAuthorization = App.session.request('canPayoutAuthorization');
		this.model = new Model();

		this.state = {
			error: '',
			loading: false
		};

		_.bindAll(this, 'onApproveSuccess', 'onRejectSuccess', 'onChangeError', 'forceReRender',
				'renderConfirmRejectButtons', 'onConfirmedRefundAction',
				'onRefundSuccess', 'onRefundError', 'loadNewTransaction',
				 'onLoadTransactionError', 'onLoadTransactionSuccess');
	}

	componentDidMount(){
		if (this.props.transactionid){
			this.loadNewTransaction(this.props.transactionId);
		}
	}

	componentWillReceiveProps(nextProps){
		var transactionId = nextProps.transactionid;

		if (transactionId && transactionId !== this.props.transactionid){
			this.model.clear();
			this.forceReRender();
			this.loadNewTransaction(transactionId);

		}
	}

	loadNewTransaction(transactionId){
		this.setState({
			error: '',
			loading: true
		});
		this.model.load(transactionId)
			.then( this.onLoadTransactionSuccess, this.onLoadTransactionError );
	}

	onLoadTransactionSuccess(){
		this.setState({
			loading: false,
		});
	}

	onLoadTransactionError(){
		this.setState({
			loading: false,
			error: 'There has been an error retrieving the details for the selected transaction'
		});
	}

	onAddTokenCriteria(token, event){
		// We need to do this because we are using a <a> tag an we don't want a
		// full page reload. We can't use <Link> because of an issue in react-router
		// 'query' params
		event.preventDefault();
		event.stopPropagation();

		if (this.props.onResetSearchCriteria){
			this.props.onResetSearchCriteria({paymentRegistrationToken: token});
		}

	}

	forceReRender(){
		this.forceUpdate();
	}

	onTransactionStatusChange(accept){
		var action = accept ? 'accept' : 'decline' ;
		var transRef = this.model.get('transRef');
		var boundAction = this.onConfirmedTransactionStatusChange.bind(this, accept, transRef);
		var message = `Are you sure you wish to ${action} the selected transaction?`;

		if (this.canPayoutAuthorization){
			App.bus.trigger('popup:confirm', { content: message, onConfirm: boundAction });
		} else {
			this.notify('Error', 'You are not allowed to perform this operation');
		}
	}

	onConfirmedTransactionStatusChange(accept, transactionId){
		var request = accept ? service.confirmPayments : service.declinePayments;
		var cb = accept ? this.onApproveSuccess : this.onRejectSuccess;

		request([transactionId])
			.then( cb, this.onChangeError );
	}

	onRefund(){
		// TO-DO: This code needs to be removed when form validation is added
		var reason = (this.refs.refundReason && this.refs.refundReason.state
						&& this.refs.refundReason.state.value) || '';
		var askedAmount = this.refs.refundAmount ? this.refs.refundAmount.state.value : '';
		var maxAmount = this.model.get('amount');
		var realReason = reason.trim();

		if (!askedAmount){
			this.notify('Error', 'You must enter an amount to refund');
			return;
		}
		if (askedAmount > maxAmount){
			this.notify('Error', 'The refund amount cannot exceed the transaction amount');
			return;
		}
		if (!(realReason.length)){
			this.notify('Error', 'You must provide a reason for the refund');
			return;
		}





		var message = `Are you sure you wish to ask for a refund on the selected transaction?`;

		if (this.canPayoutAuthorization){
			App.bus.trigger('popup:confirm', { content: message, onConfirm: this.onConfirmedRefundAction });
		} else {
			this.notify('Error', 'You are not allowed to perform this operation');
		}
	}

	onConfirmedRefundAction(){
		var reason = this.refs.refundReason ? this.refs.refundReason.state.value : '';
		var amount = this.refs.refundAmount ? this.refs.refundAmount.state.value : '';
		var transactionRef = this.model.get('transRef');
		var accountId = this.model.get('accountId');
		var data = { transactionRef, reason, amount, accountId };

		service.refundPayment(data)
			.then( this.onRefundSuccess, this.onRefundError );
	}

	onApproveSuccess(resp){
		if (resp && resp['0'] && resp['0'].status === 'FAILURE'){
			this.onChangeError();
		} else {
			this.notify('Success', `The transaction has been approved`);
			this.forceUpdate();
		}
	}

	onRejectSuccess(resp){
		if (resp && resp['0'] && resp['0'].status === 'FAILURE'){
			this.onChangeError();
		} else {
			this.notify('Success', `The transaction has been rejected`);
			this.forceUpdate();
		}
	}

	onChangeError(){
		this.notify('Error', 'The operation couldn\'t be performed');
	}

	onRefundSuccess(){
		this.notify('Success', 'The refund operation has been performed successfully');
		this.forceUpdate();
	}

	onRefundError(){
		this.notify('Error', 'There was an error in the refund operation');
	}

	notify(title='', content='', autoDestruct=2000){
		App.bus.trigger('popup:notification', {title, content, autoDestruct});
	}

	//TODO: Replace this with the global 'translate' function when there is one
	getTranslatedStatus(status){
		var statusTranslations = {
			'rejected': 'Rejected',
			'approved': 'Approved',
			'failed': 'Failure',
			'pending': 'Pending',
			'completed': 'Completed',
			'cancelled': 'Cancelled'
		};

		return statusTranslations[status] || '(unknown)';
	}

	render(){
		var attrs = _.clone(this.model.attributes);
		var creationDate;
		var translatedStatus = this.getTranslatedStatus(attrs.status);

		var statusColors = {
			'Approved': 'green',
			'Failure': 'red',
			'Pending': 'blue',
			'Rejected': 'red'
		};

		var statusColor = statusColors[translatedStatus] || 'initial';

		var paymentRegistration = this.model.get('paymentRegistration');
		var cardDetails = paymentRegistration && paymentRegistration.get('details');
		var hint = cardDetails && cardDetails.get('last4Digits');
		var expirationDate = cardDetails && cardDetails.getExpiryDate();

		if (this.state.loading){
			return <Loader />;
		}

		if (!this.props.transactionid){
			return <div>
					<p>(Select a transaction to see detailed information)</p>
				</div>;
		}

		if (this.state.error){
			return <div><p>{this.state.error}</p></div>;
		}

		// A new model has been requested but hasn't come back yet
		// This provides visual indication that the previous selection has been
		// unselected
		if (!this.model.get('status')){
			return null;
		}

		const allCardDetailsPath = '/account/cards/' + this.model.get('accountId');
		const customerDetailsPath = '/account/details/' + this.model.get('accountId');

		creationDate = moment(attrs.initiatedAt).format('DD/MM/YYYY H:mm');

		return <div >
				<div style={{overflow: 'scroll'}}>
					<div className="table toolbar">
						<div className="table-row">
							<div className="table-cell">
								<div className="inline-form-elements">
									<strong>Payout Details</strong>
								</div>
							</div>
						</div>
					</div>
					<div className="table" style={{borderBottom: '1px dotted #C0C0C0'}}>
						<div className="table-row">
							<div className="table-cell" style={{width: '60%'}}>
								<div className="table no-border-bottom">
									<div className="table-row">
										<div className="table-cell">
											<div className="inline-form-elements">
												<label>PSP Reference</label>
											</div>
										</div>
										<div className="table-cell">
											<label>{attrs.externalRef}</label>
										</div>
									</div>
									<div className="table-row">
										<div className="table-cell">
											<div className="inline-form-elements">
												<label>Merchant Reference</label>
											</div>
										</div>
										<div className="table-cell">
											{attrs.transRef}
										</div>

									</div>
									<div className="table-row">
										<div className="table-cell">
											<div className="inline-form-elements">
												<label>Merchant Account</label>
											</div>
										</div>
										<div className="table-cell">
											<label>{attrs.merchantChannel}</label>
										</div>
									</div>
									<div className="table-row">
										<div className="table-cell">
											<div className="inline-form-elements">
												<label>Creation Date</label>
											</div>
										</div>
										<div className="table-cell">
											<label>{creationDate}</label>
										</div>
									</div>
									<div className="table-row">
										<div className="table-cell">
											<div className="inline-form-elements">
												<label>Shopper Email</label>
											</div>
										</div>
										<div className="table-cell">
											<label>{attrs.accountEmail}</label>
										</div>
									</div>
									<div className="table-row">
										<div className="table-cell">
											<div className="inline-form-elements">
												<label>Shopper Name</label>
											</div>
										</div>
										<div className="table-cell">
											<Link to={customerDetailsPath}>{attrs.accountName}</Link>
										</div>
									</div>
									<div className="table-row">
										<div className="table-cell">
											<div className="inline-form-elements">
												<label>Recurring Detail Reference</label>
											</div>
										</div>
										<div className="table-cell">
											<label>
												<a onClick={this.onAddTokenCriteria.bind(this, attrs.token)}
													href={`/transactions/payments?paymentRegistrationToken=${attrs.token}`}>{attrs.token}</a>
											</label>
										</div>
									</div>
									<div className="table-row">
										<div className="table-cell">
											<div className="inline-form-elements">
												<label>Stored Details</label>
											</div>
										</div>
										<div className="table-cell">
											<label>
												<Link to={allCardDetailsPath}>See stored details</Link>
											</label>
										</div>
									</div>
								</div>
							</div>
							<div className="table-cell border-left">
							</div>
							<div className="table-cell">
								<div className="table no-border-bottom">
									<div className="table-row">
										<div className="table-cell narrow">
											<div className="inline-form-elements">
												<label>Payment Method</label>
											</div>
										</div>
										<div className="table-cell">
											<label>{attrs.paymentMethod || ''}</label>
										</div>
									</div>
									<div className="table-row">
										<div className="table-cell narrow">
											<div className="inline-form-elements">
												<label>Amount</label>
											</div>
										</div>
										<div className="table-cell">
											<label>{attrs.amount}</label>
										</div>

									</div>
									<div className="table-row">
										<div className="table-cell narrow">
											<div className="inline-form-elements">
												<label>State</label>
											</div>
										</div>
										<div className="table-cell">
											<label style={{color: statusColor}}>{translatedStatus}</label>
										</div>
									</div>
									<div className="table-row">
										<div className="table-cell narrow">
											<div className="inline-form-elements">
												<br/>
											</div>
										</div>
										<div className="table-cell">
											<br/>
										</div>
									</div>
									<div className="table-row">
										<div className="table-cell narrow">
											<div className="inline-form-elements">
												<label>Hint (e.g. Last 4 digits)</label>
											</div>
										</div>
										<div className="table-cell">
											<label>{hint}</label>
										</div>
									</div>
									<div className="table-row">
										<div className="table-cell narrow">
											<div className="inline-form-elements">
												<label>Issuer Country</label>
											</div>
										</div>
										<div className="table-cell">
											<label>{attrs.issuerCountry}</label>
										</div>
									</div>
									<div className="table-row">
										<div className="table-cell narrow">
											<div className="inline-form-elements">
												<label>Shopper Country</label>
											</div>
										</div>
										<div className="table-cell">
											<label>{attrs.accountCountry}</label>
										</div>
									</div>
									<div className="table-row">
										<div className="table-cell narrow">
											<div className="inline-form-elements">
												<label>Expiration Date</label>
											</div>
										</div>
										<div className="table-cell">
											<label>{expirationDate}</label>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					{this.renderActions()}
				</div>
				{this.renderHistory()}
			</div>;
	}

	renderActions(){
		var status = this.model.get('status');

		switch (status){
			case 'pending':
				if (this.model.get('direction') === 'Payout'){
					return this.renderConfirmRejectButtons();
				}
			case 'completed':
				if (this.model.get('direction') === 'Deposit'){
					return this.renderRefundForm();
				}
				return null;
			default:
				return null;
		}
	}

	renderConfirmRejectButtons(){
		return <div className="table-row">
						<div className="table-cell">
								<button className="btn green filled"
									onClick={this.onTransactionStatusChange.bind(this, true)}
									style={{cursor: this.canPayoutAuthorization ? 'default' : 'no-drop'}}>Confirm</button>
								&nbsp;
								<button className="btn green filled"
									onClick={this.onTransactionStatusChange.bind(this, false)}
									style={{cursor: this.canPayoutAuthorization ? 'default' : 'no-drop'}}>Reject</button>
						</div>
					</div>;
	}

	renderRefundForm(){
		var currency = this.model.get('currency') || 'EUR';
		var refundDate = moment(this.model.get('initiatedAt'));
		var latestAllowedRefundDate = moment().subtract(14, 'days');

		var refundAllowed = refundDate.isAfter(latestAllowedRefundDate);

		if (!refundAllowed){
			return <div><p>The refund is not allowed after 14 days since the deposit was made</p></div>;
		}



		return <div className="table-row">
						<div className="table-cell">
							<TextInput
								placeholder=""
								ref="refundAmount"
								label="Refund Amount" />
						</div>
						<div className="table-cell" style={{textAlign: 'left'}}>
							<div className="inline-form-elements">
								<label
									style={{verticalAlign: 'middle', height: '0px'}}>
									{currency}</label>
							</div>
						</div>
						<div className="table-cell">
							<TextInput
								placeholder=""
								ref="refundReason"
								label="Reason" />
						</div>
						<div className="table-cell">
							<button className="btn green filled"
								type="submit"
								onClick={this.onRefund.bind(this, false)}
								style={{cursor: this.canPayoutAuthorization ? 'default' : 'no-drop'}}>Refund</button>

						</div>
					</div>;
	}

	renderHistory(){
		return  <div>
					<div className="table toolbar" style={{borderTop: '1px dotted #C0C0C0'}}>
						<div className="table-row">
							<div className="table-cell">
								<div className="inline-form-elements">
									<strong>History</strong>
								</div>
							</div>
						</div>
					</div>
					<div className="table fixed-table">
						<div className="table-row header larger">
							<div className="table-cell " style={{width: '150px'}}>
								Date
							</div>
							<div className="table-cell " style={{width: '100px'}}>
								State
							</div>
							<div className="table-cell ">
								API Response
							</div>
						</div>
						{this.renderHistoryRows()}
					</div>
				</div>;
	}

	renderHistoryRows(){
		var rows = this.model.get('transactions') || [];

		return _.map(rows.models, (historyItem, index) => {
				var attrs = historyItem.attributes;
				var time = moment(attrs.transactionTime).format('DD/MM/YYYY H:mm');
				var status = attrs.accountTransactionType;
				return (<div key={index} className="table-row">
						<div className="table-cell ">{time} </div>
						<div className="table-cell ">{status} </div>
						<div className="table-cell ">{attrs.description} </div>
					</div>);
		});
	}
}

TransactionDetails.displayName = 'TransactionDetails';

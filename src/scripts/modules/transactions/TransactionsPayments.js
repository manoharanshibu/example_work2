import Component from 'common/system/react/BackboneComponent';
import ComboBox from 'backoffice/components/elements/ComboBox';
import TextInput from 'backoffice/components/elements/TextInput';
import CheckBox from 'backoffice/components/elements/CheckBox';
import {DateTimePicker} from 'react-widgets';
import {trailingSlashes as slashes} from 'common/util/RegEx';
import PayoutTransactionPopup from 'segment/account/PayoutTransactionPopup';
import model from 'backoffice/model/TransactionPaymentsModel';
import TransactionDetails from 'transactions/TransactionDetails';
import {classNames as cx} from 'common/util/ReactUtil';
import Loader from 'app/view/Loader';
import ReactDataGrid from 'react-data-grid';

export default class TransactionsPayments extends Component {

	constructor(props) {
		super(props);

		this.state = {
			selectedTransactions:[],
			hilitedTransaction: 0,
			loading: false
		};
		this.canPayoutAuthorization = App.session.request('canPayoutAuthorization');
		this.transactionSelected = false;
		this.onSearchSuccess = ::this.onSearchSuccess;
		this.onSearchError = ::this.onSearchError;
		this.onResetSearchCriteria = ::this.onResetSearchCriteria;
		this.rowGetter = ::this.rowGetter;
		this.onCheckUncheckAll = ::this.onCheckUncheckAll;
		this.onSelectTransaction = ::this.onSelectTransaction;
		this.onDeselectTransaction = ::this.onDeselectTransaction;
	}

	componentWillReceiveProps(nextProps){
		var searchCriteria = nextProps && nextProps.location && nextProps.location.query;

		if (_.keys(searchCriteria).length){
			model.searchCriteria.clear();
			model.searchCriteria.set(searchCriteria);
			this.onSearch();
		}
	}

	// This is called by the details view to force a new search based on new criteria
	onResetSearchCriteria(criteria){
			model.searchCriteria.set(criteria);
			this.onSearch();
	}

	initTransaction(e) {
			App.bus.trigger('popup:view', PayoutTransactionPopup);
	}

	onSelectAccount(id) {
		// transitions to the account page in this app

		let anchor = ReactDOM.findDOMNode(this.refs.hidden),
			location = window.location.origin.replace(slashes, '');

		// opens new browser tab to display account page
		let route = `/account/details/${id}`,
			href = App.browserHistory.createHref(route);

			anchor.href = `${location}${href}`;
			anchor.click();
	}

	onSelectTransaction(index) {
		const hilitedTransaction = this.props.collection.models[index].get('transRef')
		this.setState({hilitedTransaction});
	}

	onDeselectTransaction() {
		this.setState({hilitedTransaction: 0});
	}

	componentWillMount(){
		const searchCriteria = this.props && this.props.location && this.props.location.query;

		// If the url params object is not empty
		if (_.keys(searchCriteria).length){
			model.searchCriteria.clear();
			model.searchCriteria.set(searchCriteria);
		}
	}



	componentDidMount() {
		this.props.collection.on('add remove reset', () => {
			this.forceUpdate();
		});
		this.onSearch();
	}

	/**
	 *
	 */
	componentWillUnmount() {
		this.props.collection.off(null, null, this);
	}
	/**
	 *
	 */
	onSearch(e) {
		if (e){
			e.preventDefault();
		}
		this.setState({'loadingError' : false});
		this.setState({
			selectedTransactions:[],
			hilitedTransaction: 0,
			loading: true
		});
		this.transactionSelected = false;
		const promise = model.searchTransactionPayments();

		promise.then( this.onSearchSuccess, this.onSearchError );

	}

	onGetTotals() {
		model.getAccumulatedTotalCurrencyVal();
	}

	onSearchSuccess(){
		this.onGetTotals();
		this.setState({loading: false});
	}

	onSearchError(error){
		App.bus.trigger('popup:notification', {title: 'Error', content:'There has been an error retrieving the payment transactions', autoDestruct: 2000});
		this.setState({loading: false});
		this.props.collection.reset([]);
		this.forceUpdate();
		console.warn(error);
	}

	onFromDateChange(date) {

		// set time to midnight to get all transactions for day
		if (date) {
			date = date.setHours(0,0,0,0);
		}

		model.searchCriteria.set({
			'from': date
		});
	}

	onToDateChange(date) {

		// set time to midnight to get all transactions for day
		if (date) {
			date = date.setHours(23, 59, 59, 999);
		}

		model.searchCriteria.set({
			'to': date
		});

	}

	onProcessPayments(confCode){
		var message = `Are you sure you wish to ${confCode} the following transactions : ${this.state.selectedTransactions.join(',') } `;
		if(confCode === 'Confirm') {
			App.bus.trigger('popup:confirm', {
				content: message, onConfirm: () => {
					model.confirmPayments(this.state.selectedTransactions);
					this.setState({selectedTransactions:[]});
					this.transactionSelected = false;
				}
			});
		}else{//DECLINE
			App.bus.trigger('popup:confirm', {
				content: message, onConfirm: () => {
					model.declinePayments(this.state.selectedTransactions);
					this.setState({selectedTransactions:[]});
					this.transactionSelected = false;
				}
			});
		}
	}

	onCheckUncheckAll(transRef , checked){
		var that = this;
		this.transactionSelected = false;
		if(checked === true)
		{
			var tempArray = [];
			for (var i = 0; i < that.props.collection.models.length; i += 1) {
				if(that.props.collection.models[i].attributes.direction ==='Payout' && that.props.collection.models[i].attributes.status ==='pending'){
					tempArray.push(that.props.collection.models[i].get('transRef'));
					that.transactionSelected = true;
				}
			}
			that.setState({selectedTransactions:tempArray});
		}
		else
		{
			that.setState({selectedTransactions:[]});

		}

	}

	onCheckUncheckPayment(transRef , checked){
		var elemPos = this.state.selectedTransactions.indexOf(transRef);
		if(checked === true)
		{
			if (elemPos === -1){
				var tempArray = this.state.selectedTransactions;
				tempArray.push(transRef);
				this.setState({selectedTransactions:tempArray});
			}
		}
		else
		{
			if(elemPos !== -1){
				var tempArray2 = this.state.selectedTransactions;
				tempArray2.splice(elemPos,1);
				this.setState({selectedTransactions:tempArray2});
			}
		}
		this.transactionSelected = this.state.selectedTransactions.length > 0;
	}

	//TODO: Replace this with the global 'translate' function when there is one
	getTranslatedStatus(status){
		var statusTranslations = {
			'WITHDRAWAL_APPROVED': 'Approved',
			'DEPOSIT_FAILED': 'Failure',
			'REFUND_FAILED': 'Failure',
			'WITHDRAWAL_FAILURE': 'Failure',
			'DEPOSIT_PENDING': 'Pending',
			'REFUND_PENDING': 'Pending',
			'WITHDRAWAL_PENDING': 'Pending',
			'WITHDRAWAL_REJECTED': 'Rejected',
			'WITHDRAWAL_SUBMITTED': 'Submitted',
			'DEPOSIT': 'Completed',
			'REFUND': 'Completed',
			'DEPOSIT_SUCCESS': 'Completed',
			'WITHDRAWAL_COMPLETED': 'Completed',
			'WITHDRAWAL_CANCELLED': 'Cancelled',
			'approved': 'Approved',
			'failed': 'Failure',
			'pending': 'Pending',
			'completed': 'Completed',
			'cancelled': 'Cancelled',
			'rejected': 'Rejected'
		};

		return statusTranslations[status] || '(unknown)';
	}

	rowGetter(index){
		let {currency, direction, status, amount, balance, withdrawals, txCountry, paymentMethod, lastModified} = this.props.collection.models[index].attributes;
		const {transRef, paymentRegistration, initiatedAt, accountName, account, accountId, externalRef, accountEmail, accountCountry, ipAddress} = this.props.collection.models[index].attributes;

		status = this.getTranslatedStatus(status);
		const isPendingPayout = (direction === 'Payout' && status === 'pending') ? 'block' : 'none';
		currency = currency || 'EUR';

		const option = {style: 'currency', currency: currency};
		amount = new Intl.NumberFormat('en-GB', option).format(amount);
		balance = new Intl.NumberFormat('en-GB', option).format(balance);
		withdrawals = new Intl.NumberFormat('en-GB', option).format(withdrawals);

		txCountry = txCountry ? txCountry : '';
		const format = 'DD-MM-YYYY HH:mm:ss';
		const issuerCountry = paymentRegistration && paymentRegistration.issuerCountry || 'N/A';

		direction = _.titleize(direction.replace(/_/g, ' '));
		paymentMethod = _.titleize(paymentMethod.replace(/_/g, ' '));
		const date = moment(initiatedAt).format(format)
		lastModified = moment(lastModified).format(format)
		let details = '';
		if(account){
			if(account.type === "DIRECTDEBIT_SEPA"){
				const info = JSON.parse(account.details);
				if(info){
					details = (<span>{`Holder: ${info.holder} `}<br/>{`IBAN: ${info.iban}`}</span>) ;
				}
			}else{
				details = account.displayName;
			}
		}
		const userButton = (
			<a className="btn green block bgwhite" onClick={this.onSelectAccount.bind(this, accountId)}>{accountName}</a>
		);
		const checked = (_.indexOf(this.state.selectedTransactions, transRef) !== -1);
		const checkbox = isPendingPayout ?
			<CheckBox style={{display: isPendingPayout}} onChange={this.onCheckUncheckPayment.bind(this, transRef)}
				value={checked}/> : null;
		const isSelected = (transRef === this.state.hilitedTransaction);
		return {accountId, accountEmail, accountCountry, amount, balance, date, details, direction, issuerCountry,
			paymentMethod, transRef, externalRef, txCountry, userButton, withdrawals, checkbox, ipAddress, lastModified, status, isSelected };

	}

	/**
	 * @returns {XML}
	 */
	render() {
		var checked = this.state.selectedTransactions.length > 0;

		return (
				<div className="box">
					<div style={{minHeight: window.innerHeight - 50 , display: !this.canPayoutAuthorization ? 'block' : 'none'}}>
						<div className="table toolbar">
							<div className="table-row">
								<div className="table-cell">
									<div className="inline-form-elements">
										<strong>YOU ARE NOT AUTHORISED TO USE THIS FUNCTION</strong>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div style={{minHeight: window.innerHeight - 50 , display: this.canPayoutAuthorization ? 'block' : 'none'}}>
						<div className="table inner toolbar no-border-bottom">
							<div className="table-row">
								{this.renderComboboxes()}
								<div className="table-cell">
									<div className="inline-form-elements">
										<label>From</label>
										<DateTimePicker format='DD/MM/YYYY' time={false} onChange={this.onFromDateChange.bind(this)} />
									</div>
								</div>
								<div className="table-cell">
									<div className="inline-form-elements">
										<label>To</label>
										<DateTimePicker format='DD/MM/YYYY' time={false} onChange={this.onToDateChange.bind(this)} />
									</div>
								</div>
								<div className="table-cell">
									<div className="inline-form-elements">
										<TextInput ref="account" className="shopper-account" valueLink={this.bindTo(model.searchCriteria, 'accountName')} label="Shopper Account"/>
									</div>
								</div>
								<div className="table-cell">
									<div className="inline-form-elements">
										<TextInput ref="transactionId" className="transaction-id" valueLink={this.bindTo(model.searchCriteria, 'transactionId')} label="Transaction Id"/>
									</div>
								</div>
								<div className="table-cell narrow">
									<button className="btn blue filled" onClick={this.onSearch.bind(this)}>Search</button>
								</div>
								<div className="table-cell">
									<ComboBox
										label="Totals"
										labelStyle={{ verticalAlign: 'center', paddingLeft: 10}}>
											{_.map(model.searchResultCurrencyAccumulator.currencyArray, currency => this.renderCurrency(currency))}
									</ComboBox>
								</div>
							</div>
						</div>
						<div style={{minHeight: window.innerHeight - 250 , display: this.canPayoutAuthorization ? 'block' : 'none'}}>
							{this.renderTable()}
							<div className="table toolbar">
								<div className="table-row">
									<div className="table-cell" style={{display: this.transactionSelected ? 'block':'none'}}>
										<div className="pull-left">
											<button className="btn green filled" disabled={!this.canPayoutAuthorization}
												style={{cursor: this.canPayoutAuthorization ? 'default' : 'no-drop'}}
												onClick={this.onProcessPayments.bind(this , 'Confirm')}>Confirm Selected</button>&nbsp; &nbsp;
										</div>
										<div>
											<button className="btn blue filled" disabled={!this.canPayoutAuthorization}
												style={{cursor: this.canPayoutAuthorization ? 'default' : 'no-drop'}}
												onClick={this.onProcessPayments.bind(this , 'Decline')}>Decline Selected</button>
										</div>

									</div>
								</div>
							</div>
						</div>
					<TransactionDetails transactionid={this.state.hilitedTransaction}
						onResetSearchCriteria={this.onResetSearchCriteria}
					/>
				</div>
				<a ref="hidden" target="_blank" style={{display:'none'}}/>
			</div>
		);
	}

	renderCurrency(currency)
	{
		const option = {style: 'currency', currency: currency.currency};
		let amount = new Intl.NumberFormat('en-GB', option).format(currency.value);
		return (
			<option value={currency.currency}>{amount}</option>
		);
	}

	renderTable(){

		if(this.state.loading){
			return <Loader />;
		}
		const checked = this.transactionSelected;
		const selectAll = <div>Select All <br/><CheckBox onChange={this.onCheckUncheckAll} value={!!checked} /></div>
		const intoDiv = (first, second) => <div>{first}<br/>{second}</div>;
		const columns = [
			{ key: 'date', name: 'Date', width: 100, cellClass:'center' },
			{key: 'accountId', name: intoDiv('Account', 'ID'), width: 100, cellClass:'center'},
			{key: 'direction', name: 'Direction', width: 100, cellClass:'center'},
			{key: 'transRef', name: intoDiv('Transaction', 'ID'), width: 150, cellClass:'center'},
			{key: 'externalRef', name: intoDiv('PSP', 'Reference'), width: 150, cellClass:'center'},
			{key: 'status', name: 'Status', width: 80, cellClass:'center'},
			{key: 'paymentMethod', name: intoDiv('Payment', 'Method'), width: 100, cellClass:'center'},
			{key: 'amount', name: 'Amount', width: 100, cellClass:'right'},
			{key: 'balance', name: 'Balance', width: 100, cellClass:'right'},
			{key: 'withdrawals', name: 'Withdrawals', width: 110, cellClass:'right'},
			{key: 'accountEmail', name: 'Email', width: 250, cellClass:'center'},
			{key: 'userButton', name: 'Account', width: 150, cellClass:'center'},
			{key: 'accountCountry', name: intoDiv('Shopper', 'Country'), width: 80, cellClass:'center'},
			{key: 'issuerCountry', name: intoDiv('Issuer', 'Country'), width: 80, cellClass:'center'},
			{key: 'ipAddress', name: 'IP Address', width: 100, cellClass:'center'},
			{key: 'checkbox', name: selectAll, width: 90, cellClass:'center'}];

		const length = this.props.collection.length;

		return (
			<ReactDataGrid
				columns={columns}
				minHeight={window.innerHeight * 0.75}
				rowGetter={this.rowGetter}
				rowsCount={length}
				rowHeight={45}
				headerRowHeight={50}
				onRowClick={this.onSelectTransaction}
				rowSelection={{
					showCheckbox: false,
					selectBy: {
						isSelectedKey: 'isSelected'
					}
				}}
			/>
		);

	}


	renderComboboxes(){
		const directionList = [{name: "Payout", value: "Payout"}, {name: "Deposit", value: "Deposit"}];

		const merchantList = [{name: "EUR", value: "EUR"},
			{name: "EUR GR", value: "EUR_GR"},
			{name: "GBP", value: "GBP"},
			{name: "SEK", value: "SEK"},
			{name: "GHS", value: "GHS"}
		];

		const statusList = [{name: "Approved", value: "approved"},
			{name: "Failure", value: "failed"},
			{name: "Pending", value: "pending"},
			{name: "Rejected", value: "rejected"},
			{name: "Completed", value: "completed"},
			{name: "Cancelled", value: "cancelled"}
			/*{name: "Cleared", value: "CLEARED"}*/];

		const methodList = [{name: "Bank Transfer", value: "DIRECTDEBIT_SEPA"},
			{name: "Card", value: "CARD"}
		];

		return (
			<div>
				{this.renderCombobox("Direction", 'direction', directionList, '80px')}
				{this.renderCombobox("Merchant", 'merchantChannel', merchantList, '120px')}
				{this.renderCombobox("Status", 'status', statusList, '100px')}
				{this.renderCombobox("Method", 'method', methodList, '150px')}
			</div>
		);
	}

	renderCombobox(label, attribute, list, width){
		const options = list.map( (option, index) => <option key={index} value={option.value}>{option.name}</option>);

		return (
			<div className="table-cell">
				<div className="inline-form-elements">
					<ComboBox label={label}
							  valueLink={this.bindTo(model.searchCriteria, attribute)}
							  style={{width: width}}
							  labelStyle={{verticalAlign:'middle'}}>
						<option value="All">All</option>
						{options}
					</ComboBox>
				</div>
			</div>);
	}
};

TransactionsPayments.defaultProps = {
	collection: model.searchResults
};

TransactionsPayments.displayName = 'TransactionsPayments';

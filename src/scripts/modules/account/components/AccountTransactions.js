import Component from 'common/system/react/BackboneComponent';
import ComboBox from 'backoffice/components/elements/ComboBox';
import {DateTimePicker} from 'react-widgets';
import TabList from 'backoffice/components/lists/TabList';
import model from 'backoffice/model/transactions/TransactionsModel';
import custModel from 'backoffice/model/CustomerModel';
import Tooltip from 'backoffice/components/tooltips/Tooltip';
import InitiateTransactionPopup from 'segment/account/InitiateTransactionPopup';
import Loader from 'app/view/Loader';
import Popup from 'common/view/popup/Popup';
import ReactDataGrid from 'react-data-grid';
import { DownloadJsonInXls } from 'app/util/Converters';
import ExcelTransactionsExportPopup from 'account/components/ExcelTransactionsExportPopup';


const format = 'YYYY-MM-DD';
const transactionTypes = ['PLACE_BET', 'SETTLE_BET', 'VOID_BET', 'VOID_SETTLED_BET', 'UNSETTLE_BET', 'AMEND_BET', 'WITHDRAWAL_CANCELLED',
	'WITHDRAWAL_COMPLETED', 'RESETTLEMENT', 'REFUND_TAX_ON_WINNINGS', 'DEPOSIT_FAILED', 'REFUND_FAILED', 'REFUND_SUCCESS',
	'DEPOSIT_FEE', 'FINANCE_CORRECTION_DEPOSIT', 'INTERNATIONAL_WITHDRAWAL_FEE', 'PAYMENT_FEE,BONUS', 'DEPOSIT_SUCCESS',
	'WITHDRAWAL_APPROVED', 'TAX_ON_WINNINGS', 'TAX_ON_STAKE', 'ADJUSTMENT', 'WINNINGS_EXPIRED', 'FINANCE_CORRECTION_WITHDRAWAL',
	'REFUND_PENDING', 'BONUS_MARKETING', 'DEPOSIT', 'WITHDRAWAL_PENDING', 'WITHDRAWAL_FAILURE', 'STAKE', 'REFUND', 'SETTLEMENT', 'UNSETTLEMENT',
	'DEPOSIT_REVERT', 'DEPOSIT_BONUS', 'BONUS_CANCELLED', 'BONUS_EXECUTED', 'WITHDRAWAL_REJECTED', 'CHIPS_BUY', 'CHIPS_SELL', 'CHIPS_BUY_REVERT',
	'CHIPS_SELL_REVERT', 'BONUS_DEPOSIT', 'BONUS_EXPIRY', 'PAYOUT', 'REFUND_TAX_ON_STAKE', 'RELEASE_BONUS', 'SETTLEMENT_PAID,WINNINGS_BONUS',
	'AFFILIATE_PROGRAM', 'GOODWILL', 'ROLLED_UP_BALANCE', 'FREEBET_STAKE', 'INTERNATIONAL_WITHDRAWAL'];

export default class AccountStats extends Component {

	constructor(props) {
		super(props);
		this.canInitiateTransaction = App.session.request('canInitiateTransaction');

		this.state = {
			selectedTransaction: null,
			loading: false,
			isPopupOpen: false
		};
		_.bindAll(this, 'getTransactionHistory', 'onGetTransactionsSuccess',
			'onGetTransactionsError');

		this.rowGetter = ::this.rowGetter;
	}


	componentWillMount() {
		model.on('change', () => {
			this.forceUpdate();
		}, this);
	}

	/**
	 *
	 */
	componentDidMount() {

		//set initial dates
		const dateFrom = moment().subtract(3, 'months').format(format);
		const dateTo = moment().format(format);

		model.set({
			accountId: custModel.currentAccount.id,
			fromDate: dateFrom,
			toDate: dateTo,
			includePaymentInfo: true
		});

		//default transactions load
		this.getTransactionHistory();
	}


	componentWillUnmount() {
		model.off('change', null, this);
	}

	/**
	 *
	 * @param date
	 */
	onFromDateChange(date) {
		model.set({fromDate: moment(date).format(format)});
	}

	/**
	 *
	 * @param date
	 */
	onToDateChange(date) {
		model.set({toDate: moment(date).format(format)});
	}

	/**
	 *
	 * @param e
	 */
	onOrderChange(e) {
		model.set({reverseOrder: e.currentTarget.checked});

		this.getTransactionHistory();
	}

	/**
	 *
	 */
	getTransactionHistory() {
		model.set({currentPage: 1});
		model.getTransactions()
			.then(this.onGetTransactionsSuccess, this.onGetTransactionsError);
		this.setState({loading: true});
	}

	onGetTransactionsSuccess() {
		this.setState({loading: false});
	}

	onGetTransactionsError() {
		this.setState({loading: false});
	}


	onRowClick(transactions, index) {
		const transaction = transactions[index];
		this.setState({
			selectedTransaction: transaction,
		});
	}

	onClosePopup() {
		this.setState({
			selectedTransaction: null
		});
		this.getTransactionHistory();
	}

	/////////////
	///FILTERS///
	/////////////

	/**
	 *
	 * @param newSize
	 */
	onPageSizeChange(newSize) {
		model.updatePageSize(parseFloat(newSize));
	}

	/**
	 *
	 * @param newSize
	 */
	onCasinoOrSportsbookChange(val) {
		model.set({currentPage: 1});
		model.onCasinoOrSportsbookChange(val);
		this.forceUpdate();
	}

	/**
	 *
	 */
	onPreviousPage() {
		let currentPage = model.get('currentPage');

		if (currentPage > 1) {
			currentPage -= 1;
			model.set({currentPage});
			model.getTransactions();
		}
	}

	/**
	 *
	 */
	onNextPage() {
		let {currentPage, totalPages} = model.attributes;

		if (currentPage < totalPages) {
			currentPage += 1;
			model.set({currentPage});
			model.getTransactions();
		}
	}

	initTransaction(e) {
		if (this.canInitiateTransaction) {
			App.bus.trigger('popup:view', InitiateTransactionPopup, {
				getTransactionHistory: this.getTransactionHistory,
				accountId: custModel.currentAccount.id,
				onClose: ::this.onClosePopup,
				wallets: custModel.currentAccount.get('customerWalletFunds')
			});
		}
	}

	onExportToExcel() {
		model.getTransactionsToExport()
			.then(::this.onGetTransactionsToExport, ::this.onGetTransactionsError);
		this.setState({loading: true});
	}

	onGetTransactionsToExport(){
		App.bus.trigger('popup:view', ExcelTransactionsExportPopup, { collection: ::this.getExcelArray(), title: 'Transaction_History_Punter_' + custModel.currentAccount.id });
		this.setState({loading: false});
	}

	getExcelArray() {
		const excelArray =  [this.getColumns().map(c => c.name)];
		const transactions = model.get('sportsTransactionsToExport');
		transactions.forEach((t, i) => {
				excelArray.push(this.rowGetter(transactions, i));
			}
		)
		return excelArray;
	}


	getColumns() {
		return [
			{ key: 'id', name: 'Id', resizable: true, width: 100 },
			{ key: 'formattedDate', name: 'Date', resizable: true },
			{ key: 'type', name: 'Type', resizable: true },
			{ key: 'fullReason', name: 'Reason', resizable: true, width: 300 },
			{ key: 'amount', name: 'Amount', resizable: true },
			{ key: 'cashBalance', name: 'Balance', resizable: true },
			{ key: 'bonusBalance', name: 'Reserved', resizable: true },
			{ key: 'fundType', name: 'Fund Type', resizable: true },
			{ key: 'creator', name: 'Creator', resizable: true },
		];
	}

	/**
	 * Renders competition container
	 * @returns {XML}
	 */
	render() {
		const wallets = custModel.currentAccount.get('customerWalletFunds');
		const pagingVisible = model.get('totalPages') > 1;
		let allFundTypes = [];
		if (!!wallets && wallets.length) {
			allFundTypes = wallets.map(wallet => ({
				name: _.titleize(_.humanize(wallet.activeFundsType)),
				id: wallet.activeFundsType
			}));
		}
		const allTransactionTypes = transactionTypes.map(transaction => ({
			name: _.titleize(_.humanize(transaction)),
			id: transaction.charAt(0) === transaction.charAt(0).toLowerCase() ? 'PAYOUT' : transaction
			//workaround until lowerCase transType are saved with their values in the DB
		}));

		const {reverseOrder, pageSize, currentPage, totalPages, casinoOrSportsbook} = model.attributes;
		return (
			<div className="box">
				<div style={{minHeight: window.innerHeight - 50}}>
					<div className="table toolbar">
						<div className="table-row">
							<div className="table-cell">
								<div className="inline-form-elements">
									<label>From</label>
									<DateTimePicker ref="fromDate"
													onChange={::this.onFromDateChange}
													format='DD-MM-YYYY'
													time={false}
													defaultValue={new Date(moment().subtract(3, 'months'))}/>
								</div>
							</div>
							<div className="table-cell">
								<div className="inline-form-elements">
									<label>To</label>
									<DateTimePicker ref="toDate"
													onChange={::this.onToDateChange}
													format='DD-MM-YYYY'
													time={false}
													defaultValue={new Date()}
													max={new Date()}/>
								</div>
							</div>

							<div className="table-cell">
								<div className="inline-form-elements">
									<TabList ref="fundTypeList"
											 title={"Fund type"}
											 list={allFundTypes}
											 valueLink={this.bindTo(model, 'fundType')}
											 data-tip="Blank = All fund types included."
											 data-multiline={true}
											 style={{minWidth: '80px'}}/>
								</div>
							</div>

							<div className="table-cell">
								<div className="inline-form-elements">
									<TabList ref="fundTypeList"
											 title={"Transaction type"}
											 list={allTransactionTypes}
											 valueLink={this.bindTo(model, 'transactionType')}
											 data-tip="Blank = All transaction types included."
											 data-multiline={true}
											 style={{minWidth: '100px', maxWidth:'220px'}}/>
								</div>
							</div>

							<div className="table-cell">
								<div className="inline-form-elements left-right-nav">
									<label style={{width: '90px'}}>Reversed Order</label>
									<input type="checkbox" checked={reverseOrder} onChange={::this.onOrderChange}/>
								</div>
							</div>

							<div className="table-cell right">
								<a className="btn blue filled" onClick={::this.getTransactionHistory}>Search</a>
							</div>
							<div className="table-cell narrow border-left">
								<a className="btn green filled"
								   onClick={this.initTransaction.bind(this, 'init')}
								   style={{cursor: this.canInitiateTransaction ? 'default' : 'no-drop'}}>Initiate&#160;
									Transaction</a>
							</div>

						</div>

						<div className="table-row">
							<div className="table-cell">
								<div className="inline-form-elements">
									<ComboBox label="Per Page"
											  outerClassName=""
											  value={pageSize}
											  onChange={::this.onPageSizeChange}
											  labelStyle={{verticalAlign:'middle'}}>
										<option value="30">30</option>
										<option value="60">60</option>
										<option value="90">90</option>
										<option value="200">200</option>
										<option value="400">400</option>
										<option value="800">800</option>
									</ComboBox>
								</div>
							</div>

							<div className="table-cell">
								<div className="inline-form-elements">
									<ComboBox label="Casino/Sportsbook"
											  outerClassName=""
											  valueLink={this.bindTo(model, 'casinoOrSportsbook')}
											  onChange={::this.onCasinoOrSportsbookChange}
											  labelStyle={{verticalAlign:'middle'}}>
										<option value="All">All</option>
										<option value="Casino">Casino</option>
										<option value="Sportsbook">Sportsbook</option>
									</ComboBox>
								</div>
							</div>

							<div className="table-cell">
								{pagingVisible && (
									<div className="inline-form-elements left-right-nav">
										<a onClick={::this.onPreviousPage} className="btn"><i
											className="fa fa-chevron-left"></i></a>
										<label>{currentPage} of {totalPages}</label>
										<a onClick={::this.onNextPage} className="btn"><i
											className="fa fa-chevron-right"></i></a>
									</div>
								)}
							</div>

							<div className="table-cell">
								<button className="btn red filled"
										onClick={this.onExportToExcel.bind(this)}>
									Export to Excel
								</button>
							</div>

						</div>
					</div>
					<div style={{minHeight: window.innerHeight - 700}}>
						{this.renderTable()}
					</div>
				</div>
				<Tooltip place="top" type="info" effect="solid"/>
				{this.state.selectedTransaction && this.renderPopup() }
			</div>
		)
	}

	renderTable() {
		if(this.state.loading){
			return <Loader />;
		}

		const transactions = model.get('sportsTransactions');
		const columns = this.getColumns();

		return (
			<ReactDataGrid
				columns={columns}
				minHeight={window.innerHeight * 0.85}
				rowGetter={this.rowGetter.bind(this, transactions)}
				rowsCount={transactions.length}
				enableRowSelect={false}
				onRowClick={this.onRowClick.bind(this, transactions)}
				textAlign='center'
			/>
		);
	}

	/**
	 *
	 * @returns {*}
	 */
	rowGetter(array, index) {
		const transaction = array[index];
		const { paymentMethod, reason, id, date, amount, creator, cashBalance, bonusBalance, fundType} = transaction;
		let {type} = transaction;
		type = (type === 'Correction') ? 'Adjustment' : type;
		const displayPaymentMethod = paymentMethod || '';
		const displayReason = _.titleize(_.humanize(reason));
		const fullReason = displayReason ? `${displayPaymentMethod} ${displayReason}` : displayPaymentMethod;
		const formattedDate = moment(date).format('DD-MM-YYYY hh:mm:ss a');
		const formattedFundType = _.titleize(_.humanize(fundType));
		return { id, formattedDate, type, fullReason, amount, cashBalance, bonusBalance, fundType: formattedFundType, creator };
	}



	renderPopup() {
		const { additionalInfo } = this.state.selectedTransaction;
		if (_.isNull(additionalInfo) || additionalInfo === '')
			return null;

		return (<Popup
			title="Additional Infos"
			onClose={::this.onClosePopup}
			defaultStyles={this.props.popupStyles}
		>
			<div className="table">
				{ this.renderObjects(additionalInfo) }
			</div>
		</Popup>);
	}

	renderObjects(object) {
		return _.map(object, (value, key) => {
			if(_.isObject(value))
				return this.renderObjects(value);

			return (
				<div className="table-row">
					<div className="table-cell">{key}</div>
					<div className="table-cell">{value}</div>
				</div>
			);
		})
	}

};

AccountStats.defaultProps = {
	popupStyles: {
		display: 'block',
		position: 'fixed',
		opacity: 1,
		zIndex: 11000,
		left: '50%',
		marginLeft: '-200px',
		top: '20%',
		bottom: '20%',
		width: '400px',
		minHeight: '400px'
	}
};

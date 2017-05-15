import TextInput from 'backoffice/components/elements/TextInput';
import Popup from 'common/view/popup/Popup';
import model from 'backoffice/model/transactions/TransactionPayment';
import service from 'backoffice/service/BackofficeRestfulService'
import ComboBox from 'backoffice/components/elements/ComboBox';
import Component from 'common/system/react/BackboneComponent';
import FormValidator from 'backoffice/components/FormValidator';
import validators from 'common/util/ValidationUtil';
import PaymentMethodsPopup from 'segment/account/PaymentMethodsPopup';
import { notify, errorPopup, confirm } from 'common/util/PopupUtil.js';
import depositModel from 'backoffice/model/DepositModel';

import { launch, close } from 'thirdparty/ilixium.js';
import 'thirdparty/ilixium.css';


export default class InitiateTransactionPopup extends Component {
	constructor(props) {
		super(props);
		this.validator = new FormValidator();

		this.state = {
			bankCodes: []
		}
		this.buttons = [
			{ title: 'Ok', cls: 'blue', handler: ::this.onGo },
			{ title: 'Cancel', cls: 'blue', handler: ::this.onClose }
		];
		const isBaba = App.Settings.Customer === 'baba';

		this.transactionTypes = {
			types: [
				{ name: "Affiliate program (commission)", handle: "AFFILIATE_PROGRAM" },
				{ name: "Bonus marketing", handle: "BONUS_MARKETING" },
				{ name: "Goodwill", handle: "GOODWILL" },
				{ name: "Card Payment", handle: "CARD_PAYMENT" },
				{ name: "Credit", handle: "CREDIT_CORRECTION" },
				{ name: "Adjustment", handle: "CORRECTION" },
				{ name: "Finance correction on deposit", handle: "FINANCE_CORRECTION_DEPOSIT" },
				{ name: "Finance correction on withdrawal", handle: "FINANCE_CORRECTION_WITHDRAWAL" },
				{ name: "International withdrawal", handle: "INTERNATIONAL_WITHDRAWAL" },
				{ name: "International withdrawal fee", handle: "INTERNATIONAL_WITHDRAWAL_FEE" },
				{ name: "Payment fee", handle: "PAYMENT_FEE" },
				{ name: isBaba ? 'Withdraw To Card' : 'Refund', handle: "REFUND" }
			]
		};

		if (App.Settings.Customer === 'baba') {
			this.transactionTypes.types.push({name: "Withdraw to Account", handle: "REFUND_TO_ACCOUNT"})
		}

		_.bindAll(this, 'getBankCodes', 'onTransactionTypeChange', 'onIlixiumClose', 'handleDigesstReceived',
			'updateTransactionList', 'getPaymentMethods', 'onPaymentMethodsSuccess', 'onWithdrawTransaction',
			'onOtherTransactions', 'onTransactionSuccess', 'onTransactionFailure', 'clearPopupFields', 'onGetBankCodes');

		model.on('change:type', ::this.onUpdate);
	}


	/**
	 *
	 */
	componentDidMount() {
		var reg = this.validator.register;

		reg(this.refs.type, {
			routine: validators.nonEmpty,
			errorMsg: 'Please, choose a Transaction Type'
		});

		reg(this.refs.fundsType, {
			routine: validators.nonEmpty,
			errorMsg: 'Please, choose a Funds Type'
		});

		reg(this.refs.amount, {
			routine: validators.nonEmpty,
			errorMsg: ' The Amount field can\'t be empty'
		});

		reg(this.refs.reason, {
			routine: validators.nonEmpty,
			errorMsg: ' The Reason field can\'t be empty'
		});

		depositModel.on('digestReceived', this.handleDigesstReceived);
		App.bus.on('ilixium:close', this.onIlixiumClose);
		model.on('change:type', this.onTransactionTypeChange);
	}

	componentWillUnmount() {
		depositModel.off('digestReceived', this.handleDigesstReceived);
		App.bus.off('ilixium:close', this.onIlixiumClose);
		App.bus.off('change:segments', null);
		model.off('change:type', this.onTransactionTypeChange);
	}

	onUpdate() {
		this.validator = new FormValidator();
		this.forceUpdate();
	}

	/**
	 *
	 */
	onGo() {
		if (this.validator.isValid()) {
			if (model.get('type') === 'REFUND') {
				confirm('Are you sure', 'This action cannot be reversed, are you sure you want to refund?', this.getPaymentMethods, this.clearPopupFields)
			}
			else if(model.get('type') === 'REFUND_TO_ACCOUNT') {
				const data = {
					BankAccount: {
						accountName: model.get('accountName'),
						accountNumber: model.get('accountNumber'),
						routingBankCode: model.get('routingBankCode'),
						cardNumber: ''
					}
				}
				service.withdrawToBankAccount(this.props.accountId, 'IBANK', model.get('fundsType'), model.get('amount'), JSON.stringify(data))
					.then(this.onTransactionSuccess)
					.catch(this.onTransactionFailure);;
				this.onClose();
			}
			else if (model.get('type') === 'CARD_PAYMENT') {
				depositModel.ilixiumDeposit(this.props.accountId, model.get('amount'));
			}
			else {
				this.onOtherTransactions();
			}
		}
	}

	onTransactionTypeChange() {
		if(model.get('type') === 'REFUND_TO_ACCOUNT'){
			this.getBankCodes();
		}
	}

	getBankCodes() {
		service.getBankCodes('IBANK')
			.then(this.onGetBankCodes)
	}

	onGetBankCodes(resp) {
		const bankCodes = Object.keys(resp).map((key) => {
			return {code: key, name: resp[key]};
		}, []);
		this.setState({bankCodes})
	}

	getPaymentMethods() {
		service.getStoredCards(this.props.accountId)
			.then(this.onPaymentMethodsSuccess)
			.catch(this.onTransactionFailure);
	}

	onPaymentMethodsSuccess(response) {
		const cards = response.registrations.filter(reg => {
				return reg.type === 'CARD';
		})
		if (_.isEmpty(cards)) {
			errorPopup('No payment method was found!');
			this.clearPopupFields();
			return;
		}
		App.bus.trigger('popup:view', PaymentMethodsPopup, {
			registrations: cards,
			onOk: this.onWithdrawTransaction,
			onCancel: this.clearPopupFields
		})
	}

	onWithdrawTransaction(paymentMethodId) {
		service.withdrawTransaction(this.props.accountId, paymentMethodId, model.get('amount'))
			.then(this.onTransactionSuccess)
			.catch(this.onTransactionFailure);
	}

	onOtherTransactions() {
		const jsonObj = {
			type: model.get('type'),
			fundsType: model.get('fundsType'),
			amount: model.get('amount'),
			reason: model.get('reason')
		}
		service.initiateTransaction(this.props.accountId, JSON.stringify(jsonObj))
			.then(this.onTransactionSuccess, this.onTransactionFailure);

	}

	clearPopupFields() {
		model.clear();
		model.set(model.defaults);
	}

	updateTransactionList(...rest) {
		if (this.props.getTransactionHistory) {
			this.props.getTransactionHistory();
		}
	}

	/**
	 *
	 */
	onTransactionSuccess(resp) {
		if (resp && resp.status === 'ERROR') {
			errorPopup(resp.errorDescription);
			this.clearPopupFields();
			return;
		}
		notify('Confirmation', 'Transaction has successfully been initiated.');
		this.clearPopupFields();
		this.updateTransactionList();
	}

	onTransactionFailure() {
		errorPopup('There has been an error initiating your transaction');
		this.clearPopupFields();
	}

	/**
	 *
	 */
	onClose() {
		this.props.onClose();
		this.clearPopupFields();
	}

	handleDigesstReceived() {
		var url = depositModel.get('ilixiumURL');
		var merchantId = depositModel.get('merchantId');
		var merchantRef = depositModel.get('merchantRef');
		var requestKey = depositModel.get('requestKey');
		var digest = depositModel.get('digest');

		launch(url, merchantId, requestKey, digest);
		this.forceUpdate();
	}


	onIlixiumClose() {
		close();
		this.forceUpdate();
		this.onClose();
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const showReason = ['CARD_PAYMENT', 'REFUND_TO_ACCOUNT', 'REFUND'].indexOf(model.get('type')) === -1;
		const hasIframe = !!document.getElementById('ilixium-iframe')
		const { wallets } = this.props;
		return (
			<div>
				<Popup title="Initiate Transaction"
					buttons={this.buttons}
					onClose={this.onClose.bind(this)}
					styles={this.props.styles}
				>
					<div className="table grid table-margin-bottom table-padding-top-small"
						style={{ maxWidth: '350px', minHeight: '140px', marginLeft: '10%', borderBottom: '0' }} >
						<div className="table-row large">
							<div className="table-cell fixed-element-widths" style={{ borderBottom: '0 !important' }}>
								<ComboBox ref="type"
									label="Transaction Type"
									valueLink={this.bindTo(model, 'type')}
									placeholder="Please Select a transaction type"
									style={{ width: '230px' }}>
									{this.transactionTypes.types.map(function (type) {
										return <option value={type.handle}>{type.name}</option>
									})}
								</ComboBox>
							</div>
						</div>
						<div className="table-row large">
							<div className="table-cell fixed-element-widths" style={{borderBottom:'0 !important'}}>
								<ComboBox ref="fundsType"
									label="Funds Type"
									valueLink={this.bindTo(model, 'fundsType')}
									placeholder="Please select a funds type"
									style={{ width: '230px' }}
								>

									{wallets.map(function (type) {
										return <option value={type.activeFundsType}>{_.titleize(_.humanize(type.activeFundsType))}</option>
									})}
								</ComboBox>
							</div>
						</div>
						<div className="table-row large">
							<div className="table-cell fixed-element-widths" style={{ borderBottom: '0 !important' }}>
								<TextInput ref="amount"
									label="Amount"
									type="number"
									placeholder="Enter Amount"
									valueLink={this.bindTo(model, 'amount')}
									focus="true" required="true"
									validate="true"
									style={{ minWidth: '230px !important' }}
								/>
							</div>
						</div>
						{this.renderRefundToAccount()}
						{ showReason &&
						<div className="table-row large">
							<div className="table-cell fixed-element-widths" style={{ borderBottom: '0 !important' }}>
								<TextInput ref="reason"
									label="Reason"
									placeholder="Enter Reason"
									valueLink={this.bindTo(model, 'reason')}
									focus="true"
									required="true"
									validate="true"
									style={{ minWidth: '230px !important' }}
								/>
							</div>
						</div> }
						<div className="table-row large">
							<div className="inline-form-elements">
								<p><label>* Punters are able to see the reason on the front end</label></p>
							</div>
						</div>
					</div>
				</Popup>
				{hasIframe &&
				<div className="btn red filled" onClick={this.onIlixiumClose} style={{ position: 'absolute', zIndex: 1002, left: '45%', bottom: '20%' }}>
					Close Payment Window
				</div> }
			</div>
		)
	}


	renderRefundToAccount() {
		if (model.get('type') !== 'REFUND_TO_ACCOUNT') {
			return null;
		}

		const {bankCodes} = this.state;
		return (
			[
				<div className="table-row large">
					<div className="table-cell fixed-element-widths" style={{ borderBottom: '0 !important' }}>
						<TextInput ref="accountName"
								   label="Account Name"
								   placeholder="Enter Account Name"
								   valueLink={this.bindTo(model, 'accountName')}
								   focus="true" required="true"
								   validate="true"
								   style={{ minWidth: '230px !important' }}
						/>
					</div>
				</div>,<div className="table-row large">
					<div className="table-cell fixed-element-widths" style={{ borderBottom: '0 !important' }}>
						<TextInput ref="accountNumber"
								   label="Account Number"
								   type="number"
								   placeholder="Enter Account Number"
								   valueLink={this.bindTo(model, 'accountNumber')}
								   focus="true" required="true"
								   validate="true"
								   style={{ minWidth: '230px !important' }}
						/>
					</div>
				</div>,
				<div className="table-row large">
				<div className="table-cell fixed-element-widths" style={{borderBottom:'0 !important'}}>
					<ComboBox ref="bankCodes"
							  label="Bank"
							  valueLink={this.bindTo(model, 'routingBankCode')}
							  placeholder="Please select a Bank"
							  style={{ width: '230px' }}
					>
						{bankCodes.map(function (bank) {
							return <option value={bank.code}>{_.titleize(_.humanize(bank.name))}</option>
						})}
					</ComboBox>
				</div>
			</div>,
			]
		)
	}
};

InitiateTransactionPopup.defaultProps = {
	styles: {
		display: 'block',
		position: 'fixed',
		opacity: 1,
		zIndex: 11000,
		left: '50%',
		marginLeft: '-320px',
		top: '100px',
		width: '640px',
		minHeight: '650px'
	}
};


import TextInput from 'backoffice/components/elements/TextInput';
import Popup from 'common/view/popup/Popup';
import model from 'backoffice/model/CustomerSegmentModel';
import service from 'backoffice/service/BackofficeRestfulService'
import {classNames as cx} from 'common/util/ReactUtil';
import ComboBox from 'backoffice/components/elements/ComboBox';

export default class PayoutTransactionPopup extends React.Component {
	constructor(props) {
		super(props);

		this.buttons = [
			{title: 'Ok', cls: 'blue', handler: this.onGo.bind(this)},
			{title: 'Cancel', cls: 'blue', handler: this.onClose.bind(this)}
		];


		this.transactionTypes = {
			"types":[
				{"name":"Affiliate program (commission)", "handle":"AFFILIATE_PROGRAM"},
				{"name":"Bonus marketing", "handle":"BONUS_MARKETING"},
				{"name":"Goodwill", "handle":"GOODWILL"},
				{"name":"Correction", "handle":"CORRECTION"},
				{"name":"Finance correction on deposit", "handle":"FINANCE_CORRECTION_DEPOSIT"},
				{"name":"Finance correction on withdrawal", "handle":"FINANCE_CORRECTION_WITHDRAWAL"},
				{"name":"International withdrawal", "handle":"INTERNATIONAL_WITHDRAWAL"},
				{"name":"International withdrawal fee", "handle":"INTERNATIONAL_WITHDRAWAL_FEE"},
				{"name":"Payment fee", "handle":"PAYMENT_FEE"}
			]
		};
		this.fundTypes = {
			"types":[
			    {"name":"Visa", "handle":"visa"},
			    {"name":"MasterCard", "handle":"masterCard"},
			    {"name":"Maestro", "handle":"maestro"},
			    {"name":"Paysafecard", "handle":"paysafecard"},
			    {"name":"PayPal", "handle":"paypal"},
			    {"name":"Moneybookers", "handle":"moneybookers"},
			    {"name":"Neteller", "handle":"neteller"},
			    {"name":"Sofortüberweisung", "handle":"sofortueberweisung"},
			    {"name":"Giropay", "handle":"giropay"},
			    {"name":"Direct Debit SEPA", "handle":"directdebit_sepa"}
			]
		};

	}

	/**
	 * TODO shouldn't need to do this.  Collection events not triggering re-render
	 */
	onUpdate() {
		this.forceUpdate()
	}

	/**
	 *
	 */
	onGo(transaction) {
	 	console.log('go')
	}

	/**
	 *
	 */
	onClose() {
		this.props.onClose();
	}

	/**
	 *
	 */
	componentDidMount() {
		this.name = ReactDOM.findDOMNode(this.refs.name);
		this.code = ReactDOM.findDOMNode(this.refs.code);
	}

	componentWillUnmount(){
		App.bus.off('change:segments', null);
	}

	/**
	 * @returns {XML}
	 */
	render() {
		return (
			<Popup title="Payout Details"
			   	buttons={this.buttons}
			   	onClose={this.onClose.bind(this)}
			   	styles={this.props.styles}>
				<div className="table grid table-margin-bottom table-padding-top-small" style={{minHeight: '140px'}}>

					<div className="table-row large">

						<div className="table-cell fixed-element-widths">
							<ComboBox label="Transaction Type">
								{this.transactionTypes.types.map(function(type) {
					                return <option key={type.name}>{type.name}</option>
					            })}
							</ComboBox>
						</div>
					</div>
					<div className="table-row large">
						<div className="table-cell fixed-element-widths">
							<ComboBox label="Funds Type">
								{this.fundTypes.types.map(function(type) {
					                return <option key={type.name}>{type.name}</option>
					            })}
							</ComboBox>
						</div>
					</div>
					<div className="table-row large">
						<div className="table-cell fixed-element-widths">
							<TextInput ref="id" label="Amount" placeholder="Enter Amount" valueLink="" focus="true"/>
						</div>
					</div>
					<div className="table-row large">
						<div className="table-cell fixed-element-widths">
							<TextInput ref="id" label="Reason" placeholder="Enter Reason" valueLink="" focus="true"/>
						</div>
					</div>
				</div>
			</Popup>
		)
	}

	/**
	 * @returns {*}
	 */
	};

PayoutTransactionPopup.defaultProps = {
	styles: {
		display: 'block',
		position: 'fixed',
		opacity: 1,
		zIndex: 11000,
		left: '50%',
		marginLeft: '-320px',
		top: '100px',
		width: '800px',
		minHeight: '300px'
	}
}


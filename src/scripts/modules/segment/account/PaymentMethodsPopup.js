import Component from 'common/system/react/BackboneComponent';
import Popup from 'common/view/popup/Popup';
import {errorPopup} from 'common/util/PopupUtil.js';
import {classNames as cx} from 'common/util/ReactUtil';

export default class PaymentMethodsPopup extends Component {

	constructor(props){
		super(props);
		this.state = {paymentMethodId: 0};
		this.buttons = [
			{title: 'Ok', cls: 'blue', handler: ::this.onOk},
			{title: 'Cancel', cls: 'blue', handler: ::this.onCancel}
		];
		_.bindAll(this, 'renderPaymentMethods');
	}

	onOk(){
		if(!this.state.paymentMethodId) {
			errorPopup('No payment method was selected!');
			this.props.onCancel();
			return;
		}
		if (this.props.onOk) {
			this.props.onOk(this.state.paymentMethodId);
		}
	}

	onCancel() {
		this.props.onCancel();
		this.props.onClose();
	}

	onPaymentMethodClick(id){
		this.setState({paymentMethodId: id});
	}

	render(){
		return (
			<Popup title="Payment Method"
				   buttons={this.buttons}
				   onClose={this.onCancel.bind(this)}
				   styles={this.props.styles}>

				<div className="table inner grid max-grid-height" style={{maxHeight: '300px'}}>
					<div className="table">
						<div className="table-row header larger" style={{textAlign: 'center'}}>
							<div className="table-cell"> Id </div>
							<div className="table-cell"> Type </div>
							<div className="table-cell"> Name </div>
						</div>
						{this.renderPaymentMethods()}
					</div>
				</div>
			</Popup>
		)
	}

	renderPaymentMethods(){
		var paymentsMethods = this.props.registrations;

		return _.map(paymentsMethods, (paymentMethod, index) => {
			var active = !!this.state.paymentMethodId && this.state.paymentMethodId === paymentMethod.id;
			var classNames = cx(
				'table-row clickable',
				{'active': active}
			);
			return(
				<div key={index} className={classNames}
					 onClick={this.onPaymentMethodClick.bind(this, paymentMethod.id)}>
					<div className="table-cell">
						{paymentMethod.id}
					</div>
					<div className="table-cell">
						{paymentMethod.type}
					</div>
					<div className="table-cell">
						{paymentMethod.displayName}
					</div>
				</div>
			);
		});
	}

};

PaymentMethodsPopup.defaultProps = {
	styles: {
		display: 'block',
		position: 'fixed',
		opacity: 1,
		zIndex: 11000,
		left: '50%',
		marginLeft: '-320px',
		top: '100px',
		width:'500px',
		maxWidth:'500px',
		minHeight: '300px'
	}
};

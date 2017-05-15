import Component from 'common/system/react/BackboneComponent';
import TextInput from 'backoffice/components/elements/TextInput';
import Popup from 'common/view/popup/Popup';
import model from 'backoffice/model/CustomerSegmentModel';
import customerModel from 'backoffice/model/CustomerModel';
import {classNames as cx} from 'common/util/ReactUtil';

export default class SearchAccountsPopup extends Component {
	constructor(props) {
		super(props);

		this.state = {name: '', code: '', selectedCustomer: null};

		this.buttons = [
			{title: 'Add to Segment', cls: 'blue', handler: this.onSave.bind(this)},
			{title: 'Cancel', cls: 'blue', handler: this.onClose.bind(this)}
		];

		_.bindAll(this, 'onUpdate');

		// For some reason 'componentDidMount' doesn't seem to be called
		// for this popup
		customerModel.searchResults.on('add remove reset', this.onUpdate, this);
	}

	componentWillUnmount(){
		customerModel.searchResults.off(null ,null, this);
	}

	/**
	 * TODO shouldn't need to do this.  Collection events not triggering re-render
	 */
	onUpdate() {
		console.warn('updating');
		this.forceUpdate();
	}

	/**
	 *
	 */
	onSave() {
		var customer;

		if (this.state.selectedCustomer) {
			customer = customerModel.searchResults.get(this.state.selectedCustomer);
			model.addCustomerToSegment(customer, this.props.selectedSegment);
			this.props.onClose();
		}
	}

	/**
	 *
	 */
	onClose() {
		this.props.onClose();
	}

	/**
	 * Filter the records
	 */
	onSearch() {
		customerModel.searchAccounts();
	}

	/**
	 * Reset filtering
	 */
	onClear() {
		this.name.value = '';
		this.code.value = '';
		this.setState({name: '', code: '', selectedCustomer: null});
	}

	/**
	 * @param customer
	 */
	onSelectCustomer(customer) {
		this.setState({selectedCustomer: customer.id});
	}

	/**
	 *
	 */
	componentDidMount() {
		this.name = ReactDOM.findDOMNode(this.refs.name);
		this.code = ReactDOM.findDOMNode(this.refs.code);
	}

	componentWillUnmount(){
		//App.bus.off('change:segments', null);
	}

	/**
	 * @returns {XML}
	 */
	render() {
		return (
			<Popup title="Add Customer"
				   buttons={this.buttons}
				   onClose={this.onClose.bind(this)}
				   styles={this.props.styles}>

				<div className="table toolbar">
					<div className="table-row">

						<div className="table-cell" style={{width: '25%'}}>
							<div className="inline-form-elements">
								<TextInput label="Username"
									cls="short"
									focus={true}
									valueLink={this.bindTo(customerModel.searchCriteria,  'username')}/>
							</div>
						</div>

						<div className="table-cell" style={{width: '25%'}}>
							<div className="inline-form-elements">
								<TextInput
									cls="short"
									label="Id"
									valueLink={this.bindTo(customerModel.searchCriteria,  'id')}/>
							</div>
						</div>
						<div className="table-cell">
							<div className="inline-form-elements">
								<a className="btn blue filled" onClick={this.onSearch.bind(this)}>Search</a>
								<a className="btn blue filled" onClick={this.onClear.bind(this)}>Clear</a>
							</div>
						</div>
					</div>
				</div>

				<div className="table grid" style={{minHeight: '100px'}}>
					<div className="table-row header larger">
						<div className="table-cell center" style={{width: '50px'}}> Id </div>
						<div className="table-cell" style={{width: '250px'}}> Name </div>
						<div className="table-cell" style={{width: '80px'}}> Username </div>
					</div>
					{this.renderCustomers()}
				</div>
			</Popup>
		);
	}

	/**
	 * @returns {*}
	 */
	renderCustomers() {
		var that = this;

		return _.map(customerModel.searchResults.models, (customer) => {
			var classes = cx('table-row clickable', {'active': customer.id === that.state.selectedCustomer});

			return (
				<div className={classes} onClick={this.onSelectCustomer.bind(this, customer)}>
					<div className="table-cell center" style={{width: '50px'}}>
						{customer.id}
					</div>
					<div className="table-cell" style={{width: '100%'}}>
						{_.titleize(customer.get('name'))}
					</div>
					<div className="table-cell center" style={{width: '50px'}}>
						{customer.get('username')}
					</div>
				</div>
			);
		});
	}
};

SearchAccountsPopup.defaultProps = {
	styles: {
		display: 'block',
		position: 'fixed',
		opacity: 1,
		zIndex: 11000,
		left: '50%',
		marginLeft: '-320px',
		top: '100px',
		width: '640px',
		bottom: '20px',
		minHeight: '80%',
		overflow: 'auto'
	}
};

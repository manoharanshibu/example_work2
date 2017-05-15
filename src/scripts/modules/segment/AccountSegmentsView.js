import {notify, errorPopup} from 'common/util/PopupUtil.js';
import RegionalSegmentsView from 'segment/RegionalSegmentsView';
import SearchAccountsPopup from 'segment/account/SearchAccountsPopup';
import AddAccountSegmentPopup from 'segment/account/AddAccountSegmentPopup';
import EditAccountSegmentPopup from 'segment/account/EditAccountSegmentPopup';
import UploadAccountCsvPopup from 'segment/account/UploadAccountCsvPopup';
import CheckBox from 'backoffice/components/elements/CheckBox';
import model from 'backoffice/model/CustomerSegmentModel';
import {classNames as cx} from 'common/util/ReactUtil';
import apiService from 'backoffice/service/ApiService';

export default class AccountSegmentsView extends RegionalSegmentsView {
	constructor() {
		super();
		this.state = {segName: '', segCode: '', customerName: '', selectedSegment: '', selectedSegementId: ''};
	}

	/**
	 * Filter the records
	 */
	onFilterSegment() {
		this.setState({segName: this.segName.value, selectedSegment: '', selectedSegmentId: ''});
	}

	/**
	 * Reset filtering
	 */
	onClearSegment() {
		this.segName.value = '';
		this.setState({segName: ''});
	}

	/**
	 * @param segment
	 */
	onEditSegment(segment, e) {
		e.preventDefault();
		var data = segment.attributes;
		App.bus.trigger('popup:view', EditAccountSegmentPopup, {data: data});
	}

	/**
	 * @param segment
	 */
	onDeleteSegment(segment, e) {
		e.preventDefault();
		var segName = _.titleize(segment.get('name')),
			message = `Are you sure you wish to delete the segment: ${segName}?`;
		App.bus.trigger('popup:confirm', {content: message, onConfirm: () => {
			model.removeSegment(segment.id)
				.then( () => notify('Segment deleted', 'The segment has been successfully deleted') )
				.catch( () => notify('Error', 'There has been an error deleting the segment') );
		}});
	}

	/**
	 * @param segment
	 */
	onSelectSegment(segment, e) {
		// toggle selected item on/off
		var segId = this.state.selectedSegmentId,
			newId = segId == segment.id ? '' : segment.id,
			newSegment = segId == segment.id ? '' : segment;
		this.setState({selectedSegmentId: newId});
		this.setState({selectedSegment: newSegment});
		// only load customers if we're toggling on
		if (newId != '') {
			// We need to re-render *after* the customers have been loaded
			model.loadCustomers(segment.id)
				.then( () => { this.forceUpdate(); } );
		}
	}

	/**
	 *
	 */
	onCreateSegment() {
		App.bus.trigger('popup:view', AddAccountSegmentPopup);
	}

	/**
	 * Filter the records
	 */
	onFilterCustomer() {
		this.setState({customerName: this.customer.value});
	}

	/**
	 * Reset filtering
	 */
	onClearCustomer() {
		this.customer.value = '';
		this.setState({customerName: ''});
	}

	/**
	 *
	 */
	onAddCustomer() {
		if (this.state.selectedSegmentId){
			App.bus.trigger('popup:view', SearchAccountsPopup, {selectedSegmentId: this.state.selectedSegmentId});
			let that = this;
			App.bus.on('change:segments', () => {
				model.loadCustomers(that.state.selectedSegmentId)
					.then( () => {
						that.forceUpdate();
						App.bus.off('change:segments', null);
					} );

			}, that);
		} else {
			// App.bus.trigger('popup:alert', {content: "Please select a segment"});
			errorPopup('Please select a segment');
		}
	}

	/**
	 *
	 */
	onDeleteCustomer(customer, segment) {
		var segName  = _.titleize(segment.get('name')),
			custName = _.titleize(customer.name),
			message  = `Are you sure you want to remove '${custName}' from segment: '${segName}'?`,
			that = this;
		App.bus.on('change:segments', () => {
			model.loadCustomers(that.state.selectedSegmentId)
				.then( () => { that.forceUpdate();
					App.bus.off('change:segments', null);
				} );

		}, that);
		App.bus.trigger('popup:confirm', {content: message, onConfirm: () => {
			model.removePunterFromSegment(customer, segment.id);

		}});
	}

	/**
	 * Toggle an account blocked/unblocked
	 */
	toggleAccountBlock(currentAccount, userToBeBlocked = true) {
		var accountAttributes = currentAccount;
		var apiServiceMethod = userToBeBlocked ? 'blockAccount' : 'unblockAccount';
		var actionToBePrompted = userToBeBlocked ? 'block' : 'unblock';
		var that = this;

		var popupMessage = `Are you sure you want to ${actionToBePrompted} this user?\n\n\n${accountAttributes.firstName} ${accountAttributes.lastName}`;
		App.bus.trigger('popup:confirm', {content: popupMessage, onConfirm: () => {
			apiService[apiServiceMethod].call(null, accountAttributes.id)
				.then(() => {
					var newStatus = userToBeBlocked ? 'SUSPENDED' : 'ACTIVE';
					var actionCompleted = userToBeBlocked ? 'blocked' : 'unblocked';
					that.notify(_.titleize(actionCompleted),
						`'${accountAttributes.firstName} ${accountAttributes.lastName}' has been successfully ${actionCompleted}`);
					//currentAccount.set('accountStatus', newStatus);
					model.loadCustomers(that.state.selectedSegmentId)
						.then( () => { that.forceUpdate(); } );
				})
				.catch(() => {
					that.notify('Error', `There has been an error ${actionToBePrompted}ing the account.`);
				});
		}});
	}

	/**
	 *
	 */
	onUploadCsv() {
		if (!this.state.selectedSegmentId) {
			errorPopup('Please select a segment');
			return;
		}
		App.bus.trigger('popup:view', UploadAccountCsvPopup, {selectedSegmentId: this.state.selectedSegmentId});
	}

	/**
	 * Reference the name and code inputs
	 */
	componentDidMount() {
		super.componentDidMount();

		this.customer = ReactDOM.findDOMNode(this.refs.customer);
		this.segName = ReactDOM.findDOMNode(this.refs.segName);

		this.listenTo(model, 'change:customers', this.forceUpdate);

		this.props.collection.on('change', (e) => {
			this.props.collection.sort();
		}).bind(this);

		this.props.collection.on('all', (e) => {
			this.forceUpdate();
		}).bind(this);
	}

	/**
	 *
	 */
	componentWillUnmount() {
		super.componentWillUnmount();
		this.unlistenTo(model);
		this.props.collection.off(null, null, this);
	}

	/**
	 * @returns {XML}
	 */
	render() {
		//TODO: Checking the permissions on every render, might not be ideal
		//but as a quick fix, it ensures they are reevaluated if the user has
		//logged out and logged in with different user
		const allowed = App.session.request('canSegmentAccountSegments');

		if (!allowed){
			return <div><p><strong>YOU ARE NOT AUTHORIZED TO USE THIS FUNCTION.</strong></p></div>;
		}

		return (
			<div className="box">
				<div style={{minHeight: window.innerHeight - 50}}>
					<div className="table toolbar">
						<div className="table-row">
							<div className="table-cell">
								<div className="inline-form-elements">
									<label>Filter</label>
									<input ref="segName" type="text" name="text" onChange={this.onFilterSegment.bind(this)}/>
									<a className="btn blue filled" onClick={this.onClearSegment.bind(this)}>Clear</a>
								</div>
							</div>
							<div className="table-cell right">
								<div className="inline-form-elements">
									<a className="btn green filled" onClick={this.onCreateSegment.bind(this)}>Create Segment</a>
								</div>
							</div>
						</div>
					</div>
					<div className='split-div'>
						<div className="table grid no-border-bottom">
							<div className="table-row header larger">
								<div className="table-cell" style={{width: '30%'}}>
									Name
								</div>
								<div className="table-cell center" style={{width: '50px'}}>
									Id
								</div>
								<div className="table-cell center" style={{width: '50px'}}>
									Code
								</div>
								<div className="table-cell center" style={{width: '50px'}}>
									Priority
								</div>
								<div className="table-cell center" style={{width: '50px'}}>
									Bonus
								</div>
								<div className="table-cell center" style={{width: '50px'}}>
									Matrix
								</div>
								<div className="table-cell center" style={{width: '50px'}}>
									Settings
								</div>
								<div className="table-cell center" style={{width: '50px'}}>
									forLayout
								</div>
								<div className="table-cell center" style={{width: '50px'}}>
									forLimits
								</div>
								<div className="table-cell" style={{width: '50px'}}>
									Region
								</div>
								<div className="table-cell" style={{width: '50px'}}>
									Channel
								</div>
								<div className="table-cell center" style={{width: '80px'}}>
									Actions
								</div>
							</div>
							{this.renderSegments()}
						</div>
					</div>
					<div className='split-div'>
						<div className="table toolbar">
							<div className="table-row">
								<div className="table-cell">
									<div className="inline-form-elements">
										<label>Filter</label>
										<input ref="customer" type="text" name="text" onChange={this.onFilterCustomer.bind(this)}/>
										<a className="btn blue filled" onClick={this.onClearCustomer.bind(this)}>Clear</a>
									</div>
								</div>
								<div className="table-cell right">
									<div className="inline-form-elements">
										<a className="btn green filled" onClick={this.onAddCustomer.bind(this)}>Add Customer</a>
										<a className="btn green filled" onClick={this.onUploadCsv.bind(this)}>Upload CSV</a>
									</div>
								</div>
							</div>
						</div>
						<div className="table grid">
							<div className="table-row header larger">
								<div className="table-cell" style={{width: '30%'}}>
									Customer Name
								</div>
								<div className="table-cell center" style={{width: '50px'}}>
									Id
								</div>
								<div className="table-cell center" style={{width: '50px'}}>
									Active
								</div>
								<div className="table-cell center" style={{width: '50px'}}>
									Actions
								</div>
							</div>
							{this.renderCustomers()}
						</div>
					</div>
				</div>
			</div>
		);
	}

	/**
	 * @returns {*}
	 */
	renderSegments() {
		var filtered = this.props.collection.byNameAndCode(this.state.segName, '', 'ACCOUNT');
		return _.map(filtered, (segment, index) => {
			var classes  = cx('table-row', {'active': segment.id == this.state.selectedSegmentId});
			return (
				<div key={index} className={classes} style={{height: '100%', overflowY: 'scroll'}} onClick={this.onSelectSegment.bind(this, segment)}>
					<div className="table-cell clickable">
						{_.titleize(segment.get('name'))}
					</div>
					<div className="table-cell center">
						{segment.get('id')}
					</div>
					<div className="table-cell center">
						{segment.get('code')}
					</div>
					<div className="table-cell center">
						{segment.get('priority')}
					</div>
					<div className="table-cell center">
						<CheckBox disabled={true} valueLink={this.bindTo(segment, 'forBonus')}/>
					</div>
					<div className="table-cell center">
						<CheckBox disabled={true} valueLink={this.bindTo(segment, 'forMatrix')}/>
					</div>
					<div className="table-cell center">
						<CheckBox disabled={true} valueLink={this.bindTo(segment, 'forSettings')}/>
					</div>
					<div className="table-cell center">
						<CheckBox disabled={true} valueLink={this.bindTo(segment, 'forLayout')}/>
					</div>
					<div className="table-cell center">
						<CheckBox disabled={true} valueLink={this.bindTo(segment, 'forLimits')}/>
					</div>
					<div className="table-cell">
						{_.titleize(segment.get('parent'))}
					</div>
					<div className="table-cell">
						{_.titleize(segment.get('channelId'))}
					</div>
					<div className="table-cell center" style={{minWidth: '140px'}}>
						<a className="btn bgwhite blue small" onClick={this.onEditSegment.bind(this, segment)}>Edit</a>
						&nbsp;&nbsp;
						<a className="btn bgwhite red small" onClick={this.onDeleteSegment.bind(this, segment)}>Delete</a>
					</div>
				</div>
			);
		});
	}

	/**
	 * @returns {*}
	 */
	renderCustomers() {
		var allCustomers, filtered;

		if (!this.state.selectedSegmentId){
			return <p>Please, select a segment from the list above.</p>;
		}

		allCustomers = model.get('customers');
		const customerName = this.state.customerName.toLowerCase();
		filtered = _.filter(allCustomers, (cust) => {
			if (customerName == '') return true;
			return _.includes(cust.name.toLowerCase(), customerName);
		}, this);

		if (!filtered.length){
			if (!allCustomers.length){
				return <p>There are currently no customers in the selected segment.</p>;
			} else {
				return <p>There are no customers in the selected segment with that name.</p>;
			}
		}

		return _.map(filtered, (customer, index) => {
			return (
				<div key={index} className="table-row">
					<div className="table-cell" style={{width: '50%'}}>
						{_.titleize(customer.name)}
					</div>
					<div className="table-cell center" style={{width: '50px'}}>
						{customer.id}
					</div>
					<div className="table-cell center" style={{width: '50px'}}>
						<CheckBox value={customer.accountStatus === 'ACTIVE'} onChange={this.toggleAccountBlock.bind(this, customer, customer.accountStatus === 'ACTIVE')} />
					</div>
					<div className="table-cell center" style={{width: '50px'}}>
						<a className="btn red small" onClick={this.onDeleteCustomer.bind(this, customer, this.state.selectedSegment)}>Delete</a>
					</div>
				</div>
			);
		});
	}

	/**
	 * @param title
	 * @param content
	 * @param autoDestruct
	 */
	notify(title='', content='', autoDestruct=2000){
		App.bus.trigger('popup:notification', {title, content, autoDestruct});
	}
};


AccountSegmentsView.defaultProps = {
	collection: model.customerSegments
};

import Component from 'common/system/react/BackboneComponent';
import model from 'backoffice/model/InternalUserModel';
import TextInput from 'backoffice/components/elements/TextInput';
import CheckBox from 'backoffice/components/elements/CheckBox';
import AddUserPopup from 'app/view/main/admin-ticker/AddUserPopup';
import EditUserPopup from 'app/view/main/admin-ticker/EditUserPopup';
import EditPasswordPopup from 'app/view/main/admin-ticker/EditPasswordPopup';

export default class InternalUsers extends Component {
	constructor(props, context) {
		super(props, context);
		this.observe = false;

	}

	/**
	 * @param user
	 */
	onSelectUser(user) {
		// transitions to the account page in this app
		//this.context.router.transitionTo(`/account/data/${account.id}`);

		//var anchor = ReactDOM.findDOMNode(this.refs.hidden),
			//location = window.location.origin.replace(slashes, '');

		// opens new browser tab to display account page
		/*let route = `/account/details/${account.id}`,
			href = history.createHref(route);

		anchor.href = `${location}${href}`;
		anchor.click();*/
	}

	/**
	 *
	 */
	onFormSubmit(e) {
		e.preventDefault();
		model.searchUsers();
	}

	/**
	 * @param e
	 */
	onFormClear(e) {
		model.clearSearch();
	}

	/**
	 * @param e
	 */
	onAddUser(e) {
		App.bus.trigger('popup:view', AddUserPopup);
	}

	onEditUser(user) {
		App.bus.trigger('popup:view', EditUserPopup, {user: user});
	}

	onChangePassword(user) {
		App.bus.trigger('popup:view', EditPasswordPopup, {user: user});

	}

	onUserDelete(user) {
		var message = `Are you sure you wish to delete the selected user?`;

		App.bus.trigger('popup:confirm', { content: message,  onConfirm: () => {
			model.deleteUser(user);
		} });

	}

	/**
	 *
	 */
	componentDidMount() {
		this.props.collection.on('add remove reset', () => {
			this.forceUpdate();
		});
	}

	/**
	 *
	 */
	componentWillUnmount() {
		this.props.collection.off(null, null, this);
	}





	/**
	 * @returns {XML}
	 */
	render() {
		const allowed = App.session.request('canAdminInternalUsers');

		if (!allowed){
			return <div><p><strong>YOU ARE NOT AUTHORIZED TO USE THIS FUNCTION.</strong></p></div>;
		}

		return (

		<div className="box">
            <div style={{minHeight: window.innerHeight - 50 }}>
				<div style={{position: 'relative'}}>
					<div className="table toolbar">
						<div className="table-row">
							<div className="table-cell left" style={{width:'15%'}}>
								<label htmlFor="search">Name</label>
								<TextInput id='search'
										   ref="name"
										   valueLink={this.bindTo(model.searchCriteria, 'name')}/>
							</div>
							<div className="table-cell">
								<a href="#_" className="btn green filled left" onClick={::this.onFormSubmit}>Search</a>
								<span>&nbsp;</span>
								<a href="#_" className="btn blue filled left" onClick={::this.onFormClear}>Clear</a>
							</div>
							<div className="table-cell right">
								<div className="inline-form-elements">
									<a className="btn green filled" onClick={::this.onAddUser}>Add User</a>
								</div>
							</div>
						</div>
					</div>
					{this.renderContents()}
				</div>
			</div>
		</div>
		);
	}

	/**
	 * @returns {XML}
	 */
	renderContents(){
		return (
			<div className="table grid" style={{marginTop: '0px'}}>
				<div className="table-row header larger">
					<div className="table-cell center">Id</div>
					<div className="table-cell center">Username</div>
					<div className="table-cell center"> Name </div>
					<div className="table-cell center"> User Group </div>
					<div className="table-cell center"> Administrator </div>
					<div className="table-cell center"> Trader </div>
					<div className="table-cell center"> Hedger </div>
					<div className="table-cell center"> Price Maintainer </div>
					<div className="table-cell center"> Op Man </div>
					<div className="table-cell center"> Status </div>
					<div className="table-cell center"> Actions </div>
				</div>
				{this.renderRows()}
			</div>
		);
	}

	/**
	 * @returns {*}
	 */
	renderRows() {
		return this.props.collection.map((user, index) => {
			const {key, username, name, userGroupName, blocked} = user.attributes;

			const status = blocked ? 'Locked' : 'Active';
			const statusColour = blocked ? 'red' : 'green';

			return (
				<div className="table-row clickable"
					 key={"account-search-row-"+index}
					 onClick={this.onSelectUser.bind(this, user)}>
					<div className="table-cell center">
						{key}
					</div>
					<div className="table-cell center">
						{username}
					</div>
					<div className="table-cell center">
						{name}
					</div>
					<div className="table-cell center">
						{_.humanize('userGroupName')}
					</div>
					<div className="table-cell center">
						<CheckBox disabled={true} valueLink={this.bindTo(user, 'administrator')}/>
					</div>
					<div className="table-cell center">
						<CheckBox disabled={true} valueLink={this.bindTo(user, 'trader')}/>
					</div>
					<div className="table-cell center">
						<CheckBox disabled={true} valueLink={this.bindTo(user, 'hedger')}/>
					</div>
					<div className="table-cell center">
						<CheckBox disabled={true} valueLink={this.bindTo(user, 'priceMaintainer')}/>
					</div>
					<div className="table-cell center">
						<CheckBox disabled={true} valueLink={this.bindTo(user, 'opMan')}/>
					</div>
					<div className="table-cell center" style={{color: statusColour}}>
						<strong>{status}</strong>
					</div>
					<div className="table-cell center">
						<a className="btn blue small" onClick={this.onEditUser.bind(this, user)}>Edit</a>
						<a className="btn blue small" onClick={this.onChangePassword.bind(this, user)}>Change Password</a>
						<a className="btn red small" onClick={this.onUserDelete.bind(this, user)}>Delete</a>
					</div>
				</div>

			)
		});
	}

};

InternalUsers.defaultProps = {
	collection: model.searchResults
};

InternalUsers.contextTypes = {
	router: React.PropTypes.object
};

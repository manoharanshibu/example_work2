import HeaderView from 'app/view/header/HeaderView';
import AccountNavView from 'app/view/leftNav/AccountNavView';
import model from 'backoffice/model/CustomerModel';
import {classNames as cx} from 'common/util/ReactUtil';

export default class AccountDisplay extends React.Component {
	constructor(props) {
		super(props);
		// set the userid as search criteria to load the user account.
		// each subsequent child view will pick up the account when loaded
		model.loadAccount(this.props.params.userid);
		this.state = {open: true};

		_.bindAll(this, 'forceRender');
	}

	/**
	 * @param open
	 */
	onLeftNavToggle(open) {
		this.setState({open: open});
	}

	/**
	 * Redirects the application to the login view
	 * @param session
	 */
	onSessionChange(session) {
		if (!session && App.Config.autoLogin) {
			App.navigate('login');
		}
	}

	/**
	 *
	 */
	componentDidMount() {
		App.session.monitor(this.onSessionChange.bind(this));
		this.props.model.on('change', this.forceRender, this);
		App.bus.on('leftnav:toggle', this.onLeftNavToggle.bind(this));

	}

	/**
	 *
	 */
	componentWillUnmount() {
		this.props.model.off(null, null, this);
	}

	forceRender(){
		this.forceUpdate();
	}

	/**
	 * @returns {XML}
	 */
	render() {
		var classNames = cx('main-content', {'collapse': !this.state.open});
		this.renderDocTitle();
		const {username = '', id = ''} = model.currentAccount.attributes;
		const accountName = `(${username}-${id})`;
		return (
			<div>
				<HeaderView {...this.props} accountName={accountName}/>
				<div className="main-body">
					<AccountNavView {...this.props}/>
					<div className={classNames}>
						<div>
							<div className="right-content">
								{this.props.children}
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	/**
	 *
	 */
	renderDocTitle() {
		var attribs  = model.currentAccount.attributes,
			userName = attribs.firstName +' '+attribs.lastName;
		document.title = _.titleize(userName);
	}
}


AccountDisplay.defaultProps = {
	model: model.currentAccount
};



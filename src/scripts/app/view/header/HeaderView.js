import {removePartFromPath} from 'common/util/AppUtil.js';
import service from 'backoffice/service/ApiService';
import {classNames as cx} from 'common/util/ReactUtil';

export default class HeaderView extends React.Component {
	constructor(props, context) {
		super(props, context);
		_.bindAll(this, 'startTimer','resetTimer','goInactive');

		var isActive =  this.context.router.isActive('account');

		this.state = {
			session: App.session.request('session'),
			open: !isActive,
			username: App.session.request('name'),
			title: "Amelco"

		};

		this.isUserPage = false;

	}

	componentWillMount(){
		this.isUserPage = window.location.pathname.indexOf("/account/") > -1;
	}

	/**
	 *
	 */
	componentDidMount() {
		App.session.monitor(::this.onSessionChange);
		App.bus.on('leftnav:toggle', ::this.onLeftNavToggle);
		window.addEventListener('mousedown', this.resetTimer, false);
		this.startTimer();
	}

	componentWillReceiveProps(){
		this.onUrlChange(window.location.pathname);
	}

	startTimer() {
		// wait 60 minutes without mouse activity for timeout.
		this.timeoutID = window.setTimeout(this.goInactive, 1000 * 60 * 60);
	}
	resetTimer() {
		window.clearTimeout(this.timeoutID);
		this.startTimer();
	}

	goInactive() {
		App.session.execute('clearSession');
		service.logout();
	}

	/**
	 * Update state when session changes
	 */
	onSessionChange(session) {
		this.setState({
			session: session,
			username: App.session.request('name')
		});
	}

	/**
	 * @param open
	 */
	onLeftNavToggle(open) {
		this.setState({open: open});
	}

	/**
	 * Generally Logout and clear session, but:
	 *  if in "user pages" then close tab.
	 *  if user page but from pasted url then logout
	 *  (to avoid close restriction browsers have)
	 */
	onClick(session) {
		if (session) {
			if (!this.isUserPage) {
				App.session.execute('clearSession');
				service.logout();
			} else {
				if(!!window.opener){
					close();
				}else{
					App.session.execute('clearSession');
					service.logout();
				}
			}
		}
	}

	/**
	 * It takes the url pathname and finds a match with App.config tabs routes
	 * to render the right Module name in the Header when leftNavBar is collapsed
	 */
	onUrlChange(name){
		let title = '';

		if(App.BaseName!=='')
			name = removePartFromPath(name, App.BaseName);

		let url = name.split('/');

		if(url[url.length-1] === 'login'){
			return;
		}

		if(!this.isUserPage){
			url = _.rest(url); // remove first element

			const firstBit = url[0];
			const secondBit = url[1];

			let component = _.findWhere(this.props.tabs, {route: firstBit});
			component = component || _.findWhere(this.props.tabs, {route: secondBit});

			if (!component.tabs){ //views like AccountSearch have no children
				title = component.title || '';
			} else {
				title = _.find(component.tabs, secondBit)[secondBit];
			}
		}else{
			// We don't consider the last bit, since it's the user id
			const sectionDescriptor = url[url.length-2];
			//title = _.findWhere(this.props.accountTabs, {route: sectionDescriptor}).title;
			const {accountTabs} = this.props;
			let section = _.findWhere(accountTabs, {route: sectionDescriptor});
			if (!section){
				section = _.findWhere(accountTabs, (tab) => {
					return tab.alternativeRoutes.includes(sectionDescriptor);
				});
			}

			title = section && section.title;
		}
		this.setState({title: _.titleize(title)});
	}

	/**
	 *
	 */
	onLogoClick() {
		App.navigate();
	}
	/**
	 * 	When in "user pages" the Logout button
	 * 	becomes Close, but only if the page was opened directly in the CMS,
	 * 	not from pasted URL.
	 * */
	buttonText(){
		if(!this.isUserPage){
			return (!!this.state.session) ? 'Logout' : 'Login';
		}else{
			return (!!this.state.session && !!window.opener) ? 'Close' : 'Logout';
		}
	}

	/**
	 * @returns {XML}
	 */
	render() {
		let {open, session, title, username} = this.state;
		const buttonText = this.buttonText(),
			classNames = cx('logo-box', {'collapse': !open}),
			displayViewName = !open ? 'block' : 'none',
			displayUsername = !!session ? 'block' : 'none';

		if (this.props.accountName){
			title = `${title}: ${this.props.accountName}`;
		}

		//todo: move to scss
		const titleStyle = {float:'left', display:displayViewName, color:'white', margin:'15px 10px', fontWeight:'700'};
		const usernameStyle = {color: 'white', padding: '15px', float: 'right', display: displayUsername};

		return (
			<div className="header-bar">
				<div className={classNames}>
					<a className="logo" onClick={::this.onLogoClick}></a>
					<a className="logo2" onClick={::this.onLogoClick}></a>
				</div>
				<div style={titleStyle} id="headerPersonalDetails">
					{title}
				</div>
				<div className="account">
					<a className="logout btn" onClick={this.onClick.bind(this, session)}>{buttonText}</a>
				</div>
				<div style={usernameStyle}>
					{username}
				</div>
			</div>
		);
	}
};

HeaderView.defaultProps = {
	tabs: App.Config.tabs.map(component => ({"route": component.route, "title": component.title, "tabs": component.tabs})),
	accountTabs: App.Config.accountTabs[0].tabs.map(component => ({"route": component.route, "title": component.title}))
};

HeaderView.contextTypes = {
	router: React.PropTypes.object
};

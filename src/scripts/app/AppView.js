import ModalController from './ModalController';
import HeaderView from 'app/view/header/HeaderView';
import LeftNavView from 'app/view/leftNav/LeftNavView';
import {classNames as cx} from 'common/util/ReactUtil';
import { Provider } from 'react-redux'
import store from 'app/store/reduxStore';

export default class AppView extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {open: true};
	}

	/**
	 * @param open
	 */
	onLeftNavToggle(open) {
		this.setState({open: open});
	}

	/**
	 * Add session change listener
	 */
	componentDidMount() {
		App.session.monitor(this.onSessionChange.bind(this));
		App.bus.on('leftnav:toggle', this.onLeftNavToggle.bind(this));
	}

	/**
	 * Redirects the application to the login view
	 * @param session
	 */
	onSessionChange(session) {
		if (!session && App.Config.autoLogin) {
			App.navigate('login', {nextPathname: this.props.location.pathname});
		}
	}

	/**
	 * @returns {XML}
	 */
	render() {
		var classNames = cx('main-content', {'collapse': !this.state.open});
		return (
			<Provider store={store}>
				<div>
					<ModalController />
					<HeaderView {...this.props}/>
					<div className="main-body">
						<LeftNavView {...this.props}/>
						<div className={classNames}>
							<div>
								<div className="right-content">
									{this.props.children}
								</div>
							</div>
						</div>
					</div>
				</div>
			</Provider>
		)
	}
}

AppView.contextTypes = {
	router: React.PropTypes.object
};

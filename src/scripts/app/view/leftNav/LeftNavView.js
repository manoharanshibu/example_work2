import { Link } from 'react-router';
import { getComponent } from 'common/util/Href';
import { classNames as cx } from 'common/util/ReactUtil';
import brandsModel from 'backoffice/model/BrandsModel';

export default class LeftNavView extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.state = { open: true };

		// map all tabs to convert to a usable format
		// structured this way to maintain ordering
		this.tabs = _.map(App.Config.tabs, (t) => {
			return { route: t.route, title: t.title, enabled: t.enabled, tabs: this.map(t), icon: t.icon };
		}, this);
	}

	/**
	 * Toggles the menu open/shut
	 */
	onToggleOpen() {
		var state = !this.state.open;
		this.setState({ open: state });
		App.bus.trigger('leftnav:toggle', state);
	}

	/**
	 * @param route
	 */
	onNavigate(route) {
		App.navigate(route);
	}

	/**
	 * @returns {XML}
	 */
	render() {
		var tabs = this.renderTabs().concat(this.toggleButton()),
			leftCx = cx('left-nav', { 'collapse': !this.state.open }),
			mainCx = cx('main-nav', { 'collapse': !this.state.open });
		return (
			<div className={leftCx}>
				<ul className={mainCx}>
					{tabs}
				</ul>
			</div>
		)
	}

	/**
	 * @returns {Array|*}
	 */
	renderTabs() {
		return _.reduce(this.tabs, (tabs, t, i) => {
			var subNav = this.renderSubTabs(t),
				isActive = this.context.router.isActive(`/${t.route}`),
				title = _.titleize(t.title);
			// if not active, don't show any children
			if (!isActive) subNav = [];
			// if enabled, add the tab
			if (t.enabled) {
				tabs.push(
					<li key={i} title={title}>
						<Link to={`/${t.route}`} activeClassName='active'>
							<i className={t.icon}></i>
							{this.state.open && (
								title
							)}
							{this.state.open && (
								<i className="fa fa-chevron-down"></i>
							)}
						</Link>
						{!!subNav.length && (
							<ul className="secondary-nav open" style={{display: 'block'}}>
								{subNav}
							</ul>
						)}
					</li>
				)
			}
			return tabs;
		}, [], this);
	}

	/**
	 * @returns {Array|*}
	 */
	renderSubTabs(tab) {
		return _.map(tab.tabs, (t, i) => {
			var href = `/${tab.route}/${t.route}`;
			var title = _.titleize(t.title);
			var text = this.state.open ? title : i + 1;
			return (
				<li key={i} title={title}>
					<Link to={href} activeClassName='active'>
						{text}
					</Link>
				</li>
			)
		}, this);
	}

	/**
	 * @returns {XML}
	 */
	toggleButton() {
		var icon = this.state.open ? "fa fa-caret-square-o-left" : "fa fa-caret-square-o-right";
		return (
			<li key='toggle' onClick={this.onToggleOpen.bind(this)}>
				<a>
					<i className={icon} style={{color: '#bd3237'}}></i>
					{this.state.open && ("Collapse")}
				</a>
			</li>
		)
	}

	/**
	 * @param tab
	 */
	map(tab) {
		return _.reduce(tab.tabs, (ts, t) => {
			if (!!t.disabled)
				return ts;

			var key = _.keys(t)[0],
				val = _.values(t)[0];

			ts.push({ route: key, title: val });
			return ts;
		}, [])
	}
};

LeftNavView.contextTypes = {
	router: React.PropTypes.object
};

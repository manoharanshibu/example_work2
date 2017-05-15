import {notify, errorPopup, confirm} from 'common/util/PopupUtil.js';
import Component from 'common/system/react/BackboneComponent';
import cache from 'backoffice/model/NodeCache';
import nodePromotions from 'backoffice/collection/NodePromotions';
import Loader from 'app/view/Loader';
import Tabs from 'backoffice/components/tabs/Tabs';
import Tab from 'backoffice/components/tabs/Tab';
import UnauthorizedMessage from 'app/view/UnauthorizedMessage';
import { Icon } from 'app/util/iconsUtil';
import Tooltip from 'backoffice/components/tooltips/Tooltip';
import ReactDataGrid from 'react-data-grid';

export default class BonusTilesList extends Component {
	constructor(props) {
		super(props);


		this.state = {
			name: '',
			selectedTab: 'sportsbook',
			expiredTilesIds: []
		};

		this.observe = false;

		this.treeHeight = _.once(function(){
			return window.innerHeight - 35;
		});

		this.collection = nodePromotions;

		this.onTabClick = ::this.onTabClick;
		this.onCheckExpiredTiles = ::this.onCheckExpiredTiles;
		this.forceRerender = ::this.forceRerender;
		this.onSearch = ::this.onSearch;
		this.onClear = ::this.onClear;
		this.onAddBonusTile = ::this.onAddBonusTile;
	}

	componentDidMount() {
		this.onCheckExpiredTiles();
		this.collection.on('change changeStatus add reset destroy update', this.forceRerender);
		this.searchFilter = ReactDOM.findDOMNode(this.refs.name);
	}

	componentWillUnmount(){
		this.collection.off('change changeStatus add reset destroy update', this.forceRerender);
	}

	forceRerender(){
		this.onCheckExpiredTiles();
		this.forceUpdate();
	}

	onCheckExpiredTiles(){
		const expiredTiles = this.collection.getExpiredSportsbookBonusTiles();
		const expiredTilesIds = expiredTiles.map( t => t.id );

		this.setState({expiredTilesIds});
	}

	onTabClick(selectedTab){
		this.setState({selectedTab: selectedTab.props.id});
	}

	heightFunction() {
		return this.treeHeight;
	}

	/**
	 * Filter the records
	 */
	onSearch() {
		const name = this.searchFilter.value;
		this.setState({name});
	}

	/**
	 * Reset filtering
	 */
	onClear(event) {
		event.stopPropagation();
		event.nativeEvent.stopImmediatePropagation();
		event.preventDefault();
		this.searchFilter.value = '';
		this.setState({name: ''});
	}

	onToggle(node, expanded) {
		cache.toggleNode(node.id, 'openField2');
	}

	onAddBonusTile(){
		const {selectedTab} = this.state;
		App.navigate('/cms/bonustiles/creation', {applicationType: selectedTab});
	}

	onEditBonusTile(promoId) {
		App.navigate('/cms/bonustiles/edit/' + promoId);
	}

	onRemoveBonusTile(promotion, event){
		event.stopPropagation();
		const promName = promotion.get('name');
		const message = <div><p>Are you sure you wish to delete the bonus tile named:</p>
			<div className="name">{`${promName}?`}</div></div>;

		confirm('Are you sure?', message, this.onDestroy.bind(this, promotion));
	}

	onDestroy(promotion){
		promotion.destroy({wait: true})
			.done( this.onRemoveSuccess )
			.fail( this.onRemoveFailure );
	}

	onRemoveSuccess(){
		notify('Success', 'The bonus tile has been deleted');
		this.forceUpdate();
	}

	onRemoveFailure(){
		errorPopup('There has been an error deleting the bonus tile');
	}


	getCreateButtonLabel(){
		const {selectedTab} = this.state;

		return `Create ${selectedTab.toUpperCase()} Bonus Tile`;
	}

	/**
	 * @returns {XML}
	 */
	render() {
		if (!App.session.request('loggedIn')) {
			return <div className="panel padding white">Please log in to have access to the campaigns</div>;
		}

		//TODO: Checking the permissions on every render, might not be ideal
		//but as a quick fix, it ensures they are reevaluated if the user has
		//logged out and logged in with different user
		const allowed = App.session.request('canCmsPromotions');

		if (!allowed){
			return <UnauthorizedMessage />;
		}

		// Not to be removed, unless placed in the stylesheets
		const styleScrollable = {
			top: 0,
			bottom: 0,
			overflow: 'scroll'
		};

		const boxHeight = window.innerHeight - 50;
		const createBtnLabel = this.getCreateButtonLabel();
		const application = this.state.selectedTab;
		const filteredBySearch = this.collection.getBonusTiles(this.state.name, application);
		const numResults = filteredBySearch.length;

		return (
			<div className="newbox">
				<div style={{position: 'relative', height: boxHeight}}>
					<div className="table toolbar">
						<div className="table-row">
							<div className="table-cell">
								<div className="inline-form-elements">
									<label>Filter by Name:</label>
									<input autoFocus ref="name" type="text" name="text" onChange={this.onSearch}/>
									<Icon name="times-circle" color="#628EB1" fontSize={20} onClick={this.onClear} />
									<span>{` ${numResults} rows`}</span>
								</div>
							</div>
							<div className="table-cell right">
								<div className="inline-form-elements">
									<a className="btn green filled" onClick={this.onAddBonusTile}>{createBtnLabel}</a>
								</div>
							</div>
						</div>
					</div>
					{this.renderContents(filteredBySearch)}
				</div>
				<Tooltip place="right" type="info" effect="solid" />
			</div>
		);
	}

	/**
	 * @returns {XML}
	 */
	renderContents(filteredBySearch){

		if (this.collection.status === 'pending'){
			return <Loader />;
		}

		if (this.collection.status === 'error'){
			return <p>There has been an error retrieving the bonus tiles list.</p>;
		}

		const columns = [
			{key: 'status', name: 'Status', width: 100, cellClass: 'center'},
			{key: 'name', name: 'Name', cellClass: 'left'},
			{key: 'actions', name: 'Actions', width: 150, cellClass: 'center'}
		];

		const numResults = filteredBySearch.length;

		return (
			<ReactDataGrid
				minHeight={window.innerHeight - 100}
				columns={columns}
				rowGetter={this.rowGetter.bind(this, filteredBySearch)}
				rowsCount={numResults}
				rowHeight={45}
				headerRowHeight={50}
			/>
		);
	}

	/**
	 * @returns {*}
	 */
	renderRows(application) {
		const createBtnLabel = this.getCreateButtonLabel();

		if (!this.collection.length){
			return <p>There are currently no saved bonus tiles. Click on "{createBtnLabel}" to create one.</p>;
		}


		var filteredBySearch = this.collection.getBonusTiles(this.state.name, application);

		return _.reduce(filteredBySearch, (rows, tile, index) => {
			rows.push((
				<div key={index} className="table-row clickable">
					{this.renderStatus(tile)}
					<div className="table-cell name"
						 onClick={this.onEditBonusTile.bind(this, tile.get('id'))}>
						{tile.get('name') || ''}
					</div>
					<div className="table-cell center actions">
						<a className="btn red small" onClick={this.onRemoveBonusTile.bind(this, tile)}>Remove</a>
						&nbsp;
						<a className="btn blue small" onClick={this.onEditBonusTile.bind(this, tile.get('id'))}>Edit</a>
					</div>
				</div>
			));

			return rows;
		}, [], this);
	}

	renderStatus(tile) {
		const isOutdated = this.state.expiredTilesIds.includes(tile.id);
		const status = isOutdated ?
			<Icon
				onClick={this.onRemoveBonusTile.bind(this, tile)}
				name="exclamation-circle"
				color="orange"
				data-tip="The campaign associated<br>with this tile has expired<br><br>Click to delete it."
				data-type="warning"
				data-multiline={true}
				fontSize={20}/>

			: null;

		return (
			<div className="table-cell">{status}</div>
		);
	}

	rowGetter(list, index){
		const tile = list[index];

		const actions = (
			<div>
				<a className="btn red small" onClick={this.onRemoveBonusTile.bind(this, tile)}>Remove</a>
				&nbsp;
				<a className="btn blue small" onClick={this.onEditBonusTile.bind(this, tile.get('id'))}>Edit</a>
			</div>
		);

		const name = (
			<div onClick={this.onEditBonusTile.bind(this, tile.get('id'))}>
				{tile.get('name') || ''}
			</div>
		);

		const isOutdated = this.state.expiredTilesIds.includes(tile.id);
		const status = isOutdated ?
			<Icon
				onClick={this.onRemoveBonusTile.bind(this, tile)}
				name="exclamation-circle"
				color="orange"
				data-tip="The campaign associated<br>with this tile has expired<br><br>Click to delete it."
				data-type="warning"
				data-multiline={true}
				fontSize={20}/>

			: null;

		return {status, actions, name};
	}
};


BonusTilesList.displayName = 'BonusTilesList';


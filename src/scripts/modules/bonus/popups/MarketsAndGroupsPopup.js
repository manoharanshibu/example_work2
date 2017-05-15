import Component from 'common/system/react/BackboneComponent';
import TreeMenu from 'backoffice/components/controls/TreeMenu';
import Popup from 'common/view/popup/Popup';
import nodeModel from 'backoffice/model/NodeModel';
import cache from 'backoffice/model/NodeCache';
import SelectList from 'backoffice/components/lists/SelectList';
import marketCache from 'backoffice/model/MarketCache';

export default class MarketsAndGroupsPopup extends Component {
	constructor(props) {
		super(props);
		this.buttons = [
			{title: 'Done', cls: 'blue', handler: this.onClose.bind(this)}
		];

		this.state = {
			selectedNodeId: 0,
			marketTypes: [],
			marketGroups: [],
			paths: this.props.paths,
			markets: this.props.availPaths
		};

		_.bindAll(this, 'onToggle', 'onSportDataPopulated');

		App.bus.on('treeAvailibility:populated', this.onSportDataPopulated);
	}

	/**
	 *
	 */
	onClose() {
		var paths = this.refs.treeMenu.getSelected();
		var markets = this.state.markets;
		if (this.props.onClose){
			this.props.onClose(paths, markets);
		}
	}

	// This is called when a sport/league node is highlighted in the event tree navigation
	onToggle(node, expanded) {
		cache.toggleNode(node.id);
		node.set(this.props.openField, !node.get(this.props.openField));

		// Trigger the retrieval of sportData, the "markets" and "marketGroups"
		// SelectList will be updated asynchronously upon receiving sportData
		marketCache.getSportData(node.id, node.get('sportCode'));
		this.setState({
			selectedNodeId: node.id
		});

	}

	onCheckBoxChange(){
		if (this.props.onSportToggle){
			this.props.onSportToggle();
		}
	}

	// This is called whenever the information on marketGroups and
	// marketTypes for particular sport is detected as available
	onSportDataPopulated(nodeId){
		var all = marketCache.getNodeSelectLists(nodeId);

		if (nodeId === this.state.selectedNodeId){
			this.setState({
				marketTypes: all.markets,
				marketGroups: all.groups
			});
		}
	}

	/**
	 * @returns {XML}
	 */
	render() {
		var styles = {
			maxWidth: 'none',
			maxHeight: '450px',
			overflow: 'scroll',
			overflowX: 'hidden',
			fontSize: '14px',
			left: '10%',
			marginLeft: 'initial',
			width: '80%',
			top: '20%'
		};

		var marketSelector = this.renderMarketSelector();

		if (this.props.inline){
			return marketSelector;
		}

		return (
			<Popup title="Market Selector"
				buttons={this.buttons}
				onClose={this.onClose.bind(this)}
				styles={styles}>
				<div style={{maxWidth: '700px', padding: '10px', margin: '0 auto'}}>
					{marketSelector}
				</div>
			</Popup>
		)
	}

	renderMarketSelector(){
		var cellStyle = {padding: '0', maxHeight: '30%'};
		var marketTypessKey = 'marketTypesList' + this.state.selectedNodeId;
		var marketGroupsKey = 'marketGroupsList' + this.state.selectedNodeId;
		var globalStyle = {};

		var selectedMarketTypes = this.getPathsForCurrentSport('marketTypes');

		// Add border-right if there is a market-groups to the right
		if (this.props.includeMarketGroups){
			cellStyle.borderRight = '1px solid #DFDFDF';
		}

		var selectedSports = _.map(this.props.paths, (path) => parseInt(path,10));

		return (
			<div key={this.props.id} className="table inner no-border-bottom" style={globalStyle}>
				{this.renderHeaders()}
				<div className="table-row">
					<div className="table-cell" style={{padding: '0', borderRight: '1px solid #DFDFDF'}}>
						<TreeMenu ref="treeMenu"
							  checkbox={true}
							  openField={this.props.openField || 'open'}
							  selected={selectedSports}
							  hilitedNodeId={this.state.selectedNodeId}
							  data={cache.RootNodes}
							  onCheckBoxChange={this.onCheckBoxChange.bind(this)}
							  onToggle={this.onToggle.bind(this)}/>
					</div>
					<div className="table-cell" style={{padding: '0'}}>
						<SelectList
							key={marketTypessKey}
							ref="markets"
							onToggle={this.onMarketTypeToggled.bind(this)}
							style={cellStyle}  list={selectedMarketTypes} />
					</div>
					{this.renderMarketGroups()}
				</div>
			</div>
		);
	}

	renderHeaders(){
		var columnWidth = '50%';
		var thirdColumn = null;

		if (this.props.includeMarketGroups){
			columnWidth = '33%';
			thirdColumn = <div className="table-cell" style={{width: thirdColumn}}>
						Market groups
						</div>;
		}

		return (<div className="table-row header larger">
					<div className="table-cell" style={{width: columnWidth, borderRight: '1px solid #DFDFDF'}}>
						Sports/Competitions/Events
					</div>
					<div className="table-cell" style={{width: columnWidth, borderRight: '1px solid #DFDFDF'}}>
						Markets
					</div>
					{thirdColumn}
				</div>
		);
	}

	renderMarketGroups(){
		var cellStyle = {padding: '0', maxHeight: '311px'};
		var selectedMarketGroups;

		if (!this.props.includeMarketGroups || !this.state.selectedNodeId){
			return null;
		}

		selectedMarketGroups = this.getPathsForCurrentSport('marketGroups');

		if (!selectedMarketGroups.length){
			return (<div className="table-cell" style={{width: '50%', padding: '0'}}>
						<p>There are no market groups defined for the selected sport</p>
					</div>);
		}

		return (
				<div className="table-cell" style={{width: '50%', padding: '0'}}>
					<SelectList
						ref="groups"
						emptyListMessage="There are no market groups defined for this sport"
						list={selectedMarketGroups}
								onToggle={this.onMarketGroupToggled.bind(this)}
								style={cellStyle} />
						</div>
		);
	}


	onMarketGroupToggled(elem, index){
		var currentSportIndex;
		var currentSportPaths = _.findWhere(this.state.markets, {path: this.state.selectedNodeId});

		currentSportIndex = (currentSportPaths &&
								   currentSportPaths.marketGroups &&
								   currentSportPaths.marketGroups.indexOf(elem.id));

		// Create the path if it doesn't exist
		if (!currentSportPaths){
			this.state.markets.push({
				path: this.state.selectedNodeId,
				marketTypes: [],
				marketGroups: [elem.id]
			});
		} else {
			// If market group is currently selected
			if (currentSportIndex !== -1){
				// Remove from the array
				currentSportPaths.marketGroups.splice(currentSportIndex,1);
			} else {
				currentSportPaths.marketGroups.push(elem.id);
			}
		}

		if (this.props.onMarketGroupToggled){
			this.props.onMarketGroupToggled(elem, index);
		}
	}

	onMarketTypeToggled(elem, index){
		var currentSportIndex;
		var currentSportPaths = _.findWhere(this.state.markets, {path: this.state.selectedNodeId + ''});

		// Create the path if it doesn't exist
		if (!currentSportPaths){
			this.state.markets.push({
				path: this.state.selectedNodeId + '',
				marketTypes: [elem.id],
				marketGroups: []
			});
		} else {
			currentSportIndex = (currentSportPaths &&
									   currentSportPaths.marketTypes &&
									   currentSportPaths.marketTypes.indexOf(elem.id));

			// If market group is currently selected
			if (currentSportIndex !== -1){
				// Remove from the array
				currentSportPaths.marketTypes.splice(currentSportIndex,1);
			} else {
				currentSportPaths.marketTypes.push(elem.id);
			}
		}

		if (this.props.onMarketTypeToggled){
			this.props.onMarketTypeToggled(elem, index);
		}
	}

	// This prepares the initial list for the SelectLists corresponding
	// to the currently Selected Sport
	// propName can be either 'marketGroups' or 'marketTypessKey'
	getPathsForCurrentSport(propName){
		var currentSportPaths = _.findWhere(this.state.markets, {path: this.state.selectedNodeId + ''});
		var paths = (currentSportPaths && currentSportPaths[propName]) || [];
		var unSelectedList = this.state[propName];

		var descriptor = cache.getSportFullPathDescription(this.state.selectedNodeId);

		var selectList = _.map(unSelectedList, function(elem){

			return {
				id: elem.id,
				name: elem.name,
				selected: _.contains(paths, elem.id)
			};
		});

		return selectList;
	}

};

MarketsAndGroupsPopup.defaultProps = {collection: cache};

import Popup from 'common/view/popup/Popup';
import service from 'backoffice/service/ApiService';
import Component from 'common/system/react/BackboneComponent';
import TableRowWrapper from 'backoffice/components/TableRowWrapper';
import OneTabList from 'backoffice/components/lists/OneTabList';
import RemovableList from 'backoffice/components/lists/RemovableList';
import nodeCache from 'backoffice/model/NodeCache';
import { sportsList, getPathList } from 'backoffice/util/PathsUtils';
import Loader from 'app/view/Loader';
import EventSearchPopup from 'backoffice/components/EventSearchPopup';
import BetsModel from 'backoffice/model/bets/BetsModel';

export default class NewBet extends Component {

	constructor(props) {
		super(props);

		this.state = {
			search: true,
			paths: [],
			list: sportsList,
			selectedPath: null,
			selectedEvent: null,
			selectedMarket: null,
			selectedSelection: null,
			markets: null,
			isMarketReached: false,
			isSelectionReached: false,
			loading: false
		};

		this.onClose = ::this.onClose;
		this.onSelPath = ::this.onSelPath;
		this.onRemovePath = ::this.onRemovePath;
		this.onSelectMarket = ::this.onSelectMarket;
		this.onConfirm = ::this.onConfirm;
		this.onSearchClose = ::this.onSearchClose;
		this.onSelectEvent = ::this.onSelectEvent;
		this.onSearch = ::this.onSearch;
	}

	onConfirm() {
		const { selectedEvent, selectedSelection, selectedMarket } = this.state;
		this.setEachWay(selectedMarket);
		selectedSelection.event = selectedEvent;
		selectedSelection.market = selectedMarket;
		if (!this.props.noBets) {
			BetsModel.buildBetSelection(selectedSelection);
			BetsModel.onBonusEntitlementsChange(selectedEvent.Event);
		}

		if (this.props.onAddSelection) {
			this.props.onAddSelection(selectedSelection);
		}
		this.props.onConfirm();
	}

	onSelPath(pathId) {
		const { isSelectionReached, isMarketReached } = this.state;
		const selectedPath = _.findWhere(this.state.list, { id: pathId });
		const selectedPathName = selectedPath ? selectedPath.name : '';

		const { paths } = this.state;
		this.updatePath(pathId);


		if (!isSelectionReached && !isMarketReached) {
			nodeCache.openNode(pathId);
		}

		paths.push({
			id: pathId,
			name: `${pathId} - ${selectedPathName}`
		});

		if (isMarketReached && !isSelectionReached) {
			const selectedMarket = _.find(this.state.markets, item => {
				return item.id === pathId;
			});

			const list = getPathList(selectedMarket.selection);
			this.setState({ selectedMarket, list, isSelectionReached: true });
		}
		else {
			if (isSelectionReached) {
				const selectedSelection  = _.find(this.state.selectedMarket.selection, item => {
					return item.id === pathId;
				});
				this.setState({ selectedSelection });
			}
			this.setState({ list: null });
		}
	}

	onRemovePath(removedPath) {
		const { id } = removedPath;
		const { paths, isSelectionReached } = this.state;
		let removedPathIndex = _.findIndex(paths, (path) => {
			return (path.id === id);
		});

		if (isSelectionReached) {
			removedPathIndex--;
		}

		const strippedPaths = paths.slice(0, removedPathIndex);
		if (!removedPathIndex) {
			// If we are removing the last path, get the sport list
			// And empty the markets list
			this.setState({
				list: sportsList,
				marketList: null,
				selectedMarket: null
			});
		} else {
			if (isSelectionReached) {
				this.setState({
					isMarketReached: false,
					isSelectionReached: false,
					selectedSelection: null
				});
			}

			// Get the children for the last unremoved path
			const lastUnRemovedPath = paths[removedPathIndex - 1];

			this.onSelPath(lastUnRemovedPath.id);
		}

		this.setState({ paths: strippedPaths });
	}


	onSelectMarket(selectedMarket) {
		this.setState({ selectedMarket });
	}

	onGotPathChildren(resp) {
		const pathChildren = resp && resp.Result && resp.Result.node &&
			resp.Result.node.children;

		if (resp.Result.node.type && resp.Result.node.type === 'TRADING') {
			this.fetchEvent(resp.Result.node.id);
		}
		else {
			const newList = pathChildren ? getPathList(pathChildren) : [];
			this.setState({
				isSelectionReached: false,
				isMarketReached: false,
				list: newList,
				markets: null,
				selectedPath: null
			});
		}
	}

	onClose() {
		if (!this.props.noBets) {
			BetsModel.clearAllBetData();
		}
		this.props.onConfirm();
	}

	updatePath(selectedPath) {
		this.setState({ selectedPath });
		service.sportsNode(selectedPath)
			.then(::this.onGotPathChildren, ::this.onError);
	}

	onError(resp){
		console.warn(JSON.stringify(resp));
	}

	setEachWay(market) {
		if (_.has(market, 'attributes')) {
			_.each(market.attributes.attrib, (obj) => {
				if (obj.key === 'isEachWayAvail') {
					if (obj.value === 'true') {
						market.isEachWayAvail = true;
					}
					if (obj.value === 'false') {
						market.isEachWayAvail = false;
					}
				}
				if (obj.key === 'numPlaces') {
					market.numPlaces = obj.value;
				}

				if (obj.key === 'deduction') {
					market.deduction = obj.value;
				}
			});
		}
	}

	onSearch() {
		this.setState({ search: true });
	}

	onSearchClose() {
		this.setState({ search: false });
	}

	onSelectEvent(event) {
		this.setState({ loading: true });
		const paths = [];
		const path = event.path.split(':');
		_.each(path, node => {
			paths.push({
				id: node,
				name: node
			});
		});
		const last = paths[paths.length - 1];
		last.name = event.name;
		this.setState({ selectedEvent: event, paths });
		this.updatePath(last.id);
	}

	/**
	 * @param eventId
	 */
	fetchEvent(eventId) {
		if (!eventId) return;
		const that = this;
		service.getEvent(eventId)
			.then(
				resp => {
					this.setState({ selectedEvent: resp });
					const newList = getPathList(resp.Event.markets);
					that.setState({
						isMarketReached: true,
						isSelectionReached: false,
						list: newList,
						selectedPath: null,
						markets: resp.Event.markets,
						loading: false
					});
				});
	}

	renderContents() {
		if (this.state.searching || this.state.loading) {
			return <div className="padding">Please wait while the search is taking place...</div>;
		}

		return (
			<div>
				<a className="btn blue filled"
					style={ { width: 100, margin: 10 } } onClick={ ::this.onSearch }
				>
					Search
				</a>
				{ this.renderSelected() }
				{ this.renderSelector() }
			</div>
		);
	}

	renderSelected() {
		const { paths } = this.state;

		if (!paths || !paths.length) {
			return null;
		}

		return (
			<div className="table no-border-bottom">
				<div className="table-row">
					<RemovableList
						title={ 'Selected Path' }
						onRemoveElement={ this.onRemovePath }
						list={ this.state.paths }
					/>
				</div>
			</div>
		);
	}

	renderSelector() {
		const { list, paths, isSelectionReached } = this.state;

		// If the list is null it means we are still trying to retrieve the
		// market list
		if (!list && !isSelectionReached) {
			return <Loader />;
		}
		else if (!list) {
			return null;
		}
		else if (!list.length) {
			return <p>The selected path has no more children</p>;
		}

		const title = paths.length ? 'Add sub path:' : 'Select sport:';

		return (
			<div className="table no-border-bottom">
				<TableRowWrapper label={ title }>
					<OneTabList
						focus
						value={ null }
						onChange={ this.onSelPath }
						list={ this.state.list }
						cls="full-width"
					/>
				</TableRowWrapper>
			</div>
		);
	}

	render() {
		if (this.state.search) {
			return (
				<EventSearchPopup onSelectEvent={ this.onSelectEvent } onClose={ this.onSearchClose } modalWinStyles={ this.props.modalWinStyles } />
			);
		}
		const { selectedSelection } = this.state;
		const selectionName = selectedSelection ? 'Selected selection: ' + selectedSelection.name : 'Please select a selection';
		const buttons = [];

		// Only show the confirm button if at least the sport has been selected
		if (selectedSelection) {
			buttons.push({ title: 'Save', cls: 'blue', handler: this.onConfirm });
		}

		buttons.push({ title: 'Cancel', cls: 'blue', handler: this.onClose });


		return (
			<Popup title={ selectionName }
				titleBarColor="#337AB7"
				footerIsAbsolute
				styles={ this.props.modalWinStyles }
				buttons={ buttons }
				onClose={ ::this.onClose }
			>
				{ this.renderContents() }
			</Popup>
		);
	}

}

NewBet.displayName = 'NewBet';

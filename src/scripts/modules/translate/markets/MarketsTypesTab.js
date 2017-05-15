import Component from 'common/system/react/BackboneComponent';
import translationsModel from 'backoffice/model/MarketsTranslationsModel';
import ReactDataGrid from 'react-data-grid';
import EditMarketPopup from './EditMarketPopup';
import AddMarketPopup from './AddMarketPopup';

export default class MarketsTypesTab extends Component {

	constructor(props) {
		super(props);
		this.state = {
			filteredMarkets: this.props.markets.models
		};
		this.columns = [
			{key: 'id', name: 'Id', cellClass: 'center'},
			{key: 'code', name: 'Code', cellClass: 'center'},
			{key: 'name', name: 'Name', cellClass: 'center'},
			{key: 'displayOrder', name: 'Display Order', cellClass: 'center'},
			{key: 'actions', name: '', cellClass: 'center'}
		];
		_.bindAll(this, 'rowGetter' , 'updateFilteredMarkets', 'onAddMarket');
	}


	componentDidMount() {
		this.searchCode = ReactDOM.findDOMNode(this.refs.searchCode);
		this.searchName = ReactDOM.findDOMNode(this.refs.searchName);
		translationsModel.on('change:markets', this.updateFilteredMarkets);
	}

	componentWillUnmount(){
		translationsModel.off('change:markets', this.updateFilteredMarkets);
	}

	updateFilteredMarkets() {
		const searchCode = this.searchCode.value;
		const searchName = this.searchName.value;
		let filteredMarkets = this.props.markets.byMarketsCode(this.props.markets, searchCode);
		filteredMarkets = this.props.markets.byMarketsName(filteredMarkets, searchName);
		this.setState({filteredMarkets: filteredMarkets});
	}

	onAddMarket() {
		App.bus.trigger('popup:view', AddMarketPopup);
	}

	onEditMarket(market) {
		App.bus.trigger('popup:view', EditMarketPopup, {model:market});
	}

	render() {
		const length = this.state.filteredMarkets.length;

		return (
			<div>
				<div className="table toolbar">
					<div className="table-row">
						<div className="table-cell">
							<div className="inline-form-elements">
								<label>Search:</label>
							</div>
						</div>
						<div className="table-cell">
							<div className="inline-form-elements">
								<label>Market Code</label>
								<input ref="searchCode" type="text" onChange={this.updateFilteredMarkets}/>
							</div>
						</div>
						<div className="table-cell">
							<div className="inline-form-elements">
								<label>Market Name</label>
								<input ref="searchName" type="text" onChange={this.updateFilteredMarkets}/>
							</div>
						</div>
						<div className="table-cell right">
							<div className="inline-form-elements">
								<a className="btn green filled" onClick={this.onAddMarket}>Add Market</a>
							</div>
						</div>
					</div>
				</div>

				<ReactDataGrid
					columns={this.columns}
					rowsCount={length}
					rowGetter={this.rowGetter}
					minHeight={600} />
			</div>
		)
	}

	rowGetter(index) {
		const market = this.state.filteredMarkets[index];
		const {id, code, name, sport, displayOrder} = market.attributes;
		const nameToDisplay = `${name} | ${sport ? sport.toLowerCase() : ''}`;
		const actions =
			<div>
				<button className="btn blue small" onClick={this.onEditMarket.bind(this, market)}>Edit</button>
			</div>;

		return {id, code, name: nameToDisplay, displayOrder, actions};
	}

}


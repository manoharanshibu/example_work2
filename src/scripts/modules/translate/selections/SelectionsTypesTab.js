import Component from 'common/system/react/BackboneComponent';
import translationsModel from 'backoffice/model/SelectionsTranslationsModel';
import ReactDataGrid from 'react-data-grid';
import AddSelectionPopup from './AddSelectionPopup';
import EditSelectionPopup from './EditSelectionPopup';

export default class SelectionsTypesTab extends Component {

	constructor(props) {
		super(props);
		this.state = {
			filteredSelections: this.props.selections.models
		};
		this.columns = [
			{key: 'id', name: 'Id', cellClass: 'center'},
			{key: 'selectionGroup', name: 'Group', cellClass: 'center'},
			{key: 'code', name: 'Code', cellClass: 'center'},
			{key: 'name', name: 'Name', cellClass: 'center'},
			{key: 'displayOrder', name: 'Display Order', cellClass: 'center'},
			{key: 'actions', name: '', cellClass: 'center'}
		];
		_.bindAll(this, 'rowGetter', 'updateFilteredSelections', 'onAddSelection');
	}


	componentDidMount() {
		this.searchCode = ReactDOM.findDOMNode(this.refs.searchCode);
		this.searchName = ReactDOM.findDOMNode(this.refs.searchName);
		translationsModel.on('change:selections', this.updateFilteredSelections);
	}

	componentWillUnmount(){
		translationsModel.off('change:selections', this.updateFilteredSelections);
	}

	updateFilteredSelections() {
		const searchCode = this.searchCode.value;
		const searchName = this.searchName.value;
		let filteredSelections = this.props.selections.bySelectionsCode(this.props.selections, searchCode);
		filteredSelections = this.props.selections.bySelectionsName(filteredSelections, searchName);
		this.setState({filteredSelections: filteredSelections});
	}

	onAddSelection() {
		App.bus.trigger('popup:view', AddSelectionPopup);
	}

	onEditSelection(selection) {
		App.bus.trigger('popup:view', EditSelectionPopup, {model:selection});
	}

	render() {
		const length = this.state.filteredSelections.length;

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
								<label>Selection Code</label>
								<input ref="searchCode" type="text" onChange={this.updateFilteredSelections}/>
							</div>
						</div>
						<div className="table-cell">
							<div className="inline-form-elements">
								<label>Selection Name</label>
								<input ref="searchName" type="text" onChange={this.updateFilteredSelections}/>
							</div>
						</div>
						<div className="table-cell right">
							<div className="inline-form-elements">
								<a className="btn green filled" onClick={this.onAddSelection}>Add Selection</a>
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
		const selection = this.state.filteredSelections[index];
		const {id, selectionGroup, name, code, displayOrder} = selection.attributes;
		const actions =
			<div>
				<button className="btn blue small" onClick={this.onEditSelection.bind(this, selection)}>Edit</button>
			</div>;

		return {id, selectionGroup, code, name, actions, displayOrder};
	}

}

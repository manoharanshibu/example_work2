import Component from 'common/system/react/BackboneComponent';
import TextInput from 'backoffice/components/elements/TextInput';
import ComboBox from 'backoffice/components/elements/ComboBox';
import translationsModel from 'backoffice/model/SelectionsTranslationsModel';
import marketsTranslationsModel from 'backoffice/model/MarketsTranslationsModel';
import Tabs from 'backoffice/components/tabs/Tabs';
import Tab from 'backoffice/components/tabs/Tab';
import ReactDataGrid from 'react-data-grid';
import AddTranslationPopup from 'translate/AddTranslationPopup';
import AddSelectionVariantPopup from './AddSelectionVariantPopup';

export default class SelectionsTranslationsTab extends Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedSelectionCode: '',
			selectedTab: 0,
			selectedSelectionVariant: null
		};

		_.bindAll(this, 'onAddTranslation',
			'onSelectionChange', 'onSelectionVariantsChange',
			'onAddSelectionVariant', 'onEditSelectionVariant',
			'forceRender', 'onTabClick', 'onRowUpdated'
		);
	}

	componentDidMount() {
		translationsModel.on('change:selections', this.forceRender);
		translationsModel.on('change:selectionVariants', this.onSelectionVariantsChange);
	}

	componentWillUnmount() {
		translationsModel.off('change:selections', this.forceRender);
		translationsModel.off('change:selectionVariants', this.onSelectionVariantsChange);
	}

	forceRender() {
		this.forceUpdate()
	}

	onSelectionChange(value) {
		this.setState({
			selectedSelectionCode: value,
			selectedTab: 0,
			selectedSelectionVariant: this.props.selectionVariants.models[0]
		});
		translationsModel.getSelectionVariants(value);
	}

	onSelectionVariantsChange() {
		this.setState({
			selectedSelectionVariant: this.props.selectionVariants.models[this.state.selectedTab]
		});
	}

	onTabClick(tab) {
		this.setState({
			selectedTab: tab.props.id,
			selectedSelectionVariant: this.props.selectionVariants.models[tab.props.id]
		})
	}

	onAddSelectionVariant() {
		App.bus.trigger('popup:view', AddSelectionVariantPopup, {selectionTypeCode: this.state.selectedSelectionCode});
	}

	onEditSelectionVariant() {
		translationsModel.editSelectionVariant(this.state.selectedSelectionVariant)
	}

	onAddTranslation() {
		App.bus.trigger('popup:view', AddTranslationPopup, {locales: translationsModel.locales, model: this.state.selectedSelectionVariant, onSave: this.onEditSelectionVariant});
	}

	onRowUpdated(cell) {
		const {cellKey, rowIdx, updated} = cell;
		const value = updated[cellKey];
		let updatedTranslations = this.state.selectedSelectionVariant.get('translations')[rowIdx];
		updatedTranslations[cellKey] = value;
	}

	render() {
		return (
			<div>
				<div className="table toolbar">
					<div className="table-row">
						<div className="table-cell">
							{this.renderSelectionsComboBox()}
						</div>

						{this.state.selectedSelectionCode &&
						<div className="table-cell right">
							<a className="btn green filled" onClick={this.onAddSelectionVariant}>Add Selection Variant</a>
						</div>
						}
					</div>
				</div>

				{this.renderSelectionVariants()}
			</div>
		)
	}

	renderSelectionVariants() {
		if (!this.state.selectedSelectionCode)
			return null;

		let {selectionVariants} = this.props;
		if(selectionVariants.length === 0)
			return null;

		return (
			<Tabs
				selectedTab={this.state.selectedTab}
				onTabClick={this.onTabClick}>

				{selectionVariants.map((selectionVariant, index) => {
					return (
						<Tab id={index} title={selectionVariant.getTitle()}>
							{this.renderSelectionVariant(selectionVariant)}
						</Tab>
					)
				})}

			</Tabs>
		)
	}

	renderSelectionVariant(selectionVariant) {
		return (
			<div>
				<div className="table toolbar">

					<div className="table-row">
						<div className="table-cell"/>
						<div className="table-cell"/>
						<div className="table-cell right">
							<div className="inline-form-elements">
								<a className="btn green filled" onClick={this.onAddTranslation}>Add Translation</a>
								<a className="btn green filled" onClick={this.onEditSelectionVariant}>Save Selection Variant</a>
							</div>
						</div>
					</div>

					<div className="table-row">
						<div className="table-cell">
							{this.renderTextInput('Sub Type', 'subType', true)}
						</div>
						<div className="table-cell">
							{this.renderTextInput('Sub Type Format', 'subTypeFormat')}
						</div>
					</div>
				</div>

				{this.renderSelectionVariantTranslations(selectionVariant.get('translations'))
				}
			</div>
		)
	}

	renderSelectionVariantTranslations(translations) {
		const columns = [
			{key:'locale', name:'Locale', cellClass:'center'},
			{key:'longText', name:'Long Text', editable: true, cellClass:'center editable'},
			{key:'shortText', name:'Short Text', editable: true, cellClass:'center editable'},
			{key:'veryShortText', name:'Very short Text', editable: true, cellClass:'center editable', }
		];

		return (
			<ReactDataGrid
				enableCellSelect
				columns={columns}
				rowsCount={translations.length}
				rowGetter={this.rowGetter.bind(this, translations)}
				onRowUpdated={this.onRowUpdated}
				minHeight="400"
				minWidth={window.innerWidth - 500}
			/>
		)
	}

	rowGetter(translations, index) {
		let {locale, longText, shortText, veryShortText} = translations[index];
		return {locale, longText, shortText, veryShortText};
	}

	renderSelectionsComboBox() {
		const {selections}  = this.props;
		return (
			<ComboBox
				label="Selection: Code | Name | Group"
				placeholder="Select a selection"
				value={this.state.selectedSelectionCode}
				onChange={this.onSelectionChange}>
				{selections.map((selection, index) => {
					return (
						<option key={index} value={selection.get('code')}>
							{`${selection.get('code')} | ${selection.get('name')} | ${selection.get('selectionGroup').toLowerCase()}`}
						</option>
					)
				})}
			</ComboBox>
		)
	}

	renderTextInput(label, prop, readOnly = false) {
		return (
			<TextInput
				ref={prop}
				label={label}
				placeholder=""
				readOnly={readOnly}
				valueLink={this.bindTo(this.state.selectedSelectionVariant, prop)}
			/>
		)
	}
}

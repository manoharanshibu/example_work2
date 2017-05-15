import Component from 'common/system/react/BackboneComponent';
import TextInput from 'backoffice/components/elements/TextInput';
import ComboBox from 'backoffice/components/elements/ComboBox';
import translationsModel from 'backoffice/model/MarketsTranslationsModel';
import Tabs from 'backoffice/components/tabs/Tabs';
import Tab from 'backoffice/components/tabs/Tab';
import ReactDataGrid from 'react-data-grid';
import AddMarketVariantPopup from "./AddMarketVariantPopup";
import AddTranslationPopup from 'translate/AddTranslationPopup';

export default class MarketsTranslationsTab extends Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedMarketCode: '',
			selectedTab: 0,
			selectedMarketVariant: null
		};

		_.bindAll(this, 'onAddTranslation',
			'onMarketChange', 'onMarketVariantsChange',
			'onAddMarketVariant', 'onEditMarketVariant',
			'forceRender', 'onTabClick', 'onRowUpdated'
		);
	}

	componentDidMount() {
		translationsModel.on('change:markets', this.forceRender);
		translationsModel.on('change:marketVariants', this.onMarketVariantsChange);
	}

	componentWillUnmount() {
		translationsModel.off('change:markets', this.forceRender);
		translationsModel.off('change:marketVariants', this.onMarketVariantsChange);
	}

	forceRender() {
		this.forceUpdate()
	}

	onMarketChange(value) {
		this.setState({
			selectedMarketCode: value,
			selectedTab: 0,
			selectedMarketVariant: this.props.marketVariants.models[0]
		});
		translationsModel.getMarketVariants(value);
	}

	onMarketVariantsChange() {
		this.setState({
			selectedMarketVariant: this.props.marketVariants.models[this.state.selectedTab]
		});
	}

	onTabClick(tab) {
		this.setState({
			selectedTab: tab.props.id,
			selectedMarketVariant: this.props.marketVariants.models[tab.props.id]
		})
	}

	onAddMarketVariant() {
		App.bus.trigger('popup:view', AddMarketVariantPopup, {marketTypeCode: this.state.selectedMarketCode});
	}

	onEditMarketVariant() {
		translationsModel.editMarketVariant(this.state.selectedMarketVariant)
	}

	onAddTranslation() {
		App.bus.trigger('popup:view', AddTranslationPopup, {locales: translationsModel.locales, model: this.state.selectedMarketVariant, onSave: this.onEditMarketVariant});
	}

	onRowUpdated(cell) {
		const {cellKey, rowIdx, updated} = cell;
		const value = updated[cellKey];
		let updatedTranslations = this.state.selectedMarketVariant.get('translations')[rowIdx];
		updatedTranslations[cellKey] = value;
	}

	render() {
		return (
			<div>
				<div className="table toolbar">
					<div className="table-row">
						<div className="table-cell">
							{this.renderMarketsComboBox()}
						</div>
						{this.state.selectedMarketCode &&
						<div className="table-cell right">
							<a className="btn green filled" onClick={this.onAddMarketVariant}>Add Market Variant</a>
						</div>
						}
					</div>
				</div>

				{this.renderMarketVariants()}
			</div>
		)
	}

	renderMarketVariants() {
		if (!this.state.selectedMarketCode)
			return null;

		let {marketVariants} = this.props;
		if(marketVariants.length === 0)
			return null;

		return (
			<Tabs
				selectedTab={this.state.selectedTab}
				onTabClick={this.onTabClick}>

				{marketVariants.map((marketVariant, index) => {
					return (
						<Tab id={index} title={marketVariant.getTitle()}>
							{this.renderMarketVariant(marketVariant)}
						</Tab>
					)
				})}

			</Tabs>
		)
	}

	renderMarketVariant(marketVariant) {
		return (
			<div>
				<div className="table toolbar">

					<div className="table-row">
						<div className="table-cell"/>
						<div className="table-cell"/>
						<div className="table-cell right">
							<div className="inline-form-elements">
								<a className="btn green filled" onClick={this.onAddTranslation}>Add Translation</a>
								<a className="btn green filled" onClick={this.onEditMarketVariant}>Save Market Variant</a>
							</div>
						</div>
					</div>

					<div className="table-row">
						<div className="table-cell">
							{this.renderTextInput('Sequence Id', 'sequenceId', true)}
						</div>
						<div className="table-cell">
							{this.renderTextInput('Sub Type', 'subType', true)}
						</div>
						<div className="table-cell">
							{this.renderTextInput('Sub Type Format', 'subTypeFormat')}
						</div>
					</div>
				</div>

				{this.renderMarketVariantTranslations(marketVariant.get('translations'))
				}
			</div>
		)
	}

	renderMarketVariantTranslations(translations) {
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
				minHeight="200"
			/>
		)
	}

	rowGetter(translations, index) {
		let {locale, longText, shortText, veryShortText} = translations[index];
		return {locale, longText, shortText, veryShortText};
	}

	renderMarketsComboBox() {
		const {markets}  = this.props;
		return (
			<ComboBox
				label="Market: Name | Code"
				placeholder="Select a market"
				value={this.state.selectedMarketCode}
				onChange={this.onMarketChange}>
				{markets.map((market, index) => {
					const sport = market.get('sport') ? market.get('sport').toLowerCase() : '';
					return (
						<option key={index} value={market.get('code')}>
							{`${market.get('name')} | ${market.get('code')} | ${sport}`}
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
				valueLink={this.bindTo(this.state.selectedMarketVariant, prop)}
			/>
		)
	}

}

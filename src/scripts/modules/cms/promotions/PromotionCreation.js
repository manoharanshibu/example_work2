import {notify} from 'common/util/PopupUtil.js';
import Component from 'common/system/react/BackboneComponent';
import DatePicker from 'backoffice/components/elements/DatePicker';
import EventSearchPopup from 'backoffice/components/EventSearchPopup';
import NodePromotion from 'backoffice/model/NodePromotion';
import CheckBox from 'backoffice/components/elements/CheckBox';
import TabList from 'backoffice/components/lists/TabList';
import OneTabList from 'backoffice/components/lists/OneTabList';
import TextInput from 'backoffice/components/elements/TextInput';
import TableRowWrapper from 'backoffice/components/TableRowWrapper';
import nodePromotions from 'backoffice/collection/NodePromotions';
import Tooltip from 'backoffice/components/tooltips/Tooltip';
import service from 'backoffice/service/ApiService';
import PromotionsImageControl from 'cms/promotions/PromotionsImageControl';
import campaignModel from 'backoffice/model/bonus/CampaignModel';
import ComboBox from 'backoffice/components/elements/ComboBox';

const Market = Backbone.Model.extend({
	defaults: {
		marketId: 0,
		selectionIds: []
	}
});

const MarketList = Backbone.Collection.extend({
	model: Market
});



export default class PromotionCreation extends Component {
	constructor(props) {
		super(props);

		this.collection = nodePromotions;
		this.forceRerender = ::this.forceRerender;

		this.state = {
			event: null,
			marketList: new MarketList(),
			promotionType: 'none',
		};

		_.bindAll(this,
			'renderLegacyOptions', 'renderMarketOptions', 'renderImageOnlyCTAOptions',
			'renderTextOnlyCTAOptions', 'renderImageTextOptions', 'renderCasinoOptions',
		);

		this.onGetAllSelections = ::this.onGetAllSelections;
	}

	componentWillMount(){
		// This is needed to handle full-page reload and internal navigation
		// This could be better handled by a Promise
		if (this.collection.status === 'fetched'){
			this.initializePromotion();
		} else {
			this.collection.once('reset', ::this.initializePromotion);
		}
		App.bus.on('campaignModel:campaignChanged', this.forceRerender);
	}

	componentWillUnmount(){
		if (this.model){
			this.model.off('change:markets', ::this.resetSelections);
			this.model.off('change:isBonusTile', this.forceRerender);
		}
		App.bus.off('campaignModel:campaignChanged', this.forceRerender);
	}

	componentDidMount() {
		let promotionType = (_.isUndefined(this.model)) ? 'none' : this.model.get('type');

		const legacyTypes = [
			'pictureOnly',
			'sports',
			'sportsLive',
			'imageButton',
			'largeText',
		]

		const isLegacy = _.some(legacyTypes, type => type === promotionType);
		if(isLegacy) {
			promotionType = 'legacy';
		}

		this.setState({promotionType});
	}

	forceRerender(){
		this.forceUpdate();
	}

	initializePromotion(){
		const promotionId = this.props.routeParams.id;
		const model = promotionId && this.collection.get(promotionId);

		if (promotionId && !model){
			notify('Error', 'No promotion found with the specified id');
			this.backToList();
			return;
		}

		this.model = model || new NodePromotion();
		this.forceUpdate();

		this.model.on('change:markets', ::this.resetSelections);
		this.model.on('change:isBonusTile', this.forceRerender);

		const eventId = this.model.get('eventId');

		// If the promotion is bound to an event we need to get name, markets
		// and selections info for the event
		if (eventId){
			this.getEventDetails(eventId);
		}

		const markets = this.model.get('markets');
		this.state.marketList = new MarketList(markets);
	}

	resetSelections(){
		this.model.set('selectionIds', []);
		this.forceUpdate();
	}

	getEventDetails(eventId){
		//TODO: Get reid of this hardcoded country code
		service.getEvent(eventId, 6, 'GB')
			.then( (resp) => this.onGotEventDetails(resp) );
	}

	onGetAllSelections(index){
		const {markets} = this.state.event;
		if (!this.state.marketList || !markets || !markets.length){
			return ;
		}
		const market = this.state.marketList.at(index);

		const selectedMarket = _.findWhere(markets, {id: market? this.state.marketList.at(index).get('marketId') : 0});
		const selections = selectedMarket && selectedMarket.selection;

		if (selections){
			const selectionIds = selections.map( x => x.id );
			market.set({selectionIds});
		}

		this.forceRerender();
	}

	onGotEventDetails(resp){
		const event = resp && resp.Event;

		this.setState({
			event,
		});
	}

	onSaveAndStay() {
		const backToList = false;
		this.model.save().then( this.onSaveSuccess.bind(this, backToList), this.onSaveError );
	}

	onSaveAndGotoList() {
		const backToList = true;
		const {marketList} = this.state;
		this.model.set({markets: marketList.models});
		this.model.save().then( this.onSaveSuccess.bind(this, backToList), this.onSaveError );
	}

	onSaveSuccess(backToList, resp){
		const id = resp && resp.data && resp.data.id;
		if (id){
			this.model.set('id', id);
			this.collection.add(this.model);
			notify('Success', 'The promotion was saved successfully');
			if (backToList){
				this.backToList();
			}
		} else {
			this.onSaveError();
		}
	}

	onSaveError(){
		notify('Error', 'There has been an error saving the promotion');
	}

	onLinkToEvent(){
		App.bus.trigger('popup:view', EventSearchPopup, {onSelectEvent: this.onAddEvent.bind(this)});
	}

	onAddEvent(event){
		const hasMarkets = event && event.markets && event.markets.length;

		if (hasMarkets){
			this.model.set('eventId', event.id);
			this.setState({ event });
		} else {
			notify('Error', 'The selected event doesn\'t have any markets');
		}
	}

	onUnLinkEvent(){
		this.model.set({ eventId: 0, markets: [], selectionIds: [] });
	}

	backToList() {
		App.navigate('/cms/promotions');
	}

	removeLastMarket() {
		const {marketList} = this.state;

		if(!marketList)
			return;

		marketList.remove(marketList.at(marketList.length-1));
		this.forceRerender();
	}

	addNewMarket(index) {
		const id = index!==-1?arguments[1]:0;
		const {marketList} = this.state;

		if (index !==-1 && index < marketList.length) {
			marketList.at(index).set('marketId', id);
			marketList.at(index).set('selectionIds', []);
		}
		else {
			const market = new Market();
			market.set('marketId', id);
			marketList.add(market);
		}
		this.forceRerender();
	}

	render(){
		//TODO: Checking the permissions on every render, might not be ideal
		//but as a quick fix, it ensures they are reevaluated if the user has
		//logged out and logged in with different user
		const allowed = App.session.request('canCmsPromotions');

		if (!allowed){
			return <div><p><strong>YOU ARE NOT AUTHORIZED TO USE THIS FUNCTION.</strong></p></div>;
		}

		if (!this.model){
			return (
				<div>
					<p>Please wait while the promotion data is retrieved</p>
				</div>
			);
		}
		// Not to be removed, unless placed in the stylesheets
		const styleScrollable = {
			position: 'absolute',
			top: 0,
			bottom: 0,
			overflow: 'scroll'
		};

		return (
			<div className="box" style={styleScrollable}>
				<div style={{position: 'relative'}}>
					<div className="page-selectors">
						<h1 className="heading main">Promotion</h1>
					</div>
					{this.renderToolbar()}
					{this.renderForm()}
					{this.renderToolbar()}
				</div>
				<Tooltip place="right" type="info" effect="solid" />
			</div>
		);
	}

	renderToolbar(){
		return (
			<div className="table toolbar">
				<div className="table-row">
					<div className="table-cell right">
						<div className="inline-form-elements">
							<a className="btn green filled" onClick={this.onSaveAndGotoList.bind(this)}>Save</a>
							<a className="btn green filled" onClick={this.backToList.bind(this)}>Back to List</a>
						</div>
					</div>
				</div>
			</div>
		);
	}

	/**
	 * @returns {XML}
	 */
	renderForm() {
		const {promotionType} = this.state;
		const isNotLegacy = promotionType !== 'legacy';
		const isTypeSet = promotionType !== 'none' && promotionType !== '';

		return (
			<div className="box">
				<div style={{position: 'relative'}}>
					<div className="table">
						<div className="table-row">
							<div className="table-cell" style={{width: '50%'}}>
								<div className="table no-border-bottom">
									<TableRowWrapper label="Promotion name"
													 data-tip="Name for internal reference">
										<TextInput inputStyle={{width: '100%'}}
												   focus
												   placeholder="Promotion's internal name"
												   valueLink={this.bindTo(this.model, 'name')} />
									</TableRowWrapper>
								</div>
							</div>
							<div className="table-cell">
								<div className="table no-border-bottom">
									<TableRowWrapper label="Promotion id">
										<TextInput inputStyle={{width: '100%'}}
												   placeholder="(not yet assigned)"
												   readOnly
												   value={this.model.get('id')} />
									</TableRowWrapper>
								</div>
							</div>
						</div>
						<div className="table-row">
							<div className="table-cell" style={{width: '50%'}}>
								<div className="table no-border-bottom">
									{this.renderPromotionTypeSelector()}
								</div>
							</div>
						</div>
						{isTypeSet &&
							<div className="table-row">
								<div className="table-cell">
									<div className="table no-border-bottom">
										{this.renderStartDate()}
									</div>
								</div>
								<div className="table-cell">
									<div className="table no-border-bottom">
										{this.renderEndDate()}
									</div>
								</div>
							</div>
						}
					</div>
					{this.renderFromOptions()}
				</div>
			</div>
		);
	}

	renderFromOptions() {
		const {promotionType} = this.state;
		const options = {
			legacy: this.renderLegacyOptions,
			markets: this.renderMarketOptions,
			imageOnlyCTA: this.renderImageOnlyCTAOptions,
			textOnlyCTA: this.renderTextOnlyCTAOptions,
			imageTextCTA: this.renderImageTextOptions,
			casino: this.renderCasinoOptions,
		};
		const fn = options[promotionType] || _.constant(null)
		return fn();
	}

	renderLegacyOptions() {
		return (
			<div>
				<div className="table">
					<div className="table-row">
						<div className="table-cell" style={{width: '50%'}}>
							<div className="table no-border-bottom">
								<TableRowWrapper label="Is Bonus Tile">
									<CheckBox classes="" label=""
												valueLink={this.bindTo(this.model, 'isBonusTile')}/>
								</TableRowWrapper>
							</div>
						</div>
						<div className="table-cell">
							<div className="table no-border-bottom">
								{this.renderTypeCombo()}
							</div>
						</div>
					</div>
				</div>
				{this.renderTitle(true)}

				<div className="table">
					<div className="table-row">
						{this.renderNonBonusTile()}
						{this.renderBonusTileSpecific()}
					</div>
				</div>
				{this.renderColorSelect()}
				{this.renderColorSelect(true)}
				{this.renderPromotionsImageControl()}
				{this.renderCTA()}
				{this.renderEventDetails()}
				{this.renderMarketRows()}
				{this.state && this.state.event &&
				<TableRowWrapper>
					<a className="btn blue filled" onClick={this.addNewMarket.bind(this, -1)}>Add New Market</a>
					<a className="btn blue filled" onClick={this.removeLastMarket.bind(this)}>Remove Last Market</a>
				</TableRowWrapper>}
			</div>
		);
	}

	renderCasinoOptions() {
		return (
			<div>
				{this.renderTitle()}
				{this.renderCasinoId()}
			</div>
		)
	}

	renderMarketOptions() {
		return (
			<div>
				{this.renderTitle(false)}
				{this.renderPromotionsImageControl()}
				{this.renderEventDetails()}
				{this.renderMarketRows()}
				{this.state && this.state.event &&
					<TableRowWrapper>
						<a className="btn blue filled" onClick={this.addNewMarket.bind(this, -1)}>Add New Market</a>
						<a className="btn blue filled" onClick={this.removeLastMarket.bind(this)}>Remove Last Market</a>
					</TableRowWrapper>
				}
			</div>
		);
	}

	renderImageOnlyCTAOptions() {
		return (
			<div>
				{this.renderTitle(false)}
				{this.renderCTA()}
				{this.renderColorSelect(true)}
				{this.renderPromotionsImageControl()}
			</div>
		);
	}

	renderTextOnlyCTAOptions() {
		return (
			<div>
				{this.renderTitle(true)}
				{this.renderCTA()}
				{this.renderColorSelect()}
				{this.renderColorSelect(true)}
			</div>
		);
	}

	renderImageTextOptions() {
		return (
			<div>
				{this.renderTitle(true)}
				{this.renderCTA()}
				{this.renderColorSelect()}
				{this.renderColorSelect(true)}
				{this.renderPromotionsImageControl()}
			</div>
		);
	}

	updatePromotionType = (value) => {
		this.setState({promotionType: value})
	}

	renderPromotionTypeSelector() {
		const promotionTypes = {
			imageOnlyCTA: 'Image Only CTA',
			textOnlyCTA: 'Text Only CTA',
			imageTextCTA: 'Image and Text CTA',
			markets: 'Markets',
			casino: 'Casino',
			legacy: 'Legacy',
		};

		let options = [];

		for (let key of Object.keys(promotionTypes)) {
			options.push( <option value={ key } key={ key } >{ promotionTypes[key] }</option> );
		};

		return (
			<TableRowWrapper label="Promotion type" data-tip="Name for internal reference">
				<ComboBox
					value={ this.state.promotionType }
					valueLink={ this.bindTo(this.model, 'type') }
					onChange={ this.updatePromotionType }
					style={{width:'150px'}}
					labelStyle={{verticalAlign:'middle'}}
					placeholder='Please select a type'
				>
					{options}
				</ComboBox>
			</TableRowWrapper>
		)
	}

	renderMarketRows(){
		const {marketList} = this.state;

		if(!marketList || !marketList.length)
			return this.renderMarketRow(0);

		const markets = marketList.models;

		return _.map(markets, (market, index) => {
			return this.renderMarketRow(index);
		});
	}

	renderTitle(subTitle) {
		return (
			<div className="table">
				<div className="table-row">
					<div className="table-cell">
						<div className="table no-border-bottom">
							<TableRowWrapper label="Title">
								<TextInput inputStyle={{width: '100%'}}
											 placeholder="Promotion's title"
											 valueLink={this.bindTo(this.model, 'title')} />
							</TableRowWrapper>

							{subTitle &&
								<TableRowWrapper label="Subtitle">
									<TextInput inputStyle={{width: '100%'}}
											   placeholder="Promotion's subtitle"
											   valueLink={this.bindTo(this.model, 'subtitle')} />
								</TableRowWrapper>
							}
						</div>
					</div>
				</div>
			</div>
		)
	}

	renderCasinoId() {
		return (
			<div className="table">
				<div className="table-row">
					<div className="table-cell">
						<div className="table no-border-bottom">
							<TableRowWrapper label="Casino game ID">
								<TextInput inputStyle={{width: '100%'}}
											 placeholder="ID..."
											 valueLink={this.bindTo(this.model, 'casinoID')} />
							</TableRowWrapper>
						</div>
					</div>
				</div>
			</div>
		)
	}

	renderPromotionsImageControl(){
		const isBonusTile = this.model.get('isBonusTile');

		if (isBonusTile){
			return null;
		}

		return (
			<div className="table">
				<div className="table-row">
					<div className="table-cell">
						<PromotionsImageControl
						onSave={this.onSaveAndStay.bind(this)}
						model={this.model} />
					</div>
				</div>
			</div>
		);
	}

	renderBonusTileSpecific(){
		// this.getCampaignList();
		const isBonusTile = this.model.get('isBonusTile');
		// const campaigns = this.getCampaignList();

		if (!isBonusTile){
			return null;
		}

		return (
			<div className="table-cell">
				<div className="table no-border-bottom">
					{/* <TableRowWrapper label="Campaign" */}
					{/* 	data-tip="The promotion the will be bound to"> */}
					{/* 	<OneTabList list={campaigns} style={{width: '100%'}} */}
					{/* 		valueLink={this.bindTo(this.model, 'campaignId')} /> */}
					{/* </TableRowWrapper> */}
					<TableRowWrapper label="Is Casino Tile">
						<CheckBox classes="" label=""
								  valueLink={this.bindTo(this.model, 'isCasinoTile')}/>
					</TableRowWrapper>
					<TableRowWrapper label="Show in MyBonuses">
						<CheckBox classes="" label=""
								  valueLink={this.bindTo(this.model, 'showInMyBonuses')}/>
					</TableRowWrapper>
				</div>
			</div>
		);
	}

	renderNonBonusTile(){
		const isBonusTile = this.model.get('isBonusTile');

		if (isBonusTile){
			return null;
		}

		return (
			<div className="table-cell">
				<div className="table no-border-bottom">
					<TableRowWrapper label="Background link"
									 data-tip="If provided, will enable the background image to become a link">
						<TextInput inputStyle={{width: '100%'}}
								   placeholder="(click-through link) "
								   maxLength={255}
								   valueLink={this.bindTo(this.model, 'linkUrl')} />
					</TableRowWrapper>
				</div>
			</div>
		);
	}

	renderTypeCombo(){
		const isBonusTile = this.model.get('isBonusTile');

		if (isBonusTile){
			return null;
		}

		const promotionTypes = {
			pictureOnly: 'Picture only',
			sports: 'Sports',
			sportsLive: 'Sports Live',
			imageButton: 'Image Button',
			largeText: 'Large Text',
		};

		let options = [];

		for (let key of Object.keys(promotionTypes)) {
			options.push( {
				id: key,
				name: promotionTypes[key],
				selected: false
			});
		};

		return (
			<TableRowWrapper label="Promotion style"
							 data-tip="Different styles cause the promotion to be displayed differently">
				<OneTabList list={options} style={{width: '100%'}}
							valueLink={this.bindTo(this.model, 'type')} />
			</TableRowWrapper>
		);
	}

	renderColorSelect(button) {
		const colorOf = (button) ? 'buttonColor' : 'backgroundColor';
		const labelText = (button) ? 'Button Color' : 'Background Color';

		const colors = {
			primary: 'Primary',
			secondary: 'Secondary',
			dark: 'Dark',
		};

		let options = [];

		for (let key of Object.keys(colors)) {
			options.push( <option value={ key } key={ key } >{ colors[key] }</option> );
		};

		return (
			<div className="table">
				<div className="table-row">
					<div className="table-cell">
						<div className="table no-border-bottom">
							<TableRowWrapper label={labelText}>
								<ComboBox
									valueLink={ this.bindTo(this.model, colorOf) }
									style={{width:'150px'}}
									labelStyle={{verticalAlign:'middle'}}
								>
									{options}
								</ComboBox>
							</TableRowWrapper>
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderStartDate(){
		const isBonusTile = this.model.get('isBonusTile');

		if (isBonusTile){
			return null;
		}

		return (
			<TableRowWrapper label="Start date"
							 data-place="left"
							 data-tip="Date the promotion can start being displayed">
				<DatePicker classes="right full-width"
							format='DD-MM-YY HH:mm'
							time
							valueLink={this.bindTo(this.model, 'activeStart')} />
			</TableRowWrapper>
		);
	}

	renderEndDate(){
		const isBonusTile = this.model.get('isBonusTile');

		if (isBonusTile){
			return null;
		}

		return (
			<TableRowWrapper label="End date"
							 data-place="left"
							 data-tip="Date the promotion will automatically stop being displayed">
				<DatePicker classes="right full-width"
							format='DD-MM-YY HH:mm'
							time
							valueLink={this.bindTo(this.model, 'activeEnd')} />
			</TableRowWrapper>
		);
	}

	// call-to-action configuration
	renderCTA(){
		const isBonusTile = this.model.get('isBonusTile');

		if (isBonusTile){
			return null;
		}

		const eventId = this.model.get('eventId');
		const event = this.state && this.state.event;

		// If an event is configured the call-to-action will not be rendered
		// and, therefore, there is no point in show the associated controls
		if (event && eventId){
			return null;
		}

		return (
			<div className="table">
				<div className="table-row">
					<div className="table-cell">
						<div className="table no-border-bottom">
							<TableRowWrapper label="CTA text"
											 data-tip="Text for button to be added to promotion if background image has not CTA
								<br>Requires that a link is also provided"
											 data-multiline>
								<TextInput inputStyle={{width: '100%'}}
										   placeholder="(enter the text for the button. e.g. TERMS AND CONDITIONS)"
										   valueLink={this.bindTo(this.model, 'buttonText')} />
							</TableRowWrapper>
							<TableRowWrapper label="CTA Link"
											 data-tip="Link for the button to be added to the promotion.<br>
									It can be used to provide a Ts and Cs link.<br>
										In bonus tiles it'll be used for the Call-to-action</br>
										The button won't be displayed unless a Button label<br>
										is also provided."
											 data-multiline >
								<TextInput inputStyle={{width: '100%'}}
										   maxLength={255}
										   placeholder="(enter the target url button's action, e.g. /deposit"
										   valueLink={this.bindTo(this.model, 'buttonLink')} />
							</TableRowWrapper>
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderEventDetails(){
		const isBonusTile = this.model.get('isBonusTile');
		const eventId = this.model.get('eventId');
		const event = this.state && this.state.event;

		if (isBonusTile){
			return null;
		}


		if (!eventId){
			return (
				<div className="table">
					<div className="table-row">
						<div className="table-cell">
							<div className="inline-form-elementns">
								<a className="btn blue filled" onClick={this.onLinkToEvent.bind(this)}>Link Promotion to Event</a>
							</div>
						</div>
					</div>
				</div>
			);
		}

		if (!event){
			return (
				<div className="table">
					<div className="table-row">
						<div className="table-cell">
							<div className="inline-form-elements">
								<p>Updating event details, please wait.</p>
							</div>
						</div>
					</div>
				</div>
			);
		}

		return (
			<div className="table">
				<div className="table-row">
					<div className="table-cell" style={{width: '50%', borderBottom: 'none'}}>
						<div className="table no-border-bottom">
							<TableRowWrapper label="Event name">
								<TextInput inputStyle={{width: '100%'}}
										   placeholder=""
										   readOnly
										   value={event.name} />
							</TableRowWrapper>
						</div>
					</div>
					<div className="table-cell" style={{borderBottom: 'none'}}>
						<TableRowWrapper>
							<div className="inline-form-elements">
								<a className="btn blue filled"
								   onClick={this.onLinkToEvent.bind(this)}>Change event</a>
								<a className="btn blue filled"
								   onClick={this.onUnLinkEvent.bind(this)}>Unlink event</a>
							</div>
						</TableRowWrapper>
					</div>
				</div>
			</div>
		);
	}

	renderMarketRow(index){
		const eventId = this.model.get('eventId');
		const event = this.state && this.state.event;
		const isBonusTile = this.model.get('isBonusTile');

		if (isBonusTile){
			return null;
		}

		// If there is no event linked to the promotion or the event data
		// is still missing, show nothing
		if (!eventId || !event){
			return null;
		}

		return (
			<div className="table">
				<div className="table-row" >

					<div className="table-cell" style={{width: '50%'}}>
						{ this.renderMarketSelector(index) }
					</div>
					<div className="table-cell" style={{height: '200px'}}>
						{ this.renderAllSelections(index) }
					</div>
				</div>
			</div>
		);
	}

	// Render a dropdown for selecting a market only if the promotion is
	// bound to a specific sports event
	renderMarketSelector(index){
		const markets = this.state.event.markets;
		const {marketList} = this.state;

		const sortedMarkets = _.sortBy(markets, m => m.name);
		const market = marketList.at(index);

		if (this.state.event.state === 'COMPLETED'){
			return null;
		}

		return (
			<TableRowWrapper label="Select a Market">
				<OneTabList list={sortedMarkets} style={{width: '300px'}} value={market ? market.get('marketId') : 0 }
							onChange={this.addNewMarket.bind(this,index)} />
				{this.renderNoSelectionsError()}
			</TableRowWrapper>
		);
	}

	renderAllSelections(index){
		const {marketList} = this.state;
		const market = marketList.at(index);

		if(!market)
			return null;

		let selectedMarket = _.findWhere(this.state.event.markets, {id: market ? market.get('marketId') : 0});
		let selections = selectedMarket && selectedMarket.selection;

		if (!selections){
			return null;
		}

		return (
			<TableRowWrapper label="Selections">
				{selections && selections.length && <div
					className="btn small filled blue"
					onClick={this.onGetAllSelections.bind(this,index)} >
					{'Add all selections in default order'}</div>}
				<TabList list={selections} style={{width: '300px'}}
						 valueLink={this.bindTo(market, 'selectionIds')} />
				{this.renderNoSelectionsError()}
			</TableRowWrapper>
		);
	}

	renderNoSelectionsError(index) {
		const {marketList} = this.state;
		const market = marketList.at(index);

		if(!market)
			return null;

		const markets = this.model.get('markets');
		const selectionIds = market.get('selectionIds');

		if (!markets){
			return (
				<div style={{color: 'red'}}> Please pick a market </div>
			);
		}

		// If some selections have already been picked, we don't need the error message
		if (selectionIds && selectionIds.length) {
			return null;
		}

		return (
			<div style={{color: 'red'}}>
				Please remember to pick at least one selection
			</div>

		);
	}
	getCampaignList(){
		const allCampaigns = campaignModel.campaigns;

		const campaignsList = allCampaigns.map( camp => {
			const type = !!camp.depositBonus ? 'DEPOSIT' : 'FREEBET';
			const obj = {
				id: camp.id,
				name: `${camp.name} (${type})`,
				selected: false
			};

			return obj;
		});

		return campaignsList;
	}
};

PromotionCreation.displayName = 'PromotionCreation';

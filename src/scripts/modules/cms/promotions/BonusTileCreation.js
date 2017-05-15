import {notify, errorPopup} from 'common/util/PopupUtil.js';
import Component from 'common/system/react/BackboneComponent';
import EventSearchPopup from 'backoffice/components/EventSearchPopup';
import NodePromotion from 'backoffice/model/NodePromotion';
import TextInput from 'backoffice/components/elements/TextInput';
import TableRowWrapper from 'backoffice/components/TableRowWrapper';
import LanguageSelector from 'backoffice/components/LanguageSelector';
import nodePromotions from 'backoffice/collection/NodePromotions';
import Tooltip from 'backoffice/components/tooltips/Tooltip';
import service from 'backoffice/service/ApiService';
import service2 from 'backoffice/service/BackofficeRestfulService';
import campaignModel from 'backoffice/model/bonus/CampaignModel';
import Loader from 'app/view/Loader';
import OneTabList from 'backoffice/components/lists/OneTabList';
import UnauthorizedMessage from 'app/view/UnauthorizedMessage'

export default class BonusTileCreation extends Component {
	constructor(props) {
		super(props);

		this.collection = nodePromotions;

		this.state = {
			language: 'defaults',
			loading: false,
			event: null,
			nyxBonuses: []
		};
		this.resetSelections = ::this.resetSelections;
		this.onGetAllSelections = ::this.onGetAllSelections;
		this.onGotEventError = ::this.onGotEventError;
		this.forceRerender = ::this.forceRerender;
		this.setTitle = ::this.setTitle;
		this.setBulletpoints = ::this.setBulletpoints;
		this.onSelectNyxBonus = ::this.onSelectNyxBonus;
		this.onNavigateToCampaignList = ::this.onNavigateToCampaignList;
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

	componentDidMount(){
		this.getNyxBonuses();
	}

	componentWillUnmount(){
		if (this.model){
			this.model.off('change:marketId', this.resetSelections);
			this.model.off('change:selectionIds change:btTitles change:btBulletPoints change:casinoNyxId', this.forceRerender);
		}
		App.bus.off('campaignModel:campaignChanged', this.forceRerender);
	}

	forceRerender(){
		this.forceUpdate();
	}

	onNavigateToCampaign(campaignId){
		const nextPath = `/bonus/manage/${campaignId}`;
		App.navigate(nextPath);
	}

	onNavigateToCampaignList(){
		const nextPath = '/bonus/manage';
		App.navigate(nextPath);
	}

	getNyxBonuses(){
		service2.getCasinoBonuses()
			.then( resp => {
				if (resp && resp.accountCasinoBonuses){
					const nyxBonuses = resp.accountCasinoBonuses.map(
						bonus => ({
							id: bonus.id && parseInt(bonus.id, 10),
							name: bonus.name,
							selected: false
						})
					).sort( (a,b) => {
						const nameA = a.name.toUpperCase(); // ignore upper and lowercase
						const nameB = b.name.toUpperCase(); // ignore upper and lowercase
						if (nameA < nameB) { return -1; }
						if (nameA > nameB) { return 1; }

						// names must be equal
						return 0;
					});

					this.setState({nyxBonuses});
				}
			});
	}

	initializePromotion(){
		const promotionId = this.props.routeParams.id;
		const model = promotionId && this.collection.get(promotionId);

		if (promotionId && !model){
			notify('Error', 'No bonus tile found with the specified id');
			this.backToList();
			return;
		}

		this.model = model || this.createNewPromo();
		this.forceUpdate();

		this.model.on('change:marketId', this.resetSelections);
		this.model.on('change:selectionIds change:btTitles change:btBulletPoints change:casinoNyxId', this.forceRerender);

	}

	createNewPromo(){
		const model = new NodePromotion();
		const {location} = this.props;
		const applicationType = (location.state && location.state.applicationType);
		const isCasinoTile = (applicationType === 'casino');

		model.set({ isBonusTile: true, isCasinoTile });

		return model;
	}

	isCasinoTile(){
		const {location} = this.props;
		const applicationType = (location.state && location.state.applicationType);
		const isCasinoTile = (applicationType === 'casino');

		return isCasinoTile;
	}


	onSelectNyxBonus(casinoNyxId){
		this.model.set({casinoNyxId});
	}

	onChangeLanguage(language){
		this.setState({language});
	}

	setTitle(title){
		const {language} = this.state;

		this.model.setTranslation(title, 'btTitles', language);
	}

	setBulletpoints(bulletpoints){
		const {language} = this.state;

		this.model.setTranslation(bulletpoints, 'btBulletPoints', language);
	}

	resetSelections(){
		this.model.set('selectionIds', []);
		this.forceUpdate();
	}

	getEventDetails(eventId){
		//TODO: Get reid of this hardcoded country code
		service.getEvent(eventId, 6, 'GB')
			.then( (resp) => this.onGotEventDetails(resp) );

		this.setState({loading: true});
	}

	onGetAllSelections(){
		const marketId = this.model.get('marketId');
		const {markets} = this.state.event;

		if (!marketId || !markets || !markets.length){
			return ;
		}

		const selectedMarket = _.findWhere(markets, {id: parseInt(marketId,10)});
		const selections = selectedMarket && selectedMarket.selection;

		if (selections){
			const selectionIds = selections.map( x => x.id );
			this.model.set({selectionIds});
		}

	}

	onGotEventDetails(resp){
		const event = resp && resp.Event;

		this.setState({
			event,
			loading: false
		});
	}

	onGotEventError(){
		errorPopup('Error', 'There has been an error retrieving the bonus tile data');
		this.setState({loading: false});
	}

	onSaveAndStay() {
		const backToList = false;
		this.model.save().then( this.onSaveSuccess.bind(this, backToList), this.onSaveError );
	}

	onSaveAndGotoList() {
		const backToList = true;

		const eventId = this.model.get('eventId');
		const marketId = this.model.get('marketId');

		const event = this.state && this.state.event;
		if (event && marketId) {
			const market = _.findWhere(event.markets, {id: marketId});
			if (market) {
				this.model.set({marketType: market.type});
			}
		}

		this.model.save().then( this.onSaveSuccess.bind(this, backToList), this.onSaveError );
	}

	onSaveSuccess(backToList, resp){
		const id = resp && resp.data && resp.data.id;
		if (id){
			this.model.set('id', id);
			this.collection.add(this.model);
			notify('Success', 'The bonus tile was saved successfully');
			if (backToList){
				this.backToList();
			}
		} else {
			this.onSaveError();
		}
	}

	onSaveError(){
		errorPopup('There has been an error saving the bonus tile');
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
		this.model.set({ eventId: 0, marketId: 0, selectionIds: [] });
	}

	backToList() {
		App.navigate('/cms/bonustiles');
	}

	render(){
		//TODO: Checking the permissions on every render, might not be ideal
		//but as a quick fix, it ensures they are reevaluated if the user has
		//logged out and logged in with different user
		const allowed = App.session.request('canCmsPromotions');

		if (!allowed){
			return <UnauthorizedMessage />;
		}

		if (this.state.loading){
			return <Loader />;
		}

		if (!this.model){
			return (
				<div>
					<p>Please wait while the bonus tile data is retrieved</p>
				</div>
			);
		}

		return (
			<div className="box">
				<div style={{position: 'relative'}}>
					<div className="page-selectors">
						<h1 className="heading main">Bonus Tile</h1>
					</div>
					{this.renderToolbar(true)}
					{this.renderForm()}
					{this.renderToolbar()}
				</div>
				<Tooltip place="right" type="info" effect="solid" />
			</div>
		);
	}

	renderToolbar(showLanguageSelector=false){
		const langSelector = showLanguageSelector ? this.renderLanguageSelector() : null;
		return (
			<div className="table toolbar">
				<div className="table-row">
					{langSelector}
					<div className="table-cell right">
						<div className="inline-form-elements">
							<a className="btn green filled" onClick={this.onSaveAndGotoList.bind(this)}>Save</a>
							<a className="btn blue filled" onClick={this.backToList.bind(this)}>Back to List</a>
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderLanguageSelector () {
		return (
			<LanguageSelector
				value={this.state.language}
				onChange={::this.onChangeLanguage} />
		);
	}

	/**
	 * @returns {XML}
	 */
	renderForm() {
		const {language} = this.state;

		return (
			<div className="box">
				<div style={{position: 'relative'}}>
					<div className="table">
						<div className="table-row">
							<div className="table-cell" style={{width: '50%'}}>
								<div className="table no-border-bottom">
									<TableRowWrapper label="Bonus tile name"
													 data-tip="Name for internal reference">
										<TextInput inputStyle={{width: '100%'}}
												   focus
												   placeholder="Bonus tile internal name"
												   valueLink={this.bindTo(this.model, 'name')} />
									</TableRowWrapper>
								</div>
							</div>
						</div>

						<div className="table-row">
							<div className="table-cell" style={{width: '50%'}}>
								<div className="table no-border-bottom">
									<TableRowWrapper label={`Title (${language})`}
													 data-tip="The main text to display on the tile">
										<TextInput inputStyle={{width: '100%'}}
												   onChange={this.setTitle}
												   placeholder="(the big text on the tile)"
												   value={this.model.getBtTitle(language)}/>
									</TableRowWrapper>
									{this.renderDetails()}
								</div>
							</div>

							{this.renderTypeSpecificContent()}
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderDetails(){
		const {language} = this.state;

		return (
			<TableRowWrapper label={`Bulletpoints (${language})`}>
				<TextInput inputStyle={{width: '100%'}}
						   rows={5}
						   placeholder="(write one line per bulletpoint)"
						   maxLength={255}
						   data-multiline
						   data-tip="List to be displayed on the tile<br>when the bonus is AVAILABLE.<br><br>Every new line will be converted into one bulletpoint."
						   onChange={this.setBulletpoints}
						   value={this.model.getTranslation('btBulletPoints', language)} />
			</TableRowWrapper>
		);
	}

	renderTypeSpecificContent(){
		return (
			<div className="table-cell" style={{height: 300}}>
				<div className="table no-border-bottom">
					{this.renderNyxList()}
					{this.renderSportsbookTileSpecific()}
				</div>
			</div>
		);
	}

	renderNyxList(){
		const {nyxBonuses} = this.state;

		if (!this.model || !this.model.get('isCasinoTile')){
			return null;
		}

		return (
			<TableRowWrapper
				cellClass="nyxbonuses"
				label="Link to NYX Bonus">
				<OneTabList list={nyxBonuses}
							value={this.model.get('casinoNyxId')}
							onChange={this.onSelectNyxBonus}
							style={{width: '100%'}} />
			</TableRowWrapper>
		);
	}

	renderSportsbookTileSpecific(){
		if (!this.model || this.model.get('isCasinoTile')){
			return null;
		}

		const allCampaigns = campaignModel.campaigns;
		const id = this.model && this.model.id;

		if (!id){
			return null;
		}

		const matchingCampaign = allCampaigns.find( camp => {
			return camp.promotionId === id;
		});

		if (matchingCampaign){
			const campaignId = matchingCampaign.id;
			return (
				<div
					className="btn green filled"
					onClick={this.onNavigateToCampaign.bind(this, campaignId)}>Go to Paired Campaign</div>
			);
		}

		return (
			<div>
				<div className="highlightRed">
					There is no campaign associated with this tile
				</div>
				<div
					className="btn blue filled"
					onClick={this.onNavigateToCampaignList}>Go to Campaign List</div>
			</div>
		);
	}
};

BonusTileCreation.displayName = 'BonusTileCreation';


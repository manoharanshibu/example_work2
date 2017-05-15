import campaignModel from 'backoffice/model/bonus/CampaignModel';
import Component from 'common/system/react/BackboneComponent';
import CampaignSelection from 'bonus/CampaignSelection';
import CampaignForm from 'bonus/CampaignForm';
import Tooltip from 'backoffice/components/tooltips/Tooltip';
import ComboBox from 'backoffice/components/elements/ComboBox';

export default class BonusManage extends Component {
	constructor() {
		super();
		_.bindAll(this, 'onSelect', 'onCampaignChange', 'onTabChange',
				  'onSaveSuccess', 'onSaveError', 'onRemoveSuccess',
				  'onRemoveSuccess', 'onCampaignAlreadyExists');

		this.state = {
			campaignSelected: 0,
			selectedIndex: -1,
			currentPage: '',
			searchTerm: '',
			status: 'ALL'
		};
	}

	componentDidMount(){
		App.bus.on('campaignModel:campaignChanged', this.onCampaignChange, this);
		App.bus.on('campaignModel:saveBonusSuccess', this.onSaveSuccess);
		App.bus.on('campaignModel:saveBonusFailure', this.onSaveError);
		App.bus.on('campaignModel:onCampaignAlreadyExists', this.onCampaignAlreadyExists);
		App.bus.on('campaignModel:removeSuccess', this.onRemoveSuccess);
		App.bus.on('campaignModel:removeFailure', this.onRemoveFailure);

	   this.onCampaignChange();
	}

	componentWillUnmount(){
		App.bus.off('campaignModel:campaignChanged', this.onCampaignChange, this);
		App.bus.off('campaignModel:saveBonusSuccess', this.onSaveSuccess);
		App.bus.off('campaignModel:saveBonusFailure', this.onSaveError);
		//App.bus.off('campaignModel:onCampaignAlreadyExists', this.onCampaignAlreadyExists);
		App.bus.off('campaignModel:removeSuccess', this.onRemoveSuccess);
		App.bus.off('campaignModel:removeFailure', this.onRemoveFailure);
	}

	onCampaignAlreadyExists(){
		this.notify('Error', 'The bonus code already exists');
	}

	onRemoveFailure(){
		this.notify('Error', 'There has been an error removing the campaign');
	}

	onCampaignRemove(row, index){
		var message = `Are you sure you want to delete the campaign named '${row.name}'?`;

		App.bus.trigger('popup:confirm', {content: message, onConfirm: () => {
			campaignModel.removeCampaign(row.id);
		}});
	}

	onCampaignCopy(row, index){
		var message = `Are you sure you want to copy the campaign named '${row.name}'?`;

		App.bus.trigger('popup:confirm', {content: message, onConfirm: () => {
			campaignModel.copyCampaign(row.id);
		}});
	}

	onSaveSuccess(campaign){
		this.notify('Campaign Saved', 'The campaign has been successfully saved');

		//TODO: This wouldn't be necessary if rows where selected by campaignId
		//and not by rowIndex. May be worth giving it some thought.
		if (campaign && campaign.id && this.refs.campaignSelection){
			window.setTimeout( () => {
				var rowIndex = this.refs.campaignSelection.findRowByCampaignId(campaign.id);
				rowIndex = rowIndex || 0;
				this.setState({selectedIndex: rowIndex});
			}, 0);
		}
	}

	onSaveError(){
		this.notify('Error', 'The campaign name already exists');
	}

	onRemoveSuccess(){
		this.setState({
			selectedIndex: -1,
			campaignSelected: 0
		});

	   this.notify('Campaign Removed', 'The campaign has been successfully removed.');
	}

	/**
	 *
	 */
	onCampaignChange(){
		var selectedCampaignId;

		selectedCampaignId = campaignModel.selectedCampaign.id;
		this.setState({campaignSelected: selectedCampaignId});
	}

	/**
	 * @param row
	 * @param index
	 */
	onSelect(row, index) {
		// This shouldn't be necessary if the views weren't created multiple times
		if (this.isMounted()){
			campaignModel.selectCampaign(row.id);
			this.setState({selectedIndex: index});
		}
	}

	onTabChange(tab, index){
		this.setState({
			selectedIndex: -1,
			campaignSelected: 0
		});
	}

	onStatusSelected(statusCampaign){
		this.setState({
			status: statusCampaign
		});
	}

	onSearch(e){
		const searchTerm = e.currentTarget.value;
		this.setState({searchTerm});
	}

	notify(title='', content='', autoDestruct=2000){
		App.bus.trigger('popup:notification', {title, content, autoDestruct});
	}


	/**
	 * @returns {XML}
	 */
	render() {
		if (!App.session.request('loggedIn')){
			return <div className="panel padding white">Please log in to have access to the campaigns</div>;
		}

		const allowed = App.session.request('canBonusEngineCampaignManager');

		if (!allowed){
			return <div><p><strong>YOU ARE NOT AUTHORIZED TO USE THIS FUNCTION.</strong></p></div>;
		}

		return (
			<div className="box">
				<div  style={{minHeight: window.innerHeight - 50}}>
					<div className="table toolbar">
						<div className="table-row">
							{this.renderDropdown()}
							<div style={{float: 'right', margin: '7px 10px', padding: '5px', display: 'inline-flex'}}>
								<input autoFocus ref="search" type="text" placeholder="Search name, code or ID"
									   name="text" onChange={this.onSearch.bind(this)}/>
							</div>
						</div>
					</div>
					<div className="table no-padding no-border-bottom">
						<div className="table-row split-2">
							<CampaignSelection
								ref="campaignSelection"
								key="campaign-selection"
								selectedIndex={this.state.selectedIndex}
								campaignStatus={this.state.status}
								campaignFilter={this.state.searchTerm}
								onCampaignCopy={this.onCampaignCopy.bind(this)}
								onCampaignRemove={this.onCampaignRemove.bind(this)}
								onTabChange={this.onTabChange}
								onSelect={this.onSelect}
							/>
							{this.renderView()}
						</div>
					</div>
				</div>
				<Tooltip place="right" type="info" effect="solid" />
			</div>
		);
	}

	/**
	 * @returns {*}
	 */
	renderView() {
		if (this.state.campaignSelected) {
			return this.renderCampaign();
		}
		return this.renderEmptyView();
	}

	/**
	 * @returns {XML}
	 */
	renderEmptyView() {
		return (
			<div className="table-cell">
				<div className="tabs-gap">&#160;</div>
				<br/>
				<div className="empty-notice padding">
					<h5>Please select a campaign</h5>
				</div>
			</div>
		);
	}

	/**
	 * @returns {XML}
	 */
	renderCampaign(){
		var campaign = campaignModel.selectedCampaign;
		return (
			<div className="table-cell">
				<div className="tabs-gap">&nbsp;</div>
				<CampaignForm key={campaign.id} campaign={campaign} isManaged={true}/>
			</div>
		);
	}

	/**
	 * @returns {number}
	 */
	getWinHeight() {
		return window.innerHeight - 50;
	}

	renderDropdown() {
		return (
			<div className="table-cell">
				<div className="inline-form-elements">
					<ComboBox label="Status"
							  outerClassName=""
							  value={this.state.status}
							  onChange={this.onStatusSelected.bind(this)}
							  labelStyle={{verticalAlign:'middle'}}>
						<option value="ALL">ALL</option>
						<option value="ACTIVE">ACTIVE</option>
						<option value="IN_ACTIVE">INACTIVE</option>
						<option value="ENDED">EXPIRED</option>
					</ComboBox>
				</div>
			</div>
		);
	}

};

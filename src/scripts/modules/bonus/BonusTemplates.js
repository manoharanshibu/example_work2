import model from 'backoffice/model/bonus/BonusTemplatesModel';
import campaignTemplateModel from 'backoffice/model/bonus/CampaignTemplateModel';
import CampaignForm from 'bonus/CampaignForm';
import TemplateList from 'bonus/TemplateList';
import Component from 'common/system/react/BackboneComponent';
import Tooltip from 'backoffice/components/tooltips/Tooltip';

export default class BonusTemplates extends Component {
	constructor(props) {

		super(props);

		this.state = {
			mainActiveTab: 'entitlement-panel',
			subActiveTab: 'deposit-panel',
			templateSelected: 0,
			activeItemId: 0
		};

		this.maintabs = [{
			name: 'Entitlement',
			id:'entitlement-panel',
			group:'main'
		}, {
			name: 'Settlement',
			id:'settlement-panel',
			group:'main'
		}];

		this.subTabs = [{
			name: 'Deposit',
			id:'deposit-panel',
			group:'sub'
		}, {
			name: 'Freebet',
			id:'freebet-panel',
			group:'sub'
		}];

		_.bindAll(this, 'onSaveSuccess', 'onRemoveSuccess',
				  'unSelectTemplate', 'onModelUpdate');

		this.listenTo(campaignTemplateModel, 'campaignTemplateModel:templateChanged', this.onModelUpdate);
		App.bus.on('campaignTemplateModel:templateChanged', this.onModelUpdate);
		App.bus.on('campaignTemplateModel:saveSuccess', this.onSaveSuccess);
		App.bus.on('campaignTemplateModel:saveError',
				   () => this.notify('Error', 'There has been an error saving the template') );
		App.bus.on('campaignTemplateModel:removeSuccess', this.onRemoveSuccess);
		App.bus.on('campaignTemplateModel:removeError',
				   () => this.notify('Error', 'There has been an error removing the template') );
	}

	onSaveSuccess(template){
		var templateId = template && template.id;

	   App.bus.trigger('popup:notification', {
			   title: 'Template Saved',
			   content: 'The template has been properly saved',
			   autoDestruct: 2000});

		model.unSelectTemplate();
		this.unSelectTemplate();

		campaignTemplateModel.fetchCampaignTemplates()
			.then( () => {
				if (templateId){
					campaignTemplateModel.selectTemplate(templateId);
					this.setState({
						templateSelected: templateId,
						activeItemId: templateId
					});
				}
			} );

	}

	onRemoveSuccess(){
	   App.bus.trigger('popup:notification', {
			   title: 'Template removed',
			   content: 'The template has been properly removed',
			   autoDestruct: 2000});

		this.unSelectTemplate();
		model.unSelectTemplate();
	}

	notify(title='', content='', autoDestruct=2000){
		App.bus.trigger('popup:notification', {title, content, autoDestruct});
	}

	onModelUpdate() {
		var selectedTemplateId = campaignTemplateModel.selectedTemplateId;

		model.onAllCampaignTemplatesReceived();
		this.setState({templateSelected: selectedTemplateId});
	}

	onTabClick(tab) {
		var updateTab = (tab.group == 'main') ?
		{ mainActiveTab: tab.id, subActiveTab: this.state.subActiveTab } :
		{ mainActiveTab: this.state.mainActiveTab, subActiveTab: tab.id };
		this.setState(updateTab);
	}

	unSelectTemplate(){
		this.setState({
			templateSelected: 0,
			activeItemId: 0
		});
	}

	eachTab(el, val) {
		var handler = this.onTabClick.bind(this, el);
		var isActive = (this.state.mainActiveTab == el.id || this.state.subActiveTab == el.id ) ? 'tab active' : 'tab';
		return (<li key={val} className={isActive} id={el.id}><a onClick={handler}>{el.name}</a></li>);
	}

	renderMainTabs() {
		var that = this;
		return _.map(that.maintabs, function(el, val) {
			return that.eachTab(el, val);
		}, this);
	}

	renderSubTabs() {
		var that = this;
		return _.map(that.subTabs, function(el, val) {
			return that.eachTab(el, val);
		}, this);
	}

	getWinHeight() {
		return window.innerHeight - 50;
	}

	onTemplateRemoved(templateId) {
		var template = _.findWhere( campaignTemplateModel.campaignTemplates, {id: templateId});
		var templateName = _.titleize(template.name);
		var message = `Are you sure you wish to delete the '${templateName}' template?`;

		App.bus.trigger('popup:confirm', {content: message, onConfirm: () => {
			model.removeTemplate(templateId);
		}});

	}

	onTemplateCopy(templateId) {
		var template = _.findWhere( campaignTemplateModel.campaignTemplates, {id: templateId});
		var templateName = _.titleize(template.name);
		var message = `Are you sure you wish to copy the '${templateName}' template?`;

		App.bus.trigger('popup:confirm', {content: message, onConfirm: () => {
			model.copyTemplate(templateId);
		}});
	}

	onTemplateClicked(templateId) {
		this.setState({activeItemId: templateId});
		model.loadTemplate(templateId);
		model.selectTemplate(templateId);
	}

	onNewTemplate(templateType){
		model.createNewTemplate('',templateType);
	}

	/**
	 * @returns {XML}
	 */
	render() {
		var DepositPanelList = model.get('depositTemplates');
		var FreebetList = model.get('freebetTemplates');

		if (!App.session.request('loggedIn')){
			return <div className="panel padding white">Please log in to have access to the templates</div>;
		}

		//TODO: Checking the permission on every render, might not be ideal
		//but as a quick fix, it ensures they are reevaluated if the user has
		//logged out and logged in with different user
		const allowed = App.session.request('canBonusEngineCampaignTemplates');

		if (!allowed){
			return <div><p><strong>YOU ARE NOT AUTHORIZED TO USE THIS FUNCTION.</strong></p></div>;
		}

		return (
			<div className="box">
				<div style={{minHeight: this.getWinHeight()}}>
					<div className="table no-padding">
						<div className="table-row split-2">
							<div className="table-cell">
								<div className="vertical-form">
									<ul className="tab-links"> {this.renderSubTabs()} </ul>
									<div className="tab-panels" ref="templateSelection">
										<TemplateList
											list={FreebetList}
											templateType="freebet"
											isActive={(this.state.subActiveTab === 'freebet-panel')}
											activeItemId={this.state.activeItemId}
											onNewTemplate={this.onNewTemplate.bind(this,'freebet')}
											onTemplateRemoved={this.onTemplateRemoved}
											onTemplateCopy={this.onTemplateCopy}
											onTemplateClicked={this.onTemplateClicked.bind(this)}/>
										<TemplateList
											list={DepositPanelList}
											templateType="deposit"
											isActive={(this.state.subActiveTab === 'deposit-panel')}
											onNewTemplate={this.onNewTemplate.bind(this,'deposit')}
											activeItemId={this.state.activeItemId}
											onTemplateRemoved={this.onTemplateRemoved}
											onTemplateCopy={this.onTemplateCopy}
											onTemplateClicked={this.onTemplateClicked.bind(this)}/>
									</div>
								</div>
							</div>
							{this.renderView()}
						</div>
					</div>
					<Tooltip place="right" type="info" effect="solid" />
				</div>
			</div>
		);
	}

	/**
	 * @returns {*}
	 */
	renderView() {
		if (this.state.templateSelected) {
			return this.renderCampaign();
		}
		return this.renderEmptyView();
	}

	/**
	 * @returns {XML}
	 */
	renderCampaign(){
		var template = campaignTemplateModel.selectedTemplate;
		return (
			<div className="table-cell">
				<div className="tabs-gap">&nbsp;</div>
				<CampaignForm key={template.id} campaign={template} isTemplate={true}/>
			</div>
		);
	}

	/**
	 * @returns {XML}
	 */
	renderEmptyView() {
		return (
			<div className="table-cell">
				<div className="tabs-gap">&#160;</div>
				<div className="white panel">
					<p>Please select a template</p>
				</div>
			</div>
		);
	}
};


BonusTemplates.defaultProps = { model: model };

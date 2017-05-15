import {classNames as cx} from 'common/util/ReactUtil';
import campaignModel from 'backoffice/model/bonus/CampaignModel';
import campaignTemplateModel from 'backoffice/model/bonus/CampaignTemplateModel';
import Tabs from 'backoffice/components/tabs/Tabs';
import Tab from 'backoffice/components/tabs/Tab';

export default class CampaignTemplateSelection extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			activeRow: 0,
			value:'Create New'
		};
	}

	render(){
		return (
			<div className="box">
				<div style={{minHeight: window.innerHeight - 50}}>
					<div className="table toolbar">
						<div className="table-row">
								{this.createDropdown()}
						</div>
					</div>
					<div className="table no-border-bottom">
						<div className="table-row">
							<p className="padding">Or choose one of the templates below to create your campaign:</p>
						</div>
					</div>


					<div className="table no-border-bottom">
						<div className="table-row">
							<div className="table-cell">
								<div className="vertical-form">
									<Tabs noPadding={true}>
										<Tab title="Deposit" id="1">
											{this.renderRows(this.getTemplatesOfType('depositBonus'), 'deposit')}
										</Tab>
										<Tab title="Freebet" id="2">
											{this.renderRows(this.getTemplatesOfType('freebet'), 'freebet')}
										</Tab>
									</Tabs>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

    createDropdown() {
		return (
			<div className="table-cell">
				<div className="button-group right">
					<a className="btn green filled"
						onClick={this.createCampaignFromScratch.bind(this, 'deposit')}>Create Deposit Campaign from scratch</a>
					<a className="btn green filled"
						onClick={this.createCampaignFromScratch.bind(this, 'freebet')}>Create Freebet Campaign from scratch</a>
				</div>
			</div>
		);
	}

	//
	// Get the list of templates of a certain type
	getTemplatesOfType(propertyToCheck) {
		var allTemplates = campaignTemplateModel.campaignTemplates;
		var filteredTemplates = _.filter(allTemplates, function(template){
			return template.hasOwnProperty(propertyToCheck);
		});

		var parsedTemplates = _.map(filteredTemplates, function(template){
			return { name: template.name, id: template.id };
		});

		return parsedTemplates;
	}

	mapRows(rowsData) {

		return _.map(rowsData, function (el, i) {
			var classes = cx('table-row', 'clickable');
			return (
				<div className={classes}
					key={el.id}
					onClick={this.createCampaignFromTemplate.bind(this, el.id, el.name)}>
					<div className="table-cell">{el.name}</div>
					<div className="table-cell">{el.id}</div>
				</div>
			);
		}, this);

	}

	/**
	 * @param rowsData
	 * @returns {*}
	 */
	renderRows(rowsData, type) {

		if (rowsData.length > 0) {
			return(
				<div className="padding">
					<div className="table grid inner">
						<div className="table-row header">
							<div className="table-cell wide">Name</div>
							<div className="table-cell wide">Id</div>
						</div>
						{this.mapRows(rowsData)}
					</div>
				</div>
			);
		} else {
			return (
				<div className="padding">
					<span className="empty-notice">No {_.titleize(type)} Templates</span>
					<br/><br/>
					<a onClick={this.createCampaignFromScratch.bind(this, type)} className="btn green filled">Create New</a>
				</div>
			);
		}
	}

	createCampaignFromScratch(campaignType){
		if (campaignType === 'deposit'){
			campaignModel.createEmptyDepositCampaignScaffold();
		} else {
			campaignModel.createEmptyBetCampaignScaffold();
		}
	}

	createCampaignFromTemplate(templateId, templateName) {
		campaignModel.createCampaignScaffoldFromTemplate(templateId);
	}
}

CampaignTemplateSelection.displayName = 'CampaignTemplateSelection';

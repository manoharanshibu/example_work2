import campaignModel from 'backoffice/model/bonus/CampaignModel';
import CampaignForm from 'bonus/CampaignForm';
import CampaignTemplateSelection from 'bonus/CampaignTemplateSelection';
import Tooltip from 'backoffice/components/tooltips/Tooltip';

export default class BonusCreation extends React.Component {
	constructor() {
		super();
		this.state = {
			campaignIsScaffolded: false
		};
		_.bindAll(this, 'setIsScaffolded', 'resetToNonScaffolded');

	}

	componentDidMount(){
		App.bus.on('campaignModel:setCampaignScaffold', this.setIsScaffolded);
		App.bus.on('campaignModel:saveBonusSuccess', this.resetToNonScaffolded);
		// App.bus.on('campaignModel:saveBonusFailure', this.on
	}

	componentWillMount(){
		App.bus.off('campaignModel:setCampaignScaffold', this.setIsScaffolded);
		App.bus.off('campaignModel:saveBonusSuccess', this.resetToNonScaffolded);
	}

	/**
	 *
	 */
	setIsScaffolded(){
		this.setState({campaignIsScaffolded: true});
	}

	/**
	 *
	 */
	resetToNonScaffolded(){
		this.notify('Success', 'The campaign has been saved successfully');
		this.setState({campaignIsScaffolded: false});
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

		//TODO: Checking the permission on every render, might not be ideal
		//but as a quick fix, it ensures they are reevaluated if the user has
		//logged out and logged in with different user
		const allowed = App.session.request('canBonusEngineCampaignCreation');

		if (!allowed){
			return <div><p><strong>YOU ARE NOT AUTHORIZED TO USE THIS FUNCTION.</strong></p></div>;
		}

		return this.renderContents();
	}

	/**
	 * @returns {XML}
	 */
	renderContents() {
		var campaign = campaignModel.selectedCampaign;
		if (this.state.campaignIsScaffolded){
			return <div>
					<CampaignForm campaign={campaign} isFullPage={true} />
					<Tooltip place="right" type="info" effect="solid" />
				</div>;
		}
		return <CampaignTemplateSelection />;
	}
};

BonusCreation.displayName = 'BonusCreation';

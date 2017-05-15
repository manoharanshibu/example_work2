import Component from 'common/system/react/BackboneComponent';
import TextInput from 'backoffice/components/elements/TextInput';
import CheckBox from 'backoffice/components/elements/CheckBox';
import DatePicker from 'backoffice/components/elements/DatePicker';
import ValidationGroup from 'backoffice/components/lists/ValidationGroup';
import TabList from 'backoffice/components/lists/TabList';
import depositCampaignModel from 'backoffice/model/DepositCampaignModel';
import customerSegmentModel from 'backoffice/model/CustomerSegmentModel';
import nodePromotions from 'backoffice/collection/NodePromotions';
import MarkdownEditor from 'backoffice/components/MarkdownEditor';

export default class CampaignSpecifics extends Component {
	constructor(props){
		super(props);
		this.state = {
			markdownPreview: false
		}
	}

	onSelectAllPaymentMethods(paymentMethods){
		depositCampaignModel.set('paymentMethods', paymentMethods);
		this.forceUpdate();
	}

	componentDidMount(){
		nodePromotions.on('change changeStatus add reset destroy update', (...rest)=>{
			this.forceUpdate();
		});
	}

	componentWillUnmount(){
		nodePromotions.off('change changeStatus add reset destroy update', (...rest)=>{
			this.forceUpdate();
		});
	}

	onMarkdownPreview() {
		const markdownPreview = !this.state.markdownPreview;
		this.setState({markdownPreview})
	}

	onMarkdownChange(markDown) {
		depositCampaignModel.set('promotionDescription', markDown)
	}

	render(){
		var activationHTML = this.getActivationHTML();
		var paymentsHTML = this.getPaymentsHTML();
		var allSegments = this.getSegmentList();
		var promoList = this.getPromoList();
		var bonusCheckboxes = this.renderBonusCheckboxes();
		var noEntitlementNeeded = this.renderNoEntitlementNeeded();
		var autoEntitleCheckbox = this.renderAutoEntitleCheckbox();
		const promotion = this.renderPromotion();

		return (<div className="table">
					<div className="table-row">
						<div className="table-cell" style={{width:'60%'}}>
							<div className="vertical-form">
								<TextInput
									data-tip="Name used to identify Bonus"
									ref="campaignName" label="Name" placeholder="Campaign name"
									focus={true}
									valueLink={this.bindTo(depositCampaignModel, 'name')} />
								<TextInput label="Bonus Code"
									placeholder=""
									ref="bonusCode"
									data-tip="Code used by Customers"
									valueLink={this.bindTo(depositCampaignModel, 'bonusCode')} />

								{bonusCheckboxes}

								{noEntitlementNeeded}

								{autoEntitleCheckbox}

								{activationHTML}

								{promotion}

								<h4 className="nice">Campaign Activation Date</h4>
								<div style={{textAlign:'right'}}>
									<ValidationGroup ref="activationDatesGroup">
										<DatePicker classes="right full-width"
											format='DD-MM-YY HH:mm'
											time
											data-tip="Date from which the bonus code is active and can be sent to customers."
											label="Starting"
											ref="starts"
											valueLink={this.bindTo(depositCampaignModel, 'starts')} />
										<DatePicker classes="right full-width"
											format='DD-MM-YY HH:mm'
											time
											data-tip="Date from which the bonus code is no longer sent out. <br>Note: The customer will still have the number of days to activate the bonus as above."
											data-multiline={true}
											label="Ending"
											ref="expires"
											valueLink={this.bindTo(depositCampaignModel, 'expires')}/>
								</ValidationGroup>
								</div>
							</div>
						</div>
						<div className="table-cell" style={{width:'40%'}}>
							<div className="vertical-form">
								<ValidationGroup ref="segmentsGroup">
									<TabList ref="segmentsList"
										title={"Segments"}
										list={allSegments}
										valueLink={this.bindTo(depositCampaignModel, 'segmentIds')}
										data-tip="Bonus only valid for selected segments.<br>Blank = All segments included."
										data-multiline={true}
										data-place="left"
										cls="full-width" />
									<TabList ref="excludedSegmentsList"
										title={"Excluded Segments"}
										list={allSegments}
										valueLink={this.bindTo(depositCampaignModel, 'excludedSegmentIds')}
										data-tip="Bonus not valid for selected segments.<br>Blank = No segments excluded."
										data-multiline={true}
										data-place="left"
										cls="full-width" />
								</ValidationGroup>
							</div>
							<div className="vertical-form">
								{paymentsHTML}
							</div>
						</div>
					</div>
				</div>);
	}

	renderPromotion() {
		return (
			<div>
				{/*<TextInput label="Bonus Tile Name"
						   placeholder="Bonus tile internal name"
						   valueLink={this.bindTo(depositCampaignModel, 'promotionName')}/>*/}
				<TextInput label="Bonus Tile Title"
						   placeholder="(the big text on the tile)"
						   valueLink={this.bindTo(depositCampaignModel, 'promotionTitle')}/>
				<div className="inline-form-elements">
					{this.renderMarkDown()}
					{/*<div className="btn small filled blue"
					 onClick={::this.onMarkdownPreview}>Description Preview
					 </div> */}
				</div>
				<TextInput label="Bonus Conditions URL"
						   placeholder="page builder path"
						   valueLink={this.bindTo(depositCampaignModel, 'promotionConditionsURL')}/>
			</div>
		)
	}

	renderMarkDown() {
		const { markdownPreview } = this.state;
		const description = depositCampaignModel.get('promotionDescription');
		if (markdownPreview && !!description) {
			const markdown = description[1];
			return <div dangerouslySetInnerHTML={{ __html: markdown}}/>
		}
		return (
			<div>
				<label>Bonus Tile Description (Markdown)</label>
				<MarkdownEditor value={depositCampaignModel.get('promotionDescription')}
								onChange={::this.onMarkdownChange}/>
			</div>
		)
	}

	renderBonusCheckboxes(){
		if(depositCampaignModel.get('isDepositCampaign')){
			return <ValidationGroup ref='typeOfBonusGroup'
									childrenStyle={{float: 'right'}}
									label="Bonus Type">
				<CheckBox classNames="right" label="Registration"
						  ref="registrationBonus"
						  data-tip="Bonus given to all new registrations"
						  valueLink={this.bindTo(depositCampaignModel, 'registrationBonus')} />
				<CheckBox classNames="right" label="CRM"
						  ref="crmBonus"
						  data-tip="CRM Driven Bonus"
						  valueLink={this.bindTo(depositCampaignModel, 'crmbonus')} />
			</ValidationGroup>;
		}else{
			return <ValidationGroup ref='typeOfBonusGroup'
									childrenStyle={{float: 'right'}}
									label="Bonus Type">
				<CheckBox classNames="right" label="Registration"
						  ref="registrationBonus"
						  data-tip="Bonus given to all new registrations"
						  valueLink={this.bindTo(depositCampaignModel, 'registrationBonus')}
						  disabled={true}/>
				<CheckBox classNames="right" label="CRM"
						  ref="crmBonus"
						  data-tip="CRM Driven Bonus"
						  valueLink={this.bindTo(depositCampaignModel, 'crmbonus')} />
				<CheckBox classNames="right"
						  ref="releaseBonus"
						  label="Release"
						  data-tip="Release Driven Bonus"
						  valueLink={this.bindTo(depositCampaignModel, 'releaseRestricted')}/>
			</ValidationGroup>;
		}
	}

	renderNoEntitlementNeeded(){
		const isDepositCampaign = depositCampaignModel.get('isDepositCampaign');
		if(!isDepositCampaign) {
			return <CheckBox
				ref="noEntitlementNeeded"
				label="No Entitlement Needed"
				classNames="right"
				key='noEntitlementNeeded'
				inline={true}
				classes=""
				valueLink={this.bindTo(depositCampaignModel, 'ignoreEntitlement')}
				data-tip="Tick this checkbox to disable the Entitlement Tab"/>
		}
	}

	renderAutoEntitleCheckbox(){

		if (!depositCampaignModel.get('isDepositCampaign')){
			return (
				<ValidationGroup ref='bonusAutoEntitle'
								 childrenStyle={{float: 'right'}}
								 label="Apply bonus automatically">
					<CheckBox classNames="right" label=""
							  ref="bonusEntitled"
							  data-tip="If the bonus is applied automatically then the punter will not need to opt in to be able to redeem bonus"
							  valueLink={this.bindTo(depositCampaignModel, 'autoEntitle')}
							  />
				</ValidationGroup>
			);
		}

		return (
			<ValidationGroup ref='bonusAutoEntitle'
							 childrenStyle={{float: 'right'}}
							 label="Apply bonus automatically">
				<CheckBox classNames="right" label=""
						  ref="bonusEntitled"
						  data-tip="If the bonus is applied automatically then the punter will not need to opt in to be able to redeem bonus"
						  valueLink={this.bindTo(depositCampaignModel, 'autoEntitle')}
				/>
			</ValidationGroup>
		);
	}

	getActivationHTML(){
		if (depositCampaignModel.get('isDepositCampaign')){
			return (
				<div>
					<TextInput label="Days to Activate Bonus"
							placeholder=""
							ref="daysToActivate"
							type="number"
							min="0"
							valueLink={this.bindTo(depositCampaignModel, 'daysToActivate')}
							data-tip="Days until code becomes invalid once received by customer"
							inputStyle={{width:'60%', float:'right'}}
					/>
					<TextInput label="Days to Fulfill"
							placeholder=""
							ref="daysToFulfill"
							type="number"
							min="0"
							valueLink={this.bindTo(depositCampaignModel, 'daysToFulfill')}
							data-tip="Number of days to fulfil the redemption criteria"
							inputStyle={{width:'60%',position:'relative', float:'right'}}
					/>
				</div>
			);
		}

		return ( <div>
					<TextInput label="Days to Activate Bonus"
							   placeholder=""
							   ref="daysToActivate"
							   type="number"
							   min="0"
							   valueLink={this.bindTo(depositCampaignModel, 'daysToActivate')}
							   data-tip="Days until code becomes invalid once received by customer"
							   inputStyle={{width:'60%', float:'right'}}
					/>
					<TextInput label="Days to meet Entitlement"
							placeholder=""
							ref="daysToFulfillBonus"
							type="number"
							valueLink={this.bindTo(depositCampaignModel, 'daysToClaim')}
							data-tip="Number of days to fulfil the entitlement criteria"
							data-multiline={true}
					/>
					<TextInput label="Days to meet Settlement"
							disabled={!!depositCampaignModel.get("releaseRestricted")}
							placeholder=""
							ref="daysToClaimBonus"
							type="number"
							valueLink={this.bindTo(depositCampaignModel, 'daysToFulfill')}
							data-tip="When a user meets the requirements <br>to qualify for a bonus he has <br>these many days to claim the bonus"
							data-multiline={true}

					/>
			</div>);
	}

	getPaymentsHTML(){
		if (!depositCampaignModel.get('isDepositCampaign')){
			return ('');
		}
		var hardcodedPaymentMethods = ['ILIXIUM'];
		var allPaymentMethods = _.map(hardcodedPaymentMethods, (elem) => ({
				name: elem,
				id: elem
			}));

		return(
			<div>
				<div className="btn small filled blue"
					onClick={this.onSelectAllPaymentMethods.bind(this, hardcodedPaymentMethods)} >{'Select all payment methods'}</div>
				<TabList ref="paymentMethods"
					title={"Payment Methods"}
					valueLink={this.bindTo(depositCampaignModel, 'paymentMethods')}
					list={allPaymentMethods}
					data-tip="Bonus only applied to money deposited <br>by the selected payment methods. "
					data-place="left"
					data-multiline={true}
					cls="full-width" />
			</div>
		);
	}

	getSegmentList(){
		var segments = customerSegmentModel.customerSegments.models || [];
		var parsedSegmentList = _.map(segments, function(segModel){
			return {
				id: segModel.get('id'),
				name: segModel.get('name'),
				selected: false
			};
		});

		return parsedSegmentList;
	}

	getPromoList(){
		const bonustilePromos = [];

		nodePromotions.forEach( (promo)=>{
			if ( promo.get('isBonusTile') ){
				bonustilePromos.push(
					{
						id: promo.get('id'),
						name: promo.get('name'),
						selected: false
					}
				);
			}
		});

		return bonustilePromos;
	}
}

CampaignSpecifics.displayName = 'CampaignSpecifics';

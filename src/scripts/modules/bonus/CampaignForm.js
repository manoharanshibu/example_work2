import getSportNode from 'backoffice/command/api/GetSportNodeCommand';
import campaignModel from 'backoffice/model/bonus/CampaignModel';
import campaignTemplateModel from 'backoffice/model/bonus/CampaignTemplateModel';
import CampaignSpecifics from 'bonus/CampaignSpecifics';
import Tabs from 'backoffice/components/tabs/Tabs';
import Tab from 'backoffice/components/tabs/Tab';
import TextInput from 'backoffice/components/elements/TextInput';
import SaveButton from 'backoffice/components/elements/SaveButton';
import CheckBox from 'backoffice/components/elements/CheckBox';
import ValidationGroup from 'backoffice/components/lists/ValidationGroup';
import CurrencyList from 'backoffice/components/lists/CurrencyList';
import RemovableList from 'backoffice/components/lists/RemovableList';
import TabList from 'backoffice/components/lists/TabList';
import Component from 'common/system/react/BackboneComponent';
import depositCampaignModel from 'backoffice/model/DepositCampaignModel';
import cache from 'backoffice/model/NodeCache';
import marketCache from 'backoffice/model/MarketCache';
import FormValidator from 'backoffice/components/FormValidator';
import validators from 'common/util/ValidationUtil';
import PathSelectorPopup from 'backoffice/components/PathSelectorPopup';

export default class CampaignForm extends Component {
	constructor(props){
		super(props);

		this.validator = new FormValidator();

		_.bindAll(this, 'confirmSave', 'saveTemplate', 'forceRender',
			'forceValidation', 'onAddPath');

	}

	validationRules() {
		const isTemplate = this.props.isTemplate;
		const isCampaign = !isTemplate;
		const type = isTemplate ? 'Template' : 'Campaign';

		var reg = this.validator.register;
		var campaignName = isTemplate ? this.refs.campaignName : this.refs.specifics.refs.campaignName;
		var currentName = depositCampaignModel.get('name');
		var campaignsList = isTemplate ? campaignTemplateModel.campaignTemplates : campaignModel.campaigns;
		var allCampaignNames = _.pluck(campaignsList, 'name');
		var otherCampaignNames = _.without(allCampaignNames, currentName);

		otherCampaignNames = otherCampaignNames.map(name => name.trim().toLowerCase());

		reg(campaignName, {
			routine: validators.notEmptyAndUnique(otherCampaignNames),
			errorMsg: `${type} name can't be empty and cannot be same as any other ${type}'s`
		});


		if (isCampaign) {

			const isDeposit = depositCampaignModel.get('isDepositCampaign');
			const specifics  = this.refs.specifics.refs;
			const positive = validators.isPositive;

			reg(specifics.bonusCode, {
				routine: /^[\wäöüÄÖÜß]{4,12}$/,
				errorMsg: 'Bonus code needs to be between 4 and 12 characters long (letters and numbers)'
			});

			reg(specifics.activationDatesGroup.refs.starts, {
				routine: validators.timestampNotEmpty,
				errorMsg: `Starting date cannot be empty`
			});

			reg(specifics.activationDatesGroup.refs.expires, {
				routine: validators.timestampNotEmpty,
				errorMsg: `Ending date cannot be empty`
			});

			reg(specifics.activationDatesGroup, {
				routine: validators.greaterThanDate(specifics.activationDatesGroup.refs.starts, specifics.activationDatesGroup.refs.expires),
				errorMsg: `Ending date must be later than Starting date`
			});

			reg(specifics.segmentsGroup, {
				routine: validators.noIntersectionTabLists(specifics.segmentsGroup.refs.segmentsList, specifics.segmentsGroup.refs.excludedSegmentsList),
				errorMsg: `Segments and Excluded segments can't share any value`
			});

			if (isDeposit) {
				// Deposit campaigns
				reg(specifics.daysToActivate, {
					routine: validators.isPositiveIntegerOrEmptyString,
					errorMsg: 'Days to activate needs to be greater than 0 or empty'
				});

				// reg( specifics.daysToFulfill, {
				// 	routine: validators.isPositiveIntegerOrEmptyString,
				// 	errorMsg: 'Days to fulfill needs to be greater than 0 or empty'
				// });

				reg(specifics.daysToClaimBonus, {
					routine: validators.isPositiveIntegerOrEmptyString,
					errorMsg: 'Days to claim Bonus needs to be greater than 0 or empty'
				});

				reg(specifics.paymentMethods, {
					routine: validators.arrayNotEmpty,
					errorMsg: 'At least one payment method needs to be selected'
				});

				reg(specifics.typeOfBonusGroup, {
					routine: validators.booleanCount(1, 1),
					errorMsg: 'Either "Registration" or "CRM" must be selected'
				});

				reg(this.refs.bonusFactor, {routine: positive, errorMsg: 'Bonus Factor needs to be greater than 0'});
				reg(this.refs.wageringFactor, {
					routine: positive,
					errorMsg: 'Wagering factor needs to be greater than 0'
				});

				reg(this.refs.bonusOnlyGroup, {
					routine: validators.booleanCount(1, 1),
					errorMsg: 'Either "bonus Only" OR "deposit and Bonus" must be selected'
				});

				reg(this.refs.depositsGroup.refs.minDeposits, {
					routine: validators.currencyNotEmpty,
					errorMsg: 'Min Deposits cannot be empty or zero'
				});

				reg(this.refs.depositsGroup.refs.maxDeposits, {
					routine: validators.currencyNotEmpty,
					errorMsg: 'Max Deposits cannot be empty or zero'
				});

				reg(this.refs.depositsGroup, {
					routine: validators.greaterThanCurrencyList(
						this.refs.depositsGroup.refs.minDeposits,
						this.refs.depositsGroup.refs.maxDeposits),
					errorMsg: 'Max Deposits needs to be greater than Min Deposits'
				});

			} else {
				// Freebet campaigns
				reg(specifics.daysToClaimBonus, {
					routine: (...rest) => {
						if (depositCampaignModel.get('releaseRestricted')) {
							return true;
						}
						return positive(...rest);
					},
					errorMsg: 'Days to claim bonus needs to be greater than 0'
				});


				reg(specifics.typeOfBonusGroup, {
					routine: validators.booleanCount(1, 1),
					errorMsg: 'Only one amongst "Registration", "CRM" or "Release" must be selected'
				});

				/**
				 * ENTITLEMENT
				 * */

				//TODO: These constraints need to be reactivated but considering the value of
				// WinningOnly and LosingOnly

				// reg( this.refs.entitlementWinningNoBet, { routine: positive, errorMsg: 'No. Winning Bets needs to be greater than 0' });
				// reg( this.refs.entitlementWinningBonusPcnt, { routine: positive, errorMsg: 'Winning Bonus % needs to be greater than 0' });
				// reg( this.refs.entitlementWinningMinOdds, { routine: positive, errorMsg: 'Min Odds needs to be greater than 0' });
				//
				// reg( this.refs.entitlementLosingNoBet, { routine: positive, errorMsg: 'No. Losing Bets needs to be greater than 0' });
				// reg( this.refs.entitlementLosingBonusPcnt, { routine: positive, errorMsg: 'Losing Bonus % needs to be greater than 0' });
				// reg( this.refs.entitlementLosingMinOdds, { routine: positive, errorMsg: 'Min Odds needs to be greater than 0' });

				const minStakeValidator = function(...rest) {
					const noEntitlementNeeded = depositCampaignModel.get('ignoreEntitlement');
					if(noEntitlementNeeded) {
						return true;
					}
					return validators.currencyNotEmpty(...rest);
				}.bind(this);

				const entitlementPrematchInplayValidator = function(...rest) {
					const noEntitlementNeeded = depositCampaignModel.get('ignoreEntitlement');
					if(noEntitlementNeeded) {
						return true;
					}
					return validators.booleanCount(1,2)(...rest);
				}.bind(this);


				reg(this.refs.minStakes, {
					routine: minStakeValidator,
					errorMsg: 'Min Stakes needs to be greater than 0'
				});


				reg(this.refs.entitlementPrematchInplayGroup, {
					routine: entitlementPrematchInplayValidator,
					errorMsg: 'Either "Prematch" OR "Inplay" or both must be selected'
				});


				/**
				 * SETTLEMENT
				 *
				 * */

				//reg( this.refs.redemptionMinOdds, { routine: positive, errorMsg: 'Min Odds needs to be greater than 0' });

				const preInplayIfCrmSelected = function (groupValues) {
					const group = specifics.typeOfBonusGroup;
					const checkBox = group && group.refs.crmBonus;
					if (checkBox && checkBox.value()) {
						return validators.booleanCount(1, 2)(groupValues);
					}
					return true;
				}.bind(this);

				reg(this.refs.bonusStakes, {
					routine: validators.currencyNotEmpty,
					errorMsg: 'Bonus Stakes needs to be greater than 0'
				});


				reg(this.refs.settlementPrematchInplayGroup, {
					routine: preInplayIfCrmSelected,
					errorMsg: 'Either "Prematch" OR "Inplay" or "both" must be selected'
				})
			}
		}
	}

	componentWillMount(){
		depositCampaignModel.reset();
		depositCampaignModel.parseCampaign(this.props.campaign);
	}

	componentDidMount(){
		App.bus.on('treeAvailibility:populated', this.forceRender);
		depositCampaignModel.on('change:entitlementAccumulationSequenceAcc', this.forceRender, this);
		depositCampaignModel.on('change:redemptionExpiryRuleWinnings', this.forceRender, this);
		depositCampaignModel.on('change:entitlementBonusTaxHoliday', this.forceRender, this);
		depositCampaignModel.on('change:entitlementBonusTaxNoTax', this.forceRender, this);
		depositCampaignModel.on('change:entitlementWinningOnly', this.forceRender, this);
		depositCampaignModel.on('change:entitlementLosingOnly', this.forceRender, this);
		depositCampaignModel.on('change:releaseRestricted', this.forceValidation, this);
		depositCampaignModel.on('change:registrationBonus', (...rest) => this.radioGroupMimick('registrationBonus', ...rest), this);
		depositCampaignModel.on('change:crmbonus', (...rest) =>	this.radioGroupMimick('crmbonus', ...rest), this);
		depositCampaignModel.on('change:releaseRestricted', (...rest)=>	this.radioGroupMimick('releaseRestricted', ...rest), this);
		depositCampaignModel.on('change:ignoreEntitlement', this.forceValidation, this);

		this.validationRules();
	}

	componentWillUnmount(){
		App.bus.off('treeAvailibility:populated', this.forceRender);
		depositCampaignModel.off('change:entitlementAccumulationSequenceAcc', this.forceRender, this);
		depositCampaignModel.off('change:redemptionExpiryRuleWinnings', this.forceRender, this);
		depositCampaignModel.off('change:entitlementBonusTaxHoliday', this.forceRender, this);
		depositCampaignModel.off('change:entitlementBonusTaxNoTax', this.forceRender, this);
		depositCampaignModel.off('change:entitlementWinningOnly', this.forceRender, this);
		depositCampaignModel.off('change:entitlementLosingOnly', this.forceRender, this);
		depositCampaignModel.off('change:releaseRestricted', this.forceValidation, this);
		depositCampaignModel.off('change:registrationBonus', null, this);
		depositCampaignModel.off('change:crmbonus', null, this);
		depositCampaignModel.off('change:releaseRestricted', null, this);
		depositCampaignModel.off('change:ignoreEntitlement', this.forceValidation, this);
	}

	radioGroupMimick(changedControl, ...rest){
		const radioOptions = ['registrationBonus', 'crmbonus', 'releaseRestricted'];
		const newControlValue = depositCampaignModel.get(changedControl);

		// If the control has been changed to true
		// all the others need to be changed to false
		// to emulate a radiogroup
		if (newControlValue){
			radioOptions.forEach(option => {
				if (option !== changedControl){
					depositCampaignModel.set(option, false, {silent: true});
				}
			});
			this.forceUpdate();
		}
	}

	//TODO: This is an ugly workaround to the problem of complex validations in
	// Backoffice forms. We need to rethink how we deal with validations altogether.
	forceValidation(){
		this.validator.isValid();
		this.forceUpdate();
	}

	forceRender(){
		this.forceUpdate();
	}

	render(){
		if (depositCampaignModel.get('isDepositCampaign')){
			return this.renderDepositCampaign();
		}
		return this.renderFreebetCampaign();

	}

	/** Since this component is used both in full pages
	 * 	and together with other components, this method avoid
	 * 	unaesthetic double or triple scrollbars to appear
	 * 	Note: isFullPage = false by default
	 * */
	getWinHeight() {
		const heights = this.props.isFullPage ? (window.innerHeight - 100) : 1000;
		return heights;
	}

	renderDepositCampaign(){
		const{minDeposits, maxDeposits} = depositCampaignModel.attributes;

		return (

			<div className="box">
				<div className="white panel" style={{height: '90vh', width: '720px'}}>
					<h2>
						<div className="inline-form-elements">
							{this.getManagement()}
							{this.getSaveButton()}
						</div>
					</h2>
					{this.getTopView()}
					<div className="table no-border-bottom">
						<div className="table-row">
							<div className="table-cell wide">
								<div className="vertical-form">
									<div className="padding">
										<TextInput label="Bonus Factor" placeholder=""
												   ref="bonusFactor"
												   valueLink={this.bindTo(depositCampaignModel, 'bonusFactor')}
												   data-tip="Multiplied by deposit amount to give bonus value"
										/>
										<TextInput label="Wagering Factor"
												   ref="wageringFactor"
												   placeholder=""
												   valueLink={this.bindTo(depositCampaignModel, 'wageringFactor')}
												   data-tip="Multiplied by deposit value to give minimum wager to redeem bonus"
										/>
										<ValidationGroup ref='bonusOnlyGroup'>
											<CheckBox label="Bonus Only"
													  ref="bonusOnly"
													  valueLink={this.bindTo(depositCampaignModel,'bonusOnly')}
													  classNames="right"
													  data-tip="User only required to meet bonus * wagering factor to allow withdrawal"
											/>
											<CheckBox label="Deposit + Bonus"
													  ref="depositAndBonus"
													  valueLink={this.bindTo(depositCampaignModel,'depositAndBonus')}
													  classNames="right"
													  data-tip="User required to meet (bonus + deposit) * wagering factor to allow withdrawal"
													  defaultChecked={true}

											/>
										</ValidationGroup>

										<CheckBox label="Qualify on Bet Placement"
												  ref="qualifyOnPlacement"
												  valueLink={this.bindTo(depositCampaignModel,'qualifyOnPlacement')}
												  classes=""
												  data-tip=""
												  data-multiline={true}
												  defaultChecked={true}
										/>
										<br/>
										<CheckBox label="Net winnings separate"
												  ref="qualifyOnPlacement"
												  valueLink={this.bindTo(depositCampaignModel,'restoreStakeIntoWallet')}
												  classes=""
												  data-tip=""
												  data-multiline={true}
												  defaultChecked={true}
										/>

									</div>
								</div>
							</div>
							<div className="table-cell">
								<h4 className="nice">Minimum Odds</h4>
								<TextInput label="Minimum Odds"
										   ref="minimumOdds"
										   placeholder=""
										   type="number"
										   pattern="[0-9]+([\,|\.][0-9]+)?"
										   step="0.01"
										   valueLink={this.bindTo(depositCampaignModel, 'minimumOdds')}
										   data-tip="Minimum odds the bets must be placed at to qualify for bonus to apply"
										   data-place="left"
								/>

								<h4 className="nice">Withdrawal Restricted Amount</h4>
								<div className="inline-form-elements">
									<CheckBox label="Deposit"
											  ref="depositWithdrawal"
											  valueLink={this.bindTo(depositCampaignModel,'depositWithdrawal')}
											  classes="right"
											  data-tip="Cannot withdraw deposit until<br>wagering requirements are met"
											  data-multiline={true}
											  defaultChecked={true}
											  disabled={true}
									/>
									<CheckBox label="Winnings"
											  ref="winningsWithdrawal"
											  valueLink={this.bindTo(depositCampaignModel,'winningsWithdrawal')}
											  classes="right"
											  data-tip="Cannot withdraw winnings until<br>wagering requirements are met"
											  data-multiline={true}
											  data-place="left"
											  defaultChecked={true}
											  disabled={true}
									/>
									<CheckBox label="Bonus"
											  ref="bonusWithdrawal"
											  valueLink={this.bindTo(depositCampaignModel,'bonusWithdrawal')}
											  classes="right"
											  data-tip="Cannot withdraw bonus until<br>wagering requirements are met"
											  data-multiline={true}
											  data-place="left"
											  defaultChecked={true}
											  disabled={true}
									/>
								</div>

								<h4 className="nice">Balance Reduction Post Expiry</h4>
								<div className="inline-form-elements">
									<CheckBox label="Deposit"
											  ref="postEnquiryDeposit"
											  valueLink={this.bindTo(depositCampaignModel,'postEnquiryDeposit')}
											  classes=""
											  data-tip="What is deducted from the users balance<br>if the bonus expires before wagering<br>requirements are met"
											  data-multiline={true}
									/>
									<CheckBox label="Winnings"
											  ref="postEnquiryWinnings"
											  valueLink={this.bindTo(depositCampaignModel,'postEnquiryWinnings')}
											  classes=""
											  data-tip="What is deducted from the users balance<br>if the bonus expires before wagering<br>requirements are met"
											  data-multiline={true}
											  data-place="left"
											  defaultChecked={true}
									/>
									<CheckBox label="Bonus"
											  ref="postEnquiryBonus"
											  valueLink={this.bindTo(depositCampaignModel,'postEnquiryBonus')}
											  classes=""
											  data-tip="What is deducted from the users balance<br>if the bonus expires before wagering<br>requirements are met"
											  data-multiline={true}
											  data-place="left"
											  defaultChecked={true}
									/>
								</div>
							</div>
						</div>
					</div>
					<div className="table no-border-bottom">
						<ValidationGroup ref="depositsGroup"
										 outerClass="table-row">
							<CurrencyList
								ref="minDeposits"
								outerClass="inline-form-elements currency-list table-cell"
								title={"Min Deposits"}
								value={minDeposits}
								titleButton={"Add"}
								data-tip="Minimum amount that can be deposited<br>for the bonus to apply"
								data-place="right"
								data-multiline={true}
							/>
							<CurrencyList
								ref="maxDeposits"
								outerClass="inline-form-elements currency-list table-cell"
								title={"Max Deposits"}
								value={maxDeposits}
								titleButton={"Add"}
								data-tip="Maximum amount that can be deposited<br>for the bonus to apply"
								data-place="left"
								data-multiline={true}
							/>
						</ValidationGroup>
					</div>
				</div>
			</div>
		);
	}

	getManagement(){
		var statusTranslations = {
			'ACTIVE' : 'ACTIVE',
			'IN_ACTIVE' : 'INACTIVE',
			'ENDED': 'ENDED'
		};

		var actionTranslations = {
			'ACTIVE': 'SUSPEND',
			'IN_ACTIVE': 'ACTIVATE',
			'ENDED': ''
		};

		var buttonStyles = {
			'ACTIVE' : 'red',
			'IN_ACTIVE': 'green',
			'ENDED': ''
		};

		var currentStatus = depositCampaignModel.get('status');
		var status = statusTranslations[currentStatus];
		var action = actionTranslations[currentStatus];
		var styleClass = 'btn small filled ' + buttonStyles[currentStatus];


		if (this.props.isManaged){
			return ( <div style={{position:'relative', float:'left'}}>
				<label>Current status: {status}</label>
				<a className={styleClass} onClick={_.bind(this.toggleActivation, this)} >{action}</a>
			</div>);
		}

		return '';/*( <div style={{position:'relative', float:'left'}}>
		 <a className='btn blue' onClick={_.bind(this.toggleActivation, this)} >Back</a>
		 </div>);*/
	}

	renderFreebetCampaign(){
		return (
			<div className="box">
				<div className="white panel" style={{height: '90vh', width: '720px'}}>
					<h2>
						<div className="inline-form-elements">
							{this.getManagement()}
							{this.getSaveButton()}
						</div>
					</h2>
					{this.getTopView()}
					<Tabs>
						{this.renderEntitlementTab()}
						{this.renderSettlementTab()}
					</Tabs>
				</div>
			</div>
		);
	}

	renderEntitlementTab() {
		const noEntitlementNeeded = depositCampaignModel.get('ignoreEntitlement');
		const isTaxHoliday = depositCampaignModel.get('entitlementBonusTaxHoliday');
		const allBetTypes = this.getBetTypesList();
		const accumulatesStakes = this.renderAccumulatesStakes();
		const entitlementPaths = this.getRemovableListOfPaths('entitlement');
		const entitlementMarkets = this.getRemovableListOfMarkets('entitlement');
		const minStakes = depositCampaignModel.get('entitlementMinStakes');
		// const isReleaseBonus = depositCampaignModel.get('releaseRestricted');
		const needsTemporaryDisabling = true;

		if(noEntitlementNeeded){
			return <Tab title="Entitlement" id="1">
				<p>The entitlement tab has been disabled.</p>
				<p>Un-tick "No Entitlement Needed" to enable it</p>
			</Tab>
		}else{
			return (
				<Tab title="Entitlement" id="1">
					<div className="table no-border-bottom padding">
						<div className="table-row">
							<div className="table-cell">
								<div className="vertical-form">
									<TextInput
										disabled={isTaxHoliday}
										ref="entitlementMinOdds"
										label="Min Odds"
										valueLink={this.bindTo(depositCampaignModel, 'entitlementMinOdds')}
										data-tip="Minimum odds the bet(s)<br>must be staked at"
										data-multiline={true}
									/>
									<hr/>
									<CheckBox
										label="Winning Only"
										disabled={isTaxHoliday}
										classNames="right"
										key='entitlementWinningOnly'
										inline={true}
										classes=""
										valueLink={this.bindTo(depositCampaignModel, 'entitlementWinningOnly')}
										data-tip="Winning bet must be placed to qualify for bonus"
									/>
									<TextInput
										disabled={!depositCampaignModel.get('entitlementWinningOnly')}
										ref="entitlementWinningNoBet"
										label="No. Winning Bets"
										key='entitlementWinningNoBet'
										valueLink={this.bindTo(depositCampaignModel, 'entitlementWinningNoBet')}
										data-tip="Bonus applies once the number<br>of winning bets has been met"
										data-multiline={true}
									/>
									<TextInput
										disabled={!depositCampaignModel.get('entitlementWinningOnly')}
										ref="entitlementWinningBonusPcnt"
										label="Winning Bonus %" placeholder="100"
										valueLink={this.bindTo(depositCampaignModel, 'entitlementWinningBonusPcnt')}
										data-tip="Percentage of win allocated as bonus"
									/>
									<hr/>
									<CheckBox
										disabled={isTaxHoliday}
										ref="entitlementLosingOnly"
										label="Losing Only"
										inline={true}
										classes="right"
										valueLink={this.bindTo(depositCampaignModel, 'entitlementLosingOnly')}
										data-tip="Losing bet must be placed<br>to qualify for bonus"
										data-multiline={true}
									/>
									<TextInput
										disabled={!depositCampaignModel.get('entitlementLosingOnly')}
										ref="entitlementLosingNoBet"
										label="No. Losing Bets"
										valueLink={this.bindTo(depositCampaignModel, 'entitlementLosingNoBet')}
										data-tip="Bonus applies once the number<br>of losing bets has been met"
										data-multiline={true}
									/>
									<TextInput
										disabled={!depositCampaignModel.get('entitlementLosingOnly')}
										ref="entitlementLosingBonusPcnt"
										label="Losing Bonus %"
										valueLink={this.bindTo(depositCampaignModel, 'entitlementLosingBonusPcnt')}
										data-tip="Percentage of loss allocated as bonus"
										data-multiline={true}
									/>
								</div>
							</div>
							<div className="table-cell" style={{width:'50%'}}>
								<div className="vertical-form">
									<CheckBox label="Sequence Accumulation"
											  disabled={isTaxHoliday || needsTemporaryDisabling}
											  inline={true}
											  inputStyle={{width: '40%'}}
											  classes=""
											  valueLink={this.bindTo(depositCampaignModel, 'entitlementAccumulationSequenceAcc')}
											  data-tip="Signifies that the bonus<br>is a sequence bonus"
											  data-place="left"
											  data-multiline={true}
											  disabled={true}
									/>
									<TextInput label="Sequence Count"
											   inputStyle={{width: '40%'}}
											   disabled={isTaxHoliday || needsTemporaryDisabling || !depositCampaignModel.get('entitlementAccumulationSequenceAcc')}
											   valueLink={this.bindTo(depositCampaignModel, 'entitlementAccumulationSequence')}
											   data-tip="Number of steps in the squence"
											   data-place="left"
											   data-multiline={true}
											   disabled={true}
									/>
									<TextInput label="Stake Accumulation Factor"
											   inputStyle={{width: '40%'}}
											   disabled={isTaxHoliday || needsTemporaryDisabling || !depositCampaignModel.get('entitlementAccumulationSequenceAcc')}
											   valueLink={this.bindTo(depositCampaignModel, 'entitlementAccumulationStakeAccPctn')}
											   data-tip="Factor applied to the stake<br>to give the min stake<br>in the next bet<br>in the sequence"
											   data-place="left"
											   data-multiline={true}
											   disabled={true}
									/>
									<hr/>
									<CheckBox label="Tax Holiday"
											  inline={true}
											  inputStyle={{width: '40%'}}
											  classes=""
											  disabled={needsTemporaryDisabling}
											  valueLink={this.bindTo(depositCampaignModel, 'entitlementBonusTaxHoliday')}
											  data-tip="Signifies that the bonus<br>is a tax bonus"
											  data-place="left"
											  data-multiline={true}
											  disabled={true}
									/>
									<CheckBox label="No Tax"
											  inline={true}
											  inputStyle={{width: '40%'}}
											  disabled={!isTaxHoliday || needsTemporaryDisabling}
											  classes=""
											  valueLink={this.bindTo(depositCampaignModel, 'entitlementBonusTaxNoTax')}
											  data-tip="No tax applied"
											  data-place="left"
											  data-multiline={true}
											  disabled={true}
									/>
									<TextInput label="Tax Level %"
											   inputStyle={{width: '40%'}}
											   disabled={!isTaxHoliday || needsTemporaryDisabling || depositCampaignModel.get('entitlementBonusTaxNoTax')}
											   valueLink={this.bindTo(depositCampaignModel, 'entitlementBonusTaxLevelPcnt')}
											   data-tip="% of tax applied to winnings"
											   data-place="left"
											   data-multiline={true}
											   disabled={true}
									/>
									<hr/>
									<ValidationGroup ref="entitlementPrematchInplayGroup">
										<CheckBox label="Prematch" classNames="right"
												  inline={true}
												  inputStyle={{width: '40%'}}
												  classes=""
												  disabled={isTaxHoliday}
												  ref="entitlementPrematch"
												  valueLink={this.bindTo(depositCampaignModel, 'entitlementPrematch')}
												  data-tip="Bonus can be only applied to Prematch bets"
												  data-place="left"
												  data-multiline={true}
										/>
										<CheckBox label="Inplay" classNames="right"
												  inline={true}
												  inputStyle={{width: '40%'}}
												  classes=""
												  disabled={isTaxHoliday}
												  ref="entitlementInplay"
												  valueLink={this.bindTo(depositCampaignModel, 'entitlementInplay')}
												  data-tip="Bonus can be only applied to Inplay bets"
												  data-place="left"
												  data-multiline={true}
										/>
									</ValidationGroup>
									<hr/>
									<CheckBox classNames="right" label="Mobile"
											  classes=""
											  inputStyle={{width: '40%'}}
											  inline={true}
											  ref="mobile"
											  data-tip="Mobile"
											  data-place="left"
											  valueLink={this.bindTo(depositCampaignModel, 'mobile')} />

									{accumulatesStakes}
								</div>
							</div>
						</div>
						<div className="table-row">
							<div className="table-cell vertical-form">
								<TabList ref="entitlementBetTypes"
										 title="BetTypes"
										 list={allBetTypes}
										 valueLink={this.bindTo(depositCampaignModel, 'entitlementBetTypes')}
										 cls="full-width"
										 data-tip="Type of bet the bonus can be applied to.<br>Blank = all bet types"
										 data-multiline={true}
										 disabled={true}
								/>
							</div>
							<div className="table-cell vertical-form">
								<CurrencyList ref="minStakes"
											  disabled={isTaxHoliday}
											  title="Min Stakes"
											  valueLink={this.bindTo(depositCampaignModel, 'entitlementMinStakes')}
											  titleButton="Add"
											  data-tip="Minimum customer stake<br>to be entitled for bonus"
											  data-place="left"
											  data-multiline={true}
								/>
							</div>
						</div>

						<div className="table-row">
							<RemovableList ref="entitlementPaths"
										   disabled={isTaxHoliday}
										   key="1"
										   title={"Paths"}
										   titleAction={this.onShowPathsPopup.bind(this, 'entitlement')}
										   onRemoveElement={_.bind(this.onRemovePath, this, 'entitlement')}
										   list={entitlementPaths} titleButton={"Add"}
										   data-tip="Sport or Event against which<br>the bonus can be applied.<br>Blank = all Sports and Events."
										   data-multiline={true}
							/>
							<RemovableList ref="entitlementAvailPaths"
										   disabled={isTaxHoliday}
										   key="2"
										   title={"Markets"}
										   titleAction={this.onShowMarketsPopup.bind(this, 'entitlement')}
										   onRemoveElement={_.bind(this.onRemoveMarket, this, 'entitlement')}
										   list={entitlementMarkets} titleButton={"Add"}
										   data-tip="Market against which the bonus<br>can be applied.<br>Blank = all markets."
										   data-place="left"
										   data-multiline={true}
							/>
						</div>
						<div className="table-row">
							<h3>
								Note: It's not necessary to select a path if you just want to qualify a market or viceversa.
							</h3>
						</div>
					</div>
				</Tab>
			);
		}

	}

	renderSettlementTab(){
		const redemptionPaths = this.getRemovableListOfPaths('redemption');
		const redemptionMarkets = this.getRemovableListOfMarkets('redemption');
		const isTaxHoliday = depositCampaignModel.get('entitlementBonusTaxHoliday');
		const allBetTypes = this.getBetTypesList();
		const bonusStakes = depositCampaignModel.get('redemptionBonusStakes');
		const accumulatesStakes = this.renderAccumulatesStakes();

		return (
			<Tab title="Settlement" id="2" >
				<div className="table no-border-bottom padding">
					<div className="table-row">
						<div className="table-cell">
							<div className="vertical-form">
								<ValidationGroup ref="settlementPrematchInplayGroup">
									<CheckBox label="Prematch"
											  inline={true}
											  inputStyle={{width: '40%'}}
											  classes=""
											  disabled={isTaxHoliday}
											  ref="redemptionPrematch"
											  valueLink={this.bindTo(depositCampaignModel, 'redemptionPrematch')}
											  data-tip="Bonus can be applied<br>to Prematch bets"
											  data-multiline={true}
									/>
									<CheckBox label="Inplay"
											  inline={true}
											  inputStyle={{width: '40%'}}
											  classes=""
											  disabled={isTaxHoliday}
											  ref="redemptionInplay"
											  valueLink={this.bindTo(depositCampaignModel, 'redemptionInplay')}
											  data-tip="Bonus can be applied<br>to Inplay bets"
											  data-multiline={true}
									/>
								</ValidationGroup>
								<hr/>
								<CheckBox classNames="right" label="Mobile"
										  classes=""
										  inputStyle={{width: '40%'}}
										  inline={true}
										  ref="mobile"
										  data-tip="Mobile"
										  data-place="left"
										  valueLink={this.bindTo(depositCampaignModel, 'settlementMobile')}
										  disabled={true}/>

								{accumulatesStakes}
								<hr/>
								<TextInput label="Bonus Accumulation"
										   inputStyle={{width: '40%'}}
										   placeholder=""
										   valueLink={this.bindTo(depositCampaignModel, 'redemptionBonusAccumulationPcnt')}
										   data-tip="How much bonus stake<br>accumulates after each step<br>in the sequence"
										   data-multiline={true}
										   disabled={true}
								/>
								<TextInput
									inputStyle={{width: '40%'}}
									disabled={isTaxHoliday}
									ref='redemptionMinOdds'
									label="Min Odds"
									placeholder=""
									valueLink={this.bindTo(depositCampaignModel, 'redemptionMinOdds')}
									data-tip="Minimum odds the free bet<br>needs to be placed at"
									data-multiline={true}
								/>
							</div>
						</div>
						<div className="table-cell">
							<div className="vertical-form">
								<CheckBox label="Winnings"
										  inline={true}
										  inputStyle={{width: '40%'}}
										  classes=""
										  valueLink={this.bindTo(depositCampaignModel, 'redemptionExpiryRuleWinnings')}
										  data-tip="After bet has been placed<br>user can withdraw<br>winnings only"
										  data-multiline={true}
										  disabled={true}
								/>
								<CheckBox label="Bonus"
										  inline={true}
										  inputStyle={{width: '40%'}}
										  classes=""
										  valueLink={this.bindTo(depositCampaignModel, 'redemptionExpiryRuleBonus')}
										  data-tip="After bet has been placed<br>user can withdraw bonus"
										  data-multiline={true}
										  disabled={true}
								/>
							</div>
						</div>
					</div>

					<div className="table-row">
						<div className="table-cell vertical-form wide">
							<TabList ref="redemptionBetTypes"
									 disabled={isTaxHoliday}
									 title={"BetTypes"}
									 list={allBetTypes}
									 valueLink={this.bindTo(depositCampaignModel,'redemptionBetTypes')}
									 cls="full-width"
									 data-tip="Type of bet the bonus<br>can be applied to.<br>Blank = all bet types"
									 data-multiline={true}
							/>
						</div>
						<div className="table-cell vertical-form wide">
							<CurrencyList ref="bonusStakes"
										  disabled={isTaxHoliday}
										  title={"Bonus Stakes"}
										  valueLink={this.bindTo(depositCampaignModel,'redemptionBonusStakes')}
										  titleButton="Add"
										  data-tip="Value of the bonus"
							/>

						</div>
					</div>
					<div className="table-row">
						<RemovableList ref="redemptionPaths" title={"Paths"}
									   disabled={isTaxHoliday}
									   key="1"
									   list={redemptionPaths}
									   titleAction={this.onShowPathsPopup.bind(this, 'redemption')}
									   onRemoveElement={_.bind(this.onRemovePath, this, 'redemption')}
									   titleButton={"Add"}
									   data-tip="Sport or Event against which<br>the bonus can be applied.<br>Blank = all Sports and Events."
									   data-multiline={true}
						/>
						<RemovableList ref="redemptionAvailPaths" title={"Markets"}
									   disabled={isTaxHoliday}
									   key="2"
									   list={redemptionMarkets}
									   titleAction={this.onShowMarketsPopup.bind(this, 'redemption')}
									   onRemoveElement={_.bind(this.onRemoveMarket, this, 'redemption')}
									   titleButton={"Add"}
									   data-place="left"
									   data-tip="Market against which<br>the bonus can be applied.<br>Blank = all markets."
									   data-multiline={true}
						/>
					</div>
					<div className="table-row">
						<h3>
							Note: It's not necessary to select a path if you just want to qualify a market or viceversa.
						</h3>
					</div>
				</div>
			</Tab>
		);
	}

	renderAccumulatesStakes(){
		if (depositCampaignModel.get('isDepositCampaign')){
			return null;
		}

		return (
			<CheckBox classNames="" label="Accumulates Stakes"
					  classes=""
					  inputStyle={{width: '40%'}}
					  inline={true}
					  ref="allowAccumulatesStake"
					  data-tip="Allow Accumulates Stakes"
					  data-place="left"
					  valueLink={this.bindTo(depositCampaignModel, 'allowAccumulatesStake')}	/>
		);
	}

	getSaveButton(){
		var type = this.props.isTemplate ? 'Template' : 'Campaign';

		return (
			<div style={{position:'relative', float:'right'}}>
				<SaveButton save={this.confirmSave} text={'Save ' + type}/>
			</div>
		);
	}

	confirmSave(){
		if (this.validator.isValid()) {
			if (this.props.isTemplate) {
				this.saveTemplate();
			} else {
				this.saveCampaign();
			}
		} else {
			this.notify('Error', 'There are some errors in the form. Please review all the error messages');
		}
	}

	notify(title='', content='', autoDestruct=2000){
		App.bus.trigger('popup:notification', {title, content, autoDestruct});
	}


	getTopView(){
		//var boundToggleActivation = _.bind(this.toggleActivation, this);
		const {isTemplate, isManaged} = this.props;

		if (isTemplate){
			return (
				<div className="table">
					<div className="table-row">
						<div className="table-cell wide">
							<div className="vertical-form">
								<div className="inline-form-elements">
									<TextInput label="Name"
											   placeholder="Enter a campaign name"
											   ref="campaignName"
											   key='name'
											   focus={true}
											   data-tip="Name used to identify Template"
											   valueLink={this.bindTo(depositCampaignModel, 'name')}/>
								</div>
							</div>
						</div>
						<div className="table-cell">&nbsp;</div>
					</div>
				</div>
			);
		}
		return <CampaignSpecifics ref="specifics"
								  isManaged={!!isManaged} />;
	}

	// isEntitlement allows to retrieve both 'entitlement'
	// and 'redemption' paths
	getPaths(isEntitlement){
		var propName = (isEntitlement ? 'entitlement' : 'redemption') + 'Paths';
		var selectedPaths = depositCampaignModel.get(propName);
		const parsedPaths = selectedPaths.map(path => ({id: path, name: path}));

		return parsedPaths;
	}

	// isEntitlement allows to retrieve both 'entitlement'
	// and 'redemption' betTypes
	getMarkets(isEntitlement){
		var propName = (isEntitlement ? 'entitlement' : 'redemption') + 'AvailPaths';
		var selectedPaths = depositCampaignModel.get(propName);
		const parsedPaths = selectedPaths.map(path => ({id: path, name: path }));

		return parsedPaths;
	}

	// isEntitlement allows to retrieve both 'entitlement'
	// and 'redemption' betTypes
	getBetTypesList(){
		const names = ['SINGLE', 'MULTIPLE', 'TRIXIE', 'YANKEE', 'CANADIAN',
			'HEINZ', 'SUPER_HEINZ', 'GOLIATH', 'SUPER_GOLIATH', 'PATENT',
			'LUCKY_15', 'LUCKY_31', 'LUCKY_63'];

		const allBetTypes = names.map(elem => ({name: elem,	id: elem }));

		return allBetTypes;
	}

	saveCampaign() {
		var campaign;
		var minDeposits = [];
		var maxDeposits = [];
		var minStakes = [];
		var bonusStakes = [];
		const options = {};
		if (depositCampaignModel.get('isDepositCampaign')){
			minDeposits = this.refs.depositsGroup.refs.minDeposits.state.value;
			maxDeposits = this.refs.depositsGroup.refs.maxDeposits.state.value;
			options.minDeposits = minDeposits;
			options.maxDeposits = maxDeposits;
		} else {
			if(!depositCampaignModel.get('ignoreEntitlement')){
				minStakes = this.refs.minStakes.state.value;
				options.entitlementMinStakes = minStakes;
			}
			bonusStakes = this.refs.bonusStakes.state.value;
			options.redemptionBonusStakes = bonusStakes;
		}

		// Negative ids are not useful when saving
		// Maybe this validation could be better performed at DepositCampaignModel
		if (depositCampaignModel.get('id')<0){
			options.id = 0;
		}

		depositCampaignModel.set(options);

		campaign = depositCampaignModel.retrieveCampaign();
		campaignModel.saveCampaignFromExternalObject(campaign);
	}

	saveTemplate() {
		var template;
		var minDeposits = [];
		var maxDeposits = [];
		var minStakes = [];
		var bonusStakes = [];
		const options = {};
		if (depositCampaignModel.get('isDepositCampaign')){
			minDeposits = this.refs.depositsGroup.refs.minDeposits.state.value;
			maxDeposits = this.refs.depositsGroup.refs.maxDeposits.state.value;
			options.minDeposits = minDeposits;
			options.maxDeposits = maxDeposits;
		} else {
			if(!depositCampaignModel.get('ignoreEntitlement')){
				minStakes = this.refs.minStakes.state.value;
				options.entitlementMinStakes = minStakes;
			}
			bonusStakes = this.refs.bonusStakes.state.value;
			options.redemptionBonusStakes = bonusStakes;
		}

		// Negative ids are not useful when saving
		// Maybe this validation could be better performed at DepositCampaignModel
		if (depositCampaignModel.get('id') < 0){
			options.id = 0;
		}

		depositCampaignModel.set(options);

		template = depositCampaignModel.retrieveCampaign();
		campaignTemplateModel.saveTemplateFromExternalObject(template);
	}

	toggleActivation(){
		var currentStatus = depositCampaignModel.get('status');

		if (currentStatus === 'ACTIVE'){
			this.suspendCampaign();
		} else if (currentStatus === 'IN_ACTIVE'){
			this.activateCampaign();
		}
	}

	activateCampaign(){
		depositCampaignModel.set({status: 'ACTIVE'});
		var campaign = depositCampaignModel.retrieveCampaign();
		campaignModel.saveCampaignFromExternalObject(campaign);
	}

	suspendCampaign(){
		depositCampaignModel.set({status: 'IN_ACTIVE'});
		var campaign = depositCampaignModel.retrieveCampaign();
		campaignModel.saveCampaignFromExternalObject(campaign);
	}

	// prefix can be 'entitlement' or 'redemption'
	onShowMarketsPopup(prefix) {
		App.bus.trigger('popup:view', PathSelectorPopup,
			{
				onConfirmedPath: this.onAddMarket.bind(this, prefix),
				selectMarket: true
			});

	}

	// prefix can be 'entitlement' or 'redemption'
	onShowPathsPopup(prefix){
		App.bus.trigger('popup:view', PathSelectorPopup,
			{
				onConfirmedPath: this.onAddPath.bind(this, prefix)
			});
	}

	onAddPath(prefix, fullPathString, sport, nodeId){
		const pathsProp = `${prefix}Paths`;
		const paths = depositCampaignModel.get(pathsProp);

		paths.push(fullPathString);
		depositCampaignModel.set(pathsProp, paths);

		// This should be handled very differently
		this.forceUpdate();
	}

	onAddMarket(prefix, fullPathString, sport, nodeId, marketId){
		const availProp = `${prefix}AvailPaths`;
		const availPaths = depositCampaignModel.get(availProp);

		if (marketId){
			// const nodeAsString = `${nodeId}`;
			const selectedAvailPath = _.findWhere(availPaths, {path: fullPathString});
			if (selectedAvailPath){
				selectedAvailPath.marketTypes.push(marketId);
				// We don't need to re-add the selectedAvailPath to availPaths,
				// since it is already a reference and not a value
				depositCampaignModel.set(availPaths, availPaths);
			} else {
				availPaths.push({
					path: fullPathString,
					marketGroups: [],
					marketTypes: [marketId]
				});
			}
		}

		// This should be handled very differently
		this.forceUpdate();
	}

	onCloseMarketsPopup(prefix, paths, availPaths){
		depositCampaignModel.set(prefix+'Paths', paths);
		depositCampaignModel.set(prefix+'AvailPaths', availPaths);
		this.forceUpdate();
	}

	getRemovableListOfPaths(prefix){
		const list = depositCampaignModel.get(prefix+'Paths');
		const removableList = list.map(fullPath => {
			const pathParts = fullPath.split(':');
			const lastPart = pathParts[ pathParts.length-1 ];
			const nodeId = parseInt(lastPart, 10);
			const pathDescription = cache.getSportFullPathDescription(nodeId);

			const node = cache.get(nodeId);
			if (!node){
				getSportNode(nodeId, true);
			}

			return {
				// name: (node && node.get('name')) || nodeId,
				name: pathDescription,
				id: fullPath,
				tooltip: pathDescription
			};
		});

		return removableList;
	}

	getRemovableListOfMarkets(prefix){
		const list = depositCampaignModel.get(prefix+'AvailPaths');
		const removableList = [];
		let sportData, marketData;

		list.forEach(path => {
			const pathParts = path.path.split(':');
			const lastPathBit = pathParts[ pathParts.length-1 ];
			const numPath = parseInt(lastPathBit, 10);
			var pathDescription = cache.getSportFullPathDescription(numPath);
			sportData = marketCache.getSportDataSync(parseInt(numPath));
			marketData = sportData && sportData.marketTypes;

			path.marketTypes.forEach(marketType => {
				const name = (marketData && marketData[marketType] && marketData[marketType].name) || marketType;

				removableList.push({
					id: marketType,
					name: `${name} (${pathDescription})`,
					tooltip: pathDescription
				});
			});
		});

		return removableList;
	}

	onRemovePath(prefix, elemInfo){
		const attrName = prefix + 'Paths';
		let paths = depositCampaignModel.get(attrName);
		const elemPos = paths.indexOf(elemInfo.id);

		if (elemPos !== -1){
			paths.splice(elemPos,1);
		}

		depositCampaignModel.set(attrName, paths);
	}

	onRemoveMarket(prefix, elemInfo){
		var attrName = prefix + 'AvailPaths';
		var paths = depositCampaignModel.get(attrName);

		// Locate and remove from the array
		paths.forEach(path => {
			const pos = path.marketTypes.indexOf(elemInfo.id);
			if (pos !== -1){
				path.marketTypes.splice(pos,1);
			}
			return path;
		});

		depositCampaignModel.set(attrName, paths);
	}
}

CampaignForm.defaultProps = {
	isFullPage: false
};

CampaignForm.displayName = 'CampaignForm';

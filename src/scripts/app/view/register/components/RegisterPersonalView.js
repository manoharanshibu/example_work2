import Form from 'app/view/register/components/formElements/forms/Form';
import FormInputWithIconbox from 'app/view/register/components/formElements/forms/FormInputWithIconbox.jsx';
import SelectElement from 'app/components/main/SelectElement';
import SelectCountryElement from 'app/components/main/SelectCountryElement';
import SelectDOB from 'app/components/main/SelectDOB';
import Component from 'common/system/react/BackboneComponent';
import backofficeService from 'backoffice/service/BackofficeRestfulService';
import {classNames as cx} from 'common/util/ReactUtil.js';
import { alphaNumeric2, alphaNumeric3 } from 'common/util/RegEx';

class RegisterPersonalView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			spinnerState: 'none',
			serverErrors: [],
			showingMoreTerms: false,
			errorMessageCountry: '',
			errorType: '',
			termsAccepted: this.props.model.get('termsAccepted'),
			gender: this.props.model.get('gender'),
			showAddressLookup :false,
			addressLookupSelected :false,
			addressReadOnly :false
		};
	}

	/**
	 * @param route
	 */
	onNavigate(route) {
		App.navigate(route);
	}

	/**
	 *
	 */
	onSubmit() {
		const country = this.props.model.get('brandId') !== 1 ? 'GB' : 'MX';
		if (this.props.model.get('country') != country){

			if(this.props.model.get('brandId') === 3){
				this.setState({
					errorMessageCountry: 'Only users from the UK can register on Redzone',
					errorType: 'country'
				});
			}else{
				this.setState({
					errorMessageCountry: 'Only users from the UK can register on Bet on Brazil',
					errorType: 'country'
				});
			}

			return;
		};

		if(!this.props.model.get('termsAccepted')){
			this.setState({serverErrors: [ 'Terms must be selected'], spinnerState: 'none'});
			return;
		}
		//this.setState({serverErrors: [], spinnerState: 'inline-block'}, () => {
			var personalFields = this.props.model.buildPersonalValidationRequest();
		backofficeService.validateRegistrationFields(JSON.stringify(personalFields), this.props.model.get('localeVal'))
				.then(this.onServerValidationCallSuccess.bind(this))
				.catch(this.onRegisterFailure.bind(this));
		//});

		//this.props.onNext();
	}

	onPostcodeLookup() {
		const that = this; //this.props.model.get('nationality')
		backofficeService.getAddressesByPostcode( 'GB', this.props.model.get('addressLookupPostcode'))
			.then((resp) => {
				if(resp && resp.length > 0){
					that.props.model.setPostcodeLookupAddressArray(resp);
					that.setAddressLookupState(true , '');
				}else{
					that.props.model.resetPostcodeLookAddress();
					that.setAddressLookupState(false , 'Error has occurred on lookup - postcode not found');
				}
			})
			.catch((resp) => {
				that.setAddressLookupState(false , resp.Error ? resp.Error.value : 'Error has occurred on lookup - postcode not found');
			})
	}

	setAddressLookupState(showAddressLookup , error) {
		this.refs.addressLookupPostcode.setManualError(error);
		this.setState({showAddressLookup : showAddressLookup ,addressLookupSelected:false ,addressReadOnly : true} );
	}


	onAddressLookupSelected(e) {
		if(e.target.value === 'MANUAL') {
			this.onEnterAddressManually();
		}else{
			this.props.model.setPostcodeLookAddress(e.target.value);
			this.setState({showAddressLookup : false ,addressLookupSelected:true ,addressReadOnly : true } );
		}
		this.forceUpdate();
	}

	onEnterAddressManually() {
		this.props.model.resetPostcodeLookAddress();
		this.setState({showAddressLookup : false ,addressLookupSelected:true ,addressReadOnly : false } );
	}

	onChange(e){
		const gender = (this.refs.female.checked) ? 'female' : 'male';
		this.props.model.set('gender', gender);
		this.setState({gender: gender});
	}

	onInputChange(comp, len, val){
		let modelValue;
		len = Number(len);
		if(Number(val.length) >= len){
			switch(comp){
				case "forename":
					modelValue = this.props.model.get('forename').substring(0,len);
					this.props.model.set('forename', modelValue);
					break;
				case "surname":
					modelValue = this.props.model.get('surname').substring(0,len);
					this.props.model.set('surname', modelValue);
					break;
				case "houseNo":
					modelValue = this.props.model.get('houseNo').substring(0,len);
					this.props.model.set('houseNo', modelValue);
					break;
				case "postcode":
					modelValue = this.props.model.get('postcode').substring(0,len);
					this.props.model.set('postcode', modelValue);
					break;
				case "street":
					modelValue = this.props.model.get('street').substring(0,len);
					this.props.model.set('street', modelValue);
					break;
				case "colony":
					modelValue = this.props.model.get('colony').substring(0,len);
					this.props.model.set('colony', modelValue);
					break;
				case "city":
					modelValue = this.props.model.get('city').substring(0,len);
					this.props.model.set('city', modelValue);
					break;
				case "state":
					modelValue = this.props.model.get('stateVal').substring(0,len);
					this.props.model.set('stateVal', modelValue);
					break;
				case "addressLookupPostcode":
					modelValue = this.props.model.get('addressLookupPostcode').substring(0,len);
					this.props.model.set('addressLookupPostcode', modelValue);
					break;
				default:
			}
		}
	}

	onChangeTerm(e){
		this.props.model.set('termsAccepted', this.refs.terms.checked);
		this.setState({spinnerState: 'none', serverErrors: [], termsAccepted: !this.state.termsAccepted});
	}

	/**
	 * @param resp.
	 */
	onServerValidationCallSuccess(resp){
		var validationResult = resp;

		if (validationResult.valid){
			this.registerPunter();
		} else {
			if(validationResult.errorFields && validationResult.errorFields[0].errorMessage){
				const error = validationResult.errorFields[0];
				const errorMessage = this.getErrorMessageByKey(error.errorType) || decodeURIComponent(escape(error.errorMessage));
				this.setState({serverErrors: errorMessage, spinnerState:'none'});
			}
		}
	}

	/**
	 *
	 */
	registerPunter(){
		var regJson = this.props.model.buildRegistrationMsg();
		backofficeService.register(JSON.stringify(regJson), true, this.props.model.get('localeVal'))
			.then(this.onRegisterSuccess.bind(this))
			.catch(this.onRegisterFailure.bind(this));
	}

	/**
	 * On success, navigate to previous confirmation page
	 */
	onRegisterSuccess(resp) {
		if (resp.status == "SUCCESS") {

			//confirmation on Baja
			/*if (this.props.model.get('brandId') === 1) {
				this.props.model.set('accountId', resp.accountId);
				App.navigate('register/confirm');
			}
			else {
				App.navigate('register/success');
			}*/
			this.props.onNext();
		} else {
			this.onRegisterFailure(resp);
		}
	}

	/**
	 * @param evt
	 */
	onRegisterFailure(resp){
		var error = 'Registration was unsuccessful, your details could not be verified. Please enter correct details or contact customer service for assistance.';
		if ((arguments.length)) {
			var arg = arguments[0];
			if (arg && arg.Error) {
				var errorMsg = arg.Error.value.split('...');
				if(arg.Error.code === 'error.registration.contact.invalid'){
					//error = App.Intl('registration.server_error.generic');
				}else if (errorMsg.length > 1 && errorMsg[1] != "") {
					error = errorMsg[1];
				} else {
					error = errorMsg[0];
				}
			}
		}
		this.setState({serverErrors: error ,spinnerState: 'none'});
	}


	/**
	 **
	 */
	componentDidMount(){
		super.componentDidMount();
		var that = this;
		this.props.model.on('change', () => {
			that.forceUpdate();
		});
	}

	validateRule(){
		if(document.activeElement !== this.refs.submit) return true;
		if(!_.isUndefined(this.refs.forename) && !(this.refs.forename.state.isValid && this.refs.forename.state.validated)){
			this.refs.forename.refs.input.focus();
		}else if(!_.isUndefined(this.refs.surname) && !(this.refs.surname.state.isValid && this.refs.surname.state.validated)){
			this.refs.surname.refs.input.focus();
		}else if(!_.isUndefined(this.refs.houseNo) && !(this.refs.houseNo.state.isValid && this.refs.houseNo.state.validated)){
			this.refs.houseNo.refs.input.focus();
		}else if(!_.isUndefined(this.refs.street) && !(this.refs.street.state.isValid && this.refs.street.state.validated)) {
			this.refs.street.refs.input.focus();
		}else if(!_.isUndefined(this.refs.colony) && !(this.refs.colony.state.isValid && this.refs.colony.state.validated)){
			this.refs.colony.refs.input.focus();
		}else if(!_.isUndefined(this.refs.city) && !(this.refs.city.state.isValid && this.refs.city.state.validated)){
			this.refs.city.refs.input.focus();
		}else if(!_.isUndefined(this.refs.state) && !(this.refs.state.state.isValid && this.refs.state.state.validated)){
			this.refs.state.refs.input.focus();
		}else if(!_.isUndefined(this.refs.postcode) && !(this.refs.postcode.state.isValid && this.refs.postcode.state.validated)){
			this.refs.postcode.refs.input.focus();
		}else if(!_.isUndefined(this.refs.placeOfBirth) && !(this.refs.placeOfBirth.state.isValid && this.refs.placeOfBirth.state.validated)){
			this.refs.placeOfBirth.refs.input.focus();
		}else if(!_.isUndefined(this.refs.birthName) && !(this.refs.birthName.state.isValid && this.refs.birthName.state.validated)) {
			this.refs.birthName.refs.input.focus();
		}else if(!_.isUndefined(this.refs.partnerCode) && !(this.refs.partnerCode.state.isValid && this.refs.partnerCode.state.validated)){
			this.refs.partnerCode.refs.input.focus();
		}
		return true;
	}

	validators = {
		forename: [{ 'isLength:2': 'Please enter a valid first name' },
			{
				rule: val => { return alphaNumeric2.test(val) },
				error: 'Please enter a valid first name'
			},{rule: ::this.validateRule}],
		surname: [{ 'isLength:2': 'Please enter a valid last name' },
			{
				rule: val => { return alphaNumeric2.test(val); },
				error: 'Please enter a valid last name'
			},{rule: ::this.validateRule}],
		street: [{ 'isLength:2': 'There is something wrong with the street you have entered. Try again, please.' },
			{
				rule: val => { return alphaNumeric3.test(val); },
				error: 'Please enter a valid street'
			},{rule: ::this.validateRule}],
		state: [{ 'isLength:2': 'State missing.' },
			{
				rule: val => { return alphaNumeric3.test(val); },
				error: 'Please enter a valid Locality/Province'
			},{rule: ::this.validateRule}],
		colony: [{ 'isLength:2': 'There is something wrong with the colony / county you have entered. Try again, please.' },
			{
				rule: val => { return alphaNumeric3.test(val); },
				error: 'There is something wrong with the colony / county you have entered. Try again, please.'
			},{rule: ::this.validateRule}],
		houseNo: [
			{ 'isLength:1': 'Please enter your house number and street.' },
			{
				rule: val => { return alphaNumeric3.test(val); },
				error: 'Please enter a valid house number and street.'
			},{rule: ::this.validateRule}],
		postcode: [{ 'isLength:2': 'Please enter a valid post code.' },
			{
				rule: val => { return alphaNumeric2.test(val); },
				error: 'Please enter a valid post code.'
			},{rule: ::this.validateRule}],
		city: [{ 'isLength:2': 'City missing.' },
			{
				rule: val => { return alphaNumeric3.test(val); },
				error: 'Please enter a valid city'
			},{rule: ::this.validateRule}],
		placeOfBirth: [{ 'isLength:2': 'Please enter your place of birth.' },{rule: ::this.validateRule}],
		birthName: [{ 'isLength:2': 'Please enter your birth name' },{rule: ::this.validateRule}],
		parterCode: [{ 'isLength:2': 'Please enter a valid partner code' },{rule: ::this.validateRule}],
		terms: [
			{ rule: val => !!val === true, error: 'Terms must be selected' }
		],
	};

	getTermsText () {
		const termsText = {
			accept: 			'I accept the',
			t_and_cs: 			'Terms and Conditions',
			and_the: 			'and the',
			dpp: 				'Data Protection Policy',
			age_identity: 		'I also accept that my age and identity',
			will_be_verified: 	'will be verified',
			clause: 			"* During our contractual relationship we will from time to time inform you via E-Mail about similar products and services. You can unsubscribe from this information service at any time in 'My account/Settings'."
		};

		let termsIconClass = cx(this.state.showingMoreTerms ? 'icon-chevron-down' : 'icon-chevron-right');

		const { accept, t_and_cs, and_the, dpp, age_identity, will_be_verified, clause } = termsText;

		return (
				<div className="u-spacing--vertical--lg">
					<br/>
					<input id="check1" type="checkbox" ref="terms" name="check" checked={this.state.termsAccepted} onChange={this.onChangeTerm.bind(this)}/>
					<label htmlFor="check1" className="big">
						<div>
							{accept} <a href={ "/" + App.Globals.lang + '/terms'} target="_blank">{t_and_cs}</a> {and_the} <a href={ "/" + App.Globals.lang + '/policy'} target="_blank">{dpp}</a>. {age_identity} {will_be_verified}.*
						</div>
					</label>
					<p>{clause}</p>
					<div style={{cursor: 'pointer'}} onClick={this.handleWhyNeedInfoClick.bind(this)}><i className={termsIconClass}></i>Why do we need this information?</div>
					<p style={{display: this.state.showingMoreTerms ? 'block' : 'none'}}>Not everyone is granted a gaming license. In order to be licensed by the state, a lot of requirements have to be met. One of those requirements is being able to identify and contact every single player.

						We only ask our customers for information we really need and we promise to respect everyone’s privacy.

						The license terms ensure that customers can rest assured that we will handle their data carefully and that we will communicate openly and transparently.
					</p>
				</div>
		)
	}

	getErrorMessageByKey(errorKey){
		const age = this.props.model.get('minimumBettingAge') || 18;
		switch(errorKey){
			case 'error.registration.birthday.not.old.enough':
				return `You need to be {age} years or over to register on the Bet on Brazil sportsbook.`;
				break;
			default:
				return null;
				break;
		}
	}

	handleWhyNeedInfoClick() {
		this.setState({showingMoreTerms: !this.state.showingMoreTerms});
	}

	translatePath(page){
		//return App.Intl('route.register.'+page,  { lang: App.Globals.lang });
	}

	renderAddressLookup() {
		return ([
			(<div className="label-col">
				<label>Address Lookup</label>
			</div>),

			(<div className="form-section address-lookup">

				<FormInputWithIconbox ref="addressLookupPostcode"
									  name="addressLookupPostcode"
									  focus={false}
									  valueLink={this.bindTo(this.props.model, 'addressLookupPostcode')}
									  placeHolder='Enter Post Code'
									  tooltip='Please enter your post code here.'
									  label={""}
									  tooltipHoverEl
									  errorAsTooltipOnMobile
									  blockLabel
									  tooltipMobileCloseBtn
									  tooltipMobileNavigate
									  tooltipLink={null}
									  icon="query-icon"
									  onChange={this.onInputChange.bind(this, 'addressLookupPostcode', 30)}
				/>
				<button className="btn red filled" type="button"
						href="javascript:void(0)"
						onClick={this.onPostcodeLookup.bind(this)}>
					Find Address
				</button>
			</div>),
			!this.state.showAddressLookup && this.state.addressReadOnly &&(
			<div className="form-section address-lookup">
				<br/>
				<button className="btn green filled " type="button"
					href="javascript:void(0)"
					onClick={this.onEnterAddressManually.bind(this)}>
					Enter my address manually
				</button>
			</div>
			),
			this.state.showAddressLookup && (
				<div className="form-section address-select"><br/>
					<select onChange={this.onAddressLookupSelected.bind(this)} defaultValue={'DEFAULT'}>
						<option value="DEFAULT">Please Select an Address</option>
						{_.map(this.props.model.get('postcodeLookupAddressArray'), this.renderAddressOptions)}
						<option value="MANUAL">Enter my address manually</option>
					</select>
				</div>
			)
		])
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const expanded = true;//!!window.location.pathname.match(`/${this.translatePath('personal')}`)
		const fade = this.state.spinnerState === 'inline-block' ? 'fade' : '';
		const collapse = expanded ? '' : 'collapse';
		const errors = this.renderErrorBox();
		const addressLookupEnabled = false;//this.props.model.get('addressLookupEnabled');
		let addressFieldsDisplayed;
		if(!addressLookupEnabled || this.state.addressLookupSelected){//allow display of address fields if 192 not available , or they have selected an address, or chosen manual input
			addressFieldsDisplayed = true;
		}else{
			addressFieldsDisplayed = false;
		}

		return (
			<div className="grid">
			<h1><b>PERSONAL DATA</b></h1>
			<div ref="registration-step" className={cx('number-steps', 'c-register-view--personal', collapse, 'col-3_lg-4_md-6_xs-12')}>

				<div className={fade}>

					<Form onSubmit={::this.onSubmit}>
								<FormInputWithIconbox ref="forename"
												  name="forename"
												  focus={false}
												  valueLink={this.bindTo(this.props.model, 'forename')}
												  placeholder='Enter first name'
												  tooltip='Please enter your first name here, without any errors (important when we need verification).'
												  rules={this.validators.forename}
												  label='Enter first name'
												  tooltipHoverEl
												  errorAsTooltipOnMobile
												  blockLabel
												  tooltipMobileCloseBtn
												  tooltipMobileNavigate
												  tooltipLink={null}
												  icon="query-icon" onChange={this.onInputChange.bind(this, 'forename', 29)}
								/>
						<div className="form-section">
									<FormInputWithIconbox ref="surname"
													  name="surname"
													  focus={false}
													  valueLink={this.bindTo(this.props.model, 'surname')}
											   			placeholder='Enter last name'
													  tooltip='Please enter your last name here, without any errors (important when we need verification).'
													  rules={this.validators.surname}
													  label='Enter last name'
													  tooltipHoverEl
													  errorAsTooltipOnMobile
													  blockLabel
													  tooltipMobileCloseBtn
													  tooltipMobileNavigate
													  tooltipLink={null}
													  icon="query-icon" onChange={this.onInputChange.bind(this, 'surname', 29)}
									/>
							{ this.props.model.get('brandId') != 1 && <label>* Please note that correct details are required, or the registration will be rejected</label>}
						</div>
						<br/>
							<SelectDOB ref="selectDOB" model={this.props.model} validate={ this.props.model.get('brandId') !== 1 } />
						<br/>
							<div className="form-section gender">
								<table>
									<tr>
										<td width="205"><label>Gender</label></td>
										<td><input
											type="radio"
											ref="male"
											value='male'
											name="gender"
											id="male"
											checked={this.state.gender === 'male'}
											onChange={this.onChange.bind(this)}
										/><label htmlFor="male"><span>Male</span></label></td>
										<td><input
											type="radio"
											ref="female"
											name="gender"
											id="female"
											value="female"
											checked={this.state.gender === 'female'}
											onChange={this.onChange.bind(this)}
										/><label htmlFor="female"><span>Female</span></label></td>
									</tr>
								</table>

 							</div><br/>

							{addressLookupEnabled && (
								this.renderAddressLookup()
							)}

							{addressFieldsDisplayed &&(
								<FormInputWithIconbox ref="houseNo"
									name="houseNo"
									focus={false}
									valueLink={this.bindTo(this.props.model, 'houseNo')}
										   placeholder='House Number'
									tooltip='Please enter your house number here.'
									rules={this.validators.houseNo}
									label='Number'
									tooltipHoverEl
									errorAsTooltipOnMobile
									blockLabel
									tooltipMobileCloseBtn
									tooltipMobileNavigate
									readOnly={this.state.addressReadOnly}
									tooltipLink={null}
									icon="query-icon" onChange={this.onInputChange.bind(this, 'houseNo', 45)}
								/>
							)}


							{ this.props.model.get('brandId') != 1 && addressFieldsDisplayed &&
								<FormInputWithIconbox ref="street"
													  name="street"
													  focus={false}
													  valueLink={this.bindTo(this.props.model, 'street')}
										   placeholder='Enter Street'
													  tooltip='Please enter the street of your registered address here.'
													  rules={this.validators.street}
													  label='Street'
													  tooltipHoverEl
													  errorAsTooltipOnMobile
													  blockLabel
													  tooltipMobileCloseBtn
													  tooltipMobileNavigate
													  tooltipLink={null}
													  readOnly={this.state.addressReadOnly}
													  icon="query-icon" onChange={this.onInputChange.bind(this, 'street', 45)}
								/>
							}

							{ this.props.model.get('brandId') === 1 && addressFieldsDisplayed &&
								<FormInputWithIconbox ref="colony"
													  name="colony"
													  focus={false}
													  valueLink={this.bindTo(this.props.model, 'colony')}
										              placeholder='Enter Colony / County'
													  tooltip=''
													  rules={this.validators.colony}
													  label='Colony / County'
													  tooltipHoverEl
													  errorAsTooltipOnMobile
													  blockLabel
													  tooltipMobileCloseBtn
													  tooltipMobileNavigate
													  tooltipLink={null}
													  readOnly={this.state.addressReadOnly}
													  icon="query-icon" onChange={this.onInputChange.bind(this, 'colony', 45)}
								/>
							}

							{addressFieldsDisplayed &&

								<FormInputWithIconbox ref="city"
												  name="city"
												  focus={false}
												  valueLink={this.bindTo(this.props.model, 'city')}
										   placeholder='Enter city'
												  tooltip='Please enter the city of your registered address here.'
												  rules={this.validators.city}
												  label='City'
												  tooltipHoverEl
												  errorAsTooltipOnMobile
												  blockLabel
												  tooltipMobileCloseBtn
												  tooltipMobileNavigate
												  tooltipLink={null}
				    							  readOnly={this.state.addressReadOnly}
												  icon="query-icon" onChange={this.onInputChange.bind(this, 'city', 45)}
								/>
							}
							{ this.props.model.get('brandId') === 1 && addressFieldsDisplayed &&
									<FormInputWithIconbox ref="state"
														  name="state"
														  focus={false}
														  valueLink={this.bindTo(this.props.model, 'stateVal')}
											              placeholder='Enter State'
														  tooltip='Please enter the state of your registered address here.'
														  rules={this.validators.state}
														  label='State'
														  tooltipHoverEl
														  errorAsTooltipOnMobile
														  blockLabel
														  tooltipMobileCloseBtn
														  tooltipMobileNavigate
														  tooltipLink={null}
														  icon="query-icon"
										                  readOnly={this.state.addressReadOnly}
														  onChange={this.onInputChange.bind(this, 'state', 45)}
									/>
							}

						{addressFieldsDisplayed &&
						<FormInputWithIconbox ref="postcode"
											  name="postcode"
											  focus={false}
											  valueLink={this.bindTo(this.props.model, 'postcode')}
											  placeholder='Enter Post Code'
											  tooltip='Please enter your post code here.'
											  rules={this.validators.postcode}
											  label='Postal Code'
											  tooltipHoverEl
											  errorAsTooltipOnMobile
											  blockLabel
											  tooltipMobileCloseBtn
											  tooltipMobileNavigate
											  tooltipLink={null}
											  readOnly={this.state.addressReadOnly}
											  icon="query-icon" onChange={this.onInputChange.bind(this, 'postcode', 30)}
						/>
						}


							{addressFieldsDisplayed &&
						<SelectCountryElement class="country" ref="country" style={{height: '30'}}
											  label='Country'
											  showError={this.state.errorType === 'country'}
											  errorMsg={this.state.errorMessageCountry}
											  hideError={false}
											  disabled={this.state.addressReadOnly}
											  valueLink={this.bindTo(this.props.model, 'country')}>
							{_.map(this.props.model.get('countries'), this.renderCountries)}
						</SelectCountryElement>
						}
						{this.props.model.get('brandId') !== 1 && addressFieldsDisplayed &&<SelectElement class="currency" ref="currency"
										label='Currency'
										hideError={false}
										disabled={this.state.addressReadOnly}
										valueLink={this.bindTo(this.props.model, 'currency')}>
							{_.map(this.props.model.get('currencies'), this.renderCurrencies)}
						</SelectElement>}

						{this.props.model.get('country' ) === "DE" && addressFieldsDisplayed && (

							<FormInputWithIconbox ref="placeOfBirth"
												  name="placeOfBirth"
												  focus={false}
												  valueLink={this.bindTo(this.props.model, 'placeOfBirth')}
									   placeholder='Please enter your place of birth'
												  tooltip='Please enter your place of birth'
												  rules={this.validators.placeOfBirth}
												  label='Place of Birth'
												  tooltipHoverEl
												  errorAsTooltipOnMobile
												  blockLabel
												  tooltipMobileCloseBtn
												  tooltipMobileNavigate
												  tooltipLink={null}
												  icon="query-icon"
								/>

							)}

							{this.props.model.get('isSchleswigHolstein') && addressFieldsDisplayed &&(
								<FormInputWithIconbox ref="birthName"
												  name="birthName"
												  focus={false}
												  valueLink={this.bindTo(this.props.model, 'birthName')}
									   placeholder='Please enter your birth name'
												  tooltip='Please enter your birth name'
												  rules={this.validators.birthName}
												  label='Birth Name'
												  tooltipHoverEl
												  errorAsTooltipOnMobile
												  blockLabel
												  tooltipMobileCloseBtn
												  tooltipMobileNavigate
												  readOnly={this.state.addressReadOnly}
												  tooltipLink={null}
												  icon="query-icon"
								/>
							)}

							{this.props.model.get('country' ) == "DE" && addressFieldsDisplayed &&(
									<SelectElement class="country" ref="nationality" style={{height: '30'}}
												   label='Nationality'
												   valueLink={this.bindTo(this.props.model, 'nationality')}>
										{_.map(this.props.model.get('countries'), this.renderCountries)}
									</SelectElement>
							)}

						{this.getTermsText()}
						{this.props.model.get('brandId') === 1 && addressFieldsDisplayed &&
						<div className="u-spacing--vertical--lg">
							<FormInputWithIconbox ref="partnerCode"
												  name="partnerCode"
												  focus={false}
												  valueLink={this.bindTo(this.props.model, 'partnerCode')}
									   placeholder='Partner Code (opt)'
												  tooltip="A partner code could have been given to you by your shop owner or another partner. Please leave blank if you don't have a code."
												  rules={this.validators.parterCode}
												  label='Partner Code'
												  tooltipHoverEl
												  errorAsTooltipOnMobile
												  blockLabel
												  tooltipMobileCloseBtn
												  tooltipMobileNavigate
												  tooltipLink={null}
												  icon="query-icon"
												  readOnly={this.state.addressReadOnly}
												  required={false}
							/>
						</div>}


							<div className="form-section grid">
								<br/>
								<button className="btn blue filled"
									 type="button"
									 href="javascript:void(0)"
									 onClick={::this.props.onBack}
								>
									Back
								</button>
								<button ref="submit" className="btn green filled" type="submit">
									Register
								</button>

								<div className="spinner"
									 style={{display: this.state.spinnerState}}>
									  <div className="double-bounce1"></div>
									  <div className="double-bounce2"></div>
								</div>


								<div className="error-box">
									{errors}
								</div>
							</div>
					</Form>
				</div>
			</div>
			</div>
		);
	}

	/**
	 * @returns {XML}
	 */
	renderErrorBox() {
		return (
			<p dangerouslySetInnerHTML={{__html: this.state.serverErrors}}></p>
		);
	}

	/**
	 * code2: "HU"
	 * code3: "HUN"
	 * name: "HUNGARY"
	 */
	renderCountries(country, index) {
		return <option key={index} value={country.code2}>{_.titleize(country.name)}</option>;
	}

	/**
	 * @param currency
	 * @param index
	 * @returns {XML}
	 */
	renderCurrencies(currency, index){
		return <option key={index} value={currency}>{currency}</option>;
	}

	/**
	 * code2: "HU"
	 * code3: "HUN"
	 * name: "HUNGARY"
	 */
	renderAddressOptions(address, index) {
		const houseNo = !_.isUndefined(address.address1) && address.address1 || '';
		const flat = !_.isUndefined(address.address4) && address.address4 || '';
		const flatAndHouseNo = (!!flat ? `${flat}, ${houseNo}` : houseNo) || '';
		const street = !_.isUndefined(address.address2) && address.address2 || '';

		return <option key={index} value={index}>{ flatAndHouseNo + ' ' + street }</option>;
	}


}

export default RegisterPersonalView;

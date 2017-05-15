import Form from 'app/view/register/components/formElements/forms/Form';
import Component from 'common/system/react/BackboneComponent';
import {getIovationBlackbox} from 'common/util/IovationUtil.js';
import {password2, number, username, mobilePhone, mobilePhoneBaja} from 'common/util/RegEx';
import FormInputWithIconbox from 'app/view/register/components/formElements/forms/FormInputWithIconbox.jsx';
import {classNames as cx} from 'common/util/ReactUtil.js';
import './RegisterView.scss';
import backofficeService from 'backoffice/service/BackofficeRestfulService';



export default class RegisterProfileView  extends Component {
	constructor(props) {
		super(props);
		this.state = {
			spinnerState: 'none',
			serverErrors: [],
			showPasswordTooltip: false
		};
	}

	onBrandChange(e){
		this.props.model.set('brandId', Number(e.target.value));
		this.props.model.setLocaleValue();
	}

	/**
	 * Handles 'Your Profile' click to return to this panel
	 * @param route
	 */
	onNavigate(route) {
		App.navigate(route);
	}

	/**
	 * @param e
	 */
	onSubmit() {
		//this.setState({serverErrors: [], spinnerState: 'inline-block'}, () => {
			var profileFields = this.props.model.buildProfileValidationRequest();
			backofficeService.validateRegistrationFields(JSON.stringify(profileFields), this.props.model.get('localeVal'))
				.then(this.onServerValidationCallSuccess.bind(this))
				.catch(this.onServerValidationCallFail.bind(this));
		//});

		//this.props.onNext();
	}

	/**
	 * Handles success from the server
	 * @param resp
	 */
	onServerValidationCallSuccess(resp){

		if (resp.valid) {
			// This attempts to set the 'blackbox' property in the passed model
			// to the value retrieved from Iovation
			getIovationBlackbox(this.props.model);
			//App.navigate('register/personal');
			this.props.onNext();
			return;
		}

		var errorKey, error = {};

		if(resp.errorFields){
			errorKey = resp.errorFields[0].errorType
		}

		error.errorMessage = this.getErrorMessageByKey(errorKey);

		if(!!error.errorMessage) {
			this.setState({
				serverErrors: [error],
				spinnerState: 'none'
			});
		} else {
			this.setState({
				spinnerState: 'none'
			});
		}
	}

	getErrorMessageByKey(errorKey){
		console.log(errorKey);
		switch(errorKey){
			case 'error.registration.email.is.not.valid':
				return "Unfortunately, there is an error with the email address provided"
				break;
			case 'error.registration.email.duplicate':
				return 'This email address already exists in our system.';
				break;
			case 'error.registration.illegal.username.chars':
				return 'The username contains invalid characters.';
				break;
			case 'error.registration.username.already.exist':
				return 'Your Desired Username Already Exists. Please choose another.';
				break;
			case 'error.registration.duplicate.account':
				return "Your account already exists."; // changed login link
				break;
			case 'error.registration.password.too.short':
				return 'Password too short';
				break;
			case 'error.registration.pwd.not.secure' :
				return 'Password not secure';
				break;
			case 'error.registration.cellphone.number.invalid' :
				return 'Not a valid phone number';
				break;
			case 'error.registration.cellphone.number.already.exist' :
				return 'The phone number entered already exists.';
				break;
			default:
				break;
		}
	}

	/**
	 * Handles errors from the server
	 * @param evt
	 */
	onServerValidationCallFail(evt){
		let error = {errorMessage:''};
		error.errorMessage == 'Oops! There was an issue with registration!';

		if ((arguments.length)){
			var arg = arguments[0];
			var errorMsg = arg.Error && arg.Error.value.split('...');

			if(errorMsg && errorMsg.length > 1){
				error.errorMessage = errorMsg[1];
			}else if(errorMsg){
				error.errorMessage = errorMsg[0];
			}
		}

		this.setState({
			serverErrors: [error],
			spinnerState: 'none'
		});
	}


	validateRule(){
		if(document.activeElement !== this.refs.submit) return true;
		if(!(this.refs.email.state.isValid && this.refs.email.state.validated)){
			this.refs.email.refs.input.focus();
		}else if(!(this.refs.username.state.isValid && this.refs.username.state.validated)){
			this.refs.username.refs.input.focus();
		}else if(!(this.refs.password.state.isValid && this.refs.password.state.validated)){
			this.refs.password.refs.input.focus();
		}else if(!(this.refs.confirm.state.isValid && this.refs.confirm.state.validated)) {
			this.refs.confirm.refs.input.focus();
		}else if(!(this.refs.phone.state.isValid && this.refs.phone.state.validated)){
			this.refs.phone.refs.input.focus();
		}
		return true;
	}

	validators = {
		email: [
			{'isLength:1': 'Please provide a email address'},
			{'isEmail': 'Unfortunately, there is an error with the email address provided'},
			{rule: ::this.validateRule}
		],
		username: [
			{'isLength:1': 'Please provide a username'},
			{'isLength:4': 'Right, we feel that that user name is simply too short. 4 characters minimum, please.'},
			{'isLength:4:80': 'Right, we feel that that user name is simply too long. 80 characters maximum, please.'},
			{rule: val => username.test(val), error: 'Sorry! Your username is too wonky for our system. These characters only, please: a-z A-Z 0-9 _ . -'},
			{rule: ::this.validateRule}
		],
		password: [
			{'isLength:1': 'Please provide a password'},
			{rule: val => password2.test(val), error: 'Your password must between 8 and 20 characters with a combination of letters and digits.'},
			{rule: ::this.matchPasswords, error: "Password and Confirmation don't match"},
			{rule: ::this.notMatchUsername, error: 'Your password must contain a minimum of 8 characters with a combination of letters and digits and do not match your username.'},
			{rule: ::this.validateRule}
		],
		confirm: [
			{'isLength:1': 'Please enter a confirmation password'},
			{rule: val => password2.test(val), error: 'Your password must between 8 and 20 characters with a combination of letters and digits.'},
			{rule: ::this.matchPasswords, error: "Password and Confirmation don't match"},
			{rule: ::this.validateRule}
		],
		phone: this.props.model.get('brandId') === 2 ?
			[
				{'isLength:1': 'Please provide a phone number'},
				{rule: ::this.checkMobileNo, error: 'Not a valid phone number'},
				{rule: ::this.validateRule}
			] :
			[{rule: ::this.checkMobileNo, error: 'Not a valid phone number'},
				{rule: ::this.validateRule}
			]
	};

	/**
	 * ony run the validation of the mobile phone if the val has been entered
	 * @returns {boolean}
	 */
	checkMobileNo() {
		if(this.refs && this.refs.phone){
			const mobNo = this.refs.phone.value();
			if (_.isEmpty(mobNo)){
				return true;
			}else{
				return this.props.model.get('brandId') === 1 ? mobilePhoneBaja.test(mobNo) : mobilePhone.test(mobNo);
			}
		}else{
			return true;
		}
	}

	/**
	 * Matches the password and password confirmation fields
	 * @returns {boolean}
     */
	matchPasswords() {
		if(this.refs && this.refs.password && this.refs.confirm){
			const password = this.refs.password.value();
			const confirm  = this.refs.confirm.value();
			if (_.isEmpty(password) || _.isEmpty(confirm)) {
				return true;
			}
			return password === confirm;
		}
		return true;

	}

	/**
	 * Password must not match username
	 * @returns {boolean}
	 */
	notMatchUsername() {
		if(this.refs && this.refs.password && this.refs.confirm){
			const password = this.refs.password.value();
			const username = this.refs.username.value();
			if (_.isEmpty(password) || _.isEmpty(username)) {
				return true;
			}
			return password !== username;
		}
		return true;
	}

	/**
	 *
	 */
	onValidityChange() {
		this.refs.password.validate();
		this.refs.confirm.validate();
	}

	handlePasswordFocus () {
		return;
		this.setState({
			showPasswordTooltip: true
		})
	}

	handlePasswordBlur () {
		return;
		this.setState({
			showPasswordTooltip: false
		})
	}

	translatePath(page){
		//return App.Intl('route.register.'+page,  { lang: App.Globals.lang });
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const expanded = true;//!!window.location.pathname.match(this.translatePath('profile'));
		const collapse = expanded ? '' : 'collapse';
		let fade = this.state.spinnerState === 'inline-block' ? 'fade' : '';

		return (
			<div className="grid">
				<h1><b>YOUR PROFILE</b></h1>
				<br/>
				<div className={cx('c-register-view--profile ', collapse, 'col-3_lg-4_md-6_xs-12')}>
					<div className={fade}>
						<Form onSubmit={::this.onSubmit} >
							<FormInputWithIconbox ref="email"
												  name="email"
												  focus={false}
												  valueLink={this.bindTo(this.props.model, 'email')}
												  placeHolder='Enter email address'
												  rules={this.validators.email}
												  label='Email Address'
												  tooltipHoverEl
												  errorAsTooltipOnMobile
												  blockLabel
												  tooltipMobileCloseBtn
												  tooltipMobileNavigate
												  tooltipLink={null}
												  icon="query-icon"
							/>

							<FormInputWithIconbox ref="username"
												  name="username"
												  focus={false}
												  valueLink={this.bindTo(this.props.model, 'username')}
									   			  placeHolder='Enter desired username'
												  rules={this.validators.username}
												  label='Username'
												  tooltipHoverEl
												  errorAsTooltipOnMobile
												  blockLabel
												  tooltipMobileCloseBtn
												  tooltipMobileNavigate
												  tooltipLink={null}
												  icon="query-icon"
							/>


							<FormInputWithIconbox type="password"
												  ref="password"
												  name="password"
												  focus={false}
												  valueLink={this.bindTo(this.props.model, 'password')}
									   			  placeHolder='Enter password'
												  isPassword
												  rules={this.validators.password}
												  label='Password'
												  tooltipHoverEl
												  errorAsTooltipOnMobile
												  blockLabel
												  tooltipMobileCloseBtn
												  tooltipMobileNavigate
												  tooltipLink={null}
												  icon="query-icon"
												  showPasswordTooltip={this.state.showPasswordTooltip}
												  onFocus={this.handlePasswordFocus.bind(this)}
												  onBlur={this.handlePasswordBlur.bind(this)}
							/>
							<FormInputWithIconbox type="password"
												  ref="confirm"
												  name="confirm"
												  focus={false}
												  valueLink={this.bindTo(this.props.model, 'confirmPassword')}
									   			  placeHolder='Retype password'
												  rules={this.validators.confirm}
												  label='Confirm Password'
												  tooltipHoverEl
												  errorAsTooltipOnMobile
												  blockLabel
												  tooltipMobileCloseBtn
												  tooltipMobileNavigate
												  tooltipLink={null}
												  icon="query-icon"
							/>

							<FormInputWithIconbox ref="phone"
												  name="phone"
												  focus={false}
												  valueLink={this.bindTo(this.props.model, 'phone')}
									   			  placeHolder='Enter number'
												  rules={this.validators.phone}
												  label='Tel No.'
												  tooltipHoverEl
												  errorAsTooltipOnMobile
												  blockLabel
												  tooltipMobileCloseBtn
												  tooltipMobileNavigate
												  tooltipLink={null}
												  icon="query-icon"
							/>

							<table>
								<tr>
									<td width="205"><label>Brand</label></td>
									<td>
										<select defaultValue={this.props.model.get('brandId')} onChange={::this.onBrandChange} style={{height: '30'}}>
											{this.props.model.get('brandId') === 1 &&
												<option value="1">BAJA</option>
											}
											{this.props.model.get('brandId') !== 1 &&
												_.map([{name:'BOB', index:2}, {name:'REDZONE', index:3}], (val)=> <option value={val.index}>{val.name}</option>)
											}
										</select>
									</td>
								</tr>
							</table>

							<div className="form-section"><br/><br/>
								<button ref="submit" className="btn green filled" type="submit">
									Continue To Next Step
								</button>
								<div className="spinner" style={{display: this.state.spinnerState}}>
									<div className="double-bounce1"></div>
									<div className="double-bounce2"></div>
								</div>
							</div>

							<div className="error-box">
								{this.renderServerErrors()}
							</div>


						</Form>
					</div>
				</div>
			</div>
		);
	}

	renderServerErrors(){
		if (!this.state.serverErrors.length){
			return null;
		}

		return (
			<div>
				{_.map(this.state.serverErrors, this.renderOneServerError)}
			</div>
		);
	}

	/**
	 * @param error
	 * @param ref
	 * @returns {XML}
     */
	renderOneServerError(error, ref = 'serverError') {
		return (
			<p key={ref} ref={ref} style={{textAlign: 'justify'}}
			   dangerouslySetInnerHTML={{__html: _.titleize(error.errorMessage)}}>
			</p>
		);
	}
}

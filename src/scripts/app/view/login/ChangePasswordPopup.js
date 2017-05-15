import Component from 'common/system/react/BackboneComponent';
import TextInput from 'backoffice/components/elements/TextInput';
import Popup from 'common/view/popup/Popup';
import internalChangePassword from 'common/command/InternalChangePasswordCommand';
import internalLogin from 'common/command/InternalLoginCommand';

var ChangePasswordModel = Backbone.Model.extend({
	defaults: {username: '', oldPassword: '', newPassword:'', confirmPassword:''}
});

export default class ChangePasswordPopup extends Component {
	constructor(props) {
		super(props);
		this.model= new ChangePasswordModel();
		this.model.set({'username': this.props.username, 'oldPassword': this.props.oldPassword});
		this.state = {
			submitted: false,
			error: false,
			errorMsg: ''};
		_.bindAll(this,
			'onChangePasswordSuccess', 'onChangePasswordFailure',
			'onLoginSuccess', 'onLoginFailure');
	}

	/**
	 *
	 */
	onSubmit() {
		this.setState({submitted: true});
		if(_.isEmpty(this.model.get('username')) ||
			_.isEmpty(this.model.get('oldPassword')) ||
			_.isEmpty(this.model.get('newPassword')) ||
			_.isEmpty(this.model.get('confirmPassword'))){
			this.setState({
				submitted: false,
				error: true,
				errorMsg: "Please fill out all fields!"
			});
			return;
		}

		if (this.model.get('newPassword') !== this.model.get('confirmPassword')) {
			this.setState({
				submitted: false,
				error: true,
				errorMsg: "New Password and Confirm password don't match!"
			});
			return;
		}

		internalChangePassword(
			this.model.get('username'),
			this.model.get('oldPassword'),
			this.model.get('newPassword')
		)
			.then(this.onChangePasswordSuccess)
			.catch(this.onChangePasswordFailure);
	}

	onChangePasswordSuccess(response){
		if (response.Result.status !== "SUCCESS") {
			this.onChangePasswordFailure();
			return;
		}
		this.onClose();
		App.bus.trigger('popup:notification',{
			title: 'Confirmation',
			content: 'Password has been changed successfully!',
			autoDestruct: 2000});

		var username = this.model.get('username'),
			password = this.model.get('newPassword');
		internalLogin(username, password)
			.then(this.onLoginSuccess)
			.catch(this.onLoginFailure);

	}

	onChangePasswordFailure(error){
		var errorMessage = (error && _.has(error, 'Error')) ?
			error.Error.value : 'Internal error occurred!';
		this.setState({
			submitted: false,
			error: true,
			errorMsg: _.humanize(errorMessage)});
	}

	onLoginSuccess(response){
		const state = this.props.nextState || {};
		var nextPath = state.nextPathname;
		if (!nextPath || nextPath === '/login'){
			nextPath = '';
		}
		App.navigate(nextPath);
	}

	onLoginFailure(error){
	}

	onClose() {
		this.props.onClose();
	}

	onFieldChange(value){
		this.setState({
			error: false,
			errorMsg: ''
		});
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const buttons = [
			{title: 'Submit', cls: 'blue', handler: ::this.onSubmit},
			{title: 'Cancel', cls: 'blue', handler: ::this.onClose}
		];
		return (
			<Popup styles={this.props.styles}
				   title={this.props.title}
				   buttons={buttons}
				   onClose={::this.onClose}>

				<div className="vertical-form padding" style={{textAlign: 'center'}}>
					{this.renderTextInput('Username', 'username')}
					{this.renderTextInput('Old Password', 'oldPassword', 'password')}
					{this.renderTextInput('New Password', 'newPassword', 'password', true)}
					{this.renderTextInput('Confirm Password', 'confirmPassword', 'password')}
					<div className="error-box" style={{display: this.state.error ? 'table': 'none'}}>
						<p style={{}}>{this.state.errorMsg}</p>
					</div>
				</div>
			</Popup>
		);
	}

	/**
	 * @param label
	 * @param prop
	 * @param focus
	 * @returns {XML}
	 */
	renderTextInput(label, prop, type = 'text', focus = false, validate = true) {
		return (
			<TextInput ref={prop}
					   type={type}
					   label={label}
					   placeholder=""
					   focus={focus}
					   required="true"
					   validate={validate}
					   submitted={this.state.submitted}
					   valueLink={this.bindTo(this.model, prop)}
					   onChange={::this.onFieldChange}/>
		);
	}

};


ChangePasswordPopup.defaultProps = {
	title : 'Change Password',
	styles: {
		display: 'block',
		position: 'fixed',
		opacity: 1,
		zIndex: 11000,
		left: '50%',
		marginLeft: '-200px',
		top: '100px',
		width: '400px',
		minHeight: '300px'
	}
};

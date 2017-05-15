import TextInput from 'backoffice/components/elements/TextInput';
import internalLogin from 'common/command/InternalLoginCommand';
import ChangePasswordPopup from 'app/view/login/ChangePasswordPopup';

export default class LoginView extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.state = {error: false, errorMsg: ''};
		this.buttons = [
			{title: 'Submit', type: 'submit', cls: 'green', handler: this.onSubmit.bind(this)},
			{title: 'Clear', cls: 'blue', handler: this.onClear.bind(this)}
		];

		this.handleClose = this.onClose.bind(this);
		this.handleError = this.onError.bind(this);

		this.nextState = this.props.location.state;
	}

	/**
	 *
	 */
	onSubmit(e) {
		e.preventDefault();
		var username = this.refs.username.input.value,
			password = this.refs.password.input.value;
		internalLogin(username, password)
			.then(this.handleClose)
			.catch(this.handleError);
	}

	clearErrorMsg(){
		this.setState({
			error: false,
			errorMsg: ''
		});
	}

	/**
	 * On failure display the error
	 */
	onError(error) {
		var errorMessage = (error && _.has(error, 'Error')) ?
			error.Error.value : 'Oops! There was an issue logging in!';
		this.setState({error: true, errorMsg: _.humanize(errorMessage)});
		if(error && _.has(error, 'Error') && error.Error.code === 'PASSWORD_EXPIRED'){
			var username = this.refs.username.input.value,
				oldPassword = this.refs.password.input.value,
				nextState= this.nextState;
			App.bus.trigger('popup:view', ChangePasswordPopup, {username, oldPassword, nextState});
		}
	}

	/**
	 *
	 */
	onClose() {
		const state = this.nextState || {};
		var nextPath = state.nextPathname;

		if (!nextPath || nextPath === '/login'){
			nextPath = '';
		}

		App.navigate(nextPath);
	}

	/**
	 *
	 */
	onClear() {
		this.refs.username.input.value = '';
		this.refs.password.input.value = '';
	}

	/**
	 * @returns {XML}
	 */
	render() {
		var errorStyle = {color: 'red', textAlign: 'center', padding: 0};
		return (
			<div id="popupOverlay" className="loginPop">
				<div className="modal-window" style={this.props.styles}>
					<a href="" className="logo-sm-black"></a>
					<h2>Backoffice Login</h2>
					<form onSubmit={this.onSubmit.bind(this)}>
						<div className="vertical-form padding" style={{textAlign: 'center'}}>
							<TextInput ref="username"
									   label="Username"
									   placeholder=""
									   focus="true"
									   onChange={this.clearErrorMsg.bind(this)}/>
							<TextInput
								ref="password"
								label="Password"
								placeholder=""
								type="password"
								onChange={this.clearErrorMsg.bind(this)}/>
							<div className="error-box" style={{display: this.state.error ? 'table': 'none', width: '100%'}}>
								<p style={errorStyle}>{this.state.errorMsg}</p>
							</div>
						</div>

						<div className="table-padding" style={{textAlign: 'center'}}>
							<div className="inline-form-elements">
								<button className='btn green filled' type='submit' onClick={this.onSubmit.bind(this)}>Submit</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		);
	}
};

LoginView.defaultProps = {
	styles: {
		display: 'block',
		position: 'fixed',
		opacity: 1,
		zIndex: 11000,
		left: '50%',
		marginLeft: '-200px',
		marginTop: '-150px',
		top: '50%',
		width: '400px',
		minHeight: '200px'
	}
};


LoginView.contextTypes = {
	router: React.PropTypes.object
};

LoginView.displayName = 'LoginView';

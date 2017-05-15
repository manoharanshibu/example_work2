import Component from 'common/system/react/BackboneComponent';
import segmentModel from 'backoffice/model/CustomerSegmentModel';
import FormValidator from 'backoffice/components/FormValidator';
import TextInput from 'backoffice/components/elements/TextInput';
import CheckBox from 'backoffice/components/elements/CheckBox';
import Popup from 'common/view/popup/Popup';
import model from 'backoffice/model/InternalUserModel';
import UserSummary from 'backoffice/model/UserSummary';
import ComboBox from 'backoffice/components/elements/ComboBox';

export default class AddUserPopup extends Component {
	constructor(props) {
		super(props);
		this.validator = new FormValidator();
		this.state = {submitted: false, error: false, errorMsg: ''};
		this.props.model.clear();
		this.buttons = [
			{title: 'Save', cls: 'blue', handler: ::this.onSave},
			{title: 'Cancel', cls: 'blue', handler: ::this.onClose}
		];
	}

	/**
	 *
	 */
	onSave() {
		this.setState({submitted: true});
		if (this.validator.isValid()) {
			model.saveUser(this.props.model);

			this.props.onClose();
		}
	}


	/**
	 *
	 */
	onClose() {
		this.props.onClose();
	}

	onToggleStatus(){
		const blocked = this.props.model.get('blocked');
		this.props.model.set('blocked', !blocked);
	}

	notify(title='', content='', autoDestruct=2000){
		App.bus.trigger('popup:notification', {title, content, autoDestruct});
	}

	/**
	 *
	 */
	componentDidMount() {
		super.componentDidMount();
		// reset model to defaults
		if (!this.props.isEdit) {
			this.props.model.clear().set(this.props.model.defaults);

			this.validator.register(this.refs.password,
				{
					routine: /[A-Za-z0-9]+/,
					errorMsg: 'Password can\'t be empty'
				});
		}


		this.validator.register(this.refs.name,
			{
				routine: /.+/,
				errorMsg: 'Name can\'t be empty'
			});
		this.validator.register(this.refs.username,
			{
				routine: /[A-Za-z0-9]+/,
				errorMsg: 'Username can\'t be empty'
			});
		this.validator.register(this.refs.userGroupName,
			{
				routine: /.+/,
				errorMsg: 'User Group can\'t be empty'
			});


	}

	/**
	 * @returns {XML}
	 */
	render() {
		const {isEdit, title, styles, model} = this.props;
		const blocked = model.get('blocked');
		const colour = blocked ? 'green' : 'red';
		const status = blocked ? 'Locked' : 'Active';
		const buttonState = blocked ? 'Activate' : 'Lock';

		return (
			<Popup title={title || 'Create User'}
				buttons={this.buttons}
				onClose={::this.onClose}
				styles={styles}>

				<div className="vertical-form padding" style={{textAlign: 'center'}}>
					{this.renderTextInput('Name', 'name', true)}
					{this.renderTextInput('Username', 'username')}
					{!isEdit && <div style={{display: this.props.isEdit ? 'none': 'block', width: '100%'}}>
						{this.renderTextInput('Password', 'password')}
					</div>}
					<div className="inline-form-elements">
						{this.renderCheckBox('Administrator', 'administrator')}
						{this.renderCheckBox('Trader', 'trader')}
						{this.renderCheckBox('Hedger', 'hedger')}
						{this.renderCheckBox('Price Maintainer', 'priceMaintainer')}
						{this.renderCheckBox('Op Man', 'opMan')}
					</div>
					{this.renderUserGroupComboBox()}
					{isEdit &&
					<div className="inline-form-elements">
						<label>Status: {status}</label>
						<button className={`btn ${colour} small`}
								onClick={::this.onToggleStatus}>{buttonState} account</button>
					</div>}
					<div className="error-box" style={{display: this.state.error ? 'table': 'none'}}>
						<p>{this.state.errorMsg}</p>
					</div>
				</div>
			</Popup>
		);
	}

	/**
	 * @param label
	 * @param prop
	 * @param focus
	 * @param validate
	 * @returns {XML}
	 */
	renderTextInput(label, prop, focus = false, validate = true) {
		return (
			<TextInput ref={prop}
					   label={label}
					   placeholder=""
					   focus={focus}
					   required="true"
					   validate={validate}
					   submitted={this.state.submitted}
					   valueLink={this.bindTo(this.props.model, prop)}/>
		);
	}

	/**
	 * @param label
	 * @param prop
	 * @returns {XML}
	 */
	renderCheckBox(label, prop) {
		return (
			<CheckBox ref={prop} label={label} valueLink={this.bindTo(this.props.model, prop)}/>
		);
	}

	renderUserGroupComboBox(){

		return (<ComboBox label="UserGroup"  valueLink={this.bindTo(this.props.model, 'userGroupName')}  style={{width:'150px'}} labelStyle={{verticalAlign:'middle'}}>
			<option value="MANAGER">Manager</option>
			<option value="CUSTOMER_CARE_AGENT">Customer Care Agent</option>
			<option value="CUSTOMER_CARE_MANAGER">Customer Care Manager</option>
			<option value="PAYMENT_AGENT">Payment Agent</option>
			<option value="MARKETING">Marketing</option>
			<option value="BACKOFFICE">Backoffice</option>
			<option value="ADMINISTRATOR">Administrator</option>
			<option value="READ_ONLY">Read Only</option>
	    </ComboBox>);
	}

};

AddUserPopup.defaultProps = {
	model: new UserSummary(),
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

AddUserPopup.displayName = 'AddUserPopup';

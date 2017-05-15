import Component from 'common/system/react/BackboneComponent';
import segmentModel from 'backoffice/model/CustomerSegmentModel';
import FormValidator from 'backoffice/components/FormValidator';
import TextInput from 'backoffice/components/elements/TextInput';
import CheckBox from 'backoffice/components/elements/CheckBox';
import Popup from 'common/view/popup/Popup';
import model from 'backoffice/model/InternalUserModel';
import UserSummary from 'backoffice/model/UserSummary';
import ComboBox from 'backoffice/components/elements/ComboBox';

export default class EditPasswordPopup extends Component {
	constructor(props) {
		super(props);
		this.props.model.clear();
		this.props.model.set(this.props.user.attributes);
		this.validator = new FormValidator();
		this.state = {submitted: false, error: false, errorMsg: ''};
		this.buttons = [
			{title: 'Save', cls: 'blue', handler: this.onSave.bind(this)},
			{title: 'Cancel', cls: 'blue', handler: this.onClose.bind(this)}
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

	notify(title='', content='', autoDestruct=2000){
		App.bus.trigger('popup:notification', {title, content, autoDestruct});
	}

	/**
	 *
	 */
	componentDidMount() {
		var model;
		var that = this;
		super.componentDidMount();
		// reset model to defaults

		this.validator.register( this.refs.password,
			{
				routine: /[A-Za-z0-9]+/,
				errorMsg: 'Password can\'t be empty'
			});


	}

	/**
	 * @returns {XML}
	 */
	render() {


		return (
			<Popup title={this.props.title || 'Edit Password'}
				buttons={this.buttons}
				onClose={this.onClose.bind(this)}
				styles={this.props.styles}>

				<div className="vertical-form padding" style={{textAlign: 'center'}}>
					{this.renderTextInput('Password', 'password')}
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
	renderTextInput(label, prop, focus = false, validate=true) {
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



};



EditPasswordPopup.defaultProps = {
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

EditPasswordPopup.displayName = 'EditPasswordPopup';

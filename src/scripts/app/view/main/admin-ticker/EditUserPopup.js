import AddUserPopup from 'app/view/main/admin-ticker/AddUserPopup';
import FormValidator from 'backoffice/components/FormValidator';
import UserSummary from 'backoffice/model/UserSummary';

export default class EditUserPopup extends AddUserPopup {
	constructor(props) {
		super(props);
		this.props.model.clear();
		this.props.model.set(this.props.user.attributes);
		this.validator = new FormValidator();
		this.state = {submitted: false, error: false, errorMsg: ''};
		this.buttons = [
			{title: 'Save', cls: 'blue', handler: ::this.onSave},
			{title: 'Cancel', cls: 'blue', handler: ::this.onClose}
		];
	}
};


EditUserPopup.defaultProps = {
	isEdit: true,
	title: 'Edit User',
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


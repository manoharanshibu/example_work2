import AddAccountSegmentPopup from 'segment/account/AddAccountSegmentPopup';
import FormValidator from 'backoffice/components/FormValidator';

export default class EditAccountSegmentPopup extends AddAccountSegmentPopup {
	constructor(props) {
		super(props);
		this.props.model.update(this.props.data);
		this.validator = new FormValidator();
		this.state = {submitted: false, error: false, errorMsg: ''};
		this.buttons = [
			{title: 'Save', cls: 'blue', handler: this.onSave.bind(this)},
			{title: 'Cancel', cls: 'blue', handler: this.onClose.bind(this)}
		];
	}
};

var Model = Backbone.Model.extend({
	defaults: {
		id: 0,
		name: '',
		code: '',
		forBonus: true,
		forMatrix: true,
		forSettings: true,
		forLayout: true,
		forLimits: true,
		priority: 0,
		parentId: '',
		type: 'REGIONAL',
		channelId: '',
		brandId: ''
	},

	update(oldData) {
		var data = _.reduce(oldData, (memo, val, key) => {
			if (_.has(this.defaults, key)) {
				memo[key] = val;
			}
			return memo;
		}, {}, this);
		this.set(data);
	}
});

EditAccountSegmentPopup.defaultProps = {
	isEdit: true,
	title: 'Edit Account Segment',
	model: new Model(),
	styles: {
		display: 'block',
		position: 'fixed',
		opacity: 1,
		zIndex: 11000,
		left: '50%',
		marginLeft: '-240px',
		top: '100px',
		width: '480px',
		minHeight: '80%',
		overflow: 'auto'
	}
}


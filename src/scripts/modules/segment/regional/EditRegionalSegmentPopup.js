import AddRegionalSegmentPopup from 'segment/regional/AddRegionalSegmentPopup';
import FormValidator from 'backoffice/components/FormValidator';

export default class EditRegionalSegmentPopup extends AddRegionalSegmentPopup {
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
		postcodes: '',
		cities: '',
		countries: [],
		priority: 0,
		type: 'REGIONAL',
		channelId: '',
		brandId: ''
	},

	update(oldData) {
		var data = _.reduce(oldData, (memo, val, key) => {
			if (_.has(this.defaults, key)) {
				if (key == 'cities' || key == 'postcodes') {
					memo[key] = val.join(',');
				}
				else {
					memo[key] = val;
				}
			}
			return memo;
		}, {}, this);
		this.set(data);
	},

	toJSON() {
		this.attributes.postcodes = this.attributes.postcodes.split(',');
		this.attributes.cities = this.attributes.cities.split(',');
		return _.clone(this.attributes);
	}
});

EditRegionalSegmentPopup.defaultProps = {
	isEdit: true,
	title: 'Edit Regional Segment',
	model: new Model(),
	styles: {
		display: 'block',
		position: 'fixed',
		opacity: 1,
		zIndex: 11000,
		left: '50%',
		marginLeft: '-240px',
		top: '70px',
		bottom: '20px',
		width: '480px',
		minHeight: '80%',
		overflow: 'auto'
	}
}


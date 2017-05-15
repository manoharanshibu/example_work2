import Component from 'common/system/react/BackboneComponent';
import segmentModel from 'backoffice/model/CustomerSegmentModel';
import brandsModel from 'backoffice/model/BrandsModel';
import FormValidator from 'backoffice/components/FormValidator';
import TextInput from 'backoffice/components/elements/TextInput';
import CheckBox from 'backoffice/components/elements/CheckBox';
import ComboBox from 'backoffice/components/elements/ComboBox';
import Popup from 'common/view/popup/Popup';
import settings from 'backoffice/model/SportsbookSettingsModel';

export default class AddAccountSegmentPopup extends Component {
	constructor(props) {
		super(props);
		this.validator = new FormValidator();
		this.state = {submitted: false, error: false, errorMsg: '', options: [], optionValues: []};
		this.props.model.clear();
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
			var data = this.props.model.toJSON();

			if(data.channelId == '' && this.state.optionValues && this.state.optionValues[0]){
				data.channelId = this.state.optionValues[0].id;
			}

			if (this.props.isEdit){
				segmentModel.saveSegment(data, data.id);
			} else {
				segmentModel.addSegment(data);
			}
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
		super.componentDidMount();
		var model;

		if (!this.props.isEdit){
			// reset model to defaults
			model = this.props.model;
			model.clear().set(model.defaults);
		}
		this.validator.register( this.refs.name,
			{
				routine: /.+/,
				errorMsg: 'Name can\'t be empty'
			});
		this.validator.register( this.refs.code,
			{
				routine: /.+/,
				errorMsg: 'Code can\'t be empty'
			});
		/*this.validator.register( this.refs.region,
		 {
		 routine: /.+/,
		 errorMsg: 'Region can\'t be empty'
		 });*/
		this.setState({brands: brandsModel.get('brands')});

		var that = this;

		settings.loadChannels().then( (resp) => {
			that.setState({optionValues: resp});
			that.setState({options: resp.map((option, index) =>
			{
				return <option key={index} value={option.id}>{option.name}</option>
			})});
			that.render();
		});
	}

	/**
	 * @returns {XML}
	 */
	render() {
		return (
			<Popup title={this.props.title || 'Create Account Segment'}
				   buttons={this.buttons}
				   onSave={this.onSave.bind(this)}
				   onClose={this.onClose.bind(this)}
				   styles={this.props.styles}>

				<div className="vertical-form padding" style={{textAlign: 'center'}}>
					{this.renderTextInput('Name', 'name', true)}
					{this.renderTextInput('Code', 'code')}
					{this.renderTextInput('Priority', 'priority', false, "number")}
					<div className="inline-form-elements">
						{this.renderCheckBox('Bonus', 'forBonus')}
						{this.renderCheckBox('Matrix', 'forMatrix')}
						{this.renderCheckBox('Settings', 'forSettings')}
						{this.renderCheckBox('Layout', 'forLayout')}
						{this.renderCheckBox('forLimits', 'forLimits')}
					</div>
					{this.renderComboBox()}
					{this.renderBrands()}
					<div className="inline-form-elements">
							{this.renderChannelsList()}
					</div>
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
	renderTextInput(label, prop, focus = false, type="text") {
		return (
			<TextInput ref={prop}
					   label={label}
					   placeholder=""
					   focus={focus}
					   required="true"
					   validate="true"
					   type={type}
					   submitted={this.state.submitted}
					   valueLink={this.bindTo(this.props.model, prop)}/>
		);
	}

	/**
	 * @param label
	 * @param prop
	 * @param focus
	 * @returns {XML}
	 */
	renderCheckBox(label, prop) {
		return (
			<CheckBox classes="" ref={prop} label={label} valueLink={this.bindTo(this.props.model, prop)}/>
		);
	}

	/**
	 * @returns {XML}
	 */
	renderComboBox() {
		var regions = segmentModel.customerSegments.allRegions();
		return (
			<ComboBox ref='region' label="Region"
					  placeholder='[Optional] Select a Region'
					  valueLink={this.bindTo(this.props.model, 'parentId')}>
				{_.map(regions, (region, index) => {
					return (
						<option key={index}
								value={region.id}>{_.humanize(region.get('name'))}</option>
					);
				})}
			</ComboBox>
		);
	}

	/**
	 * @returns {XML}
	 */
	renderBrands() {
		var brands = brandsModel.get('brands');
		return (
			<ComboBox ref='region' label="Brand"
					  valueLink={this.bindTo(this.props.model, 'brandId')}>
				{_.map(brands, (brand, index) => {
					return (
						<option key={index}
								value={brand.id}>{_.titleize(brand.name)}</option>
					);
				})}
			</ComboBox>
		);
	}

	/**
	 * @returns {XML}
	 */
	renderChannelsList(){
		return <ComboBox id="channelCombo" label="Channel &nbsp;&nbsp;&nbsp;&nbsp;"
		outerClassName=""
		valueLink={this.bindTo(this.props.model, 'channelId')}
		labelStyle={{verticalAlign:'top'}}>
		{ this.state.options }
	</ComboBox>;

	}
};

var Model = Backbone.Model.extend({
	defaults: {
		name: '',
		code: '',
		forBonus: false,
		forMatrix: false,
		forSettings: false,
		forLayout: false,
		forLimits: false,
		priority: 100,
		brandId: '',
		parentId: '',
		type: 'ACCOUNT',
		channelId: ''
	}
});


AddAccountSegmentPopup.defaultProps = {
	model: new Model(),
	styles: {
		display: 'block',
		position: 'fixed',
		opacity: 1,
		zIndex: 11000,
		left: '50%',
		marginLeft: '-200px',
		top: '100px',
		width: '400px',
		minHeight: '80%',
		overflow: 'auto'
	}
};


import Component from 'common/system/react/BackboneComponent';
import segmentModel from 'backoffice/model/CustomerSegmentModel';
import FormValidator from 'backoffice/components/FormValidator';
import TextInput from 'backoffice/components/elements/TextInput';
import CheckBox from 'backoffice/components/elements/CheckBox';
import TabList from 'backoffice/components/lists/TabList';
import Popup from 'common/view/popup/Popup';
import matrixModel from 'backoffice/model/MatrixModel';
import brandsModel from 'backoffice/model/BrandsModel';
import settings from 'backoffice/model/SportsbookSettingsModel';
import ComboBox from 'backoffice/components/elements/ComboBox';


export default class AddRegionalSegmentPopup extends Component {
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
		var model;
		var that = this;
		super.componentDidMount();
		// reset model to defaults
		if (!this.props.isEdit && !this.props.isCopy) {
			model = this.props.model;
			model.clear().set(model.defaults);
		}
		matrixModel.on('change:countriesReceived', () => {
			that.forceUpdate();
		});
		matrixModel.listCountries();

		this.validator.register( this.refs.name,
			{
				routine: /.+/,
				errorMsg: 'Name can\'t be empty'
			});
		this.validator.register( this.refs.code,
			{
				routine: /^[a-zA-Z]{1,8}$/,
				errorMsg: 'Please enter a valid code'
			});
		this.validator.register( this.refs.postcodes,
			{
				routine: /.+/,
				errorMsg: 'Post codes can\'t be empty'
			});
		this.validator.register( this.refs.cities,
			{
				routine: /.+/,
				errorMsg: 'Cities can\'t be empty'
			});
		this.validator.register( this.refs.countries,
			{
				routine: /.+/,
				errorMsg: 'Countries can\'t be empty'
			});

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
			<Popup title={this.props.title || 'Create Regional Segment'}
				buttons={this.buttons}
				onClose={this.onClose.bind(this)}
				styles={this.props.styles}>

				<div className="vertical-form padding" style={{textAlign: 'center'}}>
					{this.renderTextInput('Name', 'name', true)}
					{this.renderTextInput('Code', 'code', undefined , false)}
					{this.renderTextInput('Priority', 'priority', false, false, "number")}
					<div className="inline-form-elements">
						{this.renderCheckBox('Bonus', 'forBonus')}
						{this.renderCheckBox('Matrix', 'forMatrix')}
						{this.renderCheckBox('Settings', 'forSettings')}
						{this.renderCheckBox('Layout', 'forLayout')}
						{this.renderCheckBox('forLimits', 'forLimits')}
					</div>
					{this.renderTextInput('PostCodes', 'postcodes')}
					{this.renderTextInput('Cities', 'cities')}
					{this.renderCountriesTabList()}
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
	renderTextInput(label, prop, focus = false, validate = true, type = "text") {
		return (
			<TextInput ref={prop}
					   label={label}
					   placeholder=""
					   focus={focus}
					   required="true"
					   type={type}
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
			<CheckBox ref={prop} classes="" label={label} valueLink={this.bindTo(this.props.model, prop)}/>
		);
	}

	renderCountriesTabList(){
		var countries = _.map(matrixModel.countries, (country, index) => {
			return {
				name: _.titleize(country.get('name')),
				id: country.get('code2')
			};
		});

		return <TabList ref="countries"
			title="Countries"
			list={countries}
			valueLink={this.bindTo(this.props.model, 'countries')}
			cls="full-width" />;
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
		postcodes: '',
		cities: '',
		countries: [],
		priority: 0,
		type: 'REGIONAL',
		channelId: '',
		brandId: ''
	},

	toJSON() {
		this.attributes.postcodes = this.attributes.postcodes.split(',');
		this.attributes.cities = this.attributes.cities.split(',');
		return _.clone(this.attributes);
	}
});


AddRegionalSegmentPopup.defaultProps = {
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

AddRegionalSegmentPopup.displayName = 'AddRegionalSegmentPopup';

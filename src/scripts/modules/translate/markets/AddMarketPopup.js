import Component from 'common/system/react/BackboneComponent';
import Popup from 'common/view/popup/Popup';
import TextInput from 'backoffice/components/elements/TextInput';
import CheckBox from 'backoffice/components/elements/CheckBox';
import ComboBox from 'backoffice/components/elements/ComboBox';
import FormValidator from 'backoffice/components/FormValidator';
import translationsModel from 'backoffice/model/MarketsTranslationsModel';
import Market from 'backoffice/model/models/Market';
import MarketCode from 'backoffice/model/models/MarketCode';

export default class AddMarketPopup extends Component{

	constructor(props) {
		super(props);
		this.model = new Market();
		this.marketCodeModel = new MarketCode();
		this.buttons = [
			{title: 'Save', cls: 'green', handler: ::this.onSave},
			{title: 'Cancel', cls: 'red', handler: ::this.onClose}
		];
		this.state = {
			error: ''
		};
		_.bindAll(this, 'updateMarketCode');
	}

	componentDidMount() {
		this.validator = new FormValidator();
		this.validator.register( this.refs.type,
			{
				routine: /.+/,
				errorMsg: 'Type can\'t be empty'
			});

		this.validator.register( this.refs.name,
			{
				routine: /.+/,
				errorMsg: 'Name can\'t be empty'
			});
		this.validator.register( this.refs.displayOrder,
			{
				routine: /.+/,
				errorMsg: 'Display Order can\'t be empty'
			});
	}

	updateMarketCode(prop, value) {
		this.marketCodeModel.set(prop, value);
		this.model.set('code', this.marketCodeModel.getCode());
		if (!!this.marketCodeModel.get('sport')) {
			this.model.set('sport', this.marketCodeModel.get('sport'));
		}
		this.setState({
			error: ''
		});
	}

	onSave() {
		if (this.validator.isValid()) {
			translationsModel.addMarket(this.model);
			this.onClose();
		}
	}

	onClose() {
		this.props.onClose();
	}

	render() {

		return (
			<Popup
				title={this.props.title}
				styles={this.props.styles}
				buttons={this.buttons}
				onClose={this.onClose}
				closeEnabled={false}>

				<div className="vertical-form padding">

					{!this.props.isEdit && this.renderMarketCodeForm()}

					{this.renderTextInput(this.model, 'code', 'Code', true, true)}
					{this.renderTextInput(this.model, 'name', 'Name', true)}
					{this.renderTextInput(this.model, 'displayOrder', 'Display Order', true, false, 'number')}
					{this.renderTextInput(this.model, 'lineType', 'Line Type')}

					<div className="inline-form-elements">
						{this.renderCheckbox(this.model, 'inPlay', 'InPlay')}
						{this.renderCheckbox(this.model, 'dedicated', 'Dedicated')}
						{this.renderCheckbox(this.model, 'outright', 'Outright')}
						{this.renderCheckbox(this.model, 'balancedMarket', 'Balanced')}
						{this.renderCheckbox(this.model, 'asianHandicap', 'Asian Handicap')}
					</div>

					<div className="error-box" style={{display: this.state.error ? 'table': 'none'}}>
						<p>{this.state.error}</p>
					</div>

				</div>

			</Popup>
		);
	}

	renderMarketCodeForm() {
		const {sports, periods, players} = translationsModel;
		return(
			<div>
				{this.renderComboBox(this.marketCodeModel, this.updateMarketCode,'sport', 'Sport', 'Select a sport', sports.models, 'code', 'code')}
				{this.renderComboBox(this.marketCodeModel, this.updateMarketCode, 'period', 'Period', 'Select a period', periods.models, 'code', 'code')}
				{this.renderComboBox(this.marketCodeModel, this.updateMarketCode, 'player','Player', 'Select a player', players.models, 'code', 'code')}
				<TextInput
					ref='type'
					label='Type'
					placeholder=""
					required={true}
					value={this.marketCodeModel.get('type')}
					onChange={this.updateMarketCode.bind(this, 'type')}
				/>
			</div>
		)
	}

	renderTextInput(model, prop, label, required = false, readOnly = false, type = 'text') {
		return (
			<TextInput
				type={type}
				ref={prop}
				label={label}
				placeholder=""
				required={required}
				readOnly={readOnly}
				valueLink={this.bindTo(model, prop)}
			/>
		)
	}

	renderCheckbox(model, prop, label) {
		return (
			<CheckBox
				ref={prop}
				label={label}
				valueLink={this.bindTo(model,prop)}/>
		)
	}

	renderComboBox(model,onChange, prop, label, placeholder, items, value, name) {
		return (
			<ComboBox
				label={label}
				placeholder={placeholder}
				value={model.get(prop)}
				onChange={onChange.bind(this, prop)}>
				{items.map((item, index) => {
					return (
						<option key={index} value={item.get(value)}>
							{item.get(name)}
						</option>
					)
				})}
			</ComboBox>
		)
	}


}

AddMarketPopup.defaultProps = {
	title: 'Add Market',
	isEdit: false,
	styles: {
		display: 'block',
		position: 'fixed',
		opacity: 1,
		zIndex: 11000,
		left: '50%',
		marginLeft: '-200px',
		top: '100px',
		width: '400px',
		minHeight: '600px'
	}
};

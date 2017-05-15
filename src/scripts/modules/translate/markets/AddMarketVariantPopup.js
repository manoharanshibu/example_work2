import Component from 'common/system/react/BackboneComponent';
import Popup from 'common/view/popup/Popup';
import TextInput from 'backoffice/components/elements/TextInput';
import FormValidator from 'backoffice/components/FormValidator';
import MarketVariant from 'backoffice/model/models/MarketVariant';
import translationsModel from 'backoffice/model/MarketsTranslationsModel';

export default class AddMarketVariantPopup extends Component {

	constructor(props) {
		super(props);
		this.model = new MarketVariant();
		this.model.set('marketTypeCode', this.props.marketTypeCode);
		this.buttons = [
			{title: 'Save', cls: 'green', handler: ::this.onSave},
			{title: 'Cancel', cls: 'red' , handler: ::this.onClose}
		]
	}

	componentDidMount() {
		this.validator = new FormValidator();
		this.validator.register( this.refs.marketTypeCode,
			{
				routine: /.+/,
				errorMsg: 'Market Code can\'t be empty'
			});
	}


	onSave() {
		if (this.validator.isValid()) {
			translationsModel.addMarketVariant(this.model)
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
					{this.renderTextInput('Market Code', 'marketTypeCode', true, true)}
					{this.renderTextInput('Sequence Id', 'sequenceId')}
					{this.renderTextInput('Sub Type', 'subType')}
					{this.renderTextInput('Sub Type Format', 'subTypeFormat')}
				</div>

			</Popup>
		);
	}

	renderTextInput(label, prop, required = false, readOnly = false) {
		return (
			<TextInput
				ref={prop}
				label={label}
				placeholder=""
				required={required}
				readOnly={readOnly}
				valueLink={this.bindTo(this.model, prop)}
			/>
		)
	}

}

AddMarketVariantPopup.defaultProps = {
	title: 'Add Market Variant',
	styles: {
		display: 'block',
		position: 'fixed',
		opacity: 1,
		zIndex: 11000,
		left: '50%',
		marginLeft: '-200px',
		top: '100px',
		width: '400px',
		minHeight: '400px'
	}
};

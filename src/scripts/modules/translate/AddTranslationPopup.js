import Component from 'common/system/react/BackboneComponent';
import Popup from 'common/view/popup/Popup';
import ComboBox from 'backoffice/components/elements/ComboBox';
import TextInput from 'backoffice/components/elements/TextInput';
import FormValidator from 'backoffice/components/FormValidator';

export default class AddTranslationPopup extends Component {

	constructor(props) {
		super(props);
		this.translationModel = new TranslationModel();
		this.buttons = [
			{title: 'Save', cls: 'green', handler: ::this.onSave},
			{title: 'Cancel', cls: 'red' , handler: ::this.onClose}
		]
	}

	componentDidMount() {
		this.validator = new FormValidator();
		this.validator.register( this.refs.longText,
			{
				routine: /.+/,
				errorMsg: 'Long Text can\'t be empty'
			});
	}

	onSave() {
		if (this.validator.isValid()) {
			let translations = this.props.model.get('translations');
			translations.push(this.translationModel.toJSON());
			if(this.props.onSave) {
				this.props.onSave();
			}
			this.onClose();
		}
	}

	onClose() {
		this.props.onClose();
	}

	getRemainingLocales() {
		const allLocales = this.props.locales.models;
		const translations = this.props.model.get('translations');
		if(translations.length > 0) {
			const usedLocales = _.pluck(translations,'locale');
			const remainingLocales = _.filter(allLocales, (locale) => {
				return !_.contains(usedLocales, locale.get('code'))
			});
			return remainingLocales
		}
		return allLocales;
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
					{this.renderLocalesComboBox()}
					{this.renderTextInput('Long Text', 'longText', true)}
					{this.renderTextInput('Short Text', 'shortText')}
					{this.renderTextInput('Very Short Text', 'veryShortText')}
				</div>

			</Popup>
		);
	}

	renderLocalesComboBox() {
		const locales = this.getRemainingLocales();
		return (
			<ComboBox
				label="Locale"
				placeholder="Select a locale"
				valueLink={this.bindTo(this.translationModel, 'locale')}>
				{_.map(locales, (locale, index) => {
					return (
						<option key={index} value={locale.get('code')}>
							{`${locale.get('code')} | ${locale.get('name')}`}
						</option>
					)
				})}
			</ComboBox>
		)
	}

	renderTextInput(label, prop, required = false) {
		return (
			<TextInput
				ref={prop}
				label={label}
				placeholder=""
				required={required}
				valueLink={this.bindTo(this.translationModel, prop)}
			/>
		)
	}

}

let TranslationModel = Backbone.Model.extend({
	defaults: {
		locale:'',
		longText:'',
		shortText:'',
		veryShortText:''
	}
});

AddTranslationPopup.defaultProps = {
	title: 'Add Translation',
	styles: {
		display: 'block',
		position: 'fixed',
		opacity: 1,
		zIndex: 11000,
		left: '50%',
		marginLeft: '-200px',
		top: '100px',
		width: '300px',
		minHeight: '300px'
	}
};

import AddMarketPopup from './AddMarketPopup';
import translationsModel from 'backoffice/model/MarketsTranslationsModel';
import Market from 'backoffice/model/models/Market';

export default class EditMarketPopup extends AddMarketPopup {

	constructor(props) {
		super(props);
		this.model.set(this.props.model.attributes);
		//this.marketCodeModel.update(this.model.get('code'));
		this.buttons = [
			{title: 'Save', cls: 'green', handler: ::this.onSave},
			{title: 'Cancel', cls: 'red', handler: ::this.onClose}
		]
	}

	onSave() {
		if (this.validator.isValid()) {
			translationsModel.editMarket(this.model);
			this.onClose();
		}
	}
}

EditMarketPopup.defaultProps = {
	title: 'Edit Market',
	isEdit: true,
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

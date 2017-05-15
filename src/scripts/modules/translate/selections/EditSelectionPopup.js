import AddSelectionPopup from './AddSelectionPopup';
import Selection from 'backoffice/model/models/Selection';
import translationsModel from 'backoffice/model/SelectionsTranslationsModel';

export default class EditSelectionPopup extends AddSelectionPopup {

	constructor(props) {
		super(props);
		this.model.set(this.props.model.attributes);
		this.buttons = [
			{title: 'Save', cls: 'green', handler: ::this.onSave},
			{title: 'Cancel', cls: 'red', handler: ::this.onClose}
		]
	}

	onSave() {
		if (this.validator.isValid()) {
			translationsModel.editSelection(this.model);
			this.onClose();
		}
	}
}

EditSelectionPopup.defaultProps = {
	title: 'Edit Selection',
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

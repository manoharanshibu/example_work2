import Component from 'common/system/react/BackboneComponent';
import Popup from 'common/view/popup/Popup';
import TextInput from 'backoffice/components/elements/TextInput';
import ComboBox from 'backoffice/components/elements/ComboBox';
import FormValidator from 'backoffice/components/FormValidator';
import Selection from 'backoffice/model/models/Selection';
import translationsModel from 'backoffice/model/SelectionsTranslationsModel';

export default class AddSelectionPopup extends Component {

	constructor(props) {
		super(props);
		this.model = new Selection();
		this.buttons = [
			{title: 'Save', cls: 'green', handler: ::this.onSave},
			{title: 'Cancel', cls: 'red', handler: ::this.onClose}
		];
	}

	componentDidMount() {
		this.validator = new FormValidator();
		this.validator.register( this.refs.selectionGroup,
			{
				routine: /.+/,
				errorMsg: ' Group can\'t be empty'
			});
		this.validator.register( this.refs.code,
			{
				routine: /.+/,
				errorMsg: 'Code can\'t be empty'
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

	onSave() {
		if (this.validator.isValid()) {
			translationsModel.addSelection(this.model);
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
					{this.renderGroupsComboBox()}
					{this.renderTextInput('Code', 'code' , true, this.props.isEdit)}
					{this.renderTextInput('Name', 'name', true)}
					{this.renderTextInput('Display Order', 'displayOrder', true, false, 'number')}
				</div>
			</Popup>
		)
	}

	renderGroupsComboBox() {
		const groups = translationsModel.groups.models;
		return (
			<ComboBox
				label="Group"
				ref="selectionGroup"
				placeholder="Select a group"
				required={true}
				valueLink={this.bindTo(this.model, 'selectionGroup')}>
				{_.map(groups, (group, index) => {
					return (
						<option key={index} value={group.get('code')}>
							{group.get('code')}
						</option>
					)
				})}
			</ComboBox>
		)
	}

	renderTextInput(label, prop, required = false, readOnly = false, type ='text') {
		return (
			<TextInput
				type={type}
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

AddSelectionPopup.defaultProps = {
	title: 'Add Selection',
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
		minHeight: '400px'
	}
};

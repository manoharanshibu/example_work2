/**
 * Created by mboninsegni on 23/08/16.
 */
import Component from 'common/system/react/BackboneComponent';
import TextInput from 'backoffice/components/elements/TextInput';
import ComboBox from 'backoffice/components/elements/ComboBox';
import Popup from 'common/view/popup/Popup';
import FormValidator from 'backoffice/components/FormValidator';

export default class BlockUserPopup extends Component {
	constructor(props) {
		super(props);



		this.buttons = [
			{title: 'Confirm Lock', cls: 'red', handler: ::this.onBlockUser},
			{title: 'Cancel', cls: 'blue', handler: ::this.onClose}
		];
	}

	/**
	 *
	 */
	onBlockUser() {
		if(this.validator.isValid()){
			this.props.model.toggleAccountBlock(this.props.block);
			this.props.onClose();
		}
	}

	/**
	 *
	 */
	onClose() {
		this.props.model.set({
			reasonToBlock: '',
			descriptionToBlock: ''
		});
		this.props.onClose();

	}

	onTextareaChange(e){
		const descriptionToBlock = e;
		this.props.model.set({descriptionToBlock});
	}

	notify(title = '', content = '', autoDestruct = 2000){
		App.bus.trigger('popup:notification', {title, content, autoDestruct});
	}

	componentWillMount(){
		this.props.model.on('change', () => {
			this.forceUpdate();
		}, this);
	}
	/**
	 *
	 */
	componentDidMount() {
		super.componentDidMount();
		this.props.model.clear();

		this.props.model.set({
			reasonToBlock: 'Linked with ID',
			descriptionToBlock: ''
		});

	}

	componentWillUnmount(){
		this.props.model.off('change', null, this);

	}

	componentDidUpdate() {
		this.validator = new FormValidator();

		if (this.refs.linkedID) {
			this.validator.register(this.refs.linkedID,
				{
					routine: /.+/,
					errorMsg: 'Linked ID can\'t be empty'
				});
		}
		if (this.refs.textarea) {
			this.validator.register(this.refs.textarea,
				{
					routine: /.+/,
					errorMsg: 'Reason can\'t be empty'
				});
		}
	}

	/**
	 * @returns {XML}
	 */
	render() {
		return (
			<Popup title={this.props.title || 'Reason to block the user'}
				   buttons={this.buttons}
				   onSave={::this.onBlockUser}
				   onClose={::this.onClose}
				   styles={this.props.styles}>

				<div className="vertical-form padding" style={{textAlign: 'center'}}>
					<p>Please, select a reason to block the user from the dropdown and add a description when necessary</p>
					{this.renderComboBox()}
					{this.renderDescription()}
				</div>
			</Popup>
		);
	}

	renderDescription(){
		const reason = this.props.model.get('reasonToBlock');
		if(reason === 'Linked with ID'){
			return this.renderTextInput('linkedID', '', true, null, 'Enter ID Number of linked account' )
		}
		if(reason === 'Other'){
			return this.renderTextArea();
		}

		return null;
	}

	renderTextArea(){
		return (
			<div>
				<label htmlFor="other">Please, enter a reason</label>
				{this.renderTextInput('textarea', '', true, 3)}
			</div>

		);
	}


	/**
	 * @param label
	 * @param focus
	 * @param type
	 * @returns {XML}
	 */
	renderTextInput(ref, label, focus = false, rows = null, placeHolder = '') {
		return (
			<TextInput ref={ref} inputStyle={{width: '100%'}}
					   label={label}
					   placeholder={placeHolder}
					   focus={focus}
					   required="true"
					   type='text'
					   rows={rows}
					   valueLink={this.bindTo(this.props.model, 'descriptionToBlock')}/>
		);
	}

	/**
	 * @returns {XML}
	 */
	renderComboBox() {
		const list = ['Linked with ID', 'Bonus Abuser', 'Other'];

		const options = list.map((option, index) => <option key={index} value={option}>{option}</option>);

		return (
			<ComboBox label="Reason"
					  placeholder='Input a reason when the text box appears'
					  valueLink={this.bindTo(this.props.model, 'reasonToBlock')}>
				{options}
			</ComboBox>
		);
	}
};

BlockUserPopup.defaultProps = {
	styles: {
		display: 'block',
		position: 'fixed',
		opacity: 1,
		zIndex: 11000,
		left: '50%',
		marginLeft: '-200px',
		top: '100px',
		width: '400px',
		minHeight: '380px'
	}
};


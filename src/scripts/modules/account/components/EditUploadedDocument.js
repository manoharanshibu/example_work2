import Component from 'common/system/react/BackboneComponent';
import TextInput from 'backoffice/components/elements/TextInput';
import ComboBox from 'backoffice/components/elements/ComboBox';
import DatePicker from 'backoffice/components/elements/DatePicker';
import Popup from 'common/view/popup/Popup';
import service from 'backoffice/service/BackofficeRestfulService';
import FileSelector from 'backoffice/components/FileSelector';
import {notify, errorPopup} from 'common/util/PopupUtil.js';
import TableRowWrapper from 'backoffice/components/TableRowWrapper';

export default class EditUploadedDocumentPopup extends Component {
	constructor(props) {
		super(props);
		this.state = {
			submitted: false,
			error: false,
			errorMessage: '',
			selectedImageFile: null
		};

		const saveButtonLabel = props.isNew ? 'Upload' : 'Save';
		this.buttons = [
			{title: saveButtonLabel, cls: 'blue', handler: ::this.onSave},
			{title: 'Cancel', cls: 'blue', handler: ::this.onClose}
		];

		_.bindAll(this, 'onSaveSuccess', 'onSaveError', 'onImageSelected');
	}

	onImageSelected(event){
		const files = event.currentTarget.files;

		if (files && files.length){
			this.setState({selectedImageFile: files[0]});
		}
	}

	/**
	 *
	 */
	onSave() {
		const {isNew, model, accountId} = this.props;
		this.setState({submitted: true});

		const errorMessage = this.missingFields();
		this.setState({errorMessage});

		if (errorMessage){
			return;
		}

		let data;
		const api = isNew ? 'uploadNewDocument' : 'saveUploadedDocument';

		if (isNew){
			data = new window.FormData();

			// The two APIs expect different field names and that's why we need
			// to accomodate our model to the 'uploadNewDocument' one
			const file = this.state.selectedImageFile;
			const proofExpiry = model.get('proofExpiry');
			const expiryDate = proofExpiry ?  moment(proofExpiry, 'YYYY-MM-DD').format('DD/MM/YYYY') : '';

			data.append('proofId', model.get('proofId'));
			data.append('proofType', model.get('proofType'));
			data.append('expiresOn', expiryDate);
			data.append('userComments', model.get('info') || '');
			data.append('file', file, file.name);
		} else {
			data = JSON.stringify(model.toJSON());
		}

		service[api](accountId, data)
			.then( this.onSaveSuccess.bind(this, model), this.onSaveError );

		if (this.props.onDocChangesDiscarded){
			this.props.onDocChangesDiscarded();
		}
	}

	missingFields(){
		const {model, isNew} = this.props;
		const missing = [];

		if (isNew){
			if (!(this.state.selectedImageFile)){
				missing.push('File');
			}
		}

		if (!(model.get('proofExpiry'))){
			missing.push('Expiry Date');
		}

		if (!(model.get('proofType'))){
			missing.push('Document Type');
		}

		let message = missing.join(' and ');
		// If message is empty, just return the empty string
		if (message){
			message = `Some essential information is missing: ${message}`;
		}

		return message
	}

	onSaveSuccess(model, resp){
		// If the document is new the 'id' is provided by
		// the server upon saving, so we need to update our model with that value
		if (this.props.isNew){
			// The date provided in the server response is not reliable,
			// so we fake it (it will be the correct one if we refresh the page)
			const formattedDate = moment().format('DD/MM/YYYY');
			model.set('id', resp.id);
			model.set('date', formattedDate);
		}
		if (this.props.onDocChangesSaved){
			this.props.onDocChangesSaved(model);
		}
		const message = this.props.isNew ? 'Your document has been uploaded' :
			 'Your changes to the document have been changed';

		notify('Success', message);
	}

	onSaveError(){
		const message = this.props.isNew ? 'uploading the file' : 'saving the changes';
		errorPopup('There has been an error ' + message);
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
	 * @returns {XML}
	 */
	render() {
		const {model, isNew} = this.props;
		const title = isNew ? 'Upload New Document' : 'Edit Uploaded Document';

		return (
			<Popup title={title}
				titleBarColor="#3A8ECA"
				buttons={this.buttons}
				onSave={this.onSave.bind(this)}
				onClose={this.onClose.bind(this)}
				styles={this.props.styles}>

				<div className="vertical-form padding" style={{textAlign: 'center'}}>
					{this.renderUploadButton()}
					<div className="table" style={{textAlign: 'left'}}>
						{this.renderDocDate()}

						<TableRowWrapper label="Document Id:">
							<TextInput maxLength="29"
								inputStyle={{float: 'left'}}
								valueLink={this.bindTo(model, 'proofId')}/>
						</TableRowWrapper>
						<TableRowWrapper label="Expiry Date*:">
							<DatePicker
								valueIsDateString={true}
								format='DD-MM-YYYY'
								valueLink={this.bindTo(model, 'proofExpiry')}/>
						</TableRowWrapper>
						<TableRowWrapper label="Document Type*:" >
							<ComboBox
								placeholder='(select a document type)'
								valueLink={this.bindTo(model, 'proofType')}>
								<option value="ID">Proof of Id</option>
								<option value="ADDRESS">Proof of address</option>
								<option value="OTHERS">Others</option>
							</ComboBox>
						</TableRowWrapper>

						<TableRowWrapper label="Additional Info:">
							<TextInput
								inputStyle={{float: 'left'}}
								valueLink={this.bindTo(model, 'info')}/>
						</TableRowWrapper>
					</div>
					<div className="error-box" style={{display: this.state.errorMessage ? 'table': 'none'}}>
						<p style={{}}>{this.state.errorMessage}</p>
					</div>
				</div>
			</Popup>
		);
	}

	renderDocDate() {
		// If we are uploading a new document the date will be set to
		// the current date automatically and we don't even need to show it
		// at this point
		if (this.props.isNew){
			return null;
		}

		return (
			<TableRowWrapper label="Date">
				<div className="inline-form-elements">
					{this.props.model.get('date')}
				</div>
			</TableRowWrapper>
		);
	}
	renderUploadButton() {
		// Only show the file selector if we are uploading a new document
		if (!this.props.isNew){
			return null;
		}

		const {selectedImageFile} = this.state;
		const filename = selectedImageFile ?
			<div style={{fontSize: 11, display: 'inline'}}>{selectedImageFile.name}</div> : '';

		return (
			<div className="inline-form-elements" style={{textAlign: 'left'}}>
				<FileSelector
					classes="btn blue filled fileUpload"
					style={{
						display: 'inline-block',
						marginRight: '10px'
					}}
					multiple
					accept=".jpg"
					uploadButtonLabel="Select image file"
					onSelected={this.onImageSelected} />
					{filename}
			</div>
		);
	}
};


EditUploadedDocumentPopup.defaultProps = {
	styles: {
		minHeight: 500,
		marginTop: 'initial',
		top: 20,
		right: '50%',
		maxWidth: 500,
		marginRight: -250
	}
};

import Component from 'common/system/react/BackboneComponent';
import CheckBox from 'backoffice/components/elements/CheckBox';
import Popup from 'common/view/popup/Popup';
import service from 'backoffice/service/BackofficeRestfulService';

export default class RejectedDocumentsPopup extends Component {
	constructor(props) {
		super(props);
		//note no need to call the save api , if the customer is not to be notified.
		this.buttons = [
			{title: 'Save no email notification',  cls: 'blue', handler: ::this.onSaveSuccess},
			{title: 'Save With email notification', cls: 'blue', handler: ::this.onSave}
		];


		_.bindAll(this, 'onSaveSuccess', 'onSaveError');
	}

/**
 *
 */
	onSave(){
		const {rejectReasonCodeArray , accountId} = this.props;
		let serverRejectionErrors = []
		_.each(rejectReasonCodeArray, function(reject){
			if(reject.isSelected){
				serverRejectionErrors.push(reject.rejectReason)
			}
			reject.isSelected = false;//reset all back to false.
		}, this);
		if(serverRejectionErrors.length > 0){//no need to call server if nothing has been selected
	    	service.saveRejectReasons(accountId, serverRejectionErrors.toString())
			.then( this.onSaveSuccess, this.onSaveError );
		}else{
			this.onSaveSuccess();
		}
	}


	onSaveSuccess(resp){
		const onConfirmedCallback = this.props.onConfirmed;
		this.props.onClose();
		if (onConfirmedCallback) {
			onConfirmedCallback();
		}
	}

	onSaveError(){
		const onRejectedErrorCallback = this.props.onRejectedError;
		this.props.onClose();
		if (onRejectedErrorCallback) {
			onRejectedErrorCallback();
		}

	}

	onIsSelected(option) {
		option.isSelected= !option.isSelected;
		this.forceUpdate();
	}
	/**
	 *
	 */
	onClose() {
		this.props.onClose();
	}

/**
 * @returns {XML}
 */
	render() {
		const {model } = this.props;
		const title = 'Reject Reason(s)';

		return (
			<Popup title={title}
				titleBarColor="#3A8ECA"
				buttons={this.buttons}
				closeEnabled={false}
				onSave={this.onSave.bind(this)}
				styles={this.props.styles}>
				<div className="vertical-form padding">
					{this.renderContents()}
				</div>
			</Popup>
		);
	}


	renderContents(){
		return (
			<div>
					{this.renderIdCopy()}
					{this.renderAddressCopy()}
			</div>
		);
	}

	renderIdCopy(){
		let {model} = this.props;
		if(model.get('idCopy') != 'REJECTED'){
			return null;
		}
		return _.map(this.props.rejectReasonCodeArray, function(option, index)  {
			if(option.rejectType != 'ID_COPY'){
				return null;
			}
			return (
				<div className="vertical-form" style={ { marginLeft: '5%' } }>
					<label style={ { fontSize: '12px' } }>
						<span>{option.description}</span>
						<input type="checkbox" checked={option.isSelected} key={index}
							onClick={this.onIsSelected.bind(this, option)}/>
					</label>
				</div>);
		}, this);
	}

	renderAddressCopy(){
		let {model} = this.props;
		if(model.get('dataPlausible') != 'REJECTED'){
			return null;
		}
		return _.map(this.props.rejectReasonCodeArray, function(option, index)  {
			if(option.rejectType != 'ADDRESS'){
				return null;
			}
			return (
				<div className="vertical-form" style={ { marginLeft: '5%' } }>
					<label style={ { fontSize: '12px' } }>
						<span>{option.description}</span>
						<input type="checkbox" checked={option.isSelected} key={index}
							onClick={this.onIsSelected.bind(this, option)}/>
					</label>
				</div>);
		}, this);
	}
};

RejectedDocumentsPopup.defaultProps = {
	styles: {
		minHeight: 360,
		marginTop: 'initial',
		top: 20,
		right: '50%',
		minWidth: 460
	},
	rejectReasonCodeArray : [
		{description: 'Date of birth does not match' , rejectType : 'ID_COPY' , isSelected : false , rejectReason : 'BIRTH_DATE_NOT_MATCHED'},
		{description: 'Name does not match' , rejectType : 'ID_COPY' , isSelected : false , rejectReason : 'NAME_NOT_MATCHED'},
		{description: 'Not a valid form of ID' , rejectType : 'ID_COPY' , isSelected : false , rejectReason : 'NOT_OFFICIAL_FORM_ID'},
		{description: 'No proof of ID provided' , rejectType : 'ID_COPY' , isSelected : false , rejectReason : 'PROOF_OF_ID_NOT_PROVIDED'},
		{description: 'Only uploaded bank card (ID)' , rejectType : 'ID_COPY' , isSelected : false , rejectReason : 'ONLY_UPLOADED_BANK_CARD'},
		{description: 'Proof of address does not match' , rejectType : 'ADDRESS' , isSelected : false , rejectReason : 'ADDRESS_DOES_NOT_MATCH'},
		{description: 'Unable to see all 4 corners of the document' , rejectType : 'ADDRESS' , isSelected : false , rejectReason : 'NOT_ABLE_TO_SEE_FOUR_CORNERS'},
		{description: 'Is not an official document' , rejectType : 'ADDRESS' , isSelected : false , rejectReason : 'NOT_AN_OFFICIAL_DOCUMENT'},
		{description: 'Document is outdated' , rejectType : 'ADDRESS' , isSelected : false , rejectReason : 'DOCUMENT_IS_OUTDATED'},
		{description: 'No proof of address provided' , rejectType : 'ADDRESS' , isSelected : false , rejectReason : 'NO_PROOF_OF_ADDRESS_PROVIDED'},
		{description: 'Only uploaded bank card (address)' , rejectType : 'ADDRESS' , isSelected : false , rejectReason : 'ONLY_UPLOADED_BANK_CARD'},
	]
};

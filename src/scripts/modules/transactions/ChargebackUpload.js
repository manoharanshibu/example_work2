import Component from 'common/system/react/BackboneComponent';
import {notify, errorPopup} from 'common/util/PopupUtil.js';
import service from 'backoffice/service/BackofficeRestfulService'

export default class ChargebackUpload extends Component {
	constructor(props) {
		super(props);
		this.state = {
			error: false,
			errorMsg: ''
		};

		this.canPayoutAuthorization = App.session.request('canPayoutAuthorization');
	}

	/**
	 *
	 */
	onSave() {
		let file = this.fileInput.files[0];

		if (!file) {
			this.setState({error: true, errorMsg: 'No file selected!'});
			return;
		}
		// read the file
		let reader = new FileReader();
		reader.onload = ::this.onFileLoad;
		reader.readAsDataURL(file);
	}

	onBrowser(){

	}
	/**
	 * @param e
	 */
	onFileLoad(e) {
		var reader = e.target;
		var text = reader.result;
		/*var fileContent;

		try {
			fileContent = window.atob(text.substring(text.indexOf(',') + 1));
		} catch (e) {
			errorPopup('There is an error in the file format');
			return;
		}*/

		const fileContent = this.fileInput.files[0];

		if(text) {
			let data = new window.FormData();
			data.append('file', fileContent);


			service.uploadChargebackCSV(data)
				.then(function (resp) {

					if (resp.status === "SUCCESS") {
						notify('Success', 'The chargeback file has been uploaded');
					} else if(resp.error && resp.error.length) {
						errorPopup(resp.error);
					}
				}, (resp)=> {
					errorPopup('The chargeback file has NOT been uploaded');
				});
		}
	}

	onUploadError(){

	}

	/**
	 *
	 */
	componentDidMount() {
		this.fileInput = ReactDOM.findDOMNode(this.refs.fileInput);
	}

	/**
	 * @returns {XML}
	 */
	render() {
		return (
			<div className="box">
				<div style={{minHeight: window.innerHeight - 50 , display: !this.canPayoutAuthorization ? 'block' : 'none'}}>
					<div className="table toolbar">
						<div className="table-row">
							<div className="table-cell">
								<div className="inline-form-elements">
									<strong>YOU ARE NOT AUTHORISED TO USE THIS FUNCTION</strong>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div style={{minHeight: window.innerHeight - 50 , display: this.canPayoutAuthorization ? 'block' : 'none'}}>
					<div className="vertical-form padding">
						<div className="inline-form-elements">
							<label htmlFor="fileUploader">Upload a chargeback</label><br/>
							<input id="fileUploader" ref='fileInput' type='file' accept="text/csv" onChange={::this.onBrowser}/>
						</div>
						<div className="error-box" style={{display: this.state.error ? 'table': 'none'}}>
							<p style={{}}>{this.state.errorMsg}</p>
						</div>

						<button className="btn green filled" onClick={::this.onSave}>Submit File</button>
					</div>
				</div>
			</div>
		);
	}

};

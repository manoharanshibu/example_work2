import Popup from 'common/view/popup/Popup';
import Component from 'common/system/react/BackboneComponent';
import RegisterProfileView from 'app/view/register/components/RegisterProfileView';
import RegisterPersonalView from 'app/view/register/components/RegisterPersonalView';
import RegisterSuccessView from 'app/view/register/components/RegisterSuccessView';
import RegistrationModel from 'backoffice/model/RegistrationModel';


export default class RegisterAccountPopup extends Component {
	constructor(props){
		super(props);

		this.state = {
			currentStep: 1
		};

		this.onClose = ::this.onClose;
		this.onConfirm = ::this.onConfirm;
		this.model = this.props.model;

		this.onNext = ::this.onNext;
		this.onBack = ::this.onBack;

		this.model = new RegistrationModel();

	}

	onBack(){
		this.setState({currentStep: this.state.currentStep-1});
	}

	onNext(){
		this.setState({currentStep: this.state.currentStep+1});
	}

	onConfirm(){
		this.props.onClose();
	}

	onClose(){
		this.props.onClose();
	}

	render(){
		const modalWinStyles = {
			maxWidth: 'none',
			overflow: 'auto',
			marginLeft: 0,
			marginTop: 0,
			top: '2%',
			left: '25%',
			right: '25%',
			width: '550',
			height: '780'
		};

		const buttons = [];
		buttons.push({title: 'Close', cls: 'blue', handler: this.onClose});

		return (
			<Popup title="Registration"
				   titleBarColor="#b21e22"
				   footerIsAbsolute
				   styles={modalWinStyles}
				   buttons={buttons}
				   onClose={this.onClose} >
				{this.state.currentStep < 2 && (this.renderProfileView())}
				{this.state.currentStep === 2 && (this.renderPersonalView())}
				{this.state.currentStep > 2 && (this.renderSuccessView())}
			</Popup>
		);
	}

	renderProfileView(){
		return (
			<div className="vertical-form">
				<div className="inline-form-elements" style={{padding: '20px'}}>
					<div className='step-progress'>
						<RegisterProfileView {...this.props} onNext={this.onNext} model={this.model}/>
					</div>
				</div>
			</div>
		);
	}

	renderPersonalView() {
		return (
			<div className="vertical-form">
				<div className="inline-form-elements" style={{padding: '20px'}}>
					<div className='step-progress'>
						<RegisterPersonalView {...this.props} onNext={this.onNext} onBack={this.onBack} model={this.model}/>
					</div>
				</div>
			</div>
		);
	};

	renderSuccessView(){
		return (
			<div className="vertical-form">
				<div className="inline-form-elements" style={{padding: '20px'}}>
					<div className='step-progress'>
						<RegisterSuccessView {...this.props} model={this.model}/>
					</div>
				</div>
			</div>
		);
	}
}

RegisterAccountPopup.displayName = 'RegisterAccountPopup';

import Component from 'common/system/react/BackboneComponent';
import TextInput from 'backoffice/components/elements/TextInput';
import CheckBox from 'backoffice/components/elements/CheckBox';
import settings from 'backoffice/model/SportsbookSettingsModel';


export default class RegistrationSettingsView extends Component {
	constructor(props) {
		super(props);
		this.state = {changed: !!settings.changed}
	}

	/**
	 * Reference the name and code inputs
	 */
	//componentDidMount() {
	//	super.componentDidMount();
	//	settings.registrationSettings.on('change', () => {
	//		this.setState({changed: true});
	//	}).bind(this);
	//}

	/**
	 *
	 */
	//componentWillUnmount() {
	//	super.componentWillUnmount();
	//	settings.registrationSettings.off(null, null, this);
	//}

	/**
	 * @returns {XML}
	 */
	render() {
		var registration = settings.registrationSettings;
		return (
			<div className="inline-form-elements">
				<div className="section-title"><strong>Registration Settings</strong></div>
				<CheckBox label="DOB Required" valueLink={this.bindTo(registration, 'dob')}/>

				<div className="inline-form-elements">
					<TextInput label="Minimum age" type="number" className='half-width-inputs'
							   valueLink={this.bindTo(registration, 'minAge')}/>
				</div>

				<div className="vertical-form">
				    <label className="g-label section-title"><strong>Required attributes:</strong></label>

						<CheckBox label="BirthName" valueLink={this.bindTo(registration, 'birthName')}/>
						<CheckBox label="Document Upload" valueLink={this.bindTo(registration, 'documentUpload')}/>
						<CheckBox label="Nationality" valueLink={this.bindTo(registration, 'nationality')}/>
						<CheckBox label="Place of Birth" valueLink={this.bindTo(registration, 'placeOfBirth')}/>
						<CheckBox label="Double OptIn" valueLink={this.bindTo(registration, 'doubleOptIn')}/>
						<CheckBox label="Use iOvation Validation" valueLink={this.bindTo(registration, 'useIOvationValidation')}/>
						<CheckBox label="Use 192 Validation" valueLink={this.bindTo(registration, 'use192Validation')}/>
				</div>
			</div>
		)
	}
};

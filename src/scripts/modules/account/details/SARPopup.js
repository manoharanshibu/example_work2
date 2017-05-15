/* globals moment */
import { PropTypes } from 'react'
import Component from 'common/system/react/BackboneComponent'
import TextInput from 'backoffice/components/elements/TextInput'
import ComboBox from 'backoffice/components/elements/ComboBox'
import Popup from 'common/view/popup/Popup'
import service from 'backoffice/service/BackofficeRestfulService';

export default class SARPopup extends Component {
	constructor(props) {
		super(props)

		this.buttons = [
			{ title: 'Send', cls: 'red', handler: ::this.onSubmitReport },
			{ title: 'Cancel', cls: 'blue', handler: ::this.onClose }
		]
	}

	componentWillMount() {
		this.props.model.set('sarSubmittedBy', App.session.request('name'))
		this.props.model.set('sarSubmittedDate', moment())
	}

	onSubmitReport() {
		console.log('TODO: submit to api')
		var that = this;
		const reason = `${this.props.model.get('reasonTypeForSAR')}: ${this.props.model.get('reasonForSAR')}`;
		service.addSarReport(this.props.model.currentAccount.id, reason)
			.then((resp) => {
				if(resp && resp.status)
					this.notify('Status', resp.status)
				else
					this.notify('Status', 'ERROR')
			});

	}

	/**
	 *
	 */
	onClose() {
		this.props.onClose()
	}

	notify(title = '', content = '', autoDestruct = 2000) {
		App.bus.trigger('popup:notification', { title, content, autoDestruct })
	}

	/**
	 * @returns {XML}
	 */
	renderComboBox() {
		const list = ['Bonus balance', 'Sportsbook balance', 'Bet history', 'Transaction history', 'Scoring details', 'Other']

		const options = list.map((option, index) => <option key={index} value={option}>{option}</option>)

		return (
			<ComboBox label="Reason Type"
					  placeholder="Select Reason Type"
					  valueLink={this.bindTo(this.props.model, 'reasonTypeForSAR')}>
				{options}
			</ComboBox>
		)
	}

	/**
	 * @returns {XML}
	 */
	render() {
		return (
			<Popup title={this.props.title || 'Reason to block the user'}
				   buttons={this.buttons}
				   onSave={::this.onSubmitReport}
				   onClose={::this.onClose}
				   styles={this.props.styles}>

				<div className="table inner no-border-bottom">
					<div className="table-row">
						<div className="table-cell">
							<div className="vertical-form padding">
								{this.renderComboBox()}
								<TextInput label="Reason"
										   placeholder=""
										   required="true"
										   type="text" rows="3"
										   valueLink={this.bindTo(this.props.model, 'reasonForSAR')}
								/>
							</div>
						</div>
					</div>
				</div>
			</Popup>
		)
	}
}

SARPopup.defaultProps = {
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
}

SARPopup.propTypes = {
	model: PropTypes.object,
	onClose: PropTypes.func,
	styles: PropTypes.string,
	title: PropTypes.string
}

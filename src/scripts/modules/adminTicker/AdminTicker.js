/**
 * Created by mboninsegni on 29/09/2015.
 */

import ComboBox from 'backoffice/components/elements/ComboBox';
import CheckBox from 'backoffice/components/elements/CheckBox';
import tickerModel from 'backoffice/model/AdminTickerModel';

export default class AdminTicker extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			allAlerts: tickerModel.getAllAlerts(),
			selectedHours: tickerModel.get('currentlySelectedHours'),
			selectedStatusType: tickerModel.get('selectedStatusType')
		};

	}

	ComponentWillMount(){
		this.setState({allAlerts: tickerModel.getAllAlerts()});
		App.bus.request('command:listAlerts', this.state.selectedHours, this.state.selectedStatusType);

	}
	/**
	 * These change events are triggered in the AdminTicker model
	 */
	ComponentDidMount() {
		tickerModel.on('change:alertsReceived', this.forceUpdate);
		tickerModel.on('change:tickerAlertChangedReceived' , this.forceUpdate);
		tickerModel.on('change:newTickerAlertReceived', this.forceUpdate);
	}

	/**
	 * Make an api call to check/unckeck an alert
	 * @param event
	 */
	onCheckUncheckAlert(event){
		const id = $(event.currentTarget).data('id');

		if(event.currentTarget.checked == true) {
			tickerModel.checkAlert(id);
		} else {
			tickerModel.uncheckAlert(id);
		}
	}

	/**
	 * Make a service call with the updated hours
	 * @param event
	 */
	onHoursFilterUpdated(event){
		/*if(this.state.selectedStatusType == undefined)
			this.setState({selectedStatusType: tickerModel.get("selectedStatusType")});*/

		this.setState({currentlySelectedHours: event.toLowerCase()});
		App.bus.request('command:listAlerts', this.state.selectedHours, this.state.selectedStatusType);
	}

	/**
	 * Make a service call with the updated checked/unchecked status
	 * @param event
	 */
	onCheckedFilterUpdated(event){
		/*if(this.state.currentlySelectedHours == undefined)
			this.setState({currentlySelectedHours: tickerModel.get("currentlySelectedHours")});*/

		this.setState({selectedStatusType: event.toLowerCase()});
		App.bus.request('command:listAlerts', this.state.selectedHours, this.state.selectedStatusType);
	}



	/**
	 * @returns {XML}
	 */
	render() {
		//TODO: Checking the permissions on every render, might not be ideal
		//but as a quick fix, it ensures they are reevaluated if the user has
		//logged out and logged in with different user
		const allowed = App.session.request('canAdminAdminTicker');

		if (!allowed){
			return <div><p><strong>YOU ARE NOT AUTHORIZED TO USE THIS FUNCTION.</strong></p></div>;
		}

		let addOption = (val, index) => (<option key={index} value={val}>{val}</option>);

		return (
			<div className="box">
				<div style={{minHeight: '700px', overflowX :'scroll'}}>
					<div className="table toolbar">
						<div className="table-row">
							<div className="table-cell">
								<div className="inline-form-elements">
									<strong>Filters</strong>
								</div>
							</div>
							<div className="table-cell">
								<div style={{display:'inline-block', maxWidth:'85%'}}>
									<ComboBox ref="hoursSelector"
											  style={{width:'100%'}}
											  label="Hours"
											  placeHolder={this.props.hoursSelectorPlaceholder}
											  value={this.state.selectedHours}
											  onChange={this.onHoursFilterUpdated.bind(this)}>
										{this.props.hours.map(addOption)}
									</ComboBox>
								</div>
							</div>
							<div className="table-cell">
								<div style={{display:'inline-block', maxWidth:'85%'}}>
									<ComboBox ref="statusSelector"
											  label="Status Selector"
											  style={{width:'100%'}}
											  placeHolder={this.props.statusSelectorPlaceholder}
											  value={this.state.selectedStatusType}
											  onChange={this.onCheckedFilterUpdated.bind(this)}>
										{this.props.status.map(addOption)}
									</ComboBox>
								</div>
							</div>
						</div>
					</div>

					<div className="table grid">
						<div className="table-row header larger">
							<div className="table-cell">
								Alert Id
							</div>
							<div className="table-cell">
								Event Id
							</div>
							<div className="table-cell">
								Alert Name
							</div>
							<div className="table-cell">
								Description
							</div>
							<div className="table-cell">
								Event Name
							</div>
							<div className="table-cell">
								Alert Time
							</div>
							<div className="table-cell">
								Status
							</div>
						</div>
						{this.getRows()}
					</div>
				</div>
			</div>
		);
	}

	getRows() {
		/*let alerts = [
		{
			alertId: '1',
			eventId: '1',
			alertName: 'Test1',
			description: 'This is a description',
			eventName: 'Event1',
			alertTime: '12:00',
			status: true
		},
		{
			alertId: '2',
			eventId: '2',
			alertName: 'Test2',
			description: 'This is a description',
			eventName: 'Event2',
			alertTime: '12:02',
			status: false
		},
		{
			alertId: '3',
			eventId: '3',
			alertName: 'Test2',
			description: 'This is a description',
			eventName: 'Event2',
			alertTime: '12:03',
			status: true
		},
		{
			alertId: '4',
			eventId: '4',
			alertName: 'Test4',
			description: 'This is a description',
			eventName: 'Event4',
			alertTime: '12:05',
			status: false
		}
	];*/

		//return _.map(this.state.allAlerts, (rd, i) => (this.getRow(rd, i)));
		return _.map(this.state.allAlerts, (ticker, index) => (
			<div key={index} className="table-row">
				<div className="table-cell center">
					{ticker.alertId}
				</div>
				<div className="table-cell center">
					{ticker.eventId}
				</div>
				<div className="table-cell center">
					{ticker.alertName}
				</div>
				<div className="table-cell center">
					{ticker.description}
				</div>
				<div className="table-cell center">
					{ticker.eventName}
				</div>
				<div className="table-cell center">
					{ticker.alertTime}
				</div>
				<div className="table-cell center">
					<CheckBox label={ticker.status} value={ticker.status} onClick={this.onCheckUncheckAlert.bind(this)} />
				</div>
			</div>

		));


	}
	/*getRow(ticker, index) {
		return (
			<div key={index} className="table-row">
				<div className="table-cell center">
					{ticker.alertId}
				</div>
				<div className="table-cell center">
					{ticker.eventId}
				</div>
				<div className="table-cell center">
					{ticker.alertName}
				</div>
				<div className="table-cell center">
					{ticker.description}
				</div>
				<div className="table-cell center">
					{ticker.eventName}
				</div>
				<div className="table-cell center">
					{ticker.alertTime}
				</div>
				<div className="table-cell center">
					<CheckBox label={ticker.status} value={ticker.status} onClick={this.onCheckUncheckAlert.bind(this)} />
				</div>
			</div>
		)
	}*/


};

AdminTicker.defaultProps = {
	hours: [6, 12, 18, 24, 30, 36,	42,	48,	54,	60,	66,	72],
	status: ['All','Checked', 'Unchecked'],
	hoursSelectorPlaceholder: `View alerts for 6 past hours`,
	statusSelectorPlaceholder: 'View Checked/Unchecked or All alerts'
};

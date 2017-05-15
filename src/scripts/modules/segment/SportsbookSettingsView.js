import Component from 'common/system/react/BackboneComponent';
import settings from 'backoffice/model/SportsbookSettingsModel';
import TollsAndTaxes from 'segment/settings/TollsAndTaxesView';
import ProductVisibility from 'segment/settings/ProductVisibilityView';
import RegistrationSettings from 'segment/settings/RegistrationSettingsView';
import BetTypesRestrictions from 'segment/settings/BetTypesRestrictionView';
import MarketRestrictions from 'segment/settings/MarketRestrictionsView';
import SegmentSelector from 'segment/SegmentSelectorView';

export default class SportsbookSettingsView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			changed: !!settings.changed,
			segmentType: 'region',
			segment: 'DE'
		};

		App.bus.on('sportsbookSettings:saveSuccess', this.onSaveSuccess);
		App.bus.on('sportsbookSettings:saveFailure', this.onSaveError);
	}

	/**
	 *
	 */
	onSave() {
		settings.saveSettings();
		this.setState({changed: false});
	}

	/**
	 *
	 */
	onReset() {
		settings.resetSettings();
		this.setState({changed: false});
	}

	onSaveSuccess(){
		App.bus.trigger('popup:notification', {
			   title: 'Settings Saved',
			   content: 'The settings have been properly saved',
			   autoDestruct: 2000});
	}

	onSaveError(){
		App.bus.trigger('popup:notification', {
			   title: 'Save error',
			   content: 'There has been an error while saving these settings.',
			   autoDestruct: 2000});
	}

	onChangeSegmentType(segmentType){
		this.setState({segmentType});
	}

	onChangeSegment(segment){
		settings.set({segment});
		this.setState({segment});
	}

	/**
	 * Reference the name and code inputs
	 */
	componentDidMount() {
		super.componentDidMount();
		settings.on('change', () => {
			this.setState({changed: true});
		}).bind(this);

		settings.set({segment: this.state.segment});
	}

	/**
	 *
	 */
	componentWillUnmount() {
		super.componentWillUnmount();
		settings.off(null, null, this);
	}

	/**
	 * @returns {XML}
	 */
	render() {
		//TODO: Checking the permission on every render, might not be ideal
		//but as a quick fix, it ensures they are reevaluated if the user has
		//logged out and logged in with different user
		const allowed = App.session.request('canSegmentSportsbookSettings');

		if (!allowed){
			return <div><p><strong>YOU ARE NOT AUTHORIZED TO USE THIS FUNCTION.</strong></p></div>;
		}

		var saveStyle = this.state.changed ? {} : {pointerEvents: 'none', cursor: 'default', opacity: '0.6'};
		return (
			<div className="box">
				<div style={{minHeight: window.innerHeight - 50}}>
					<div className="table toolbar">
						<div className="table-row">
							<SegmentSelector ref="segment-selector"
								onChangeSegment={this.onChangeSegment.bind(this)}
								onChangeSegmentType={this.onChangeSegmentType.bind(this)}
								segmentType={this.state.segmentType}
								segment={this.state.segment} />

							<div className="table-cell right">
								<div className="inline-form-elements">
									<a className="btn green filled" style={saveStyle} onClick={this.onSave.bind(this)}>Save Settings</a>
									<a className="btn red filled" onClick={this.onReset.bind(this)}>Reset Settings</a>
								</div>
							</div>
						</div>
					</div>

					{this.renderSettings()}
				</div>
			</div>
		);
	}

	renderSettings(){
		if (!this.state.segment){
			return <p>Please select a Segment</p>;
		}

		return (
			<div>
				<div style={{overflowX: 'auto', overflowY:'hidden'}}>
					<div className="table">
						<div className="table-row">
							<div className="table-cell" style={{minWidth: '582px'}}>
								<TollsAndTaxes />
							</div>

							<div className="table-cell" style={{minWidth: '200px'}}>
								<div className="vertical-form">
									<ProductVisibility/>
									<br/>
									<br/>
									<RegistrationSettings/>
								</div>
							</div>
						</div>

					</div>
				</div>
				<br/>
				<MarketRestrictions ref="marketRestrictions"/>

				<div className="table">
					<div className="table-row">
						<div className="table-cell">
							<div className="vertical-form">
								<div className="inline-form-elements">
									<label className="section-title">Restriction on Bet Types</label>
								</div>
								<BetTypesRestrictions
									openField="restrictionOnBetTypes"
									paths={[]}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

};

SportsbookSettingsView.displayName = 'SportsbookSettingsView';

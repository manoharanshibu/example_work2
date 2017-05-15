import Component from 'common/system/react/BackboneComponent';
import ComboBox from 'backoffice/components/elements/ComboBox';
import CheckBox from 'backoffice/components/elements/CheckBox';
import model from 'backoffice/model/CustomerModel';
import segmentsModel from 'backoffice/model/CustomerSegmentModel';

export default class ConditionsView extends Component {
	constructor() {
		super();
		this.canUpdateSegments = App.session.request('canChangeAccountSegments');
		this.canChangeNewsletterSubscription = App.session.request('canChangeNewsletterSubscription');
	}

	/**
	 *
	 */
	onSubmitPassword() {
		model.sendPasswordRequest();
	}

	/**
	 *
	 */
	onAddCustomer() {
		if(this.canUpdateSegments) {
			const segmentId = model.get('selectedSegmentId');
			if (segmentId){
				const customer = model.currentAccount;
				model.addCustomerToSegment(customer, segmentId);
			} else {
				this.notify('Error', 'Please select a segment');
			}
		}
	}

	notify(title='', content='', autoDestruct=2000){
		App.bus.trigger('popup:notification', {title, content, autoDestruct});
	}

	/**
	 *
	 */
	onRemoveCustomer(segment) {
		if(this.canUpdateSegments) {
			const customer = model.currentAccount;
			model.removePunterFromSegment(customer, segment.id);
		}
	}

	/**
	 *
	 */
	onSavePrefs() {
		if (this.canChangeNewsletterSubscription){
			model.saveConditionsPrefs();
		} else {
			this.notify('Error', 'You have no permissions to perform this operation');
		}
	}

	/**
	 * Reference the name and code inputs
	 */
	componentDidMount() {
		model.currentAccount.Conditions.on('change', () => {
			this.forceUpdate();
		}, this);

		model.currentAccount.on('change:segments', () => {
			this.forceUpdate();
		}, this);

		//load existing customer segments
		model.getCustomerSegments();
	}

	componentWillUnmount(){
		model.currentAccount.Conditions.off('change', null, this);
		model.currentAccount.off('change:segments', null, this);
	}

	/**
	 * Renders competition container
	 * @returns {XML}
	 */
	render() {
		const segments = this.renderCustomerSegments();
		return (
			<div>
				<div className="table inner toolbar no-border-bottom">
					<div className="table-row" >
						<div className="table-cell">
							<div className="inline-form-elements">
								<label>User Conditions</label>
							</div>
						</div>
						<div className="table-cell right">
							<div className="inline-form-elements">
								<a onClick={::this.onSubmitPassword} className="btn green filled">Submit newly generated password</a>
							</div>
						</div>
					</div>
				</div>
				<div className="table inner no-border-bottom">
					<div className="table-row">
						<div className="table-cell" style={{width: '25%'}}>
							<div className="table inner no-border-bottom">
								<div className="table-row header">
									<div className="table-cell center" style={{width: '40%'}}>
										Regular info
									</div>
									<div className="table-cell center" style={{width: '30%'}}>
										Exclusive offers
									</div>
									<div className="table-cell" style={{width: '30%'}}></div>
								</div>
								<div className="table-row">
									{this.renderConditionCheckBox('Newsletter', 'infoNewsletter', '40%')}
									{this.renderConditionCheckBox('SMS', 'offersSms', '30%')}
									{this.renderConditionCheckBox('Snail Mail', 'offersSnailMail', '30%')}
								</div>
								<div className="table-row">
									{this.renderConditionCheckBox('SMS Newsletter', 'infoSms', '40%')}
									{this.renderConditionCheckBox('Email', 'offersEmail', '30%')}
									{this.renderConditionCheckBox('Phone', 'offersPhone', '30%')}
								</div>
								<div className="table-row">
									<div className="table-cell" style={{width: '40%'}}></div>
									<div className="table-cell" style={{width: '30%'}}></div>
									<div className="table-cell" style={{width: '30%'}}>
										<div className="inline-form-elements">
											<a className="btn green right filled" onClick={::this.onSavePrefs}>Save</a>
										</div>
									</div>
								</div>
							</div>

						</div>
					</div>

					{/* Only show segments grid if there are any */}
					{!!segments.length && (
						<div className="table-row">
							<div className="table-cell" style={{width: '25%'}}>
								<div className="table inner">
									<div className="table-row header">
										<div className="table-cell">
											User Segments
										</div>
										<div className="table-cell">

										</div>
									</div>
									{segments}
								</div>
							</div>
						</div>
					)}

					<div className="table-row">
						<div className="table-cell">
							<ComboBox ref="segment"
								readOnly={!this.canUpdateSegments}
								placeholder="Choose Segment"
								style={{width: '100%'}}
								valueLink={this.bindTo(model, 'selectedSegmentId')}>
								{this.renderSegments()}
							</ComboBox>
						</div>
					</div>
					<div className="table-row">
						<div className="table-cell">
							<a onClick={::this.onAddCustomer}
								className="btn blue filled"
								style={{width: '100%', cursor: this.canUpdateSegments ? 'default' : 'no-drop'}}>Add Customer to Segment</a>
						</div>
					</div>
				</div>
			</div>
		);
	}


	renderConditionCheckBox(label, attribute, width){
		const attribs = model.currentAccount.Conditions;
		return (
			<div className="table-cell" style={{width: width}}>
				<CheckBox label={label}
						  valueLink={this.bindTo(attribs, attribute)}
						  disabled={!this.canChangeNewsletterSubscription}
				/>
			</div>
		);
	}

	/**
	 * @returns {*}
	 */
	renderSegments() {
		const parsedSegments = [];

		if (this.canUpdateSegments){
			parsedSegments.push(<option key="default" disabled>(Please choose a segment)</option>);
		} else {
			parsedSegments.push(<option key="default" disabled>(You are not allowed to add/remove segments)</option>);
		}

		this.props.collection.each((segment, idx) => {
			//only add segments that are not already added for the customer
			const segments = model.currentAccount.get('segments');
			const index = _.findIndex(segments, {id: Number(segment.id)});
			if(index == -1) {
				parsedSegments.push(
					<option
						key={idx}
						value={segment.id}>{_.titleize(segment.get('name'))}</option>
				);
			}
		});

		return parsedSegments;
	}

	/**
	 * @returns {*}
	 */
	renderCustomerSegments() {
		const segments = model.currentAccount.get('segments');
		return _.map(segments, (segment, index) =>
			(
				<div key={index} className="table-row">
					<div className="table-cell">
						{_.titleize(segment.name)}
					</div>
					<div className="table-cell">
						<a onClick={this.onRemoveCustomer.bind(this, segment)}
							className="btn red small"
							style={{cursor: this.canUpdateSegments ? 'default' : 'no-drop'}}>Remove</a>
					</div>
				</div>
			)
		);
	}
};

ConditionsView.defaultProps = {
	collection: segmentsModel.customerSegments
};

ConditionsView.displayName = 'ConditionsView';

import Component from 'common/system/react/BackboneComponent';
import ComboBox from 'backoffice/components/elements/ComboBox';
import customerSegmentModel from 'backoffice/model/CustomerSegmentModel';

export default class SegmentSelectorView extends Component {
	constructor(props){
		super(props);
	}

	onChangeSegmentType(segmentType) {
		this.props.onChangeSegmentType && this.props.onChangeSegmentType(segmentType);

		// Reset (nullify) the segment, as keeping any other selection is misleading
		this.onChangeSegment(null);
	}

	onChangeSegment(segment){
		this.props.onChangeSegment && this.props.onChangeSegment(segment);
	}

	render(){
		return (
			<div>
				<div className="table-cell">
					<div className="inline-form-elements">
						<ComboBox label="Segment Type"
							outerClassName=""
							value={this.props.segmentType}
							onChange={this.onChangeSegmentType.bind(this)}
							labelStyle={{verticalAlign:'middle'}}>
							<option value="region">Region</option>
							<option value="account">Account</option>
						</ComboBox>
					</div>
				</div>
				<div className="table-cell">
					<div className="inline-form-elements">
						<ComboBox label='Segment'
							outerClassName=""
							placeholder='Please select a Segment'
							value={this.props.segment || ''}
							onChange={this.onChangeSegment.bind(this)}
							labelStyle={{verticalAlign:'middle'}}>
							{this.renderSegments()}
						</ComboBox>
					</div>
				</div>
			</div>
		);
	}

	// renders all the combobox options for the selected segment type
	renderSegments(){
		const segments = this.props.segments;
		let list;

		if (this.props.segmentType === 'region'){
			list = segments.allSettingsRegions();
		} else {
			// if (segmentType === 'account')
			list = segments.customersByName();
		}

		return _.map(list, this.renderSegmentOption);
	}

	renderSegmentOption(segment, index){
		return (
			<option key={index} value={segment.get('code')}>{_.titleize(_.humanize(segment.get('name')))}</option>
		);
	}
}

SegmentSelectorView.defaultProps = {
	segments: customerSegmentModel.customerSegments
};

SegmentSelectorView.displayName = 'SegmentSelectorView';

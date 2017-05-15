import Component from 'common/system/react/BackboneComponent';
import model from 'backoffice/model/MatrixModel';
import SportMatrixRowPopup from 'cms/sports/components/SportMatrixRowPopup.js';
import {confirm} from 'common/util/PopupUtil.js';

export default class SportNodeRowView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			weight: this.props.segment.get('weight'),
			maxPrematch: this.props.segment.get('maxPrematch'),
			maxInplay: this.props.segment.get('maxInplay')
		};

		this.onCommitToMatrix = ::this.onCommitToMatrix;

	}

	/**
	 * @param segment
	 */
	onDeleteSegment(segment) {
		var segName = _.titleize(_.humanize(segment.get('sport'))),
			message = `Are you sure you wish to delete the '${segName}' segment?`;

		confirm('Warning!', message, () => { model.removeSegment(segment); });
	}

	onEditRow(segment){
		const displayPath = _.titleize(_.humanize(segment.get('sport')));
		const {weight, maxInplay, maxPrematch} = this.state;

		App.bus.trigger(
			'popup:view',
			SportMatrixRowPopup,
			{
				model,
				weight,
				maxInplay,
				maxPrematch,
				displayPath,
				hideHighlightBox: true,
				onConfirmed: this.onCommitToMatrix
			}
		);
	}

	onCommitToMatrix(rowValues){
		console.warn('rowValues:' , rowValues);
		this.props.segment.set(rowValues);
		this.setState(rowValues);
		this.notifyChangesToParent();
	}

	notifyChangesToParent(){
		if (this.props.onChange){
			this.props.onChange();
		}
	}

	/**
	 *
	 * @param newValue
	 */
	handleWeight(newValue) {
		this.props.segment.set({weight: Number(newValue)});
		this.setState({weight: Number(newValue)});
		model.updateWeightings();
	};

	/**
	 *
	 * @param newValue
	 */
	handleMaxPrematch(newValue) {
		this.props.segment.set({maxPrematch: Number(newValue)});
		this.setState({maxPrematch: Number(newValue)});
		model.updateWeightings();
	};

	/**
	 *
	 * @param newValue
	 */
	handleMaxInplay(newValue) {
		this.props.segment.set({maxInplay: Number(newValue)});
		this.setState({maxInplay: Number(newValue)});
		model.updateWeightings();
	};

	/**
	 * @returns {XML}
	 */
	render() {
		const {segment} = this.props;
		var weightLink = {
			value: this.state.weight,
			requestChange: this.handleWeight.bind(this)
		};

		var maxPrematchLink = {
			value: this.state.maxPrematch,
			requestChange: this.handleMaxPrematch.bind(this)
		};

		var maxInplayLink = {
			value: this.state.maxInplay,
			requestChange: this.handleMaxInplay.bind(this)
		};

		return (
			<div className="table-row">
				<div className="table-cell">
					{_.titleize(_.humanize(segment.get('sport')))}
				</div>
				<div className="table-cell center">
					<input type="number"
						min="0" max="1" step="0.1" valueLink={weightLink}/>
				</div>
				<div className="table-cell center">
					<input type="number" step="1"
						style={{width: '70px'}}
						valueLink={maxPrematchLink}/>
				</div>
				<div className="table-cell center">
					<input type="number" step="1"
						style={{width: '70px'}}
						valueLink={maxInplayLink}/>
				</div>
				<div className="table-cell center">

				</div>
				<div className="table-cell center action">
					<a className="btn blue small" onClick={this.onEditRow.bind(this, segment)}>Edit</a>
					&nbsp;
					<a className="btn red small" onClick={this.onDeleteSegment.bind(this, segment)}>Delete</a>
				</div>
			</div>
		)
	}
};

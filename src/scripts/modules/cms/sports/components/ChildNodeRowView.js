import Component from 'common/system/react/BackboneComponent';
import model from 'backoffice/model/MatrixModel';
import SportMatrixRowPopup from 'cms/sports/components/SportMatrixRowPopup.js';

export default class ChildNodeRowView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			weight: this.props.weight.get('weight'),
			maxPrematch: this.props.weight.get('maxPrematch'),
			maxInplay: this.props.weight.get('maxInplay'),
			highlight: this.props.weight.get('highlight')
		};

		this.onCommitToMatrix = ::this.onCommitToMatrix;
		this.notifyChangesToParent = ::this.notifyChangesToParent;
	}

	/**
	 * @param segment
	 */
	onDeleteWeight(segment, weight) {
		const nodeId = weight.get('nodeId');

		model.removeWeighting(segment, nodeId);
	}

	/**
	 *
	 * @param newValue
	 */
	handleWeight(newValue) {
		this.props.weight.set({weight: Number(newValue)});
		this.setState({weight: Number(newValue)});
		this.notifyChangesToParent();
	};

	/**
	 *
	 * @param newValue
	 */
	handleMaxPrematch(newValue) {
		this.props.weight.set({maxPrematch: Number(newValue)});
		this.setState({maxPrematch: Number(newValue)});
		this.notifyChangesToParent();
	};

	/**
	 *
	 * @param newValue
	 */
	handleMaxInplay(newValue) {
		this.props.weight.set({maxInplay: Number(newValue)});
		this.setState({maxInplay: Number(newValue)});
		this.notifyChangesToParent();
	};

	/**
	 * @param e
	 */
	handleHighlighted(e) {
		e.stopPropagation();
		this.props.weight.set({highlight: e.target.checked});
		this.setState({highlight: e.target.checked});
		this.notifyChangesToParent();
	}

	onEditRow(row){
		const {displayPath, weight, maxInplay, maxPrematch, highlight} = row.attributes;

		App.bus.trigger(
			'popup:view',
			SportMatrixRowPopup,
			{
				model,
				weight,
				maxInplay,
				maxPrematch,
				displayPath,
				highlight,
				onConfirmed: this.onCommitToMatrix
			}
		);
	}

	onCommitToMatrix(rowValues){
		this.props.weight.set(rowValues);
		this.setState(rowValues);
		this.notifyChangesToParent();
	}

	notifyChangesToParent(){
		const {onChange} = this.props;

		if (onChange){
			onChange();
		}
	}

	/**
	 * @returns {XML}
	 */
	render() {
		var styles = {textIndent: '1em', fontStyle: 'italic'};

		var weightLink = {
			value: this.props.weight.get('weight'),
			requestChange: this.handleWeight.bind(this)
		};

		var maxPrematchLink = {
			value: this.props.weight.get('maxPrematch'),
			requestChange: this.handleMaxPrematch.bind(this)
		};

		var maxInplayLink = {
			value: this.props.weight.get('maxInplay'),
			requestChange: this.handleMaxInplay.bind(this)
		};

		const isEvent = this.props.weight.get('trading') == "TRADING";
		var props = {
			type: "checkbox",
			className: "add checkbox",
			checked: this.state.highlight,
			onChange: this.handleHighlighted.bind(this)
		}

		const {segment, weight} = this.props;

		return (
			<div className="table-row small">

				<div className="table-cell" style={styles}>
					{_.titleize(weight.get('displayPath'))}
				</div>
				<div className="table-cell center">
					<input ref="input" type="number" min="0" max="1" step="0.1" valueLink={weightLink}/>
				</div>
				<div className="table-cell center">
					<input type="number" step="1" style={{width: '70px'}} valueLink={maxPrematchLink}/>
				</div>
				<div className="table-cell center">
					<input type="number" step="1" style={{width: '70px'}} valueLink={maxInplayLink}/>
				</div>
				<div className="table-cell center">
					{!isEvent && (
						<input {...props}/>
					)}
				</div>
				<div className="table-cell center action">
					<a className="btn blue small" onClick={this.onEditRow.bind(this, weight)}>Edit</a>
					&nbsp;
					<a className="btn red small" onClick={this.onDeleteWeight.bind(this, segment, weight)}>Delete</a>
				</div>
			</div>
		)
	}
};

import Component from 'common/system/react/BackboneComponent';
import model from 'backoffice/model/MatrixModel';
import cache from 'backoffice/model/NodeCache';
import TreeMenu from 'backoffice/components/controls/TreeMenu';
import {notify, errorPopup} from 'common/util/PopupUtil.js';

export default class SportSelectorView extends Component {
	constructor(props) {
		super(props);
		this.observe = false;
		this.treeHeight = _.once(function(){
			return window.innerHeight - 35;
		});

		this.forceRerender = ::this.forceRerender;
		this.onRemoveSportSuccess = ::this.onRemoveSportSuccess;
		this.onRemoveSportError = ::this.onRemoveSportError;
	}

	/**
	 * Reference the name and code inputs
	 */
	componentDidMount() {
		super.componentDidMount();
		this.props.collection.on('all', this.forceRerender );
	}

	/**
	 *
	 */
	componentWillUnmount() {
		this.props.collection.off('all', this.forceRerender);
	}

	forceRerender(){
		this.forceUpdate();
	}

	/**
	 *
	 */
	onToggle(node, expanded) {
		cache.toggleNode(node.id);
		node.set(this.props.openField, !node.get(this.props.openField));
	}

	/**
	 * @param node
	 * @param checked
	 */
	onCheckBoxChange(node, checked) {
		var nodeLevel = node.get('level');
		var sportCode = nodeLevel ? node.get('sportsCode') : node.get('sportCode');
		var segment = model.getSegmentForSport(sportCode);
		var nodeId = node.get('id');

		if (!nodeLevel) {
			if(checked) {
				model.addSegment(sportCode, nodeId);
			}
			else
				model.removeSegment(segment)
					.then(this.onRemoveSportSuccess, this.onRemoveSportError);
		} else {
			if(checked) {
				model.addWeighting(sportCode, nodeId);
			}
			else {
				model.removeWeighting(segment, nodeId);
			}
		}
	}

	onRemoveSportSuccess(){
		notify('Success', 'The sport has been removed from the matrix');
	}

	onRemoveSportError(){
		errorPopup('There has been a problem removing the sport from the matrix');
	}

	/**
	 * @returns {XML}
	 */
	render() {
		return (
		<div className="table-cell">
			<TreeMenu ref="treeMenu" id="1" key="1"
					  selected={model.getSegmentIds()}
					  data={cache.RootNodes}
					  openField={this.props.openField}
					  onToggle={this.onToggle.bind(this)}
					  onCheckBoxChange={this.onCheckBoxChange.bind(this)}
					  heightFunction={this.heightFunction.bind(this)}
					  collapseIcon="fa fa-minus-square-o"
					  expandIcon="fa fa-plus-square-o"
					  style={{minWidth:'200px'}}	/>
		</div>
		);
	}

	/**
	 * @returns {*}
	 */
	heightFunction() {
		return this.treeHeight;
	}
};

SportSelectorView.defaultProps = {
	collection: model.segments
};

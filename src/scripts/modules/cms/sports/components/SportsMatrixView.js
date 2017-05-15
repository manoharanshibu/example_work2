import Component from 'common/system/react/BackboneComponent';
import model from 'backoffice/model/MatrixModel';
import SportNodeRowView from 'cms/sports/components/SportNodeRowView';
import ChildNodeRowView from 'cms/sports/components/ChildNodeRowView';

export default class SportsMatrixView extends Component {
	constructor(props) {
		super(props);
		this.observe = false;

		this.onRowChange = ::this.onRowChange;
	}

	/**
	 * Reference the name and code inputs
	 */
	componentDidMount() {
		super.componentDidMount();
	}

	onRowChange(){
		const {onChange} = this.props;

		if (onChange){
			onChange();
		}
	}

	/**
	 * @returns {XML}
	 */
	render() {
		return (
			<div className="table-cell">
				<div className="table grid inner sports-matrix" style={{marginTop: '0px'}}>
					<div className="table-row header larger">
						<div className="table-cell" style={{width: '30%'}}>
							Sports/Competitions
						</div>
						<div className="table-cell center" style={{width: '15%'}}>
							Sport Weighting
						</div>
						<div className="table-cell center"  style={{width: '15%'}}>
							Max Prematch
						</div>
						<div className="table-cell center" style={{width: '15%'}}>
							Max Inplay
						</div>
						<div className="table-cell center" style={{width: '15%'}}>
							Add as Highlight
						</div>
						<div className="table-cell center" style={{minWidth: '150px'}}>
							Action
						</div>
					</div>
					{this.renderRows()}
				</div>
			</div>
		);
	}

	/**
	 * @returns {*}
	 */
	renderRows() {
		var filtered = this.props.collection.bySegmentName(this.props.nameFilter),
			that = this;
		return _.reduce(filtered, (rows, segment, index) => {
			rows.push((
				<SportNodeRowView key={index} segment={segment}/>
			));

			var subRows = _.reduce(segment.Weights.models, (weights, weight, index2) => {
				//if (weight.get('displayPath').toUpperCase() != segment.get('sport').toUpperCase()) {
					weights.push(
						<ChildNodeRowView
							onChange={this.onRowChange}
							key={index + '_' + index2}
							segment={segment}
							weight={weight}
							collection={that.props.collection}/>
					)
				//}
				return weights;
			}, [], this);

			rows = rows.concat(subRows);
			return rows;
		}, [], this);
	}
};

SportsMatrixView.defaultProps = {
	collection: model.segments
};

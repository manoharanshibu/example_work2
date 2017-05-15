import {uid, classNames as cx} from 'common/util/ReactUtil';
import matrixModel from 'backoffice/model/MatrixModel';
import Tabs from 'backoffice/components/tabs/Tabs';
import Tab from 'backoffice/components/tabs/Tab';

export default class SportSelection extends React.Component {
	constructor(props){
		super(props);
	}

	/**
	 * @returns {XML}
	 */
	render(){
		return (
			<div className="table-cell">
				<div className="table" style={{marginTop: '0px', borderRight: '1px solid #ECEBEB'}}>
					<div className="table-row header larger">
						<div className="table-cell">
							Sport<br/>&nbsp;
						</div>
						<div className="table-cell">
							&nbsp;
						</div>
					</div>
					{this.renderTabRows(0)}
				</div>
			</div>
		)
	}

	/**
	 * @param type
	 * @param index
	 * @returns {*}
	 */
	renderTabRows(index) {
		return this.renderRows(this.getSportNames(), index)
	}


	/**
	 *
	 */
	getSportNames() {
		var allSports = matrixModel.getSports();
		var filteredSports = _.filter(allSports, function(sport){
			return sport;
		});
		var parsedSports = _.map(filteredSports, function(sport){
			return { name: sport.get('name'), id: sport.id };
		});

		return parsedSports;
	}

	/**
	 *
	 * @param row
	 */
	onAddSegment(row) {
		matrixModel.addSegment(row.name.toUpperCase(), row.id);
	}

	/**
	 * @param rowsData
	 * @returns {*}
	 */
	renderRows(rowsData, tIndex) {
		return _.map(rowsData, function (row, i) {
			var classNames = cx('table-row');

			return (
				<div className={classNames} key={'sport-row'+row.id}>
					<div className="table-cell">{row.name}</div>
					<div className="table-cell center" style={{minWidth: '50px'}}>
						<a className="btn green small" onClick={this.onAddSegment.bind(this, row)}>Add</a>
					</div>
				</div>
			);
		}, this);
	}
}


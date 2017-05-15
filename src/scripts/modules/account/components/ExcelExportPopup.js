import Popup from 'common/view/popup/Popup';
import Component from 'common/system/react/BackboneComponent';
import { DownloadJsonInXls } from 'app/util/Converters'

export default class ExcelExportPopup extends Component {
	constructor(props) {
		super(props);

		this.buttons = [
			{ title: 'Download', cls: 'blue', handler: this.onOk.bind(this) }
		];

		this.collection = this.props.collection || [];
		this.columns = this.getColumns();
	}

	componentWillReceiveProps(newProps) {
		if (this.props.collection !== newProps.collection) {
			this.collection = this.props.collection.splice(0);
			this.columns = this.getColumns();
		}
	}

	getColumns() {
		if (!this.collection.length) {
			return [];
		}

		return this.collection[0].map((h, index) => {
			return { oIndex: index, index, name: h, enabled: true }
		})
	}


	validateNumber(evt) {
		const e = evt || window.event;
		let key = e.keyCode || e.which;
		key = String.fromCharCode(key);
		const regex = /[0-9]|\./;
		if (!regex.test(key)) {
			e.returnValue = false;
			if (e.preventDefault) e.preventDefault();
		}
	}

	/**
	 *
	 */
	onClose() {
		this.props.onClose();
	}

	/**
	 *
	 */
	onOk() {
		const title = this.props.title || 'ExcelExport';
		const exportArray = [];
		this.collection.forEach(row => {
			const data = this.columns.map(c => {
				return row[c.oIndex];
			}).filter((c, i) => {
				return this.columns[i].enabled;
			});
			data.splice(0, 0, '');
			exportArray.push(data);
		});
		const sumRow = this.getSumRow(exportArray);
		if (sumRow) {
			exportArray.push(sumRow);
		}
		const json = JSON.stringify(exportArray);
		DownloadJsonInXls(json, title);
		this.props.onClose();
	}

	getSumRow(collection) {
		const { sumCols } = this.props;
		const firstRow = collection[0];
		const sumRow = this.columns.map(c => {return ''});
		sumRow[0] = 'SUM';

		sumCols.forEach(s => {
			const index = firstRow.indexOf(s);
			let sum = 0;
			for (let i = 1; i < collection.length; i++) {
				const col = collection[i];
				sum += parseFloat(col[index]);
			}
			sumRow[index] = sum.toFixed(2);
		});

		return sumRow;
	}

	onColumnOrderChange(i, e) {
		this.columns[i].index = e.currentTarget.value - 1;
		this.forceUpdate();
	}

	onColumnFocusOut(i) {
		const n = this.columns[i].index;
		if (n >= 0 && n < this.columns.length) {
			this.columns.splice(n, 0, this.columns.splice(i, 1)[0]);
		}
		this.columns.forEach((c, index) => {
			c.index = index
		});
		this.forceUpdate();
	}

	onDisable(c) {
		c.enabled = !c.enabled;
		this.forceUpdate();
	}

	/**
	 * @returns {XML}
	 */
	render() {
		if (!this.collection.length) {
			return null;
		}

		return (
			<Popup title="Excel Export"
				   buttons={this.buttons}
				   onClose={this.onClose.bind(this)}
				   styles={this.props.styles}>
				<div className="padding">
					<div className="table grid tight inner">
						<div className="table-row ">
							<div className="table-cell center header">
								<h3>Column Name</h3>
							</div>
							{ this.renderHeader() }
						</div>
						<div className="table-row">
							<div className="table-cell center header">
								<h3>Index</h3>
							</div>
							{ this.renderIndexes() }
						</div>
						<div className="table-row">
							<div className="table-cell center header">
								<h3>Selected</h3>
							</div>
							{ this.renderCheckboxes() }
						</div>
					</div>
				</div>
			</Popup>
		)
	}

	/**
	 *
	 * @returns {*}
	 */
	renderHeader() {
		return this.columns.map(c => {
			return (
				<div className="table-cell center">
					{c.name}
				</div>
			)
		});
	}

	/**
	 *
	 * @returns {*}
	 */
	renderIndexes() {
		return this.columns.map((c, i) => {
			return (
				<div className="table-cell center">
					<input type="text" min="0" value={ c.index + 1 }
						   onKeyPress={ ::this.validateNumber } onChange={this.onColumnOrderChange.bind(this, i)}
						   onBlur={this.onColumnFocusOut.bind(this, i)}
					/>
				</div>
			)
		});
	}

	/**
	 *
	 * @returns {*}
	 */
	renderCheckboxes() {
		return this.columns.map((c, i) => {
			return (
				<div className="table-cell center">
					<input type="checkbox" checked={ c.enabled } onClick={ this.onDisable.bind(this, c) }/>
				</div>
			)
		});
	}

}

ExcelExportPopup.defaultProps = {
	styles: {
		display: 'block',
		position: 'fixed',
		opacity: 1,
		zIndex: 11000,
		maxWidth: '100%',
		width: '90%',
		top: 100,
		left: '5%',
		minHeight: 400
	}
}


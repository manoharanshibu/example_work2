import Component from 'common/system/react/BackboneComponent';
import {DateTimePicker} from 'react-widgets';
import model from 'backoffice/model/CustomerModel';

export default class AccountStats extends Component {
	constructor(props) {
		super(props);
	}

	/**
	 *
	 */
	componentDidMount() {
		var that = this;
		model.on('change', () => {
			that.forceUpdate();
		});

		model.bettingStats.on('change', () => {
			that.forceUpdate();
		});

		//set initial dates
		this.dateFrom = moment(new Date(moment().subtract(90, 'days'))).format("YYYY-MM-DD");
		this.dateTo = moment(new Date()).format("YYYY-MM-DD");

		//default stats load
		//this.getCustomerStats();
	}

	/**
	 *
	 */
	getCustomerStats() {
		if(this.dateFrom.valueOf() <= this.dateTo.valueOf()){
			model.getStats(this.dateFrom, this.dateTo);
		}
	}

	/**
	 *
	 * @param date
	 * @param dateStr
	 */
	onFromDateChange(date, dateStr) {
		this.dateFrom = moment(date).format("YYYY-MM-DD");
	}

	/**
	 *
	 * @param date
	 * @param dateStr
	 */
	onToDateChange(date, dateStr) {
		this.dateTo = moment(date).format("YYYY-MM-DD");
	}


	/**
	 * Renders compeition container
	 * @returns {XML}
	 */
	render() {
		var currency = model.bettingStats.get('currency');

		var highlightClass = model.bettingStats.get('settledPL') < 0 ? 'highlightRed' : 'highlightGreen';
		return (
			<div className="box">
				<div style={{minHeight: '700px'}}>
					<div className="table toolbar">
						<div className="table-row">
							<div className="table-cell">
								<div className="inline-form-elements">
									<label>From</label>
									<DateTimePicker ref="fromDate" onChange={this.onFromDateChange.bind(this)} format="DD-MM-YYYY" time={false} defaultValue={new Date(moment().subtract(90, 'days'))}/>
								</div>
							</div>
							<div className="table-cell">
								<div className="inline-form-elements">
									<label>To</label>
									<DateTimePicker ref="toDate" onChange={this.onToDateChange.bind(this)} format="DD-MM-YYYY" time={false} defaultValue={new Date()} max={new Date()}/>
								</div>
							</div>
							<div className="table-cell right">
								<a href="javascript:void(0)" className="btn blue filled" onClick={this.getCustomerStats.bind(this)}>Search</a>
							</div>

						</div>
					</div>

					<div className="table">
						<div className="table-row header larger">
							<div className="table-cell center">
								Sports Bets
							</div>
							<div className="table-cell center">

							</div>
						</div>
						<div className="table-row">
							<div className="table-cell center">
								Settled Bets
							</div>
							<div className="table-cell center">
								{model.bettingStats.get('settledBets')}
							</div>
						</div>
						<div className="table-row">
							<div className="table-cell center">
								Total Stake
							</div>
							<div className="table-cell center">
								{model.bettingStats.get('totalStake') + ' ' + currency}
							</div>
						</div>
						<div className="table-row">
							<div className="table-cell center">
								Settled Stake
							</div>
							<div className="table-cell center">
								{model.bettingStats.get('settledStake') + ' ' + currency}
							</div>
						</div>
						<div className="table-row">
							<div className="table-cell center">
								Settled P\L
							</div>
							<div className={"table-cell " + highlightClass}>
								{model.bettingStats.get('settledPL') + ' ' + currency}
							</div>
						</div>
						<div className="table-row">
							<div className="table-cell center">
								Margin %
							</div>
							<div className="table-cell center">
								{model.bettingStats.get('marginPercent')}%
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
};

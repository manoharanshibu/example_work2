import {DateTimePicker} from 'react-widgets';
import model from 'backoffice/model/CustomerModel';

export default class AccountStats extends React.Component {
	constructor() {
		super();
	}

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

		this.getCustomerStats();
	}

	getCustomerStats() {
		if(this.dateFrom.valueOf() <= this.dateTo.valueOf()){
			model.getStats(this.dateFrom, this.dateTo);
		}
	}

	onFromDateChange(date, dateStr) {
		this.dateFrom = moment(date).format("YYYY-MM-DD");
	}

	onToDateChange(date, dateStr) {
		this.dateTo = moment(date).format("YYYY-MM-DD");
	}

	/**
	 * Renders competition container
	 * &#8358; is the Naira currency symbol
	 * TODO: Populate this table with real data
	 * @returns {XML}
	 */
	render() {

		let gamesStatistics = model.bettingStats.get('gamesStatistics');
		let gamesStake = '', gamesPL = '';

		gamesStake = gamesStatistics ? gamesStatistics.gamesStake : '';
		gamesPL = gamesStatistics ? gamesStatistics.gamesPL : '';

		return (
			<div className="box">
				<div style={{minHeight: '700px'}}>
					<div className="table toolbar">
						<div className="table-row">
							<div className="table-cell">
								<div className="inline-form-elements">
									<label>From</label>
									<DateTimePicker ref="fromDate"
													onChange={this.onFromDateChange.bind(this)}
													format='DD-MM-YYYY'
													time={false}
													defaultValue={new Date(moment().subtract(90, 'days'))}/>
								</div>
							</div>
							<div className="table-cell">
								<div className="inline-form-elements">
									<label>To</label>
									<DateTimePicker ref="toDate"
													onChange={this.onToDateChange.bind(this)}
													format='DD-MM-YYYY'
													time={false}
													defaultValue={new Date()} max={new Date()}/>
								</div>
							</div>
							<div className="table-cell right">
								<button className="btn blue filled"
										onClick={this.getCustomerStats.bind(this)}>
									Search
								</button>
							</div>

						</div>
					</div>

					<div className="table">
						<div className="table-row header larger">
							<div className="table-cell">
								Sports Bets
							</div>
							<div className="table-cell">

							</div>
						</div>
						<div className="table-row">
							<div className="table-cell">
								Settled Bets
							</div>
							<div className="table-cell center">
								{model.bettingStats.get('settledBets')}
							</div>
						</div>
						<div className="table-row">
							<div className="table-cell">
								Total Stake
							</div>
							<div className="table-cell center">
								&#8358;{model.bettingStats.get('totalStake')}
							</div>
						</div>
						<div className="table-row">
							<div className="table-cell">
								Settled Stake
							</div>
							<div className="table-cell center">
								&#8358;{model.bettingStats.get('settledStake')}
							</div>
						</div>
						<div className="table-row">
							<div className="table-cell">
								Settled P\L
							</div>
							<div className="table-cell center">
								&#8358;{model.bettingStats.get('settledPL')}
							</div>
						</div>
						<div className="table-row">
							<div className="table-cell">
								Margin %
							</div>
							<div className="table-cell center">
								{model.bettingStats.get('marginPercent')}%
							</div>
						</div>
					</div>

					<div className="table">
						<div className="table-row header larger">
							<div className="table-cell">
								Lotto Bets
							</div>
							<div className="table-cell">

							</div>
						</div>
						<div className="table-row">
							<div className="table-cell">
								Total Stake
							</div>
							<div className="table-cell center">

								&#8358;{gamesStake}
							</div>
						</div>
						<div className="table-row">
							<div className="table-cell">
								Total Winnings
							</div>
							<div className="table-cell center">
								&#8358;{gamesPL}
							</div>
						</div>
					</div>

					<div className="table">
						<div className="table-row header larger">
							<div className="table-cell">
								Virtual
							</div>
							<div className="table-cell">

							</div>
						</div>
						<div className="table-row">
							<div className="table-cell">
								Total Stake
							</div>
							<div className="table-cell">
								&#8358;0.00
							</div>
						</div>
						<div className="table-row">
							<div className="table-cell">
								Total Winnings
							</div>
							<div className="table-cell">
								&#8358;0.00
							</div>
						</div>
					</div>

				</div>
			</div>
		)
	}
};

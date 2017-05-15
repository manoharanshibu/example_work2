import betsModel from 'backoffice/model/bets/BetsModel';
import CheckBox from 'backoffice/components/elements/CheckBox';

export default class SystemBets extends React.Component {

	componentDidMount() {
		betsModel.on('bets:update', this.forceUpdate, this);
	}

	componentWillUnmount() {
		betsModel.off('bets:update', this.forceUpdate, this);
	}

	onEachWayChange(bet, e) {
		bet.eachWay = e.currentTarget.checked;
		this.forceUpdate();
		betsModel.trigger('bets:update');
	}
	
	onStakeChange(bet, e) {
		bet.stake = e.target.value;
		betsModel.trigger('bets:updateStake');
		this.forceUpdate();
	}

	getSystemBets() {
		const systems = betsModel.getSystemBets();
		const combiBets = betsModel.getStandardCombi(systems);

		let filteredSystems = _.values(systems);

		if (combiBets.length > 0) {
			const combiBet = combiBets[0];
			const betId = combiBet.betId();

			filteredSystems = _.filter(filteredSystems, (system) => {
				return system.betId() !== betId;
			});
		}
		return filteredSystems;
	}

	renderSystemBets(systemBets) {
		const list = ['Name', 'Stake', 'Odds', 'Each Way'];
		const bets = _.map(systemBets, (model, r) => this.renderSystemBet(model, r));

		const cellList = list.map(cell => (
			<div className="table-cell center">
				{ cell }
			</div>
		));

		return (
			<div>
				<h1 style={{ padding: 10, fontWeight: 'bold' }} >System Bets</h1>
				<div className="table no-border-bottom">
					<div className="table-row header larger">
						{ cellList }
					</div>
					{ bets }
				</div>
			</div>
		);
	}

	renderSystemBet(bet, r) {
		return (
			<div className="table-row">
				<div className="table-cell center">
					{ bet.name }
				</div>
				<div className="table-cell center">
					<input type="number" min="0.00" placeholder="1.00" step="1" value={ bet.stake }
						onChange={ this.onStakeChange.bind(this, bet) }
					/>
				</div>
				<div className="table-cell center">
					{ bet.getOdds() }
				</div>
				{ bet.isEachWayAvailable && <div className="table-cell center">
					<input type="checkbox" checked={ bet.eachWay } onChange={ this.onEachWayChange.bind(this, bet) } />
				</div> }
			</div>
		);
	}

	render() {
		const systemBets = this.getSystemBets();
		if (!systemBets.length) {
			return null;
		}

		let hasSystemBets = true;
		const uniqueMarketCount = betsModel.getUniqueMarketCount().marketCount;
		if (uniqueMarketCount <= 2) {
			hasSystemBets = false;
		}

		return (
			<div>
				{ hasSystemBets && this.renderSystemBets(systemBets) }
			</div>
		);
	}
}

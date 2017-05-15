import betsModel from 'backoffice/model/bets/BetsModel';
import CheckBox from 'backoffice/components/elements/CheckBox';

export default class CombiBets extends React.Component {

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

	render() {
		const systemBets = betsModel.getSystemBets();

		if (!systemBets.length) {
			return null;
		}

		const combibets = betsModel.getStandardCombi(systemBets);

		const valid = _.values(combibets).length > 0 && _.values(betsModel.singleBets).length > 0;

		if (!valid) {
			return null;
		}

		const list = ['Name', 'Stake', 'Odds', 'Each Way'];
		const cellList = list.map(cell => (
			<div className="table-cell center">
				{ cell }
			</div>
		));

		return (
			<div>
				<h1 style={{ padding: 10, fontWeight: 'bold' }} >Combi Bets</h1>
				<div className="table no-border-bottom">
					<div className="table-row header larger">
						{ cellList }
					</div>
					{ _.map(combibets, (bet, index) => this.renderCombiBet(bet, index))}
				</div>
			</div>
		);
	}


	renderCombiBet(bet, index)
	{
		return (
			<div className="table-row" key={index} >
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
				{ bet.isEachWayAvailable &&
				<div className="table-cell center">
					<input type="checkbox" checked={ bet.eachWay } onChange={ this.onEachWayChange.bind(this, bet) } />
				</div> }
			</div>
		);
	}
}

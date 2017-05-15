import betsModel from 'backoffice/model/bets/BetsModel';
import CheckBox from 'backoffice/components/elements/CheckBox';

export default class SystemBets extends React.Component {

	onRemoveBet(bet) {
		betsModel.removeBetSelection(bet);
		betsModel.trigger('bets:update');
		this.forceUpdate();
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

	onOddsChange(bet, e) {
		bet.betPart.selection.decimalOdds = e.target.value;
		betsModel.trigger('bets:update');
		this.forceUpdate();
	}

	onFreeBetSelectChange(bet, e) {
		const selectedFreeBetId = e.target.value;

		if (selectedFreeBetId !== "") {
			let currentFreeBet = _.findWhere(bet.freeBet, {accountBonusId: parseInt(selectedFreeBetId)});
			const accountBonusId = currentFreeBet.accountBonusId;
			const freeBetStake = currentFreeBet.bonusStakes[0].amount;
			betsModel.includeFreeBetSelection(bet, accountBonusId);
			betsModel.updateFreeBetStake(bet, freeBetStake);
		} else {
			betsModel.excludeFreeBetSelection(bet);
			betsModel.updateFreeBetStake(bet, 0);
		}
		betsModel.trigger('bets:update');
		this.forceUpdate();
	}

	renderSingleBet(bet) {
		const selection = bet.betPart.selection;
		return (
			<div className="table-row" >
				<div className="table-cell center">
					{ selection.eventName }
				</div>
				<div className="table-cell center">
					{ selection.marketType }
				</div>
				<div className="table-cell center">
					{ selection.selectionName }
				</div>
				<div className="table-cell center">
					<input type="number" min="0.00" placeholder="1.00" step="1" value={ bet.betPart.selection.decimalOdds }
						onChange={ this.onOddsChange.bind(this, bet) }
					/>
				</div>
				<div className="table-cell center">
					<input type="number" min="0.00" placeholder="0.00" step="1" value={ bet.stake }
						onChange={ this.onStakeChange.bind(this, bet) }
					/>
				</div>
				<div className="table-cell center">
					{bet.isFreeBet && (

						<select value={bet.selectedFreeBetId} onChange={this.onFreeBetSelectChange.bind(this , bet)} defaultValue={'DEFAULT'}>
							<option value="">Select freebet</option>
									{_.map(bet.freeBet, this.renderFreeBetInfo)}
						</select>
					)}
				</div>

				<div className="table-cell center">
					{ bet.isEachWayAvailable &&
					<input type="checkbox" checked={ bet.eachWay } onChange={ this.onEachWayChange.bind(this, bet) } /> }
				</div>
				<div className="table-cell center">
					<a className="btn red small" onClick={ this.onRemoveBet.bind(this, bet) }>Delete</a>
				</div>
			</div>
		);
	}


	renderFreeBetInfo(freebet , index)
	{
		return (
			<option key={index} value={freebet.accountBonusId}>{freebet.freeBetDescription}</option>
		);
	}

	render() {
		const bets = betsModel.getSingleBets();
		if (!bets.length) {
			return null;
		}

		const list = ['Event Name', 'Market Type', 'Selection Name', 'Odds', 'Stake', 'Freebet', 'Each Way', 'Delete'];

		const cellList = list.map((cell, index) => (
			<div className="table-cell center" key={ index } >
				{ cell }
			</div>
		));

		const singleBets = _.map(bets, (bet) => this.renderSingleBet(bet));
		return (
			<div className="table no-border-bottom">
				<div className="table-row header larger">
					{ cellList }
				</div>
				{ singleBets }
			</div>
		);
	}
}

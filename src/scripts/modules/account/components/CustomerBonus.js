import ComboBox from 'backoffice/components/elements/ComboBox';
import model from 'backoffice/model/CustomerModel';
import Loader from 'app/view/Loader';
import Popup from 'common/view/popup/Popup';

export default class CustomerBonus extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			bonusType: "ACTIVE",
			accountId: "",
			loading: true,
			modalIsOpen: false,
			selectedBonus: {}
		};

		this.onBonusTypeChange = ::this.onBonusTypeChange;
		this.onSelectBonus = ::this.onSelectBonus;
		this.closeModal = ::this.closeModal;
	}

	componentDidMount() {
		this.bonusType = ReactDOM.findDOMNode(this.refs.bonusType);
		this.accountId = ReactDOM.findDOMNode(this.refs.accountId);

		this.props.collection.on('change add remove reset', () => {
			this.forceUpdate();
		});

		model.currentAccount.on('change', () => {
			this.forceUpdate();
		});

		this.onSearch();
	}

	componentWillUnmount() {
		model.customerBonuses.off(null, null, this);

		this.props.collection.off('change add remove reset', () => {
			this.forceUpdate();
		});

	}

	onSearch() {
		var accountId = model.currentAccount.id;
		this.setState({
			accountId,
			loading: true
		});

		model.loadBonus(accountId, this.state.bonusType)
			.then(::this.onBonusesLoaded, ::this.onBonusesLoaded);
	}

	onBonusesLoaded() {
		this.setState({loading: false})
	}

	onBonusTypeChange(type) {
		this.setState({bonusType: type}, this.onSearch);
	}

	onSelectBonus(bonus) {
		this.setState({
			selectedBonus: bonus.attributes,
			modalIsOpen: true
		});
		// const route = '/bonus/details/' + bonus.attributes.code.toLowerCase();
		// App.navigate(route);
	}

	onCancelBonus()
	{
		const { selectedBonus } = this.state;
		this.setState({ modalIsOpen: false })
		model.voidAccountEntitlements(selectedBonus.code, ::this.onBonusVoid);
	}

	onBonusVoid() {
		this.onSearch();
		App.bus.trigger('popup:notification', {
			title: 'Confirmation',
			content: 'The bonus has been voided successfully',
			autoDestruct: 2000 }
		);
	}

	closeModal() {
		this.setState({
			modalIsOpen: false
		});
	}
	/**
	 * @returns {XML}
	 */
	render() {

		const {bonusType, selectedBonus, modalIsOpen} = this.state;
		const isDeposit = selectedBonus.bonusType === 'deposit';
		const isRelease = selectedBonus.bonusType === 'release';
		const isFreebet = selectedBonus.bonusType === 'freebet';

		return (
			<div>
				<div className="box">
					<div style={{minHeight: window.innerHeight - 50}}>
						<div className="table toolbar">
							<div className="table-row">
								<div className="table-cell">
									<div className="inline-form-elements">
										<ComboBox
											ref="bonusType"
											label="Bonus Type"
											labelStyle={{verticalAlign: 'middle'}}
											style={{width:'120px'}}
											value={bonusType}
											onChange={this.onBonusTypeChange}
										>
											<option value="ACTIVE">Active</option>
											<option value="AVAILABLE">Available</option>
											<option value="HISTORIC">History</option>
										</ComboBox>
									</div>
								</div>
							</div>
						</div>
						{this.renderContents()}
					</div>
				</div>
				{modalIsOpen && (
					isDeposit && this.renderModal('deposit')
					||
					isRelease && this.renderModal('release')
					||
					isFreebet && this.renderModal('freebet')
				)}
			</div>
		);
	}

	renderContents(){
		if (this.state.loading){
			return <Loader/>;
		}

		return (
			<div>
				{this.renderUserCredentials()}
				{this.renderTable('deposit')}
				{this.renderTable('release')}
				{this.renderTable('freebet')}
			</div>
		);
	}

	renderTable(type){
		const releaseCells = ['Bonus Name', 'Opted-In Date', 'Min Odds', 'Min Stakes', 'Bonus Stakes'];
		//const freebetCells = releaseCells;
		const depositCells = ['Bonus Name', 'Opted-In Date', 'Bonus Factor', 'Wagering Factor',
			'Minimum Odds', 'Min Deposit', 'Max Deposit', 'Remaining Turnover'];

		const list = type === 'deposit' ? depositCells : releaseCells;

		return(
			<div className="panel margin-offset">
				<h2>{_.titleize(type)}</h2>
				<div className="table grid">
					<div className="table-row header">
						{list.map((cell, index) => (
							<div key={index} className="table-cell center">
								{cell}
							</div>
						))}
					</div>
					{this.renderTableResults(type)}
				</div>
			</div>
		);
	}

	renderTableResults(type){
		const depositCells = ['name', 'optInDate', 'bonusFactor', 'wageringFactor', 'minOdds', 'minDeposit', 'maxDeposit', 'turnoverAmount'];
		const releaseCells = ['name', 'optInDate', 'entitlementMinOdds', 'minStake', 'bonusStake'];
		const freebetCells = ['name', 'optInDate', 'settlementMinOdds', 'minStake', 'bonusStake'];

		let list;
		if(type === 'deposit'){
			list = depositCells;
		}else if (type === 'freebet'){
			list = freebetCells;
		}else{
			list = releaseCells;
		}

		return this.props.collection.models.map((bonus, index) => {

			const bonusType = bonus.get('bonusType');

			if(bonusType === type){
				return (
					<div
						className="table-row clickable"
						key={`bonus-${type}-row-${index}`}
						onClick={this.onSelectBonus.bind(this, bonus)}
					>
						{list.map((cell, index) => (
							<div key={index} className="table-cell center">
								{bonus.get(cell)}
							</div>
						))}
					</div>
				);

			}

		});
	}

	renderUserCredentials(){
		const {id, firstName, lastName, username} = model.currentAccount.attributes;
		if(id !== ""){
			return(
				<div className="panel">
					<h2>
						<span>{_.titleize(firstName)} </span>
						<span>{_.titleize(lastName)} </span>
						<span>{" - " + username} </span>
						<span>{" - " + id} </span>
					</h2>

				</div>
			);
		}
	}

	renderTableRow(string, amount){
		return (
			<div className="table-row">
				<div className="table-cell">{string}</div>
				<div className="table-cell">{amount}</div>
			</div>
		);
	}

	renderTableRowOptions(string, amount, first, second){
		return (
			<div className="table-row">
				<div className="table-cell">{string}</div>
				<div className="table-cell">{amount ? first : second}</div>
			</div>
		);
	}

	renderSubHeader(string){
		return (
			<div className="table-row header">
				<div className="table-cell center">
					<h3>{string}</h3>
				</div>
				<div className="table-cell center">

				</div>
			</div>
		);
	}

	renderList(string, list){

		const li = list.map((element, index) => <li key={index}>{element}</li>);

		return (
			<div className="table-row">
				<div className="table-cell">{string}</div>
				<div className="table-cell">
					<ul>
						{li || ''}
					</ul>
				</div>
			</div>
		);
	}

	renderDeposit() {
		const selectedBonus = this.state.selectedBonus;

		const {name, code, daysToActivate, daysToFulfill, optInDate, bonusFactor, wageringFactor,
			wageringOption, turnoverAmount, bonusProgress, minOdds, minDeposit, maxDeposit, paymentMethods} = selectedBonus;

		return (
			<div className="panel margin-offset">
				<div className="table grid">
					{this.renderTableRow('Bonus Name', name)}
					{this.renderTableRow('Bonus Code', code)}
					{this.renderTableRow('Days to activate', daysToActivate)}
					{this.renderTableRow('Days to fulfill', daysToFulfill)}
					{this.renderTableRow('Opt-In Date', optInDate)}
					{this.renderTableRow('Bonus Factor', bonusFactor)}
					{this.renderTableRow('Wagering Factor', wageringFactor)}
					{this.renderTableRow('Wagering Option', wageringOption)}
					{this.renderTableRow('Remaining Turnover', turnoverAmount)}
					{/*this.renderTableRow('Bonus Progress', bonusProgress)*/}
					{this.renderTableRow('Minimum Odds', minOdds)}
					{this.renderTableRow('Min Deposit', minDeposit)}
					{this.renderTableRow('Max Deposit', maxDeposit)}
					{this.renderList('Payment Methods', paymentMethods)}

				</div>
			</div>
		);
	}

	renderRelease() {
		const selectedBonus = this.state.selectedBonus;

		const {name, code, daysToActivate, daysToEntitlement, optInDate, winningOnly, numWinningBets, winningBonusPercentage,
			entitlementMinOdds, minStake, losingOnly, numLosingBets, losingBonusPercentage,
			entMobile, entPrematchInplay, bonusStake, accumulatesStake, entPaths, entMarkets} = selectedBonus;
		return (
			<div className="panel margin-offset">
				<div className="table grid">
					{this.renderTableRow('Bonus Name', name)}
					{this.renderTableRow('Bonus Code', code)}
					{this.renderTableRow('Days to activate', daysToActivate)}
					{this.renderTableRow('Days to meet Entitlement', daysToEntitlement)}
					{this.renderTableRow('Opt-In Date', optInDate)}
					{this.renderTableRow('Minimum Odds', entitlementMinOdds)}
					{this.renderTableRowOptions('Winning Only', winningOnly, 'Yes', 'No')}
					{this.renderTableRowOptions('No. Winning Bets', winningOnly, numWinningBets, '0')}
					{this.renderTableRowOptions('Winning Bonus %', winningOnly, `${winningBonusPercentage}%`, '0%')}
					{this.renderTableRowOptions('Loosing Only', losingOnly, 'Yes', 'No')}
					{this.renderTableRowOptions('No. Loosing Bets', losingOnly, numLosingBets, '0')}
					{this.renderTableRowOptions('Loosing Bonus %', losingOnly, `${losingBonusPercentage}%`, '0%')}
					{this.renderTableRow('Prematch/Inplay', entPrematchInplay)}
					{this.renderTableRow('Mobile', entMobile)}
					{this.renderTableRow('Accumulate Stakes', accumulatesStake)}
					{this.renderTableRow('Min Stakes', minStake)}
					{this.renderList('Paths', entPaths)}
					{this.renderList('Markets', entMarkets)}
					{this.renderTableRow('Bonus Stakes', bonusStake)}
				</div>
			</div>
		);
	}

	renderFreebet() {
		const selectedBonus = this.state.selectedBonus;

		const {name, code, daysToActivate, daysToEntitlement, daysToSettlement, optInDate, winningOnly, numWinningBets, winningBonusPercentage,
			entitlementMinOdds, settlementMinOdds, minStake, losingOnly, numLosingBets, losingBonusPercentage, entMobile, settMobile,
			entPrematchInplay, settPrematchInplay, bonusStake, entitlementMet, accumulatesStake,
			entPaths, settPaths, entMarkets, settMarkets} = selectedBonus;
		return (
			<div className="panel margin-offset">
				<div className="table grid">
					{this.renderTableRow('Bonus Name', name)}
					{this.renderTableRow('Bonus Code', code)}
					{this.renderTableRow('Days to activate', daysToActivate)}
					{this.renderTableRow('Days to meet Entitlement', daysToEntitlement)}
					{this.renderTableRow('Days to meet Settlement', daysToSettlement)}
					{this.renderTableRow('Opt-In Date', optInDate)}

					{this.renderSubHeader('Entitlement')}
					{this.renderTableRow('Entitlement Met', entitlementMet)}
					{this.renderTableRow('Minimum Odds', entitlementMinOdds)}
					{this.renderTableRowOptions('Winning Only', winningOnly, 'Yes', 'No')}
					{this.renderTableRowOptions('No. Winning Bets', winningOnly, numWinningBets, '0')}
					{this.renderTableRowOptions('Winning Bonus %', winningOnly, `${winningBonusPercentage}%`, '0%')}
					{this.renderTableRowOptions('Loosing Only', losingOnly, 'Yes', 'No')}
					{this.renderTableRowOptions('No. Loosing Bets', losingOnly, numLosingBets, '0')}
					{this.renderTableRowOptions('Loosing Bonus %', losingOnly, `${losingBonusPercentage}%`, '0%')}
					{this.renderTableRow('Prematch/Inplay', entPrematchInplay)}
					{this.renderTableRow('Mobile', entMobile)}
					{this.renderTableRowOptions('Accumulate Stakes', accumulatesStake, 'Yes', 'No')}
					{this.renderTableRow('Min Stakes', minStake)}
					{this.renderList('Paths', entPaths)}
					{this.renderList('Markets', entMarkets)}

					{this.renderSubHeader('Settlement')}
					{this.renderTableRow('Prematch/Inplay', settPrematchInplay)}
					{this.renderTableRow('Mobile', settMobile)}
					{this.renderTableRow('Minimum Odds', settlementMinOdds)}
					{this.renderTableRow('Bonus Stakes', bonusStake)}
					{this.renderList('Paths', settPaths)}
					{this.renderList('Markets', settMarkets)}
				</div>
			</div>
		);
	}

	renderModal(type){
		const deposit = type === 'deposit' ? this.renderDeposit() : null;
		const release = type === 'release' ? this.renderRelease() : null;
		const freebet = type === 'freebet' ? this.renderFreebet() : null;
		const {bonusType} = this.state;

		return <Popup
			onClose={this.closeModal}
			title="Customer Bonuses"
			defaultStyles={this.props.popupStyles}
		>
			{deposit}
			{release}
			{freebet}
			{
				deposit && bonusType === 'ACTIVE' &&
				<div className="align-center" style={{ width: '100%' }}>
					<a className="btn red filled" onClick={this.onCancelBonus.bind(this)}>Cancel bonus</a>
				</div>
			}
		</Popup>
	}

};

CustomerBonus.defaultProps = {
	collection: model.customerBonuses,
	popupStyles: {
		display: 'block',
		position: 'fixed',
		opacity: 1,
		zIndex: 11000,
		left: '50%',
		marginLeft: '-200px',
		top: '100px',
		bottom: '100px',
		width: '400px',
		minHeight: '400px',
		overflowY: 'auto'
	}
};

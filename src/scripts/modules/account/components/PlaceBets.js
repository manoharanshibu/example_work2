import Popup from 'common/view/popup/Popup';
import Component from 'common/system/react/BackboneComponent';
import NewBetsPopup from 'account/components/bets/NewBetsPopup';
import SingleBets from './bets/SingleBets';
import SystemBets from './bets/SystemBets';
import CombiBets from './bets/CombiBets';
import betsModel from 'backoffice/model/bets/BetsModel';
import ComboBox from 'backoffice/components/elements/ComboBox';
import service from 'backoffice/service/BackofficeRestfulService';

export default class PlaceBets extends Component {
	constructor(props) {
		super(props);

		this.state = {
			newBet: true,
			stake: 1,
			channels: []
		};

		betsModel.on('bets:update', this.forceUpdate, this);
		betsModel.on('bets:updateStake', this.forceUpdate, this);

		this.loadChannels();
		this.loadCustomerBonuses();

		this.onClose = ::this.onClose;
		this.onConfirm = ::this.onConfirm;
		this.onAddMore = ::this.onAddMore;
		this.onSend = ::this.onSend;
	}


	/**
	 *
	 */
	loadChannels() {
		var that = this;
		return service.getSegmentChannels()
			.then(resp => {
				const channels = resp.channels;
				this.setState({ channels });
			});
	}

	loadCustomerBonuses() {
		var { accountId} = this.props;
		betsModel.loadCustomerBonuses(accountId , 'ACTIVE');
	}


	onConfirm() {
		this.setState({ newBet: false });
	}

	onSend() {
		this.props.onClose();
		const { accountId, accountCurrency } = this.props;
		betsModel.placeBet(accountId, accountCurrency);
	}

	onAddMore() {
		this.setState({ newBet: true });
	}

	onClose() {
		this.props.onClose();
	}

	render() {
		const modalWinStyles = {
			maxWidth: 'none',
			overflow: 'auto',
			marginLeft: 0,
			marginTop: 0,
			top: '5%',
			bottom: '5%',
			left: '20%',
			right: '20%',
			width: 'auto',
			height: 'auto'
		};


		const { newBet } = this.state;

		if (newBet) {
			return this.renderNewBet(modalWinStyles);
		}
		return this.renderBets(modalWinStyles);
	}

	renderBets(modalWinStyles) {
		const buttons = [];
		if(betsModel.getTotalNumberOfBetsWithStake() > 0){
			buttons.push({ title: 'Send', cls: 'blue', handler: this.onSend });
		}
		buttons.push({ title: 'Add bet', cls: 'blue', handler: this.onAddMore });
		buttons.push({ title: 'Cancel', cls: 'blue', handler: this.onClose });
		const { channels } = this.state;

		const title = `
		 Number of bets: ${betsModel.getTotalNumberOfBetsWithStake()},
		 Total Stake: ${betsModel.totalStake()},
		 Potential Winnings: ${betsModel.estimatedReturns()}
		 `;

		return (
			<Popup title={title}
				titleBarColor="#337AB7"
				footerIsAbsolute
				className="popup-with-buttons"
				styles={ modalWinStyles }
				buttons={ buttons }
				onClose={ ::this.onClose }
			>
				<ComboBox
					label="Channel"
					labelStyle={{ verticalAlign: 'center', paddingLeft: 10}}
					valueLink={this.bindTo(betsModel, 'channelId')} >
					{_.map(channels, channel => this.renderChannel(channel))}
				</ComboBox>
				<SingleBets />
				<CombiBets />
				<SystemBets />
			</Popup>
		);
	}

	renderNewBet(modalWinStyles) {
		return (
			<NewBetsPopup bets={ this.state.bets } onConfirm={ this.onConfirm } modalWinStyles={modalWinStyles} />
		);
	}

	renderChannel(channel)
	{
		return (
			<option value={channel.id}>{channel.name}</option>
		);
	}
}

PlaceBets.displayName = 'PlaceBets';

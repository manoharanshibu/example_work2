import Popup from 'common/view/popup/Popup';
import Component from 'common/system/react/BackboneComponent';

export default class BetDetailsPopup extends Component {
	constructor(props) {
		super(props);

		this.buttons = [
			{title: 'Ok', cls: 'blue', handler: this.onOk.bind(this)}
		];
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
		this.props.onClose();
	}

	/**
	 * @returns {XML}
	 */
	render() {
		return (
			<Popup title="Bet Details"
			   	buttons={this.buttons}
			   	onClose={this.onClose.bind(this)}
			   	styles={this.props.styles}>
			 <div className="padding">
			   	<div className="table grid tight inner">
					<div className="table-row header">
						<div className="table-cell" style={{paddingLeft: '10px!important'}}>
                            Inplay
						</div>
						<div className="table-cell">
                            Part Id
						</div>
                        <div className="table-cell">
                            Event
						</div>
                        <div className="table-cell">
                            Market
						</div>
						<div className="table-cell">
                            Selection
						</div>
						<div className="table-cell">
                            Odds
						</div>
						<div className="table-cell">
                            Result
						</div>
					</div>

					{this.renderBetParts()}

					</div>
				</div>
			</Popup>
		)
	}

	/**
	 *
	 * @returns {*}
	 */
	renderBetParts() {
		var betParts = this.props.bet.betParts;

		return _.map(betParts, function(betPart) {

			return (
				<div className="table-row">
					<div className="table-cell">
						{String(betPart.inplay)}
					</div>
					<div className="table-cell">
						{betPart.id}
					</div>
					<div className="table-cell">
						{betPart.event}
					</div>
					<div className="table-cell">
						{betPart.market}
					</div>
					<div className="table-cell">
						{betPart.selection}
					</div>
					<div className="table-cell">
						{Number(betPart.odds).toFixed(2)}
					</div>
					<div className="table-cell">
						{betPart.result}
					</div>
				</div>
			)
		});
	}

	/**
	 * @returns {*}
	 */
	};

BetDetailsPopup.defaultProps = {
	styles: {
		display: 'block',
		position: 'fixed',
		opacity: 1,
		zIndex: 11000,
		left: '50%',
		marginLeft: '-512px',
		top: '100px',
		width: '1024px',
		minHeight: '300px'
	}
}


import Component from 'common/system/react/BackboneComponent';
import {Multiselect} from 'react-widgets';
import {DateTimePicker} from 'react-widgets';
import CustomerAccountPopup from 'common/view/popup/Popup';

export default class TransactionsAccount extends Component {
	constructor() {
		super();
		this.canInitiateTransaction = App.session.request('canInitiateTransaction');
	}


	renderWidget() {

		var types = [
		  { id: 0, name: 'Affiliate Program (commission)'},
		  { id: 1, name: 'Deposit'},
		  { id: 2, name: 'Poker Loyalty Bonus' },
		  { id: 3, name: 'Withdrawal' },
		  { id: 4, name: 'Holdshare Online Shop' },
		  { id: 5, name: 'Payment Return' },
		  { id: 6, name: 'Agent Provision' },
		  { id: 7, name: 'Outstanding Balance Paid' },
		  { id: 8, name: 'Bonus Marketing' },
		  { id: 9, name: 'Refund' },
		  { id: 10, name: 'Deposit Loyalty Card (shop)' },
		  { id: 10, name: 'Correction' },
		  { id: 10, name: 'Withdraw Loyalty Card (shop)' },
		  { id: 10, name: 'Finance Correction on Deposit' },
		  { id: 10, name: 'Combi Bet Profit' },
		  { id: 10, name: 'International Withdrawal' },
		  { id: 10, name: 'Bonus on Stakes' },
		  { id: 10, name: 'International Withdrawal Fee' },
		  { id: 10, name: 'Bonus on Profits' },
		  { id: 10, name: 'UniCredit Deposit' },
		  { id: 10, name: 'Fee on Stakes' },
		  { id: 10, name: 'Buy Chips' },
		  { id: 10, name: 'Fee on Profits' },
		  { id: 10, name: 'Sell Chips' },
		  { id: 10, name: 'Tax on Stakes' },
		  { id: 10, name: 'Games Stake' },
		  { id: 10, name: 'Tax on Profits' },
		  { id: 10, name: 'Games Win' },
		  { id: 10, name: 'Tax on Stakes/Shop Contingent' },
		  { id: 10, name: 'Bonus Wagered' },
		  { id: 10, name: 'Game Cleared' }

		];

		return   <Multiselect
			      valueField='id' textField='name'
			      data={types}
			      defaultValue={[1,2]}/>;

	}


	rowsData () {

		var that = this, list = [{
			desc: 'Available for Betting',
			amount: '123.00'
		},{
			desc: 'Widthdrawl',
			amount: '50.00'
		},{
			desc: 'Correction',
			amount: '223.00'
		},{
			desc: 'Correction',
			amount: '112.00'
		},{
			desc: 'Fee on Stakes',
			amount: '10.50'
		},{
			desc: 'Correction',
			amount: '60.00'
		},{
			desc: 'Combi Bet Profit',
			amount: '223.00'
		},{
			desc: 'Refund',
			amount: '20.30'
		}];


		return _.map(list, function(li, index) {
			return that.rowData(li, index);
		},this);


	}


	rowData(data, index) {

		return (
			<div key={'transaction-data-cell'+index} className="table-row">
				<div className="table-cell">
					{data.desc}
				</div>
				<div className="table-cell center">
					<strong>${data.amount}</strong>
				</div>
			</div>
		 );
	}



	initTransaction(e) {
		if(this.canInitiateTransaction) {
			App.bus.trigger('popup:view', CustomerAccountPopup);
		}
	}

	/**
	 * @returns {XML}
	 */
	render() {

		var multiSel = this.renderWidget();

		return (
			<div className="box">
				<div style={{minHeight: window.innerHeight - 50}}>
						<div className="table inner toolbar">
							<div className="table-row">
								<div className="table-cell">
									<div className="inline-form-elements">
										<label>From</label>
										<DateTimePicker format='DD/MM/YYYY' time={false}/>
									</div>
								</div>
								<div className="table-cell">
									<div className="inline-form-elements">
										<label>To</label>
										<DateTimePicker format='DD/MM/YYYY' time={false}/>
									</div>
								</div>
								<div className="table-cell">
									{multiSel}
								</div>
								<div className="table-cell narrow">
									<a href="#_" className="btn blue filled">Update&#160;Transactions</a>
								</div>
							</div>
						</div>
						<div className="table inner">
							<div className="table-row header larger">
								<div className="table-cell">
									Type
								</div>
								<div className="table-cell center">
									Amount
								</div>
							</div>
							{this.rowsData()}
						</div>
				</div>
			</div>
		);
	}
};

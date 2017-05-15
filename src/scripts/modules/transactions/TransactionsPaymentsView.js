import {DateTimePicker} from 'react-widgets';
import ComboBox from 'backoffice/components/elements/ComboBox';

export default class TransactionsPayments extends React.Component {
	constructor() {
		super();
	}


	getRows() {

		var that = this, rowsData = [{
			id: 123,
			date:'12/02/2015 19:13',
			type: 'Deposit',
			card:'MasterCard',
			amount:12,
			balance:'13.40',
			creator:'Dave'
		},{
			id: 234,
			date:'12/05/2015 20:23',
			type: 'Widthdrawl',
			amount:80,
			card:'Visa',
			balance:'21.56',
			creator:'Dave'
		},{
			id: 234,
			date:'12/02/2015 19:13',
			type: 'Widthdrawl',
			amount:80,
			card:'MasterCard',
			balance:'21.56',
			creator:'Dave'
		},{
			id: 123,
			date:'12/05/2015 20:23',
			type: 'Visa Debit',
			amount:12,
			card:'MasterCard',
			balance:'13.40',
			creator:'Dave'
		}];

		return _.map(rowsData, function(rd, i) {
			return that.getRow(rd, i);
		}, this);

	}

	getRow(data, index) {
		return (
			 <div key={index} className="table-row">
				<div className="table-cell center">
					{data.id}
				</div>
				<div className="table-cell center">
					{data.date}
				</div>
				<div className="table-cell center">
					{data.type}
				</div>
				<div className="table-cell center">
					{data.card}
				</div>
				<div className="table-cell center">
					{data.amount}
				</div>
				<div className="table-cell center">
					{data.balance}
				</div>
				<div className="table-cell center">
					{data.creator}
				</div>
			</div>
		 )
	}

	/**
	 * @returns {XML}
	 */
	render() {
		return (
				<div className="box">
					<div style={{minHeight: window.innerHeight - 50}}>
						<div className="table toolbar">
							<div className="table-row">
								<div className="table-cell">
									<div className="inline-form-elements">
										<strong>Payments Transactions</strong>
									</div>
								</div>
							</div>
						</div>
						<div className="table inner toolbar no-border-bottom">
							<div className="table-row">
								<div className="table-cell">
									<div className="inline-form-elements">
										<label>Bet Id</label>
										<input type="text" name="text"/>
									</div>
								</div>
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
									<div className="inline-form-elements">

										<ComboBox ref="amount" label="Amount" style={{width:'80px'}}>
											<option>Single</option>
											<option>Multiple</option>
											<option>System</option>
										</ComboBox>
									</div>
								</div>
								<div className="table-cell">
									<div className="inline-form-elements">
										<a href="#_" className="btn blue filled">Search</a>
										<a href="#_" className="btn filled">Clear</a>
									</div>
								</div>
							</div>
						</div>
						<div className="table inner no-border-bottom toolbar">
							<div className="table-row">
								<div className="table-cell">
									<ComboBox ref="method" label="Method" style={{minWidth:'60px'}}>
										<option>Single</option>
										<option>Multiple</option>
										<option>System</option>
									</ComboBox>
								</div>
								<div className="table-cell">
									<ComboBox ref="type" label="Type" style={{minWidth:'150px'}}>
										<option>ID-Card/Passport</option>
										<option>Debit Card</option>
										<option>Utility Bill</option>
										<option>Bank Statement</option>
										<option>Void</option>
									</ComboBox>
								</div>
									<div className="table-cell">
									<ComboBox ref="perPage" label="Per Page" style={{width:'50px'}}>
										<option>30</option>
										<option>60</option>
										<option>90</option>
										<option>200</option>
									</ComboBox>
								</div>
									<div className="table-cell">
										<div className="inline-form-elements left-right-nav">
											<a href="#_" className="btn"><i className="fa fa-chevron-left"></i></a>
											<label>1 of 5</label>
											<a href="#_" className="btn"><i className="fa fa-chevron-right"></i></a>
										</div>
									</div>

									<div className="table-cell">
										<div className="inline-form-elements">
											<a href="#_" className="btn red filled">Reset</a>
										</div>
									</div>
							</div>
						</div>
						<div className="table inner grid">
							<div className="table-row header larger">
								<div className="table-cell center">
									Id
								</div>
								<div className="table-cell center">
									Date
								</div>
								<div className="table-cell center">
									Type
								</div>
								<div className="table-cell center">
									Description
								</div>
								<div className="table-cell center">
									Amount
								</div>
								<div className="table-cell center">
									Balance
								</div>
								<div className="table-cell center">
									Creator
								</div>
							</div>
						{this.getRows()}
					</div>
				</div>
			</div>

		)
	}
};

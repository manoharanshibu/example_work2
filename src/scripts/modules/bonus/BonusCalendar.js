export default class BonusCalendar extends React.Component {
	constructor() {
		super();
	}


	/**
	 * @returns {XML}
	 */
	render() {
		return (
			<div className="box half" style={{height: '712px'}}>
				<div className="ps-container" dataps-id="0b1b6115-7814-2b4d-ca1f-5f3b44f5b979">

					<h2>Initiate Transaction</h2>

					<div className="vertical-form padding">

						<div className="inline-form-elements">
							<label>Type</label>

							<div className="select-style">
								<select name="select">
									<option>Affiliate Program</option>
									<option>Poker Loyalty Bonus</option>
									<option>Holdshare Online Shop</option>
									<option>Agent Provision</option>
									<option>Bonus Marketing</option>
								</select>
							</div>
						</div>

						<div className="inline-form-elements">
							<label>Amount</label>

							<div className="input-wrapper">
								<input type="number" name="text"/>
							</div>
						</div>


						<div className="inline-form-elements">
							<label>Description</label>

							<div className="input-wrapper">
								<input type="text" name="text"/>
							</div>
						</div>


						<div className="inline-form-buttons">
							<label>&nbsp;</label>
							<a href="#_" className="btn">Reset</a>
							<a href="#_" className="btn green">Submit</a>
						</div>

					</div>

					<div className="ps-scrollbar-x-rail" style={{left: '0px',bottom: '3px'}}>
						<div className="ps-scrollbar-x" style={{left: '0px',width: '0px'}}></div>
					</div>
					<div className="ps-scrollbar-y-rail" style={{top: '0px',right: '3px'}}>
						<div className="ps-scrollbar-y" style={{top: '0px',height: '0px'}}></div>
					</div>
				</div>
			</div>

		)
	}
};

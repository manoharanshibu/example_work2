import Component from 'common/system/react/BackboneComponent';
import model from 'backoffice/model/CustomerModel';
import TextInput from 'backoffice/components/elements/TextInput';
import ComboBox from 'backoffice/components/elements/ComboBox';
import CheckBox from 'backoffice/components/elements/CheckBox';
import ColumnSelectorPopup from 'backoffice/components/ColumnSelectorPopup';
import {trailingSlashes as slashes} from 'common/util/RegEx';
import Loader from 'app/view/Loader';

export default class AccountSearch extends Component {
	constructor(props, context) {
		super(props, context);
		this.observe = false;

		this.state = {
			loading: false
		};

		model.on("change", function () {
			this.forceUpdate();
		}.bind(this));

	}

	/**
	 * @param account
	 */
	onSelectAccount(account) {
		// transitions to the account page in this app
		//this.context.router.transitionTo(`/account/data/${account.id}`);

		var anchor = ReactDOM.findDOMNode(this.refs.hidden),
			location = window.location.origin.replace(slashes, '');

		// opens new browser tab to display account page
		let route = `/account/details/${account.id}`,
			href = App.browserHistory.createHref(route);
		anchor.href = `${location}${href}`;
		anchor.click();
	}

	/**
	 *
	 */
	onFormSubmit(e) {
		this.setState({loading: true});
		e.preventDefault();
		model.searchAccounts();
	}

	/**
	 * @param e
	 */
	onFormClear(e) {
		model.clearSearch();
	}

	/**
	 *
	 */
	componentDidMount() {
		this.props.collection.on('sync reset', ::this.stopLoader);
	}

	/**
	 *
	 */
	componentWillUnmount() {
		this.props.collection.off(null, null, this);
	}

	// Stop loader and rerender
	stopLoader(){
		this.setState({loading: false});
	}

	onSelectColumns() {
		App.bus.trigger('popup:view', ColumnSelectorPopup);
	}

	/**
	 * Temporal CSV export. react-data-grid breaks the old Excel export functionality
	 * @param table
	 * @param name
     */
	onExportToExcel(table,name) {
		var aux =JSON.stringify(this.props.collection);
		var array = typeof aux != 'object' ? JSON.parse(aux) : aux;

			var str = '';

			for (var i = 0; i < array.length; i++) {
				var line = '';
				for (var index in array[i]) {
					if (line != '') line += ','

					line += array[i][index];
				}

				str += line + '\r\n';
			}

		var hiddenElement = document.createElement('a');
		hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(str);
		hiddenElement.target = '_blank';
		hiddenElement.download = name+'.csv';
		hiddenElement.click();

	}

	onExportToExcelOld(str, name) {
		var uri = 'data:application/vnd.ms-excel;base64,'
			, template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>'
			, base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
			, format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }

		if (!table.nodeType)
			table = document.getElementById(table);
		var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML}
			window.location.href = uri + base64(format(template, ctx))
	}


	/**
	 * @returns {XML}
	 */
	render() {
		//TODO: Checking the permissions on every render, might not be ideal
		//but as a quick fix, it ensures they are reevaluated if the user has
		//logged out and logged in with different user
		const allowed = App.session.request('canAccountSearch');

		if (!allowed){
			return <div><p><strong>YOU ARE NOT AUTHORIZED TO USE THIS FUNCTION.</strong></p></div>;
		}

		const loader = this.state.loading ?
			<div><Loader /></div> :
			<table style={{width:'100%'}}>
				<tr>
					<td><p>Account Search</p></td>
					<td style={{textAlign: 'right', paddingRight:'5px'}}><button className="btn blue filled" onClick={this.onSelectColumns.bind(this)}>Select Columns</button>&nbsp;<button className="btn red filled" onClick={this.onExportToExcel.bind(this, 'finalTable', 'something excel')}>Export to Excel</button></td>
				</tr>
			</table>;

		return (
			<div>
				{loader}
				<div className="box">
					<div style={{minHeight: window.innerHeight - 120,overflowY: 'scroll'}}>
						<div className="table no-padding" style={{marginTop: '-1px'}}>
							<div className="table-row">
								<div className="table-cell" style={{minWidth: '342px', textAlign: 'right'}}>
									<form onSubmit={this.onFormSubmit.bind(this)}>
										<div className="vertical-form" style={{padding: '10px 20px'}}>
											<TextInput ref="id" type="number" label="User Id" valueLink={this.bindTo(model.searchCriteria, 'id')} focus="true"/>
											<TextInput ref="username" label="Username" valueLink={this.bindTo(model.searchCriteria, 'username')}/>
											<TextInput ref="email" label="Email" valueLink={this.bindTo(model.searchCriteria, 'email')}/>
											<TextInput ref="phone" label="Phone" valueLink={this.bindTo(model.searchCriteria, 'phone')}/>
											<TextInput ref="mobile" label="Mobile" valueLink={this.bindTo(model.searchCriteria, 'mobile')}/>
											<TextInput ref="postCode" label="Postcode" valueLink={this.bindTo(model.searchCriteria, 'postcode')}/>
											<TextInput ref="prematchStakeFactor" label="Pre. Stake Factor" valueLink={this.bindTo(model.searchCriteria, 'prematchStakeFactor')}/>
											<TextInput ref="inplayStakeFactor" label="Inplay Stake Factor" valueLink={this.bindTo(model.searchCriteria, 'inplayStakeFactor')}/>
											<TextInput ref="maxBetLimit" label="Max Bet Limit" valueLink={this.bindTo(model.searchCriteria, 'maxBetLimit')}/>
											<TextInput ref="country" label="Country" valueLink={this.bindTo(model.searchCriteria, 'country')}/>
											<TextInput ref="referrer" label="Bonus Redeemed" valueLink={this.bindTo(model.searchCriteria, 'bonusRedeemed')}/>
											<TextInput ref="first" label="First Name" valueLink={this.bindTo(model.searchCriteria, 'firstName')}/>
											<TextInput ref="last" label="Last Name" valueLink={this.bindTo(model.searchCriteria, 'lastName')}/>
											<ComboBox ref="gender" label="Gender" valueLink={this.bindTo(model.searchCriteria, 'gender')} style={{width:'120px'}}>
												<option value="">ALL</option>
												<option value="male">Male</option>
												<option value="female">Female</option>
											</ComboBox>
											{/* <TextInput ref="status" label="Status" valueLink={this.bindTo(model.searchCriteria, 'status')}/> */}
											<ComboBox ref="status" label="Status" valueLink={this.bindTo(model.searchCriteria, 'status')} style={{width:'120px'}}>
												<option value="ACTIVE">Active</option>
												<option value="SUSPENDED">Suspended</option>
											</ComboBox>
											<ComboBox ref="colour" label="Fraud Colour" valueLink={this.bindTo(model.searchCriteria, 'fraudColour')} style={{width:'120px'}}>
												<option value="GREEN">Green</option>
												<option value="YELLOW">Yellow</option>
												<option value="RED">Red</option>
											</ComboBox>
											<ComboBox ref="colour" label="User Verified"
												valueLink={this.bindTo(model.searchCriteria, 'verified')} style={{width:'120px'}}>
												<option value="">ALL</option>
												<option value="true">Verified</option>
												<option value="false">Non-verified</option>
											</ComboBox>
											<div className="inline-form-elements">
												<CheckBox ref="vip" label="VIP Customers" valueLink={this.bindTo(model.searchCriteria, 'vipaccount')}/>
											</div>
											<div className="inline-form-elements">
												<button className="btn green filled" onClick={this.onFormSubmit.bind(this)}>Search</button>
												<button className="btn blue filled" onClick={this.onFormClear.bind(this)}>Clear</button>
											</div>
											<br/>
										</div>
									</form>
								</div>
								{this.renderResults()}
							</div>
						</div>
					</div>
					<a ref="hidden" target="_blank" style={{display:'none'}}/>
				</div>
		</div>
		)
	}

	renderResults() {

		return (
			<div  className="table-cell">
				<table id="finalTable" className="table grid panel" style={{marginTop: '0', borderRight:'none'}}>
					<tbody>
						{this.renderResultHeaders()}
						{this.renderResultRows()}
					</tbody>
				</table>
			</div>

		);
	}

	renderResultHeaders() {
		return (
			<tr className="table-row header larger">

				{model.get('colId') == true && (
					<td className="table-cell center"> Id </td>
				)}

				{model.get('colName') == true && (
					<td className="table-cell center"> Name </td>
				)}

				{model.get('colUsername') == true && (
					<td className="table-cell center"> Username </td>
				)}

				{model.get('colGender') == true && (
					<td className="table-cell center"> Gender </td>
				)}

				{model.get('colPrematchStakeFactor') == true && (
					<td className="table-cell center"> Prematch Stake Factor </td>
				)}

				{model.get('colInplayStakeFactor') == true && (
					<td className="table-cell center"> Inplay Stake Factor </td>
				)}

				{model.get('colMaxBetLimit') == true && (
					<td className="table-cell center"> Max Bet Limit </td>
				)}

				{model.get('colEmail') == true && (
					<td className="table-cell center"> Email </td>
				)}

				{model.get('colPhone') == true && (
					<td className="table-cell center"> Phone </td>
				)}

				{model.get('colMobile') == true && (
					<td className="table-cell center"> Mobile </td>
				)}

				{model.get('colPostcode') == true && (
					<td className="table-cell center"> Postcode </td>
				)}

				{model.get('colCountry') == true && (
					<td className="table-cell center"> Country </td>
				)}

				{model.get('colReferrer') == true && (
					<td className="table-cell center"> Bonus Redeemed </td>
				)}

				{model.get('colStatus') == true && (
					<td className="table-cell center"> Status </td>
				)}

				{model.get('colFraudColour') == true && (
					<td className="table-cell center"> Fraud Colour </td>
				)}

				{model.get('colVIP') == true && (
					<td className="table-cell center"> VIP Account </td>
				)}

				{model.get('colVerified') == true && (
					<td className="table-cell center"> Verified </td>
				)}
			</tr>
		);
	}

	/**
	 * @returns {*}
	 */
	renderResultRows() {

		var rows = this.props.collection.map((account, index) => {
			return (
				<tr className="table-row"
					key={"account-search-row-"+index}
					onClick={this.onSelectAccount.bind(this, account)}>

					{model.get('colId') == true && (
						<td className="table-cell center">
							{account.get('id')}
						</td>
					)}

					{model.get('colName') == true && (
						<td className="table-cell center">
							{_.titleize(account.get('firstName') + ' ' + account.get('lastName'))}
						</td>
					)}

					{model.get('colUsername') == true && (
						<td className="table-cell">
							{account.get('username')}
						</td>
					)}

					{model.get('colGender') == true && (
						<td className="table-cell">
							{account.get('gender')}
						</td>
					)}

					{model.get('colPrematchStakeFactor') == true && (
						<td className="table-cell">
							{account.get('prematchStakeFactor')}
						</td>
					)}

					{model.get('colInplayStakeFactor') == true && (
						<td className="table-cell">
							{account.get('inplayStakeFactor')}
						</td>
					)}

					{model.get('colMaxBetLimit') == true && (
						<td className="table-cell">
							{account.get('maxBetLimit')}
						</td>
					)}

					{model.get('colEmail') == true && (
						<td className="table-cell center">
							{account.get('email')}
						</td>
					)}

					{model.get('colPhone') == true && (
						<td className="table-cell center">
							{account.get('phone')}
						</td>
					)}

					{model.get('colMobile') == true && (
						<td className="table-cell center">
							{account.get('mobile')}
						</td>
					)}

					{model.get('colPostcode') == true && (
						<td className="table-cell center">
							{account.get('postcode')}
						</td>
					)}

					{model.get('colCountry') == true && (
						<td className="table-cell center">
							{account.get('country')}
						</td>
					)}

					{model.get('colReferrer') == true && (
						<td className="table-cell center">
							{account.get('bonusRedeemed')}
						</td>
					)}

					{model.get('colStatus') == true && (
						<td className="table-cell center">
							{_.titleize(account.get('status'))}
						</td>
					)}

					{model.get('colFraudColour') == true && (
						<td className="table-cell center">
							{_.titleize(account.get('fraudColour'))}
						</td>
					)}

					{model.get('colVIP') == true && (
						<td className="table-cell center">
							{_.titleize(account.get('vipaccount'))}
						</td>
					)}

					{model.get('colVerified') == true && (
						<td className="table-cell center">
							<input type="checkbox" checked={account.get('verified')}/>
						</td>
					)}
				</tr>
			)
		});

		return rows;
	}

	getWinHeight() {
		return window.innerHeight - 120;
	}
};

AccountSearch.defaultProps = {
	collection: model.searchResults
};

AccountSearch.contextTypes = {
	router: React.PropTypes.object
};

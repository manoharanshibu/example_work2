import { PropTypes } from 'react'
import Component from 'common/system/react/BackboneComponent'
import customerModel from 'backoffice/model/CustomerModel'
import personalDetailsModel from 'account/models/PersonalDetailsModel'
import TextInput from 'backoffice/components/elements/TextInput'
import ComboBox from 'backoffice/components/elements/ComboBox'
import CheckBox from 'backoffice/components/elements/CheckBox'
import DatePicker from 'backoffice/components/elements/DatePicker'
import BlockUserPopup from 'account/details/BlockUserPopup'
import SARPopup from 'account/details/SARPopup'

export default class PersonalDetailsView extends Component {
	constructor() {
		super();

		this.state = {
			showAllWallet: false
		};

		this.onActivateAccount = ::this.onActivateAccount;
		this.onSave = ::this.onSave;
		this.onShowAllWallet = ::this.onShowAllWallet;
	}

	/**
	 *
	 */
	componentDidMount() {
		this.updateWallets();
		customerModel.currentAccount.on('change', () => {
			this.updateWallets();
			this.forceUpdate();
		})

		personalDetailsModel.on('change:countriesReceived', () => {
			this.forceUpdate();
		});

		personalDetailsModel.listCountries()
	}

	/**
	 *
	 */
	componentWillUnmount() {
		customerModel.currentAccount.off(null, null, this)
		personalDetailsModel.off('change:countriesReceived', null, this)
	}


	updateWallets() {
		personalDetailsModel.calculateBalances(customerModel.currentAccount.attributes.customerWalletFunds);
	}

	onShowAllWallet() {
		this.setState({ showAllWallet: !this.state.showAllWallet })
	}

	/**
	 * Trigger model to save
	 */
	onSave() {
		customerModel.savePersonalDetails()
	}

	onActivateAccount() {
		customerModel.activateAccount();
	}

	onSarReport() {
		const props = {
			model: customerModel,
			title: 'Suspicious Activity Report'
		}
		App.bus.trigger('popup:view', SARPopup, props)
	}

	/**
	 * Trigger model to block or unblock account
	 * @param block
	 */
	onToggleAccountBlock(block) {
		if (block) {
			const props = {
				model: customerModel,
				block,
				title: 'Reason to block account'
			}
			App.bus.trigger('popup:view', BlockUserPopup, props)
		} else {
			customerModel.toggleAccountBlock(block)
		}
	}

	/**
	 * Open the registration page to show bTag
	 */
	onViewRegistration(e) {
		e.preventDefault()
		//const btag = this.refs.btag.value(),
		//lang = this.refs.language.value()

		const { language } = customerModel.currentAccount.attributes;

		let punterUrl = App.Config.endpoints.punter.url;

		const url = `${punterUrl}/${language}/register/profile`;
		window.open(url, '_blank')
	}

	getCountriesList() {
		return personalDetailsModel.countries.map((country, index) => (
			<option key={ index }
					value={ country.attributes.code2 }
			>
				{ _.titleize(country.attributes.name) }
			</option>
		))
	}

	toCurrency = (amount, currency) => new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount)

	renderHeader(attributes) {
		const isBaba = App.Settings.Customer === 'baba';
		let { readOnly, username, accountStatus, testAccount, vipaccount, accountCurrency, brand, registrationStatus } = attributes;
		const currency = accountCurrency || 'GBP';

		const totalBalance = this.toCurrency(personalDetailsModel.totalBalance, currency)

		let accountType = vipaccount ? 'VIP' : ''
		accountType += testAccount ? ' TEST' : '';

		if (accountStatus === 'ACTIVE' && customerModel.currentAccount && customerModel.currentAccount.Limitations && customerModel.currentAccount.Limitations.get('exclusionUntil') && (customerModel.currentAccount.Limitations.get('exclusionUntil') > new Date())) {
			accountStatus = 'EXCLUDED';
		} else if (accountStatus === 'ACTIVE' && customerModel.currentAccount && customerModel.currentAccount.Limitations && customerModel.currentAccount.Limitations.get('timeoutUntil') && (customerModel.currentAccount.Limitations.get('timeoutUntil') > new Date())) {
			accountStatus = 'TIMEOUT';
		}

		const className = accountStatus == 'ACTIVE' ? 'labelHighlightGreen' : 'labelHighlightRed';

		return (
			<div className="table inner toolbar no-border-bottom">
				<div className="table-row">
					<div className="table-cell">
						<div className="inline-form-elements">
							<label>User: { username }</label>
							<label>Balance: { totalBalance }</label>
							<label>Status: <span className={className}>{ accountStatus }</span></label>
							{!isBaba && !!brand && <label>Website: { brand } </label>}
							<label>{ accountType } </label>
						</div>
					</div>
					<div className="table-cell right">
						<div className="inline-form-elements">
							<a className="btn green right filled"
							   style={ { display: readOnly  ? 'none' : 'block' } }
							   onClick={ ::this.onSarReport }
							>
								Submit SAR
							</a>
						</div>
						<div className="inline-form-elements">
							<a className="btn green right filled"
							   style={ { display: readOnly  ? 'none' : 'block' } }
							   onClick={ this.onSave }>
								Save
							</a>
							{this.renderActivateButton(registrationStatus)}
							{ this.renderLockButton() }
						</div>
					</div>
				</div>
			</div>
		)
	}

	/**
	 * This is currently read-only even because we need to change API if we want to be able to modify it
	 * */
	renderGender() { // FIXME
		// const title = customerModel.currentAccount.get('title')
		// const gender = title === 'mr' ? 'male' : 'female'
		return (
			<ComboBox label="Gender"
					  labelStyle={ { verticalAlign: 'top', minWidth: '40%' } }
					  placeholder="Gender"
					  valueLink={ this.bindTo(customerModel.currentAccount, 'gender') }
			>
				<option value="male">Male</option>
				<option value="female">Female</option>
			</ComboBox>
		)
	}


	/**
	 * Renders the block/unblock button
	 * @returns {XML}
	 */
	renderLockButton() {
		var blocked = customerModel.isAccountBlocked()
		var icon = blocked ? 'pe-is-hs-browser-check-f' : 'pe-is-hs-browser-ban-f'
		var permitted = App.session.request(blocked ? 'canUnblockAccounts' : 'canBlockAccounts')
		var message = blocked ? 'Unlock' : 'Lock'

		if (permitted) {
			return (
				<a className="btn right red filled" onClick={ this.onToggleAccountBlock.bind(this, !blocked) }>
					<i className={ icon }></i>{ message }
				</a>
			)
		}
	}

	renderWallets(limit = null) {
		const { accountCurrency } = customerModel.currentAccount.attributes;
		const currency = accountCurrency || 'GBP'

		const wallets = personalDetailsModel.wallets;
		let walletKeys = Object.keys(wallets).sort();
		if (!!limit) {
			walletKeys = walletKeys.slice(0, limit);
		}

		return walletKeys.map((key, i) => {
			const keySplit = key.split(':');
			const title = `${_.titleize(_.humanize(keySplit[1]))} Balance (${i + 1})`;
			const amount = this.toCurrency(wallets[key], currency);

			return <TextInput
				label={title}
				value={amount}
				readOnly={true}/>
		});
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const isBaba = App.Settings.Customer === 'baba';
		const isBaja = App.Settings.Customer === 'baja';
		const { showAllWallet } = this.state;
		const attr = customerModel.currentAccount.attributes;
		const { username, registrationDate, accountCurrency, ref5, readOnly } = attr;
		const limit = isBaba && !showAllWallet ? 3 : null;
		const titles = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Sir', 'Prof'];
		return (
			<div>
				{ this.renderHeader(customerModel.currentAccount.attributes) }
				<div className="table inner no-border-bottom">
					<div className="table-row">
						<div className="table-cell">
							<h3>Personal Details</h3>
							<form>
								<div className="vertical-form" style={ { marginLeft: '5%' } }>
									{isBaba &&
									<ComboBox ref="title"
											  label="Title"
											  labelStyle={ { verticalAlign: 'top', minWidth: '40%' } }
											  valueLink={ this.bindTo(customerModel.currentAccount, 'title') }
									>
										{titles.map(title => {
											return <option value={ title }>{title}</option>
										})}
									</ComboBox>}
									<TextInput ref="firstName"
											   label="First Name"
											   valueLink={ this.bindTo(customerModel.currentAccount, 'firstName') }
											   readOnly={ readOnly }
									/>
									<TextInput ref="lastName"
											   label="Last Name"
											   valueLink={ this.bindTo(customerModel.currentAccount, 'lastName') }
											   readOnly={ readOnly }
									/>
									{ !readOnly && (
										<TextInput ref="birthName"
												   label="Birth Name"
												   valueLink={ this.bindTo(customerModel.currentAccount, 'birthName') }
												   readOnly={ readOnly }
										/>
									) }
									<DatePicker ref="dateOfBirth"
												label="Date of Birth"
												format='DD-MM-YYYY'
												valueLink={ this.bindTo(customerModel.currentAccount, 'dateOfBirth') }
												readOnly={ readOnly }
												labelStyle={ { marginRight: '20%' } }
									/>
									<TextInput ref="placeOfBirth"
											   label="Place of Birth"
											   valueLink={ this.bindTo(customerModel.currentAccount, 'placeOfBirth') }
											   readOnly={ this.props.readOnly }
									/>

									{ this.renderGender() }

									<ComboBox ref="nationality"
											  label="Nationality"
											  labelStyle={ { verticalAlign: 'top', minWidth: '40%' } }
											  placeholder="Nationality"
											  valueLink={ this.bindTo(customerModel.currentAccount, 'nationality') }
											  disabled={ readOnly }
									>
										{ this.getCountriesList() }
									</ComboBox>
								</div>
							</form>
						</div>
						<div className="table-cell">
							<h3>Address</h3>
							<div className="vertical-form" style={ { marginLeft: '5%' } }>
								<TextInput ref="houseNo"
										   label={!isBaja ? 'House No.' : 'House No. and Street'}
										   valueLink={ this.bindTo(customerModel.currentAccount, 'houseNo') }
										   readOnly={ readOnly }
								/>
								<TextInput ref="street"
										   label={!isBaja ? 'Street' : 'Colony / County'}
										   valueLink={ this.bindTo(customerModel.currentAccount, 'street') }
										   readOnly={ readOnly }
								/>
								{ isBaja &&
								<TextInput ref="state"
										   label="State"
										   valueLink={ this.bindTo(customerModel.currentAccount, 'state') }
										   readOnly={ readOnly }
								/>
								}
								<TextInput ref="city"
										   label="City" valueLink={ this.bindTo(customerModel.currentAccount, 'city') }
										   readOnly={ readOnly }
								/>
								<TextInput ref="postalCode"
										   maxLength={ '10' }
										   label="Postal Code"
										   valueLink={ this.bindTo(customerModel.currentAccount, 'postcode') }
										   readOnly={ readOnly }
								/>
								<ComboBox ref="country"
										  label="Country"
										  labelStyle={ { verticalAlign: 'top', minWidth: '40%' } }
										  placeholder='Country'
										  valueLink={ this.bindTo(customerModel.currentAccount, 'countryCode2') }
										  disabled={ readOnly }>
									{ this.getCountriesList() }
								</ComboBox>
							</div>
						</div>
					</div>
					<div className="table-row">
						<div className="table-cell">
							<h3>Account Info</h3>
							<form>
								<div className="vertical-form" style={{marginLeft: '5%'}}>
									<TextInput ref="username"
											   label="Username" value={username}
											   readOnly={readOnly}/>
									<TextInput label="Classic Id" value={ref5}
											   readOnly={true}/>
									{this.renderWallets(limit)}
									{isBaba &&
									<a className="btn grey left filled" style={{marginTop: 5, marginBottom: 5}}
									   onClick={this.onShowAllWallet}>
										{!showAllWallet ? 'Show All Wallet' : 'Hide'}
									</a>}
									<DatePicker label="Registration Date"
												value={registrationDate}
												format="DD-MM-YYYY HH:mm"
												labelStyle={{marginRight:'20%'}}
												readOnly={readOnly}/>
									<div className="inline-form-elements">
										<label style={ { fontSize: '12px', marginRight: '10%'  } }>
											<span
												style={ { fontWeight: '600', paddingRight: '8em' } }>Account Type</span>
										</label>
										<CheckBox label="VIP"
												  valueLink={ this.bindTo(customerModel.currentAccount, 'vipaccount') }
										/>
										<CheckBox label="Test Account"
												  valueLink={ this.bindTo(customerModel.currentAccount, 'testAccount') }
										/>
									</div>
									<TextInput label="Preferred Language"
											   valueLink={ this.bindTo(customerModel.currentAccount, 'language') }
									/>
									<TextInput label="Licence"
											   valueLink={ this.bindTo(customerModel.currentAccount, 'licence') }
									/>
									<TextInput label="bTag"
											   valueLink={ this.bindTo(customerModel.currentAccount, 'tag') }
									/>
									{!isBaba &&
									<div className="inline-form-elements">
										<button onClick={ ::this.onViewRegistration }>View registration page</button>
									</div>}
									<TextInput label="Account Currency"
											   valueLink={ this.bindTo(customerModel.currentAccount, 'accountCurrency') }
									/>
								</div>
							</form>
						</div>
						<div className="table-cell">
							<h3>Contacts</h3>
							<div className="vertical-form" style={ { marginLeft: '5%', marginBottom: '0' } }>
								<TextInput ref="email"
										   label="Email"
										   valueLink={ this.bindTo(customerModel.currentAccount, 'email') }
										   readOnly={ readOnly }
								/>
								<label htmlFor="invalidEmail" style={ { fontSize: '12px' } }>
									<span style={ { fontWeight: '600', paddingRight: '31%' } }>Email Validity</span>
									<CheckBox id="invalidEmail" label="Invalid"
											  valueLink={ this.bindTo(customerModel.currentAccount, 'emailInvalid') }
											  readOnly={ readOnly }
									/>
								</label>
								<TextInput label="Phone"
										   valueLink={ this.bindTo(customerModel.currentAccount, 'phone') }
										   readOnly={ readOnly }
								/>
								<label htmlFor="invalidPhone" style={ { fontSize: '12px' } }>
									<span style={ { fontWeight: '600', paddingRight: '30%' } }>Phone Validity</span>
									<CheckBox id="invalidPhone" label="Invalid"
											  valueLink={ this.bindTo(customerModel.currentAccount, 'phoneInvalid') }
											  readOnly={ readOnly }
									/>
								</label>
								<TextInput label="Mobile"
										   valueLink={ this.bindTo(customerModel.currentAccount, 'mobile') }
										   readOnly={ readOnly }
								/>
								<label htmlFor="invalidMobile" style={ { fontSize: '12px' } }>
									<span style={ { fontWeight: '600', paddingRight: '30%' } }>Mobile Validity</span>
									<CheckBox label="Invalid"
											  valueLink={ this.bindTo(customerModel.currentAccount, 'mobileInvalid') }
											  readOnly={ readOnly }
									/>
								</label>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	renderActivateButton(registrationStatus) {
		const registrationCompleted = registrationStatus === 'COMPLETED';
		const allowed = App.session.request('canAccountActivate');

		if (!registrationCompleted && allowed) {
			return (
				<a className="btn right blue filled" onClick={this.onActivateAccount}>
					Activate Account
				</a>
			);
		}
	}

};

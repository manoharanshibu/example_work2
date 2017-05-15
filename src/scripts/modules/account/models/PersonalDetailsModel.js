import Countries from 'backoffice/collection/Countries';
import Country from 'backoffice/model/models/Country';
import getCountries from 'backoffice/command/api/GetCountriesCommand.js';


let Model = Backbone.Model.extend({

	countries: new Countries([]),
	wallets: {},
	totalBalance: 0,

	listCountries(){
		// get countries list
		getCountries(true)
			.then(resp => {
				if (_.has(resp, 'Result')){
					this.parseCountries(resp.Result.countries);
				}
			});
	},

	/**
	 * Parse the JSON object
	 * @param countries
	 */
	parseCountries: function (countries) {
		countries = countries.map(country => new Country(country));

		this.countries = countries;
		this.trigger('change:countriesReceived');
	},


	addToWallets(wallets, key, amount) {
		if (wallets.hasOwnProperty(key)) {
			wallets[key] += amount;
		}
		else {
			wallets[key] = amount;
		}
	},

	/**
	 * Returns the balance for sportsbook, casino, bonus, games and the total balance
	 * of the user.
	 **/
	calculateBalances(customerWalletFunds) {
		let wallets = customerWalletFunds || [];
		this.totalBalance = 0;
		const newWallets = {};
		wallets.forEach((wallet) => {
			const {amount, activeFundsType, creditLimit} = wallet;
			switch(activeFundsType){
				case('CASH'):
					if(App.Settings.Customer !== 'baba') {
						this.addToWallets(newWallets, '1:SPORTSBOOK', amount);
						this.addToWallets(newWallets, '8:CREDIT', creditLimit || 0);
					} else {
						this.addToWallets(newWallets, '1:CASH', amount);
					}
					break;
				case('CARD'):
					this.addToWallets(newWallets, '2:CARD', amount);
					break;
				case('GAMES'):
					this.addToWallets(newWallets, '2:CASINO', amount);
					break;
				case('BONUS'):
				case('BONUS_WITHDRAWALS'):
					App.Settings.Customer !== 'baba' &&
					this.addToWallets(newWallets, '3:SPORTSBOOK_BONUS', amount);
					break;
				case('BANKIT'):
					this.addToWallets(newWallets, '3:BANKIT', amount);
					break;
				case('GAMES_BONUS'):
					this.addToWallets(newWallets, '4:CASINO_BONUS', amount);
					break;
				case('BONUS_WINNINGS'):
					this.addToWallets(newWallets, '5:BONUS_WINNINGS', amount);
					break;
				case('BONUS_DEPOSIT'):
					this.addToWallets(newWallets, '6:BONUS_DEPOSIT', amount);
					break;
				case('DEPOSIT'):
					this.addToWallets(newWallets, '7:DEPOSIT', amount);
					break;
				default:
					this.addToWallets(newWallets, `z:${activeFundsType}`, amount);
					break;
			}

			this.totalBalance += amount;
		});
		this.wallets = newWallets;
	}
});
let inst = new Model();
export default inst;

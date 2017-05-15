export default {

	"command:login": "./api/Login.js",
	"command:forgotPassword": "./api/ForgotPassword.js",
	"command:logout": "./api/Logout.js",

	"command:getbalance": "./api/GetBalanceCommand.js",
	"command:countBets": "./api/CountBetsCommand.js",
	"command:getChildAccounts": "./api/GetChildAccountsCommand.js",
	"command:sumChildBalances": "./api/GetSumChildBalancesCommand.js",
	"command:calcBestCaseWorseCasePositions": "./api/CalculateBestCaseWorstCasePositionsCommand.js",
	"command:createChildAccount": "./api/CreateChildAccountCommand.js",
	"command:checkAccountId": "./api/CheckAccountAvailabilityCommand.js",
	"command:updateAccount": "./api/UpdateAccountCommand.js",
	"command:searchChildAccounts": "./api/SearchChildAccountsCommand.js",
	"command:searchAccounts": "./api/SearchAccountsCommand.js",
	"command:transactionOnChild": "./api/TransactionOnChildAccountCommand.js",
	"command:changePassword": "user/ChangePassword.js",

	"command:getSportRootNodes": "./api/GetSportRootNodesCommand.js",
	"command:getSportNode": "./api/GetSportNodeCommand.js",
	"command:getActiveSportTypes": "./api/GetActiveSportTypesCommand.js",
	"command:getLocales": "./api/GetLocalesCommand.js",
	"command:getCountries": "./api/GetCountriesCommand.js",
	"command:searchBets": "./api/SearchBetsCommand.js",
	"command:getBet": "./api/GetBetCommand.js",
	"command:getBetslip": "./api/GetBetslipCommand.js",
	"command:markBetslipAsPaid": "./api/MarkBetslipAsPaidCommand.js",
	"command:getSystemBets": "./api/GetSystemBetsCommand.js",
	"command:getChildBets": "./api/GetChildBetsCommand.js",
	"command:getAccountTransactionHistory": "./api/GetAccountTransactionHistoryCommand.js",
	"command:getAccountTransactionCount": "./api/GetAccountTransactionCountCommand.js",
	"command:getAccountTransactionHistoryByUsername": "./api/GetAccountTransactionHistoryByUsernameCommand.js",
	"command:getAccountTransactionCountByUsername": "./api/GetAccountTransactionCountByUsernameCommand.js",
	"command:saveImage": "./api/SaveImageCommand.js",
	"command:getFeaturedHighlights": "./api/GetFeaturedHighlightsCommand.js",
	"command:saveHightlights": "./api/SaveHighlightsCommand.js",
	"command:eventSearch": "./api/EventSearchCommand.js",
	"command:getKeyMarkets": "./api/GetKeyMarketsForSportCommand.js",

	"command:getCampaignTemplates": "./api/bonus/GetCampaignTemplatesCommand.js",
	"command:saveCampaignTemplate": "./api/bonus/SaveCampaignTemplateCommand.js",
	"command:removeCampaignTemplate": "./api/bonus/RemoveCampaignTemplateCommand.js",
	"command:getCampaignBonuses": "./api/bonus/GetCampaignBonusesCommand.js",
	"command:saveCampaignBonus": "./api/bonus/SaveCampaignBonusCommand.js",
	"command:calculateDepositBonusCurrencyAmounts": "./api/bonus/CalculateDepositBonusCurrencyAmounts.js",


	"command:getCurrencies": "./api/GetCurrenciesCommand.js",
	"command:listCountries": "./api/ListCountriesCommand.js",

	"command:getSportMarketgroups": "./api/GetSportMarketGroupsCommand.js",
	"command:getSportMarkettypes": "./api/GetSportMarketTypesCommand.js",

	"command:getSportsbookSettings": "./api/GetSportsbookSettingsCommand.js",
	"command:saveSportsbookSettings": "./api/SaveSportsbookSettingsCommand.js",
	"command:listAlerts": "./api/ListAlerts.js"
}

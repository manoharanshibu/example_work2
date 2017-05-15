import apiService from 'backoffice/service/ApiService';
import CustomerSummariesCount from 'backoffice/collection/CustomerSummariesCount';
import CustomerSummariesPage from 'backoffice/collection/CustomerSummariesPage';
import CustomerSummary from 'backoffice/model/CustomerSummary';
import CustomerDetails from 'backoffice/model/CustomerDetails';
import AuditLogs from 'backoffice/collection/AuditLogs';
import AuditLog from 'backoffice/model/AuditLog';
import BettingStatistics from 'backoffice/model/stats/BettingStatistics';
import backofficeService from 'backoffice/service/BackofficeRestfulService';
import customerSegmentModel from 'backoffice/model/CustomerSegmentModel';
import CustomerBonuses from 'backoffice/collection/CustomerBonuses';

var Model = Backbone.Model.extend({

	searchCriteria: new CustomerSummary(),
	searchCount: new CustomerSummariesCount(),
	searchPageResults: new CustomerSummariesPage(),
	currentAccount: new CustomerDetails(),
	auditLogs: new AuditLogs(),
	bettingStats: new BettingStatistics(),
	customerBonuses: new CustomerBonuses(),

	defaults: {
		selectedSegmentId: '',
		colBrandId: true,
		colId: true,
		colName: true,
		colUsername: true,
		colEmail: true,
		colPhone: true,
		colMobile: true,
		colBalance: true,
		colPostcode: true,
		colCountry: true,
		colMaxBetLimit: true,
		colDocUploadedSince: true,
		colGender: true,
		colReferrer: true,
		colStatus: true,
		colFraudColour: true,
		colVIP: true,
		colAccType: true,
		colVerified: true,
		timingout: false,
		newTimeoutUntil: 0,
		excluding:false,
		newExclusionUntil:0,
		totalCustomers:null,
		sortByUploadDate: false,
		isAscending: true,
		betslipId: null
	},

	/**
	 * @param evts
	 */
	initialize: function(){
		_.bindAll(this, 'clearSearch', 'userAuditsReceived', 'onSaveAuditSuccess', 'onCustomerSegmentsSuccess', 'onActivateAccountSuccess', 'handleStats');

	},

	/**
	 * TODO This is a temporary workaround as we don't currently have
	 * TODO a 'loadAccount' api.  Swap out with correct api when available
	 * @param userid
	 */
	loadAccount: function(userid) {
		this.currentAccount.set({id: userid});
		this.currentAccount.getCustomerDetails();
	},

	/**
	 * @param userid
	 */
	loadAudits: function(userid) {
		var that = this;
		this.auditLogs.getAudits(userid)
			.then(that.userAuditsReceived);
	},

	loadBonus: function(accountId, state){
		var that = this;
		const promise = this.customerBonuses.getCustomerBonusInfo(accountId, state);

		promise.then(null, that.onLoadBonusError );

		return promise;
	},

	onLoadBonusError(){
		App.bus.trigger('popup:notification', {
			title: 'Error',
			content: 'There was an error whilst retrieving the bonus information',
			autoDestruct: 2000});
	},
	/**
	 * @param resp
	 */
	userAuditsReceived: function(resp) {
		var audits = _.map(resp.properties, (t) => {
			return new AuditLog(t, {parse: true});
		});
		this.auditLogs.reset(audits);
	},

	/**
	 * @param message
	 */
	saveAudit: function(message) {
		backofficeService.saveAudit(this.currentAccount.id, message)
			.then(this.onSaveAuditSuccess);
	},

	/**
	 *
	 */
	onSaveAuditSuccess(resp){
		var savedLog = new AuditLog(resp, {parse: true});
		this.auditLogs.add(savedLog);
	},

	/**
	 * Save Personal Details
	 */
	savePersonalDetails() {
		var personalData = this.currentAccount.toPersonalDataJSON();

		backofficeService.savePersonalData(this.currentAccount.id, JSON.stringify(personalData))
			.then(this.onSavePersonalDataSuccess);
	},

	/**
	 *
	 */
	onSavePersonalDataSuccess(resp){
		App.bus.trigger('popup:notification', {
			title: 'Confirmation',
			content: 'Personal details have successfully been saved.',
			autoDestruct: 2000});
	},

	/**
	 * Save Conditions Preferences
	 */
	saveConditionsPrefs(resp) {
		var prefsData = this.currentAccount.toConditionsPrefsDataJSON();

		backofficeService.saveConditionsPrefs(this.currentAccount.id, JSON.stringify(prefsData))
			.then(this.onSaveConditionsPrefsSuccess);
	},

	/**
	 *
	 */
	onSaveConditionsPrefsSuccess(){
		App.bus.trigger('popup:notification', {
			title: 'Confirmation',
			content: 'Conditions Prefs have successfully been saved.',
			autoDestruct: 2000});
	},

	/**
	 * Save Scoring
	 */
	saveScoring() {
		var scoringData = this.currentAccount.toScoringDataJSON();

		backofficeService.saveScoringData(this.currentAccount.id, JSON.stringify(scoringData))
			.then(this.onScoringDataSuccess, this.onScoringDataError);
	},

	/**
	 *
	 */
	onScoringDataSuccess(resp){
		App.bus.trigger('popup:notification', {
			title: 'Confirmation',
			content: 'Scoring details have successfully been saved.',
			autoDestruct: 2000});
	},

	/**
	 *
	 */
	onScoringDataError(resp){
		App.bus.trigger('popup:notification', {
			title: 'Error',
			content: 'There has been an error saving your scoring details.',
			autoDestruct: 2000});
	},

	/**
	 * Save Limits
	 */
	saveCustomerLimits(callback) {
		var limitsData = this.currentAccount.toLimitationsDataJSON();
		backofficeService.saveCustomerLimits(this.currentAccount.id, JSON.stringify(limitsData))
			.then((response)=> {
				App.bus.trigger('popup:notification', {
					title: 'Confirmation',
					content: 'User Limitations details have successfully been saved.',
					autoDestruct: 2000});
				callback('success', response);
			})
			.catch((error) => {
				App.bus.trigger('popup:notification', {
					title: 'Failure',
					content: 'User Limitations details have not been saved.',
					autoDestruct: 2000});
				callback('error', error);
			});
	},

	/**
	 * Load Customer Segments
	 */
	getCustomerSegments() {
		backofficeService.getCustomerSegments(this.currentAccount.id)
			.then(this.onCustomerSegmentsSuccess);
	},

	/**
	 *
	 */
	onCustomerSegmentsSuccess(resp){
		this.currentAccount.set({segments: resp.segments});
	},

	/**
	 *
	 */
	sendPasswordRequest(){
		var message = {
			username: this.currentAccount.get('username'),
			sessionToken: App.session.execute('get', 'sessionToken')
		};

		backofficeService.forgotPassword(message)
			.then(function(resp){
				App.bus.trigger('popup:notification', {
					title: 'Confirmation',
					content: 'An email has been sent to the user to reset their password.',
					autoDestruct: 2000});
			});
	},

	/**
	 *
	 */
	getStats(fromDate, toDate) {
		var accountId = this.currentAccount.get('id');

		backofficeService.getCustomerBettingStatistics(accountId, fromDate, toDate)
			.then(this.handleStats);
	},

	/**
	 * @param resp
	 */
	handleStats(resp) {
		delete resp.id;
		var stats = new BettingStatistics(resp, {parse: true});
		this.bettingStats.set(stats.attributes);
	},

	/**
	 * Add customer to segment
	 */
	addCustomerToSegment(customer, segmentId) {
		segmentId = segmentId || this.get('selectedSegmentId');
		var that = this;
		backofficeService.addPunterToSegment(segmentId, customer.id)
			.then(function(resp) {
				var segmentAdded = _.findWhere(customerSegmentModel.customerSegments.models, {id: Number(segmentId)});
				that.currentAccount.get('segments').push(segmentAdded.attributes);
				that.currentAccount.trigger('change:segments');
			})
			.catch(function(resp) {
				// blah
			});
	},

	/**
	 * remove customer from a segment
	 */
	removePunterFromSegment(customer, segmentId) {
		var that = this;
		backofficeService.removePunterFromSegment(segmentId, customer.id)
			.then(function(resp) {
				var segments = that.currentAccount.get('segments');
				var index = _.findIndex(segments, {id: Number(segmentId)});
				if(index > -1) {
					that.currentAccount.get('segments').splice(index, 1);
					that.currentAccount.trigger('change:segments');
				}
			})
			.catch(function(resp) {
				// blah
			});
	},

	/**
	 * Toggle an account blocked/unblocked
	 */
	toggleAccountBlock(userToBeBlocked = true) {
		var accountAttributes = this.currentAccount.attributes;
		var apiServiceMethod = userToBeBlocked ? 'blockAccount' : 'unblockAccount';
		var actionToBePrompted = userToBeBlocked ? 'block' : 'unblock';
		var that = this;

		var popupMessage = `Are you sure you want to ${actionToBePrompted} this user?\n\n\n${accountAttributes.firstName} ${accountAttributes.lastName}`;
		App.bus.trigger('popup:confirm', {content: popupMessage, onConfirm: () => {
			apiService[apiServiceMethod].call(null, accountAttributes.id)
				.then(() => {
					var newStatus = userToBeBlocked ? 'SUSPENDED' : 'ACTIVE';
					var actionCompleted = userToBeBlocked ? 'blocked' : 'unblocked';
					that.notify(_.titleize(actionCompleted),
						`'${accountAttributes.firstName} ${accountAttributes.lastName}' has been successfully ${actionCompleted}`);
					that.currentAccount.set('accountStatus', newStatus);
				})
				.catch(() => {
					that.notify('Error', `There has been an error ${actionToBePrompted}ing the account.`);
				});
		}});
	},

	/**
	 * Assess if an account is blocked or not
	 */
	isAccountBlocked() {
		var status = this.currentAccount.get('accountStatus');
		return  status === 'SUSPENDED';
	},

	/**
	 * @param criteria
	 */
	searchAccounts() {
		var criteria = this.searchCriteria.toJSON();
		this.searchCount.getSummariesCount(JSON.stringify(criteria))
			.then(this.searchAccountsCount.bind(this), this.searchAccountsCountError);
	},

	searchByBet() {
		const betslipId = this.get('betslipId');
		if (!!betslipId) {
			this.searchPageResults.getSummariesByBetId(betslipId);
		}
	},

	searchAccountsCountError(){
		this.set('totalCustomers', null);
		this.searchPageResults.reset([]);
	},

	searchAccountsCount(resp){
		this.set('totalCustomers', resp);

		this.searchPageResults.getSummaries(JSON.stringify(this.searchCriteria.toJSON()), 0, 100);
	},

	searchAccountsPage(pageNum){
		if(this.get('totalCustomers') !== null && this.get('totalCustomers') !== undefined)
		this.searchPageResults.getSummaries(JSON.stringify(this.searchCriteria.toJSON()), (pageNum - 1) * 100, 100);
	},

	/**
	 * Clears search form
	 */
	clearSearch() {
		this.set('totalCustomers', null);
		this.searchCriteria.clear();
		this.searchCriteria.set(this.searchCriteria.defaults);
		this.searchPageResults.reset([]);
	},

	saveProductVisibility(){
		const productVisibility = this.currentAccount.toProductVisibilityDataJSON();

		backofficeService.saveProductVisibility(this.currentAccount.id, JSON.stringify(productVisibility))
			.then(this.onProductVisibilitySuccess)
			.catch(this.onProductVisibilityFailure);
	},

	onProductVisibilitySuccess(){
		App.bus.trigger('popup:notification', {
			title: 'Confirmation',
			content: 'Product Visibility has successfully been saved.',
			autoDestruct: 2000});
	},

	onProductVisibilityFailure(){
		App.bus.trigger('popup:notification', {
			title: 'Failure',
			content: 'Product Visibility has not been saved.',
			autoDestruct: 2000});
	},

	activateAccount(){
		backofficeService.activateAccount(this.currentAccount.id)
			.then(this.onActivateAccountSuccess);
	},

	onActivateAccountSuccess(response){
		if (response && response.status === 'SUCCESS') {
			this.currentAccount.set('registrationStatus', 'COMPLETED');
			notify('Confirmation', 'The account has been activated successfully');
		}
	},

	/**
	 *
	 */
	notify(title = '', content = '', autoDestruct = 2000){
		App.bus.trigger('popup:notification', {title, content, autoDestruct});
	},

	sortByUploadDate(){
		const collection = this.searchPageResults;
		if(this.get('sortByUploadDate')){
			return collection.sortByUploadDate(this.get('isAscending'));
		}

		return collection;
	}
});

let inst = new Model();
export default inst;

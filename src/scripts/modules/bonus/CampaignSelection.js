import {classNames as cx} from 'common/util/ReactUtil';
import campaignModel from 'backoffice/model/bonus/CampaignModel';
import Tabs from 'backoffice/components/tabs/Tabs';
import Tab from 'backoffice/components/tabs/Tab';

export default class CampaignSelection extends React.Component {
	constructor(props){
		super(props);
		_.bindAll(this, 'onRowClick', 'onTabSelect');
		this.state = {tabIndex: 0};
	}

	/**
	 * @param row
	 * @param index
	 */
	onRowClick(row, index){
		this.props.onSelect(row, index);
	}

	/**
	 * @param index
	 */
	onTabSelect(tab, index) {
		this.setState({tabIndex: index});

		if (index !== this.state.tabIndex){
			if (this.props.onTabChange){
				this.props.onTabChange(tab, index);
			}
		}
	}

	onCampaignRemove(...rest){
		if (this.props.onCampaignRemove){
			this.props.onCampaignRemove(...rest);
		}
	}

	onCampaignCopy(...rest){
		if (this.props.onCampaignCopy){
			this.props.onCampaignCopy(...rest);
		}
	}

	/**
	 * @returns {XML}
	 */
	render(){
		return (
			<div className="table-cell">
				<div className="vertical-form">
					<Tabs ref="tabs" onTabClick={this.onTabSelect}>
						<Tab title="Deposit " id="0">
							<div className="table grid">
								<div className="table-row header larger">
									<div className="table-cell center">
										Name
									</div>
									<div className="table-cell center">
										Bonus code
									</div>
									<div className="table-cell center">
										Bonus Id
									</div>
									<div className="table-cell center">
										Actions
									</div>
								</div>
								{this.renderTabRows('depositBonus', 0)}
							</div>
						</Tab>
						<Tab title=" Free Bet/Release " id="1">
							<div className="table grid">
								<div className="table-row header larger">
									<div className="table-cell center">
										Name
									</div>
									<div className="table-cell center">
										Bonus code
									</div>
									<div className="table-cell center">
										Bonus Id
									</div>
									<div className="table-cell center">
										Actions
									</div>
								</div>
								{this.renderTabRows('freebet', 1)}
							</div>
						</Tab>
					</Tabs>
				</div>
			</div>
		);
	}

	/**
	 * @param type
	 * @param index
	 * @returns {*}
	 */
	renderTabRows(type, index) {
		return this.renderRows(this.getCampaignsOfType(type), index);
	}


	//
	// Get the list of templates of a certain type
	getCampaignsOfType(propertyToCheck) {
		var allCampaigns = campaignModel.campaigns;

		if(this.props.campaignFilter){
			allCampaigns = this.filterCampaignBySearch(this.props.campaignFilter, allCampaigns);
		}
		if(this.props.campaignStatus !="ALL") {
			allCampaigns = allCampaigns.filter(campaign => {
				if(this.props.campaignStatus ==="ACTIVE"){
					return (campaign.status === this.props.campaignStatus) && (campaign.expires >= moment(new Date()));
				}else if(this.props.campaignStatus ==="ENDED"){
					return ((campaign.status === "ENDED") || ((campaign.status !== "IN_ACTIVE") && (campaign.expires < moment(new Date()))));
				}
				return campaign.status === this.props.campaignStatus;
			});
		}
		var filteredCampaigns = _.filter(allCampaigns, function(campaign){
			return campaign.hasOwnProperty(propertyToCheck);
		});
		var parsedCampaigns = _.map(filteredCampaigns, function(campaign){
			return { name: campaign.name, id: campaign.id, bonusCode: campaign.bonusCode };
		});

		var sortedCampaigns = _.sortBy( parsedCampaigns, obj => obj.name );

		return sortedCampaigns;
	}

	/**
	 * @param rowsData
	 * @returns {*}
	 */
	renderRows(rowsData, tIndex) {
		var rowIndex = this.props.selectedIndex,
			tabIndex = this.state.tabIndex;
		return _.map(rowsData, function (row, i) {
			var active = (rowIndex === i && tabIndex === tIndex),
				classNames = cx(
					'table-row clickable',
					{'active': active}
				);

			var campId = (row.bonusCode) ? row.bonusCode : 'new';

			const forceBorder = {
				borderBottom: '1px solid #ECECEC'
			};

			return (
				<div className={classNames}
					ref={'rowId_' + row.id}
					key={'campaign-row-'+i}
					 onClick={this.onRowClick.bind(this, row, i)}>
					<div className="table-cell" style={forceBorder}>{row.name}</div>
					<div className="table-cell center" style={forceBorder}>{campId}</div>
					<div className="table-cell center" style={forceBorder}>{row.id}</div>
					<div className="table-cell center" style={forceBorder}>
						<div className="inline-form-elements" style={{minHeight: 'none', margin:'5px 0 0 0'}}>
							<a className="btn red small" onClick={this.onCampaignRemove.bind(this, row, i)}>Remove</a>
							<a className="btn blue small" onClick={this.onCampaignCopy.bind(this, row, i)}>Copy</a>
						</div>
					</div>
				</div>
			);
		}, this);
	}

	findRowByCampaignId(campaignId){
		var tabs = this.refs.tabs.props.children;
		var foundRowIndex;

		_.each(tabs, (tab) => {
			var rows = tab.props.children.props.children;

			_.each(rows, (row) => {
				var rowId = row.ref && row.ref.match(/rowId_(-?\d*)/)[1];
				rowId = rowId ? parseInt(rowId) : 0;

				if (rowId == campaignId){
					foundRowIndex = row.key && row.key.match(/campaign-row-(\d*)/)[1];
					foundRowIndex = foundRowIndex && parseInt(foundRowIndex, 10);
				}
			});
		});

		return foundRowIndex;
	}

	filterCampaignBySearch(searchString='', campaignsToFilter) {
		const searchExp = new RegExp(searchString.toLowerCase());

		const newCollection = campaignsToFilter.filter(function(campaign) {
			const name = campaign.name;
			const id = campaign.id;
			const bonusCode = campaign.bonusCode;
			return searchExp.test(name.toLowerCase()) || searchExp.test(id) || searchExp.test(bonusCode.toLowerCase());
		});

		return newCollection;
	}


}


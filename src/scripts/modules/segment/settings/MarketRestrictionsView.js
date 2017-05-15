import Component from 'common/system/react/BackboneComponent';
import TreeMenu from 'backoffice/components/controls/TreeMenu';
import cache from 'backoffice/model/NodeCache';
import CheckBox from 'backoffice/components/elements/CheckBox';
import TextInput from 'backoffice/components/elements/TextInput';
import settings from 'backoffice/model/SportsbookSettingsModel';
import MarketPopup from 'bonus/popups/MarketsAndGroupsPopup';

export default class MarketRestrictionsView extends Component {
	constructor(props){
		super(props);

		var sportRestrictions = settings.eventTreeAvailability;

		this.state = {
			selectedPath: 0,
			changed: !!settings.changed
		};
	}

	onChange(){
		var marketPopupEl = this.refs.marketPopup;
		var markets = marketPopupEl.state.markets;
		var parsedMarkets = [];
		var paths = marketPopupEl.refs.treeMenu.getSelected();

		_.each(markets, (path) => {
			if (path.marketGroups.length + path.marketTypes.length){
				parsedMarkets.push({
					path: path.path,
					prohibitedMarketGroups: path.marketGroups,
					prohibitedMarketTypes: path.marketTypes
				});
			}
		});

		_.each(paths, (path) => {
			var hasMarketRestrictions = _.findWhere(parsedMarkets, {path: path+''});

			if (hasMarketRestrictions){
				// The path restriction takes precedence over market restrictions
				hasMarketRestrictions.prohibitedMarketTypes = [];
				hasMarketRestrictions.prohibitedMarketGroups = [];
			} else {
				parsedMarkets.push({
					path: path+'',
					prohibitedMarketGroups: [],
					prohibitedMarketTypes: []
				});
			}
		});

		settings.eventTreeAvailability.set('eventTreeRestrictions', parsedMarkets);
	}

	render(){
		var boundOnChange = this.onChange.bind(this);
		var paths = [];
		var availPaths = [];
		var sportRestrictions = settings.eventTreeAvailability.get('eventTreeRestrictions');

		_.each(sportRestrictions, function(restriction){
			if (!(restriction.prohibitedMarketGroups.length + restriction.prohibitedMarketTypes.length)){
				paths.push(parseInt(restriction.path,10));
			} else {
				availPaths.push({
					path: restriction.path,
					marketGroups: restriction.prohibitedMarketGroups,
					marketTypes: restriction.prohibitedMarketTypes
				});
			}
		});

		return(
			   <div className="table">
					<div className="table-row">
						<div className="table-cell">
							<div className="vertical-form">
								<div className="inline-form-elements">
									<label className="g-label section-title">Restriction on Sports / Leagues / Markets</label>
								</div>
								<MarketPopup inline={true}
									hilitedNodeId={this.state.selectedPath}
									ref="marketPopup"
									openField="restrictionOnSports"
									paths={paths}
									availPaths={availPaths}
									includeMarketGroups={true}
									onSportToggle={boundOnChange}
									onMarketGroupToggled={boundOnChange}
									onMarketTypeToggled={boundOnChange}
									/>
							</div>
						</div>
					</div>
				</div>
	  );
	}
};

import Component from 'common/system/react/BackboneComponent';
import TreeMenu from 'backoffice/components/controls/TreeMenu';
import cache from 'backoffice/model/NodeCache';
import CheckBox from 'backoffice/components/elements/CheckBox';
import TextInput from 'backoffice/components/elements/TextInput';
import settings from 'backoffice/model/SportsbookSettingsModel';

export default class BetTypesRestrictionsView extends Component {
	constructor(props){
		super(props);
		this.state = {selectedPath: 0};
		this.selected = [];
	}

	componentWillReceiveProps(){
		this.setState({selectedPath: 0});
	}

	onToggle(node, expanded){
		var nodeId = node.id;
		var isRootNode, path;

		cache.toggleNode(nodeId);
		node.set(this.props.openField, !node.get(this.props.openField));

		isRootNode = _.findWhere(cache.RootNodes, {id: nodeId});
		path = isRootNode ? (nodeId + '') : node.get('path');
		this.setState({selectedPath: path});
	}

	onCheckBoxChange(sport, isSelected){
		const sportId = sport.id;

		// If it's changed to unselected, ensure it's removed from the list
		if (!isSelected){
			this.selected = _.difference(this.selected, [sportId]);
			const allRestrictions = settings.bettingRestrictions.get('restrictions');
			const pluckedRestrictions = allRestrictions.pluck('eventTreePath');
			const path = sport.get('path') || (sportId + '');
			const removedRestriction = allRestrictions.findWhere({'eventTreePath': path});

			if (removedRestriction){
				allRestrictions.remove(removedRestriction);
				this.forceUpdate();
			}

			return;
		}

		if (!this.selected.includes(sportId)){
			this.selected.push(sportId);
		}
	}

	componentWillReceiveProps(nextProps){
		const allRestrictions = settings.bettingRestrictions.get('restrictions');
		const newList = allRestrictions.models.map( model => {
			const fullPath = model.get('eventTreePath');
			const pathParts = fullPath.split(':');
			const path = parseInt( _.last(pathParts), 10);
			return path;
		});

		this.selected = newList;
	}

	render(){
		return (
			<div key={this.props.id} className="table no-border-bottom">
				<div className="table-row">
					<div className="table-cell" style={{width: '33%', padding: '0'}}>
						<TreeMenu ref="treeMenu"
								checkbox
								selected={this.selected}
								data={cache.RootNodes}
								openField={this.props.openField || 'open'}
								hilitedNodeId={this.state.selectedPath}
								onCheckBoxChange={this.onCheckBoxChange.bind(this)}
								onToggle={this.onToggle.bind(this)}/>
					</div>
					<div className="table-cell" style={{width: '66%', padding: '0'}}>
						{this.renderRestrictionsList()}
					</div>
				</div>
			</div>

		);
	}

	renderRestrictionsList(){
		var allRestrictions = settings.bettingRestrictions.get('restrictions');
		var selectedPath = this.state.selectedPath;
		var selectedRestrictions;

		if (!selectedPath){
			return <p>Please select a sport, competition or event from the list on the left</p>;
		}

		selectedRestrictions = allRestrictions.findWhere({eventTreePath: selectedPath + ''});

		if (!selectedRestrictions){
			selectedRestrictions = allRestrictions.add({eventTreePath: selectedPath + ''});
		}

		return	<div>
					<div className="table no-border-bottom">
						<div className="table-row">
							<div className="table-cell">Min number of selections on the betslip from the same league</div>
							<div className="table-cell">
								<TextInput valueLink={this.bindTo(selectedRestrictions, 'minPartsForMultiple')} />
							</div>
						</div>
					</div>
					<div className="table no-border-bottom">
						<div className="table-row">
							<div className="table no-border-bottom">
								<div className="table-row">
									<div className="table-cell">In-play Betting Disabled</div>
									<div className="table-cell">
										<CheckBox valueLink={this.bindTo(selectedRestrictions, 'prohibitInplay')} />
									</div>
								</div>
								<div className="table-row">
									<div className="table-cell">Singles Betting Disabled</div>
									<div className="table-cell">
										<CheckBox valueLink={this.bindTo(selectedRestrictions, 'prohibitSingles')} />
									</div>
								</div>
								<div className="table-row">
									<div className="table-cell">Combination Betting Disabled</div>
									<div className="table-cell">
										<CheckBox valueLink={this.bindTo(selectedRestrictions, 'prohibitMultiples')} />
									</div>
								</div>
								<div className="table-row">
									<div className="table-cell">System Betting Disabled</div>
									<div className="table-cell">
										<CheckBox valueLink={this.bindTo(selectedRestrictions, 'prohibitSystem')} />
									</div>
								</div>
								<div className="table-row">
									<div className="table-cell">Multiway Betting Disabled</div>
									<div className="table-cell">
										<CheckBox valueLink={this.bindTo(selectedRestrictions, 'prohibitMultiway')} />
									</div>
								</div>
								<div className="table-row">
									<div className="table-cell">Multiway in-event Betting Disabled</div>
									<div className="table-cell">
										<CheckBox valueLink={this.bindTo(selectedRestrictions, 'prohibitMultiwayInEvent')} />
									</div>
								</div>
								<div className="table-row">
									<div className="table-cell">Full cover Betting Disabled</div>
									<div className="table-cell">
										<CheckBox valueLink={this.bindTo(selectedRestrictions, 'prohibitFullcover')} />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>;
	}
}

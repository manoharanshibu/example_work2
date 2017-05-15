import Component from 'common/system/react/BackboneComponent';
import model from 'backoffice/model/MatrixModel';
import cache from 'backoffice/model/NodeCache';
import TreeMenu from 'backoffice/components/controls/TreeMenu';
import CheckBox from 'backoffice/components/elements/CheckBox';
import TextInput from 'backoffice/components/elements/TextInput';
import SegmentSelector from 'segment/SegmentSelectorView';
import EventSearchPopup from 'backoffice/components/EventSearchPopup';
import {notify, errorPopup} from 'common/util/PopupUtil.js';
import Loader from 'app/view/Loader';

const defaultCountry = 'DE';

export default class CmsHighlightsView extends Component {
	constructor(props) {

		super(props);

		model.set({country: defaultCountry});
		model.getSports();

		this.state = {
			name: '',
			segmentType: 'region',
			segment: defaultCountry,
			loading: false
		};

		this.observe = false;

		this.forceRerender = ::this.forceRerender;

		this.treeHeight = _.once(function(){
			return window.innerHeight - 35;
		});
	}

	/**
	 * Reference the name and code inputs
	 */
	componentDidMount() {
		this.nameFilter = ReactDOM.findDOMNode(this.refs.name);
		this.props.collection.on('all', this.forceRerender);
	}

	/**
	 *
	 */
	componentWillUnmount() {
		this.props.collection.off('all', this.forceRerender);
		model.frontLinks.off(null, null, this);
	}

	forceRerender(){
		this.forceUpdate();
	}

	onChangeSegmentType(segmentType){
		this.setState({segmentType});
	}

	onChangeSegment(segment){
		this.setState({segment, loading: true});
		model.changeCountry(segment)
			.then( ::this.onChangeSegmentSuccess, ::this.onChangeSegmentError );
	}

	onChangeSegmentSuccess(){
		this.setState({loading: false});
	}

	onChangeSegmentError(){
		this.setState({loading: false});
	}

	onSearchEvent(){
		App.bus.trigger('popup:view', EventSearchPopup, {onSelectEvent: this.onAddEvent.bind(this)});
	}

	onAddEvent(sportEvent){
		const eventId = sportEvent && sportEvent.id;
		const selectedEventIds = _.pluck(this.props.collection.models, 'id');

		if (eventId){
			if (selectedEventIds.includes(eventId)){
				errorPopup('The selected event is already in the list');
				return;
			}

			const promise = model.addFrontLink(eventId);

			if (!promise){
				errorPopup('The selected event is not available as a Highlight');
				return;
			}

			promise.then( this.onAddSuccess );
		}
	}

	onAddSuccess(){
		notify('The event has been added as a highlight');
	}
	/**
	 *
	 * @returns {*}
	 */
	heightFunction() {
		return this.treeHeight;
	}

	/**
	 * @param model
	 * @returns {boolean}
	 */
	checkBoxFunction(model) {
		return model.attributes.type == 'TRADING';
	}

	/**
	 * Filter the records
	 */
	onSearch() {
		var name = this.nameFilter.value;
		this.setState({name: name});
	}

	/**
	 * Reset filtering
	 */
	onClear() {
		this.nameFilter.value = '';
		this.setState({name: ''});
	}

	/**
	 *
	 */
	onToggle(node, expanded) {
		cache.toggleNode(node.id, 'openField2');
	}

	/**
	 * @param node
	 * @param checked
	 */
	onCheckBoxChange(node, checked) {
		console.warn(node.id);
		checked ?
			this.onAddEvent(node) :
			model.removeFrontLink(node.id);
	}



	/**
	 * @param segment
	 */
	onDeleteFrontLink(frontLink) {
		var frontLinkName = _.titleize(frontLink.get('name')),
			message = `Are you sure you wish to delete the '${frontLinkName}'?`;
		App.bus.trigger('popup:confirm', {
			content: message, onConfirm: () => {
				model.removeFrontLinkFromView(frontLink);
			}
		});
	}

	/**
	 * @returns {XML}
	 */
	render() {
		//TODO: Checking the permissions on every render, might not be ideal
		//but as a quick fix, it ensures they are reevaluated if the user has
		//logged out and logged in with different user
		const allowed = App.session.request('canCmsHighlights');

		if (!allowed){
			return <div><p><strong>YOU ARE NOT AUTHORIZED TO USE THIS FUNCTION.</strong></p></div>;
		}

		return (
			<div className="box">
				<div style={{minHeight: window.innerHeight - 50}}>
					<div className="page-selectors">
						<h1 className="heading main">Highlights</h1>
					</div>
					<div className="table toolbar">
						<div className="table-row">
							<div className="table-cell">
								<div className="inline-form-elements">
									<SegmentSelector ref="segment-selector"
										onChangeSegment={this.onChangeSegment.bind(this)}
										onChangeSegmentType={this.onChangeSegmentType.bind(this)}
										segmentType={this.state.segmentType}
										segment={this.state.segment} />
								</div>
							</div>
							<div className="table-cell">
								<div className="inline-form-elements">
									<a className="btn blue filled"
										onClick={this.onSearchEvent.bind(this)}>Add Events</a>
								</div>
							</div>
							<div className="table-cell right">
								<div className="inline-form-elements">
									<label>Search Highlights</label>
									<input ref="name" type="text" name="text" onChange={this.onSearch.bind(this)}/>
									<a href="#_" className="btn blue filled" onClick={this.onClear.bind(this)}>Clear</a>
								</div>
							</div>
						</div>

					</div>

					{ this.renderContents() }

				</div>
			</div>
		);
	}

	renderContents(){
		if (!this.state.segment){
			return <p>Please select a Segment</p>;
		}

		if (this.state.loading){
			return <Loader />;
		}

		return (
			<div className="table" style={{marginTop: '0px'}}>
				<div className="table-row split-2">
					<div className="table-cell">
						<TreeMenu ref="treeMenu" id="1" key="1"
								  selected={model.getHighlightIds()}
								  rootCheckbox={false}
								  data={cache.RootNodes}
								  openField="openField2"
								  onToggle={this.onToggle.bind(this)}
								  onCheckBoxChange={this.onCheckBoxChange.bind(this)}
								  heightFunction={this.heightFunction.bind(this)}
								  checkBoxFunction={this.checkBoxFunction.bind(this)}
								  collapseIcon="fa fa-minus-square-o"
								  expandIcon="fa fa-plus-square-o"
								  />
					</div>
					<div className="table-cell" style={{verticalAlign: 'top'}}>
						{this.renderRightView()}
					</div>
				</div>
			</div>
		);
	}

	/**
	 * @returns {XML}
	 */
	renderRightView() {
		return (
			<div className="table grid inner" style={{marginTop: '0px'}}>
				<div className="table-row header larger">
					<div className="table-cell">
						Currently Selected Highlights
					</div>
					<div className="table-cell center" style={{maxWidth: '80px'}}>
						Order
					</div>
					<div className="table-cell center" style={{maxWidth: '80px'}}>
						Alan Pick
					</div>
					<div className="table-cell center" style={{maxWidth: '80px'}}>
						Active
					</div>
					<div className="table-cell center" style={{minWidth: '120px'}}>
						Action
					</div>
				</div>
				{this.renderRows()}
			</div>
		);
	}

	/**
	 * @returns {*}
	 */
	renderRows() {
		var filtered = this.props.collection.byHighlightsName(this.state.name);
		return _.reduce(filtered, (rows, frontLink, index) => {
			rows.push((
				<div key={index} className="table-row">

					<div className="table-cell">
						{_.titleize(frontLink.get('name'))}
					</div>
					<div className="table-cell center">
						<TextInput type="number" valueLink={this.bindTo(frontLink, 'order', model.updateFrontLinks)}/>
					</div>
					<div className="table-cell center">
						<CheckBox valueLink={this.bindTo(frontLink,'alanPick', model.updateFrontLinks)}/>
					</div>
					<div className="table-cell center">
						<CheckBox valueLink={this.bindTo(frontLink, 'active', model.updateFrontLinks)}/>
					</div>
					<div className="table-cell center" style={{minWidth: '120px'}}>
						<a className="btn red small" onClick={this.onDeleteFrontLink.bind(this, frontLink)}>Delete</a>
					</div>
				</div>
			));

			return rows;
		}, [], this);
	}
};

CmsHighlightsView.defaultProps = {
	collection: model.frontLinks
};

CmsHighlightsView.displayName = 'CmsHighlightsView';

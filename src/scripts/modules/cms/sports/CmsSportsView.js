import Component from 'common/system/react/BackboneComponent';
import model from 'backoffice/model/MatrixModel';
import SportSelectorView from 'cms/sports/components/SportSelectorView';
import SportsMatrixView from 'cms/sports/components/SportsMatrixView';
import SegmentSelector from 'segment/SegmentSelectorView';
import Loader from 'app/view/Loader';
import PathSelectorPopup from 'backoffice/components/PathSelectorPopup';
import {notify, errorPopup} from 'common/util/PopupUtil.js';

// TO-DO: This constant should be moved to an external
// configuration file
const defaultCountry = 'GB-BOB';

export default class CmsSportsView extends Component {
	constructor(props) {
		super(props);

		this.state = {
			unsavedChanges: false,
			name: '',
			segmentType: 'region',
			segment: defaultCountry,
			loading: false
		};

		model.getSports();

		this.treeHeight = _.once(function(){
			return window.innerHeight - 35;
		});

		this.canCmsSportMatrix = App.session.request('canCmsSportMatrix');

		this.onAddPathSuccess = ::this.onAddPathSuccess;
		this.onAddPathError = ::this.onAddPathError;
		this.onMatrixChange = ::this.onMatrixChange;
		this.onSaveChanges = ::this.onSaveChanges;
		this.onSaveMatrixSuccess = ::this.onSaveMatrixSuccess;
		this.onSaveMatrixError = ::this.onSaveMatrixError;
		this.onLeavingWithUnsavedChanges = ::this.onLeavingWithUnsavedChanges;
		this.forceRerender = ::this.forceRerender;
	}

	componentDidMount() {
		this.nameFilter = ReactDOM.findDOMNode(this.refs.name);
		// Sports are immediately removed from the matrix, as the API doesn't
		// support removing them on saving, that's why we don't want the 'save' button
		// to activate when a sport is removed
		// model.segments.on('add remove change weightAdded weightRemoved', this.onMatrixChange);
		model.segments.on('add change weightAdded weightRemoved', this.onMatrixChange);
		model.segments.on('remove', this.forceRerender);
		model.segments.on('all', this.all);

		this.props.history.listenBeforeLeavingRoute(this.props.route, this.onLeavingWithUnsavedChanges);
	}

	all(){
		console.warn('arguments:', arguments);
	}

	componentWillMount(){
		this.onChangeSegment(defaultCountry);
		model.segments.off('change', this.onMatrixChange);
	}

	componentWillUnmount(){
		window.onbeforeunload = null;
		model.segments.off('add change weightAdded weightRemoved', this.onMatrixChange);
		model.segments.off('remove', this.forceRerender);
		model.segments.off('all', this.all);
	}

	forceRerender(){
		this.forceUpdate();
	}

	onLeavingWithUnsavedChanges(event){
		if (!this.state.unsavedChanges){
			return null;
		}
		const dialogText = 'Do you want to leave without saving your changes?\na';
		event.returnValue = dialogText;
		return dialogText;
	}

	/**
	 * Filter the records
	 */
	onSearch() {
		var name = this.nameFilter.value;
		this.setState({name: name});
	}

	onSearchPath(){
		App.bus.trigger('popup:view', PathSelectorPopup, {onConfirmedPath: this.onAddPath.bind(this)});
	}

	onAddPath(path, sportCode, nodeId){
		const pathLength = path.split(':').length;

		const method = (pathLength === 1) ? 'addSegment' : 'addWeighting';

		// Sometimes the MatrixModel fails because the segment doesn't
		// really exist (I can't say why), so we need to capture that exception
		try {
			const promise = model[method](sportCode, nodeId);
			// If the node is already in the Matrix, the promise will come back
			// as 'undefined'
			if (promise){
				promise.then( this.onAddPathSuccess, this.onAddPathError );
			}
		} catch(e) {
			this.onAddPathError();
		}
	}

	onMatrixChange(){
		this.setState({unsavedChanges: true});
	}

	onSaveChanges(event){
		event.preventDefault();
		event.stopPropagation();

		// We immediately assume the changes will be saved, which provide a faster
		// better user experience. If it fails, we will flag it by making
		// unsavedChanged true again
		this.setState({unsavedChanges: false});
		model.updateWeightings()
			.then( this.onSaveMatrixSuccess, this.onSaveMatrixError );
	}

	onSaveMatrixSuccess(){
		notify('Success', <div>The changes to the matrix have been properly saved</div>);

	}

	onSaveMatrixError(){
		this.setState({unsavedChanges: true});
		errorPopup(<div>There has been an error saving the changes to the matrix</div>);
	}

	onAddPathSuccess(){
		model.segments.trigger('change');
		notify('Success', <div>The path has been added to the matrix</div>);
	}

	onAddPathError(errorMsg){
		const defaultErrMess = <div>There has been an error adding the path to the matrix</div>;
		const message = errorMsg || defaultErrMess;
		errorPopup(message);
	}

	/**
	 * Reset filtering
	 */
	onClear() {
		this.nameFilter.value = '';
		this.setState({name: ''});
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

	/**
	 * @returns {XML}
	 */
	render() {
		//TODO: Checking the permissions on every render, might not be ideal
		//but as a quick fix, it ensures they are reevaluated if the user has
		//logged out and logged in with different user
		const allowed = App.session.request('canCmsSportMatrix');

		if (!allowed){
			return <div><p><strong>YOU ARE NOT AUTHORIZED TO USE THIS FUNCTION.</strong></p></div>;
		}

		return (
			<div className="box">
				<div style={{minHeight: window.innerHeight - 50 , display: !this.canCmsSportMatrix ? 'block' : 'none'}}>
					<div className="table toolbar">
						<div className="table-row">
							<div className="table-cell">
								<div className="inline-form-elements">
									<strong>YOU ARE NOT AUTHORISED TO USE THIS FUNCTION</strong>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div style={{minHeight: window.innerHeight - 50, display: this.canCmsSportMatrix ? 'block' : 'none'}}>
					<div className="page-selectors">
						<h1 className="heading main">Sport Matrix</h1>
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
								<div className="inline-form-elements" style={{paddingTop: 10}}>
									<a className="btn blue filled"
										onClick={this.onSearchPath.bind(this)}>Add Path</a>
								</div>
							</div>
							<div className="table-cell">
								<div className="inline-form-elements" style={{paddingTop: 10}}>
									<label>Name</label>
									<input ref="name" type="text" name="text" onChange={this.onSearch.bind(this)}/>
									<a href="#_" className="btn blue filled" onClick={this.onClear.bind(this)}>Clear</a>
								</div>
							</div>
							{this.renderSaveButton()}
						</div>
					</div>
					{this.renderContents()}
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
					<SportSelectorView openField={this.props.openField}/>
					<SportsMatrixView
						onChange={this.onMatrixChange}
						nameFilter={this.state.name}/>
				</div>
			</div>
		);
	}

	renderSaveButton(){
		const saveButton = (
			<a
				href="#_"
				className="btn red filled"
				onClick={this.onSaveChanges}>Save Changes</a>
		);

		const allSavedMessage = 'All saved';
		const content = this.state.unsavedChanges ? saveButton : allSavedMessage;

		return (
			<div className="table-cell">
				<div className="inline-form-elements" style={{paddingTop: 10}}>
					{content}
				</div>
			</div>
		);
	}
};

CmsSportsView.displayName = 'CmsSportsView';

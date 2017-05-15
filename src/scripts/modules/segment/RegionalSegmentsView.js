import Component from 'common/system/react/BackboneComponent';
import AddRegionalSegmentPopup from 'segment/regional/AddRegionalSegmentPopup';
import EditRegionalSegmentPopup from 'segment/regional/EditRegionalSegmentPopup';
import CopyRegionalSegmentPopup from 'segment/regional/CopyRegionalSegmentPopup';
import TextInput from 'backoffice/components/elements/TextInput';
import CheckBox from 'backoffice/components/elements/CheckBox';
import model from 'backoffice/model/CustomerSegmentModel';
import service from 'backoffice/service/BackofficeRestfulService'

export default class RegionalSegmentsView extends Component {
	constructor(props) {
		super(props);
		this.state = {name: '', code: ''};
		this.observe = false;
	}

	/**
	 * Filter the records
	 */
	onSearch() {
		var name = this.nameFilter.value,
			code = this.codeFilter.value;
		this.setState({name: name, code: code});
	}

	/**
	 * Reset filtering
	 */
	onClear() {
		this.nameFilter.value = '';
		this.codeFilter.value = '';
		this.setState({name: '', code: ''});
	}

	/**
	 *
	 */
	onAddAccount() {
		App.bus.trigger('popup:view', AddRegionalSegmentPopup);
	}

	/**
	 * @param segment
	 */
	onDeleteSegment(segment) {
		var that = this;
		var segName = _.titleize(segment.get('name')),
			message = `Are you sure you wish to delete the '${segName}' segment?`;
		App.bus.trigger('popup:confirm', {content: message, onConfirm: () => {
			model.removeSegment(segment.id)
				.then( () => that.notify('Segment deleted', 'The segment has been successfully deleted') )
				.catch( () => that.notify('Error', 'There has been an error deleting the segment') )
		}})
	}

	/**
	 *
	 * @param segment
	 */
	onNewTsAndCsSegment(segment){
		let segCode = segment.attributes.code,
			segName = _.titleize(segment.get('name')),
			message = `Are you sure you wish to push new Ts and Cs for the '${segName}' segment?`;

		App.bus.trigger('popup:confirm', {content: message, onConfirm: onConfirm.bind(null, segCode, service)});

		function onConfirm(){
			let segCode = arguments[0],
				service = arguments[1];

			service.incrementTermsBySegment(segCode);
		}
	}

	/**
	 * @param segment
	 */
	onEditSegment(segment) {
		var data = segment.attributes;
		App.bus.trigger('popup:view', EditRegionalSegmentPopup, {data: data});
	}

	/**
	 * @param segment
	 */
	onCopySegment(segment) {
		var data = segment.attributes;
		App.bus.trigger('popup:view', CopyRegionalSegmentPopup, {data: data});
	}

	/**
	 * @param title
	 * @param content
	 * @param autoDestruct
	 */
	notify(title='', content='', autoDestruct=2000){
		App.bus.trigger('popup:notification', {title, content, autoDestruct});
	}


	/**
	 * Reference the name and code inputs
	 */
	componentDidMount() {
		super.componentDidMount();

		this.nameFilter = ReactDOM.findDOMNode(this.refs.name);
		this.codeFilter = ReactDOM.findDOMNode(this.refs.code);

		this.props.collection.on('all', (e) => {
			this.forceUpdate();
		}).bind(this);
	}

	/**
	 *
	 */
	componentWillUnmount() {
		super.componentWillUnmount();
		this.props.collection.off(null, null, this);
	}

	/**
	 * @returns {XML}
	 */
	render() {
		//TODO: Checking the permissions on every render, might not be ideal
		//but as a quick fix, it ensures they are reevaluated if the user has
		//logged out and logged in with different user
		const allowed = App.session.request('canSegmentRegionalSegments');

		if (!allowed){
			return <div><p><strong>YOU ARE NOT AUTHORIZED TO USE THIS FUNCTION.</strong></p></div>;
		}
		return (
			<div className="box">
				<div style={{minHeight: window.innerHeight - 50}}>
					<div className="table toolbar">
						<div className="table-row">
							<div className="table-cell">
								<div className="inline-form-elements">
									<label>Name</label>
									<input ref="name" type="text" name="text" onChange={this.onSearch.bind(this)}/>
									&nbsp;&nbsp;&nbsp;
									<label>Code</label>
									<input ref="code" type="text" name="text" onChange={this.onSearch.bind(this)}/>
									<a className="btn blue filled" onClick={this.onClear.bind(this)}>Clear</a>
								</div>
							</div>

							<div className="table-cell right">
								<div className="inline-form-elements">
									<a className="btn green filled" onClick={this.onAddAccount.bind(this)}>Create Segment</a>
								</div>
							</div>
						</div>
					</div>

					<div className="table grid">
						<div className="table-row header larger">
							<div className="table-cell">
								Name
							</div>
							<div className="table-cell center">
								ID
							</div>
							<div className="table-cell center">
								Code
							</div>
							<div className="table-cell center">
								Priority
							</div>
							<div className="table-cell center">
								Bonus
							</div>
							<div className="table-cell center">
								Matrix
							</div>
							<div className="table-cell center">
								Settings
							</div>
							<div className="table-cell center">
								Layout
							</div>
							<div className="table-cell center">
								forLimits
							</div>
							<div className="table-cell">
								Post Codes
							</div>
							<div className="table-cell">
								Cities
							</div>
							<div className="table-cell">
								Countries
							</div>
							<div className="table-cell" style={{width: '50px'}}>
								Channel
							</div>
							<div className="table-cell center" style={{minWidth: '140px'}}>
								Actions
							</div>
						</div>
						{this.renderRows()}
					</div>
				</div>
			</div>
		)
	}

	/**
	 * @returns {*}
	 */
	renderRows() {
		var filtered = this.props.collection.byNameAndCode(this.state.name, this.state.code);
		return _.map(filtered, (segment, index) => {
			return (
				<div key={index} className="table-row">
					<div className="table-cell">
						{segment.get('name')}
					</div>
					<div className="table-cell center">
						{segment.get('id')}
					</div>
					<div className="table-cell center">
						{segment.get('code')}
					</div>
					<div className="table-cell center">
						{segment.get('priority')}
					</div>
					<div className="table-cell center">
						<CheckBox disabled={true} valueLink={this.bindTo(segment, 'forBonus')}/>
					</div>
					<div className="table-cell center">
						<CheckBox disabled={true} valueLink={this.bindTo(segment, 'forMatrix')}/>
					</div>
					<div className="table-cell center">
						<CheckBox disabled={true} valueLink={this.bindTo(segment, 'forSettings')}/>
					</div>
					<div className="table-cell center">
						<CheckBox disabled={true} valueLink={this.bindTo(segment, 'forLayout')}/>
					</div>
					<div className="table-cell center">
						<CheckBox disabled={true} valueLink={this.bindTo(segment, 'forLimits')}/>
					</div>
					<div className="table-cell" style={this.props.textareaCellStyle}>
						<textarea disabled rows="4" cols="20" value={segment.get('postcodes')} style={this.props.textareaStyle}>
						</textarea>
					</div>
					<div className="table-cell" style={this.props.textareaCellStyle}>
						<textarea disabled rows="4" cols="20" value={segment.get('cities')} style={this.props.textareaStyle}>
						</textarea>
					</div>
					<div className="table-cell" style={this.props.textareaCellStyle}>
						<textarea disabled rows="4" cols="20" value={segment.get('countries')} style={this.props.textareaStyle}>
						</textarea>
					</div>
					<div className="table-cell">
						{_.titleize(segment.get('channelId'))}
					</div>
					<div className="table-cell center" style={{minWidth: '120px'}}>
						<a className="btn blue small" onClick={this.onCopySegment.bind(this, segment)}>Copy</a>
						&nbsp;&nbsp;
						<a className="btn blue small" onClick={this.onEditSegment.bind(this, segment)}>Edit</a>
						&nbsp;&nbsp;
						<a className="btn blue small" onClick={this.onNewTsAndCsSegment.bind(this, segment)}>New Ts And Cs</a>
						&nbsp;&nbsp;
						<a className="btn red small" onClick={this.onDeleteSegment.bind(this, segment)}>Delete</a>
					</div>
				</div>
			);
		});
	}
};


RegionalSegmentsView.defaultProps = {
	collection: model.customerSegments,
	textareaCellStyle: {padding:'0 !important', overflow:'auto',overflowY:'hidden', margin:'0'},
	textareaStyle: {margin:'0', border:'0'}
};



















import Component from 'common/system/react/BackboneComponent';
import {classNames as cx} from 'common/util/ReactUtil';

export default class TemplateListElement extends Component {
	constructor(props){
		super(props);
	}

	onTemplateRemoved() {
		this.props.onTemplateRemoved(this.props.template.id);
	}

	onTemplateClicked() {
		this.props.onTemplateClicked(this.props.template.id);
	}

	onTemplateCopy() {
		this.props.onTemplateCopy(this.props.template.id);
	}

	render() {
		var active = this.props.activeItemId ==  this.props.template.id;
		var classNames = cx(
			'table-row clickable',
			{'active': active},
			{'header': this.props.isHeader}
		);

		return (
			<div key={this.props.template.id} className={classNames}>
				<div className="table-cell" onClick={this.onTemplateClicked.bind(this)}>{this.props.template.name}</div>
				<div className="table-cell center">
					<div className="inline-form-elements" style={{minHeight:'none',margin:'5px 0 0 0'}}>
						<a href="javascript:void(0)" className="btn red small" onClick={this.onTemplateRemoved.bind(this)}>Remove</a>
						<a href="javascript:void(0)" className="btn blue  small" onClick={this.onTemplateCopy.bind(this)}>Copy</a>
					</div>
				</div>
			</div>
		)
	}
}

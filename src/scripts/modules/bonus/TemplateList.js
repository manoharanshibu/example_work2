import Component from 'common/system/react/BackboneComponent';
import TemplateListElement from 'bonus/TemplateListElement'
import TemplateListHeader from 'bonus/TemplateListHeader'

export default class TemplateList extends Component {
	constructor(props){
		super(props);
	}

	render(){
		var displayProp = (this.props.isActive) ? 'block' : 'none';
		var list = this.props.list;
		var newTemplateText = 'New ' + this.props.templateType + ' Template';

		var rows = _.map(list, function(template, index){
			return <TemplateListElement
				key={index}
				template={template}
				onTemplateRemoved={this.props.onTemplateRemoved}
				onTemplateClicked={this.props.onTemplateClicked}
				onTemplateCopy={this.props.onTemplateCopy}
				activeItemId={this.props.activeItemId}/>;
		}, this);

		return (
			<div className="white panel float" style={{display: displayProp}}>
				<div className="toolbar">
					<a className="btn green filled block"
						onClick={this.props.onNewTemplate}>{newTemplateText}</a>
				</div>
				<div className="table grid">
					<TemplateListHeader name="Bonus Template" actions="Actions"/>
					{rows}
				</div>
			</div>
		)
	}
}

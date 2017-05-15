import Component from 'common/system/react/BackboneComponent';

export default class TemplateListHeader extends Component {
  constructor(props){
    super(props);
  }

	render() {
		return (
			<div className="table-row header">
				<div className="table-cell center">{this.props.name}</div>
				<div className="table-cell center">{this.props.actions}</div>
			</div>
		)
	 }
}

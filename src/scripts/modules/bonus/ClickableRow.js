export default class ClickableRow extends React.Component {
  constructor(props){
    super(props);
  }

	render(){
		 var className = (this.props.isActive) ? 'table-row active' : 'table-row';
		 className = className + ' clickable';

		return(
			<div className={className} onClick={this.props.onClick}>
				<div className="table-cell">{this.props.name}</div>
				<div className="table-cell center">{this.props.id}</div>
			</div>
		);
	};
}

import ClickableRow from 'bonus/ClickableRow'

export default class ClickableRows extends React.Component {
  constructor(props){
    super(props);
  }

	render(){
		var activeRowIndex = this.props.activeRowIndex;
		var that = this;

		var rows = _.map(this.props.list, function(elem, i){
			return <ClickableRow
				name={elem.name}
				id={elem.id}
				isActive={i === activeRowIndex}
				onClick ={that.props.onClick.bind(that, i, elem)} />
		});

		return(<div className="table grid">{rows}</div>);
	}
}

export default class Loader extends React.Component {
	constructor(props) {
		super(props);
	}

	render(){
		const {color='#333'}  = this.props;

		return (
			<div className="table no-border-bottom" style={{padding: 20}}>
				<div className="table-row">
					<div className="table-cell">
						<div className="loaderWrap" >
							<div className="loading">
								<div className="loader" style={{color}}></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
};

export default class MtnTransaction extends React.Component {
	constructor() {
		super();
	}


	/**
	 * Renders competition container
	 * TODO: Replace iframe with real stuff
	 * @returns {XML}
	 */
	render() {
		var iframeURL = `${App.Urls.agentDomain}`;

		return (
			<div className="box">
				<iframe src={iframeURL}
						frameborder="0"
						width="100%"
						height="2000px">
					Sorry, your browser does not support this feature...
				</iframe>
			</div>
		)
	}
};

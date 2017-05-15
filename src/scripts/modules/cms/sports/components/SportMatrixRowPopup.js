import Popup from 'common/view/popup/Popup';
import TableRowWrapper from 'backoffice/components/TableRowWrapper';
import TextInput from 'backoffice/components/elements/TextInput';
import CheckBox from 'backoffice/components/elements/CheckBox';

export default class SportMatrixRowPopup extends React.Component {
	constructor(props) {
		super(props);

		const {displayPath, weight, maxInplay, maxPrematch, highlight} = props;

		this.state = {
			displayPath,
			weight,
			maxInplay,
			maxPrematch,
			highlight
		};
	}

	onClose() {
		this.props.onClose();
	}

	onSave(){

		if (this.props.onConfirmed){
			const values = Object.assign({}, this.state);

			//'displayPath' is non-editable, so there is no need to inform
			//the parent of any changes
			delete values.displayPath;

			if (this.props.hideHighlightBox){
				delete values.highlight;
			}

			this.props.onConfirmed(values);
		}

		this.props.onClose();
	}

	render(){
		const title = 'Edit Sport Matrix row';
		const buttons = [
			{title: 'Save', cls: 'green', handler: ::this.onSave},
			{title: 'Cancel', cls: 'red', handler: ::this.onClose}
		];

		const {displayPath, weight, maxInplay, maxPrematch} = this.state;

		return (
			<Popup styles={this.props.styles}
				titleBarColor='#337AB7'
				title={title}
				buttons={buttons}
				onClose={::this.onClose}>
				<div className="table sport-matrix-row-popup">
					<TableRowWrapper label="Sport/league">
						{displayPath}
					</TableRowWrapper>
					<TableRowWrapper label="Weight:">
						<TextInput
							selectOnFocus
							ref="weight"
							placeholder=""
							focus
							onChange={ weight => this.setState({weight}) }
							value = {weight}
						/>
					</TableRowWrapper>
					<TableRowWrapper label="Max Prematch">
						<TextInput
							selectOnFocus
							ref="maxPrematch"
							placeholder=""
							onChange={ maxPrematch => this.setState({maxPrematch}) }
							value = {maxPrematch}
						/>
					</TableRowWrapper>
					<TableRowWrapper label="Max InPlay">
						<TextInput
							selectOnFocus
							ref="maxInplay"
							placeholder=""
							onChange={ maxInplay => this.setState({maxInplay}) }
							value = {maxInplay}
						/>
					</TableRowWrapper>
					{this.renderHighlight()}
				</div>
			</Popup>
		);
	}

	renderHighlight(){
		const {highlight} = this.state;

		if (this.props.hideHighlightBox){
			return null;
		}

		return(
			<TableRowWrapper label="Is a Highlight?">
				<CheckBox
					ref="highlight"
					placeholder=""
					value = {highlight}
					onChange={ highlight => this.setState({highlight}) }
				/>
			</TableRowWrapper>
		);
	}
}

SportMatrixRowPopup.displayName = 'SportMatrixRowPopup';

const windowWidth = 400;

SportMatrixRowPopup.defaultProps = {
	styles: {
		marginTop: 0,
		width: windowWidth,
		top: '30%',
		left: '50%',
		marginLeft: -windowWidth/2
	}
};

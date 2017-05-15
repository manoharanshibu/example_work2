import ExternalizedTranslations from './ExternalizedTranslations';
import { connect } from 'react-redux';
import {addTranslationKey, removeTranslationKey, changeTranslation, getAllTranslations} from './translateActions';

class ExternalizedTranslationsContainer extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount(){
		const {dispatch, getAllTranslations} = this.props;
		dispatch(getAllTranslations());
	}

	render(){
		return (
			<ExternalizedTranslations {...this.props} />
		);
	}
}

ExternalizedTranslationsContainer.displayName = 'ExternalizedTranslationsContainer';

const mapStateToProps = (state) => {
	return state.translate;
};

const mapDispatchToProps = (dispatch) => {
	return {
		dispatch,
		getAllTranslations,

		onRemoveKey: (translationId) => {
			dispatch(removeTranslationKey(translationId));
		},

		onAddTranslationKey: (translationKey, defaultTranslation) => {
			dispatch(addTranslationKey(translationKey, defaultTranslation));
		},

		onChangeTranslation: (translationId, changeObj) => {
			dispatch(changeTranslation(translationId, changeObj));
		}

	};
};

const connectedContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(ExternalizedTranslationsContainer);

export default connectedContainer;

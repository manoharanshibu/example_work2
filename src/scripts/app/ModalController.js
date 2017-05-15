import {notify, errorPopup, confirm} from 'common/util/PopupUtil.js';
import { connect } from 'react-redux';
import { clearErrors } from 'translate/modalActions';

class ModalController extends React.Component {
	constructor(props) {
		super(props);
	}

	componentWillReceiveProps(nextProps){
		const {error, msgType} = nextProps;

		if (error){
			if (msgType && msgType === 'success'){
				notify('Success', error);
			} else {
				errorPopup(error);
			}
			this.props.onClearError();
		}
	}

	render(){
		return null;
	}
}

ModalController.displayName = 'ModalController';

const mapStateToProps = (state) => {
	return state.modal;
};

const mapDispatchToProps = (dispatch) => {
	return {
		onClearError: () => {
			dispatch(clearErrors());
		},

	};
};


const connectedContainer = connect(
	mapStateToProps,
	mapDispatchToProps
)(ModalController);

export default connectedContainer;

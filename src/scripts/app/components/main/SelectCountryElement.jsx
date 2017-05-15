import SelectElement from 'app/components/main/SelectElement.js';
import './RegisterView.scss';

class SelectCountryElement extends SelectElement {
	constructor(props) {
		super(props);
	}

	valid() {
		return this.state.optionChosen && this.state.value == 'GB';
	}

	onChange(e) {
		var value = e.target.value,
			valid = value != 'none';
		this.setState({optionChosen: value, inputValid: value && value == 'GB'});
		this.update(value);
	}
}

SelectCountryElement.defaultProps = {
	label: "",
	optionChosen: false,
	value: 'none',
	required: true,
	disabled: false,
	errorMsg: 'Only users from the UK can register on Bet on Brazil',
	hideError: true
};

export default SelectCountryElement;

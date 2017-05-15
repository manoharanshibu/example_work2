class FormElement extends React.Component {
	static defaultProps = {
		focus: false,
		errorMsg: 'Please fill details',
		required: true,
		showErrorboxTooltip: true,
		isValid: true,

		validateOnChange: false,
		validateOnFocus: false,
		validateOnBlur: true,

		onValid: null,
		onInvalid: null,
		onValidityChange: null,

		autocomplete: "nope",
		autoComplete: "nope"
	};

	constructor(props) {
		super(props);
		this.value = this.value.bind(this);
		this.state = {
			value: this.value(props),
			previous: '',
			isValid: props.isValid,
			errorMsg: props.errorMsg,
			validated: false
		};
	}

	/**
	 *
	 */
	validate() {
		const {validate} = this.props;
		if (validate) {
			validate(this);
		}
	}

	/**
	 * Gets the value of this component
	 @returns {}
	 */
	value(props = this.props) {
		if (props.valueLink) {
			return props.valueLink.value;
		}
		if (props.value) {
			return props.value;
		}
		return this.state && this.state.value;
	}

	/**
	 * Sets the value of this component.
	 * Override in sub-component for different implementation
	 * @param event
	 */
	setValue(value, doValidate = false) {
		const {valueLink, validate, validateOnChange, onChange} = this.props;
		if (valueLink) {
			valueLink.requestChange(value);
			valueLink.value = value;
		}

		this.setState({value: value, previous: this.state.value}, () => {
			// validate if the 'validate' and 'validateOnChange' props
			// are set, or 'validate' is set to true, or if it's currently
			// invalid and we want to re-validate as we type
			if (validate &&
				validateOnChange || doValidate) {
				validate(this);
			}
			// invoke any external onChange handlers
			if (onChange) {
				onChange(value);
			}
		});
	}

	/**
	 * @param e
	 */
	onFocus(...rest) {
		const {validate, validateOnFocus, onFocus} = this.props;
		this.setState({isFocused: true}, () => {
			const hasValue = !_.isEmpty(this.state.value);
			// validate if the 'validate' and 'validateOnFocus'
			// props are set, and there's a value
			if (validate &&
				validateOnFocus && hasValue) {
				validate(this);
			}
		});

		if (onFocus){
			onFocus(...rest);
		}
	}

	/**
	 * @param e
	 */
	onBlur(...rest) {
		const {validate, validateOnBlur, onBlur} = this.props;
		this.setState({isFocused: false}, () => {
			const hasValue = !_.isEmpty(this.state.value) || this.state.value === true;
			const hadValue = !_.isEmpty(this.state.previous) || this.state.previous === true;
			const reValidate = hasValue || (!hasValue && hadValue);
			// validate if the 'validate' and 'validateOnBlur' props are
			// set, and there's a value, or previously there was a value
			if (validate &&
				validateOnBlur && reValidate) {
				validate(this);
			}
		});

		if (onBlur){
			onBlur(...rest);
		}
	}

	/**
	 * Attach this component to the form instance
	 */
	componentWillMount() {
		if (this.props.attachToForm) {
			this.props.attachToForm(this);
		}
	}

	/**
	 * Unattach this component from the form instance
	 */
	componentWillUnmount() {
		if (this.props.detachFromForm) {
			this.props.detachFromForm(this);
		}
	}

	/**
	 * When the valid state of the component changes, hit any added validity handlers
	 * @param nextProps
	 * @param nextState
	 */
	shouldComponentUpdate(nextProps, nextState) {
		if (nextState.isValid != this.state.isValid) {
			const {onValid, onInvalid, onValidityChange} = this.props;

			this.state.isValid && onValid && onValid();
			this.state.isValid == false && onInvalid && onInvalid();

			onValidityChange && onValidityChange();
		}
		return true;
	}

	/**
	 * @param nextProps
	 */
	componentWillReceiveProps(nextProps) {
		if (nextProps.value && nextProps.value !== this.state.value) {
			this.setValue(nextProps.value);
		}
	}

	/**
	 * @returns {XML}
	 */
	render() {
		return null;
	}
}

export default FormElement;

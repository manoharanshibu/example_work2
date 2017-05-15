import {classNames as cx} from 'common/util/ReactUtil.js';
import FormElement from './FormElement';

class Input extends FormElement {

	static defaultProps = Object.assign(FormElement.defaultProps, {
		label: null,
		type: 'text',
		maxLength: 524288,
		icon: null,
		placeHolder: 'Input your details',
		errorMsg: 'There was a problem with your details',
		tooltip: null,
		blockLabel: false,
		globalStyle: {}
	});

	constructor(props) {
		super(props);
		this.state = Object.assign({
			isFocused: false
		}, this.state);
	}

	/**
	 * @param e
	 */
	onChange(e) {
		if (this.props.type === 'checkbox') {
			this.setValue(e.currentTarget.checked);
			this.props.validate(this);
		} else {
		this.setValue(e.currentTarget.value);
	}
	}

	/**
	 * Equivalent to onRender.
	 */
	componentDidMount() {
		if (!!this.props.focus) {
			this.refs.input.focus();
		}

		// Set checked value for checkboxes
		if (this.props.type === 'checkbox') {
			this.refs.input.checked = this.value();

			// revalidate if value is true..
			if (this.value()) {
				this.props.validate(this);
			}
		}
	}

	/**
	 * @returns {XML}Hi
	 */
	render() {
		const {isFocused, isValid} = this.state;
		const inputProps = this.inputProps();
		const classNames = this.classNames();
		const globalStyle = this.props.globalStyle;

		// eek! we should not have terms specific markup in a generic component
		return (
			<div className={classNames.main} style={globalStyle}>
				{this.props.label && (
					<div className={classNames.label}>
						<label>{this.props.label}</label>
					</div>
				)}

				<div className={classNames.inputWrapper} >
					<input id={this.props.id} className={cx('g-input-field', 'g-input-field--text', classNames.input)} {...inputProps}/>
					{this.props.terms && (
						<label htmlFor="check1">{this.props.termsText}</label>
					)}
					{!this.props.terms && (
					<i className={this.iconClass()}></i>
					)}
					<div className="error-box tooltip" style={{display: this.state.isValid ? 'none' : 'table'}}>
						<p>{this.state.errorMsg}</p>
					</div>
				</div>

				{this.props.tooltip && isFocused && isValid && (
					<div className="tooltip" style={{display: 'table'}}>
						<p>{this.props.tooltip}</p>
					</div>
				)}
			</div>
		);
	}

	/**
	 * @returns {{ref: string, value: *, type: *, placeholder: *, onChange: (function(this:Input)), onFocus: (function(this:Input)), onBlur: (function(this:Input))}}
	 */
	inputProps() {

		let autoCorrect = "off";

		let inputProps = {
			ref: 'input',
			value: this.value(),
			type: this.props.type,
			maxLength: this.props.maxLength,
			placeholder: this.props.placeHolder,
			onChange: this.onChange.bind(this),
			onFocus: this.onFocus.bind(this),
			onBlur: this.onBlur.bind(this),
			autoCapitalize: autoCorrect,
			autoCorrect: autoCorrect,
			autocomplete: 'nope',
			autoComplete: 'nope'
		};
		// if readOnly, remove the onChange handler
		if (this.props.readOnly) {
			delete inputProps.onChange;
			delete inputProps.onFocus;
			delete inputProps.onBlur;
		}
		// add disabled, if specified
		if (this.props.disabled) {
			inputProps.disabled = 'disabled';
		}
		return inputProps;
	}

	/**
	 *
	 */
	iconClass(){
		let icon = this.props.icon;
		if (this.state.validated && this.props.showValidateTick !== false) {
			icon = this.state.isValid ? 'icon-check valid' : 'icon-menu-close invalid';
		}

		return cx('input-icon', {[icon]: !!icon}, {'active': this.state.focused});
	}

	/**
	 * Returns the classNames for the render function
	 * @returns {{main, icon, inputWrapper, input}}
	 */
	classNames() {
		const {label, blockLabel} = this.props;
		return {
			main: cx('form-section', {'error': !this.state.isValid}),
			inputWrapper: cx('form-col', {'no-label-col' : !label, 'block-label-col': blockLabel }),
			input: cx({'no-label': blockLabel, 'with-icon-tooltip': this.props.tooltipHoverEl}),
			label: cx('label-col ', blockLabel ? 'block-label' : 'inline-label')
		};
	}
}

export default Input;

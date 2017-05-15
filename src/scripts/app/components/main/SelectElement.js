import Component from 'common/system/react/BackboneComponent.js'
import { classNames as cx } from 'common/util/ReactUtil.js'

export default class SelectElement extends Component {
	constructor(props) {
		super(props)

		this.state = {
			optionChosen: this.props.value !== 'none'
		}
	}

	/**
	 * Is component valid?
	 * @returns {boolean}
	 */
	valid() {
		return this.state.optionChosen
	}

	/**
	 * Validate the changed values
	 * @param e
	 */


	onChange(e) {
		var value = e.target.value,
			valid = value != 'none'
		this.setState({ optionChosen: value, inputValid: valid })
		this.update(value)
	}

	/**
	 * @returns {XML}
	 * ** note below allows for the default to be selected , but does not allow dynamic changing.
	 */
	render() {
		const { label, blockLabel } = this.props;


		var state, // assigned just before the return
			noLabel = this.props.label === '',
			widthClasses = cx(noLabel || label === 'Birthday' ? 'auto-width' : '', { 'block-label-col': blockLabel }),
			thisValue = this.state.optionChosen != false ? this.state.optionChosen : this.value(),
			errorMsg = this.props.errorMsg,
			hideError = this.props.hideError
			// if we have reloaded from server it is possible option chosen will be an old value,
		// therefore we need to take from the bound this.value(in this case they will not match - so we can refresh);
			if (this.state.optionChosen != false &&  this.state.optionChosen != this.value()) {
				thisValue = this.value()
			}
			if (!this.state.inputValid && this.props.required) {
				if (this.props.submitted) {// all errors must be shown on submission
					state = 'error'
				} else if (this.props.showError) {
					state = 'error'
				} else if (this.state.optionChosen) {
					state = 'error'
				}
			}

			let classes = cx('form-section ', this.props.className, state, { 'sml-margin': this.props.smlMargin })
			let style = { display: noLabel ? 'none' : '' }
		return (
			<div className={ classes + ' ' + widthClasses } style={{display: 'inline'}}>
				<div className={ cx('label-col', this.props.blockLabel ? 'block-label' : 'inline-label') } style={ style }>
					<label>{ this.props.label }</label>
				</div>
				<div className={ 'form-col ' + widthClasses } style={{display: 'inline'}}>
					<select ref="select" style={{height:30}} value={ thisValue } onChange={ this.onChange.bind(this) } disabled={ this.props.disabled }>
						{ this.props.children }
					</select>
				</div>
				{ state === 'error' && !hideError && errorMsg.length > 2 && (
					<div className="error-box tooltip" style={ { display: 'table' } }>
						<p>{ this.props.errorMsg }</p>
					</div>
				) }
			</div>
		)
	}
}

SelectElement.propTypes = {
	label: React.PropTypes.string,
	optionChosen: React.PropTypes.bool,
	value: React.PropTypes.string,
	required: React.PropTypes.bool,
	disabled: React.PropTypes.bool,
	errorMsg: React.PropTypes.string,
	hideError: React.PropTypes.bool
}

SelectElement.defaultProps = {
	label: '',
	optionChosen: false,
	value: 'none',
	required: true,
	disabled: false,
	errorMsg: 'Please select an option',
	hideError: true
}

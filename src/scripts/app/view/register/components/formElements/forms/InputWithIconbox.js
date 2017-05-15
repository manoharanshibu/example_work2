import { classNames as cx } from 'common/util/ReactUtil.js'
import Input from './Input';
import * as regex from 'common/util/RegEx'

class InputWithIconbox extends Input {
	onTooltipHover(e) {
		const hoverState = this.state.tooltipHoverEl
		this.setState({ tooltipHoverEl: !hoverState })
	}

	onKeyPress(e) {
		if (this.props.numbersOnly) {
			const keyCode = e.which || e.keyCode
			//only allow numerical keys
			const isBlockedKey = (keyCode > 31 && ((keyCode < 48 || keyCode > 57)))
			if (isBlockedKey ) e.preventDefault()
		}
	}

	onTouch(e) {
		// prevent click emulation on touch devices
		e.preventDefault()
		// toggle the tooltip
		this.onTooltipHover()
	}

	onNavigate(route) {
		// todo: this is a workaround: we should tackle the underlying problem.
		// We need to ensure that any ClickOutside event has been processed
		// before we attempt to navigate to a new route.
		// Otherwise, a race condition closes the PEA before visiting th rout
		window.setTimeout(() => {
			App.navigate(route)
		}, 0)
	}

	isValidField() {
		return this.state.validated && this.state.isValid
	}

	render() {
		const inputProps = this.inputProps()
		const classNames = this.classNames()
		const isValidField = this.isValidField()
		const labelClass = cx('label-col', { 'block-label': this.props.blockLabel })
		const formClass = cx('form-col', { 'no-label-col': !this.props.label, 'block-label-col': this.props.blockLabel })

		// IMPORTANT: the form row height needs to always remain the same
		// 			  otherwise we loose the click event when clicking submit
		// 			  as the button moves out from under the cursor
		return (
			<div className={ classNames.main }>
				{ this.props.label && (
					<div className={ labelClass } style={ { display: 'inline-block' } }>
						<label>{ this.props.label }</label>
					</div>
				) }
				<div className={ formClass }>
					<input className={cx('g-input-field', 'g-input-field--text', classNames.input)} {...inputProps} onKeyPress={::this.onKeyPress} style={{width: isValidField ? '' : '' }}/>
					{ this.renderIconbox() }
					{ this.renderErrorboxTooltip() }
					{ this.renderValidationMark() }
					{ this.renderTooltip() }
				</div>
			</div>
		)
	}

	isMobile() {
		const viewportWidth = document.documentElement.clientWidth
		return (viewportWidth <= 960)
	}

	renderIconbox() {
		const isValidField = this.isValidField()
		const tooltipIconDisplayStyle = isValidField ? 'hidden' : 'visible'
		const tooltipIconClass = cx('tooltip-hover-el', { active: this.state.tooltipHoverEl || this.props.showPasswordTooltip })
		return this.isMobile() ? (
			<a data-ignore="true" className={ tooltipIconClass }
			   onClick={ ::this.onTouch }
			>
				<i className={ this.iconClass() } style={ { visibility: tooltipIconDisplayStyle } }></i>
			</a>
		) : (
			<a data-ignore="true" className={ tooltipIconClass }
			   onClick={ this.onNavigate.bind(this, this.props.tooltipLink) }
			   onMouseOver={ this.onTooltipHover.bind(this, 1) }
			   onMouseOut={ this.onTooltipHover.bind(this, -1) }
			>
				<i className={ this.iconClass() } style={ { visibility: tooltipIconDisplayStyle } }></i>
			</a>
		)
	}

	setManualError(err) {
		this.setState({ errorMsg: err, isValid: false })
	}

	renderErrorboxTooltip() {
		if (!this.props.showErrorboxTooltip) {
			return null
		}

		return (
			<div className="error-box" style={{visibility: this.state.isValid ? 'hidden' : 'visible', height: this.state.isValid ? '0px' : 'auto'}}>
				<p>{ this.state.errorMsg }</p>
			</div>
		)
	}

	handlePasswordClass () {
		if (this.props.showPasswordTooltip) {
			this.setState({ tooltipHoverEl: true })
		} else {
			this.setState({ tooltipHoverEl: false })
		}
	}


	renderTooltip() {
		const hasError = !this.state.isValid
		let tooltip = this.props.tooltip
		const hasTooltipHoverEl = this.props.tooltipHoverEl
		let showTooltip
		let tooltipDisplayStyle
		let tooltipStyle

		if (!tooltip) {
			return null
		}

		if (hasTooltipHoverEl) {
			tooltipDisplayStyle = this.state.tooltipHoverEl || this.props.showPasswordTooltip ? 'block' : 'none'
		} else {
			showTooltip = (this.state.focused && !hasError)
			tooltipDisplayStyle = showTooltip ? 'block' : 'none'
		}
		// tooltipDisplayStyle = 'block'; // For testing

		tooltipStyle = { display: tooltipDisplayStyle }
		let tooltipClass = cx('tooltip', 'on-icon-hover', { 'with-mobile-close': this.props.tooltipMobileCloseBtn })

		// This allows for a better user experience by preventing jumps on
		// vertical layouts, as the input boxes are kept in the same position
		// while focusing in and out
		if (this.props.tooltipLeavesEmptySpace) {
			tooltipStyle = {
				display: 'table',
			}
			if (!showTooltip) {
				tooltipStyle.opacity = 0
			}
		}

		const { tooltipMobileNavigate, tooltipLink, tooltipCheck1, tooltipCheck2,
			tooltipCheck3, tooltipMobileCloseBtn, isPassword } = this.props
		const  value  = this.props.valueLink ? this.props.valueLink.value : this.props.value

		return (
			<div className={ tooltipClass } style={ tooltipStyle } data-ignore="true">
				{ !tooltipMobileNavigate && (
					<div>{ tooltip }</div>
				) }
				{ (tooltipMobileNavigate && !isPassword) && (
					<a className="navigate" onClick={ this.onNavigate.bind(this, tooltipLink) }>
						<div>{ tooltip }</div>
					</a>
				) }
				{ (tooltipMobileNavigate && isPassword) && (
					<div className="password-tooltip navigate">
						<div>{ tooltip }</div>
						{ tooltipCheck1 && this.renderCheckIt(value.length > 7, tooltipCheck1) }
						{ tooltipCheck2 && this.renderCheckIt(regex.alphas.test(value), tooltipCheck2) }
						{ tooltipCheck3 && this.renderCheckIt(regex.hasDigits.test(value), tooltipCheck3) }
					</div>
				) }
				{ tooltipMobileCloseBtn && (
					<a className="close-btn tablet-show"
  onClick={ this.onTooltipHover.bind(this) }
     ><i className="icon-menu-close"></i></a>
				) }
			</div>
		)
	}

	renderCheckIt (boolean, content) {
		const clazz = boolean ? 'icon-check active' : 'icon-check';
		return (
			<div className="check-it">
				<i className={clazz}></i>
				{content}
			</div>
		)
	}

	renderValidationMark() {
		let icon

		if (!this.state.isValid) {
			return null
		}

		if (this.state.validated) {
			icon = 'icon-check valid'
		}

		const validationClass = `input-icon avoid-tooltip-icon ${icon} ${(this.state.focused ? 'active' : '')}`

		return (
			<i className={ validationClass }
  style={ { visibility: icon ? 'visible' : 'hidden' } }
   ></i>
		)
	}

	iconClass() {
		const icon = this.props.icon

		return cx({ [icon]: !!icon }, { active: this.state.focused })
	}

}

export default InputWithIconbox

import React, { PropTypes } from 'react'
import validator from 'validator'
import { classNames as cx } from 'common/util/ReactUtil'
//import './Form.scss';

class Form extends React.Component {
	defaultProps = {
		submitButton: 'Submit',
		defaultButton: false
	};

	constructor(props) {
		super(props)
		this.model  = {}
		this.inputs = {}
		this.validated = false
		this.state  = {
			isFormValid: false,
			childProps: {
				attachToForm: 	this.attachToForm.bind(this),
				detachFromForm: this.detachFromForm.bind(this),
				validate: 		this.validate.bind(this)
			}
		}
	}

	/**
	 *
	 */
	componentWillMount() {
		this.validated = false
		if (this.props.validateOnMount) {
			this.setState({ isFormValid: false })
			this.validateForm()
		}
	}

	/**
	 * @param e
	 */
	onSubmit(e) {
		e.preventDefault()
		const isValid = this.validateForm(true)
		const onSubmit = this.props.onSubmit
		// if valid hit 'onSubmit' prop if exists.
		if (isValid) {
			onSubmit && onSubmit(this.model)
		}
	}

	/**
	 */
	componentWillunmount() {
		this.validated = false
	}

	/**
	 * used for when a form has external validation on server, we need to set the form state to invalid (for button colours etc)
	 * @param valid
     */
	setValidState(valid) {
		this.setState({ isFormValid: valid })
	}

	/**
	 * Clones a component with the necessary props from the form.
	 * Also recursively clone's the component's children.
	 * @param component
	 * @param childProps
	 * @returns {*}
	 */
	cloneChildren(component, childProps, index = '0') {
		const children = [].concat(component.props.children)
		const { validateOnMount, validateOnChange, validateOnBlur, validateOnFocus } = this.props
		return children.map((child, i) => {
			// if the child doesn't have a type, usually means that it's
			// the bottom line child, and is a non-component such as text
			if (!child.type) return child

			const key   = `${index}:${i}`
			let props = _.extend({}, child.props, { key })

			if (child && child.props) {
				// if it has children, we need to traverse it's child hierarchy
				// to find any nested elements that should be added to Form
				if (child.props.children) {
					props.children = this.cloneChildren(child, childProps, key)
				}
				// if is a named element, augment props with those necessary for Form control
				if (child.props.name) {
					const passThrough = { validateOnMount, validateOnChange, validateOnBlur, validateOnFocus }
					props = Object.assign({}, props, childProps, passThrough)
				}
			}
			return React.cloneElement(child, props)
		}, this)
	}

	/**
	 * Components can specify 2 forms of 'rules' prop on any component.  A comma delimited string of
	 * validation patterns or an array of validation objects.
	 *
	 * 1. Comma delimited string.
	 * This form validation uses npm:validator under the hood.  @see https://github.com/chriso/validator.js.
	 * Any of the validators can be used to validate our component. For example if you look down the list,
	 * you'll see 'isLength' validator. It has the syntax 'isLength(str, min [, max])'.  To use this we'd
	 * construct a validation string as such: 'isLength:3:10'.  These can be delimited ie. 'isLength:6,isAlpha'
	 * which would validate that the input is a minimum of 6 characters, and that the characters are numeric.
	 *
	 * 	<Input rules="isLength:6,isAlpha"/>
	 *
	 * 2. Object literal syntax.
	 * If you provide an array of validation objects, each object must use the colon delimted syntax above as
	 * the key, and an error message if that validator fails as the value. ie:
	 *
	 * var validators = [
	 * 	{"isLength:4": "Minimum of 4 characters"},
	 * 	{"isAlphanumeric": "Only letters or number please"}
	 * ]
	 *
	 * <Input rules={validators}/>
	 *
	 * @param component
	 */
	validate(component, revalidate = true) {
		let isValid = true // initial state
		// only validate if it has a value, or if it doesn't
		// have a value but is required to have a value
		const hasValue = !_.isEmpty(component.state.value)
		const hadValue = !_.isEmpty(component.state.previous)
		const isRequired = component.props.required

		if (hasValue || !hasValue && isRequired || hadValue) {
			let { rules } = component.props
			// ensure a simple rules exists
			rules = rules || 'isLength:1'
			rules = [].concat(rules)

			// if validation not necessary, empty out the rules so
			// that it isn't performed and the component is set 'valid'
			if (!hasValue && hadValue && !isRequired) {
				rules = []
			}

			const errors = _.reduce(rules, (memo, rule) => {
				const { method, scope, args, error } = this.parseRule(rule)
				const valid = method.apply(scope, [component.value()].concat(args))
				// if not valid add the error
				if (!valid) {
					memo.push(error)
				}
				return memo
			}, [], this)

			const error = errors.length ? _.first(errors) : null
			const state = { isValid: isValid = !errors.length, validated: true, errorMsg: error }
			// set the component state
			component.setState(state, () => {
				if (revalidate) this.validateForm()
			})
		}
		this.validated = true
		return isValid
	}


	/*

	1. Simple string
	----------------

	"isLength:1"
	"isLength:1,isNumeric"

	2. Implicit object
	------------------

	Key should be the simple validation string as above, and value an error message should validation fail

	{"isLength:5": "The value is too short.  Minimum 5 characters"}
	{"isLength:1,isNumeric": "The value is too short.  Minimum 5 characters and only numbers"}

	3. Explicit object
	------------------

	An explicit object needs a 'rule' at minimum (string|function),
	optional 'args' (array) and an optional 'error' (string), ie.

	{"rule": "isLength:5", error: "The value is too short.  Minimum 5 characters"}
	{"rule": validationFunction, error: "The function does not return true"}

	 */
	parseRule(obj) {
		let args
		let func
		const parseSimple = (sim, msg = null) => {
			args = sim.split(':')
			func = args.shift()
			args = _.map(args, arg => {
				const num = Number(arg)
				return _.isNaN(num) ? arg : num
			})
			return { method: validator[func], scope: validator, args, error: msg }
		}
		// simple string valildation rule
		if (_.isString(obj)) {
			return parseSimple(obj)
		}
		// is an implicit object
		if (_.isObject(obj) && !_.has(obj, 'rule')) {
			return parseSimple(_.keys(obj)[0], _.values(obj)[0])
		}
		// explicit object
		if (_.has(obj, 'rule')) {
			if (_.isFunction(obj.rule)) {
				const err = _.isFunction(obj.error) ? obj.error() : obj.error
				return { method: obj.rule, scope: null, args: obj.args, error: err }
			}
			return parseSimple(obj.rule, obj.error)
		}
		return {}
	}

	/**
	 * Set the valid state of the form based on number of fails
	 * @returns {boolean}
	 */
	validateForm(force = false) {
		const fails = _.reject(this.inputs, (input, name) => {
			let isValid
			// if the component hasn't yet been validated and it requires validation,
			// it should be considered invalid.  We do this here, rather than on the
			// component, so we don't display error states initially
			if (!input.state.validated && input.props.required) {
				isValid = false
			}
			else if (input.state.validated && !input.props.required && _.isEmpty(input.state.value)) {
				isValid = true
			}
			else {
				isValid = !!input.state.isValid
			}

			// force validate the component
			if (force) {
				isValid = this.validate(input, false)
			}

			this.model[name] = {
				value: input.value(),
				valid: isValid,
				name
			}

			return isValid
		})
		// set the form state and fire external change handlers
		const isValid = !fails.length
		this.setState({ isFormValid: isValid }, () => {
			this.updateValidity()
		})
		return isValid
	}

	/**
	 * Invokes any onValid and onInvalid props that may have been added on the parent.
	 */
	updateValidity() {
		const isValid = this.state.isFormValid
		const handler = isValid ? 'onValid' : 'onInvalid'
		// invoke handler with model data if exists
		const func = this.props[handler]
		func && func([this.model])
	}

	/**
	 * Attaches the specified component to the form when mounted
	 * @param component
	 */
	attachToForm(component) {
		this.inputs[component.props.name] = component
		this.model[component.props.name] = {
			value: component.state.value
		}

		// validate component if it has a value already
		if (!_.isEmpty(component.state.value)) {
			const isValid = this.validate(component)
			component.setState({ isValid })
		}
	}

	/**
	 * Unattaches the specified component from the form when unmounted
	 * @param component
	 */
	detachFromForm(component) {
		delete this.inputs[component.props.name]
		delete this.model[component.props.name]
	}

	/**
	 * @returns {XML}
	 */
	render() {
		const children = this.cloneChildren(this, this.state.childProps)
		const classNames = cx(this.state.isFormValid ? 'valid' : 'invalid', this.props.className)
		return (
			<form onSubmit={ this.onSubmit.bind(this) } className={ classNames }>
				{ children }
			</form>
		)
	}
}

Form.propTypes = {
	className: PropTypes.string,
	onSubmit: PropTypes.func,
	validateOnMount: PropTypes.bool,
	validateOnChange: PropTypes.bool,
	validateOnBlur: PropTypes.bool,
	validateOnFocus: PropTypes.bool
}

Form.defaultProps = {
	submitButton: 'Submit',
	validateOnMount: false,
	validateOnChange: false,
	validateOnFocus: false,
	validateOnBlur: true,
	defaultButton: false
}

export default Form

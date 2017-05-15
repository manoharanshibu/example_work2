import { classNames as cx} from 'common/util/ReactUtil';

export default class TextAreaWithCounter extends React.Component {

    constructor(props) {
        super(props)
        _.bindAll(this, 'onChange')

        this.state = {
            value: this.props.initialValue
        }
    }

    componentWillReceiveProps(props) {
        if (this.props.initialValue !== props.initialValue) {
            this.setState({ value: props.initialValue });
        }
    }

    onChange(event) {
        const value = event.target.value
        this.setState({ value: value })
    }

    createCounterClasses(length) {
        return cx({
            'o-counter': true,
            'u-warning': (length >= this.props.warningLength && length <= this.props.dangerLength),
            'u-danger': length >= this.props.dangerLength
        })
    }

    render() {
        const { value } = this.state
        const { className, textareaClassName } = this.props
        const counterClasses = this.createCounterClasses(value.length)

        return (
            <div className={`inline-form-elements ${className}`}>
                <div>
                    <label>{this.props.label}</label>
                </div>
                <textarea
                    className={textareaClassName}
                    onChange={this.onChange}
                    onBlur={this.props.onUpdate}
                    value={value}
                />
                <div className={ counterClasses }>
                    {this.props.dangerLength - value.length}
                </div>
            </div>
        )

    }
}

TextAreaWithCounter.propTypes = {
    className: React.PropTypes.string,
    textareaClassName: React.PropTypes.string,
    initialValue: React.PropTypes.string,
    label: React.PropTypes.string,
    onUpdate: React.PropTypes.func.isRequired,
    warningLength: React.PropTypes.number,
    dangerLength: React.PropTypes.number.isRequired,
}

TextAreaWithCounter.defaultProps = {
    initialValue: '',
    className: '',
    textareaClassName: '',
    warningLength: Infinity,
}

import React, { PropTypes } from 'react';
import Component from 'common/system/react/BackboneComponent.js';
import SelectElement from 'app/components/main/SelectElement.js';
import moment from 'moment';
import './RegisterView.scss'

export default class SelectDOB extends Component {
    constructor(props) {
        super(props)
        this.validDOB = true;
    }

    valid() {
        return this.validDOB
    }

    renderDobDD() {
        const rows = []
        for (let i = 1; i < 32; i++) {
            rows.push(<option key={ i } value={ i }>{ i }</option >)
        }
        return rows
    }

    renderDobMM(month, idx) {
        return (
            <option key={ idx } value={ idx }>{ month }</option>
        )
    }

    renderDobYY() {
        const rows = []
        let currentYear = moment().subtract(this.props.model.get('minimumBettingAge'), 'years').get('year')
        for (let i = 0; i < 100; i++) {
            rows.push(<option key={ i } value={ currentYear }>{ currentYear }</option>)
            currentYear = currentYear - 1
        }
        return rows
    }

    render() {
        const legalMinDob = moment().subtract(this.props.model.get('minimumBettingAge'), 'years').format('YYYY-MM-DD')
        // now get  dob fields.
        const legal2 = new Date(legalMinDob)
        legal2.setHours(0)
        const dob2 = new Date(this.props.model.get('dobYY'), this.props.model.get('dobMM'), this.props.model.get('dobDD'))
		const validate = this.props.validate || true;
        this.validDOB = !validate || (dob2.valueOf() <= legal2.valueOf())
        let days = this.renderDobDD()
        let DOBErrorClass = (this.validDOB) ? 'form-section birthday' : 'form-section birthday error'
        return (
			<div>
            <div className="DOBErrorClass" style={{display: 'inline'}}>
				<table>
					<tr><td width="205"><label>Birthday</label></td>
						<td><SelectElement ref="dobDD" label="" valueLink={ this.bindTo(this.props.model, 'dobDD') }>
						{ days }
					</SelectElement>&nbsp;</td><td> <SelectElement ref="dobMM" label="" valueLink={ this.bindTo(this.props.model, 'dobMM') }>
						{ _.map(moment.months(), this.renderDobMM) }
					</SelectElement>&nbsp;</td><td> <SelectElement ref="dobYY" label="" valueLink={ this.bindTo(this.props.model, 'dobYY') } className="last">
						{ this.renderDobYY() }
					</SelectElement>&nbsp;</td></tr>
				</table>                <div className="error-box tooltip" style={ { display: ((this.validDOB) ? 'none' : 'block') } }>
                    <p ref="dobError">You need to be {this.props.model.get('minimumBettingAge')} years or over to register on the Bet on Brazil sportsbook.}</p>
                </div>
            </div></div>
        )
    }
}

SelectDOB.propTypes = {
    model: PropTypes.instanceOf(Backbone.Model)
}

SelectDOB.defaultProps = {
    type: 'text',
    validationOnExit: true,
    submitted: false,
    icon: '',
    required: true
}

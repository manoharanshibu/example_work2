import Component from 'common/system/react/BackboneComponent';
import CheckBox from 'backoffice/components/elements/CheckBox';
import settings from 'backoffice/model/SportsbookSettingsModel';


export default class ProductVisibilityView extends Component {
	constructor(props) {
		super(props);
		this.state = {changed: !!settings.changed};
	}

	/**
	 * @returns {XML}
	 */
	render() {
		return (
			<div className="inline-form-elements">
				<div className="section-title"><strong>Product visibility</strong></div>
				{this.renderVisibilityOptions()}
			</div>
		);
	}

	/**
	 * @returns {*}
	 */
	renderVisibilityOptions() {
		var visibility = settings.productVisibility;
		return _.map(visibility.options(), function(option, index)  {
			return <CheckBox key={index} label={_.titleize(option.name)} valueLink={this.bindTo(settings.productVisibility, option.name)}/>;
		}, this);
	}
};









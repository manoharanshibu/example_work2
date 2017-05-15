import UnauthorizedMessage from 'app/view/UnauthorizedMessage';
import Tabs from 'backoffice/components/tabs/Tabs';
import Tab from 'backoffice/components/tabs/Tab';
import SelectionsTypesTab from './SelectionsTypesTab';
import SelectionsTranslationsTab from './SelectionsTranslationsTab';
import SelectionsCsvTab from './SelectionsCsvTab';
import translationsModel from 'backoffice/model/SelectionsTranslationsModel';

export default class SelectionsTranslationsView extends React.Component{
	constructor(props) {
		super(props);
		this.canAccess = App.session.request('canCmsSportMatrix');
	}

	componentDidMount() {
		translationsModel.loadSelections();
	}

	render() {
		if(!this.canAccess) {
			return <UnauthorizedMessage/>
		}

		return (
			<Tabs>
				<Tab id="types" title="Types">
					<SelectionsTypesTab selections={this.props.selections}/>
				</Tab>

				<Tab id="translations" title="Translations">
					<SelectionsTranslationsTab selections={this.props.selections} selectionVariants={this.props.selectionVariants}/>
				</Tab>

				<Tab id="csv" title="CSV">
					<SelectionsCsvTab/>
				</Tab>
			</Tabs>
		)
	}
};

SelectionsTranslationsView.defaultProps = {
	selections: translationsModel.selections,
	selectionVariants: translationsModel.selectionVariants
};

SelectionsTranslationsView.displayname = "SelectionsTranslations";

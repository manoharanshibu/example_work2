import UnauthorizedMessage from 'app/view/UnauthorizedMessage';
import Tabs from 'backoffice/components/tabs/Tabs';
import Tab from 'backoffice/components/tabs/Tab';
import MarketsTypesTab from './MarketsTypesTab';
import MarketsTranslationsTab from './MarketsTranslationsTab';
import MarketsCsvTab from './MarketsCsvTab';
import translationsModel from 'backoffice/model/MarketsTranslationsModel';

export default class MarketsTranslationsView extends React.Component {
	constructor(props) {
		super(props);
		this.canAccess = App.session.request('canCmsSportMatrix');
	}

	componentDidMount() {
		translationsModel.loadMarkets();
	}

	render(){
		if (!this.canAccess){
			return <UnauthorizedMessage />;
		}
		return (
			<Tabs>
				<Tab id="types" title="Types">
					<MarketsTypesTab markets={this.props.markets}/>
				</Tab>
				<Tab id="translations" title="Translations">
					<MarketsTranslationsTab  markets={this.props.markets} marketVariants={this.props.marketVariants}/>
				</Tab>
				<Tab id="csv" title="CSV">
					<MarketsCsvTab/>
				</Tab>
			</Tabs>
		)
	}

}

MarketsTranslationsView.defaultProps = {
	markets: translationsModel.markets,
	marketVariants: translationsModel.marketVariants
};

MarketsTranslationsView.displayName = 'MarketsTranslations';

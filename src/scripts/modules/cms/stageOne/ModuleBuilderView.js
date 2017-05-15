import LayoutView from 'cms/stageOne/LayoutView';
import AvailableModulesView from 'cms/stageOne/AvailableModulesView.js';
import * as helper from 'backofficeCms/utils/LayoutHelper';
import ComboBox from 'backoffice/components/elements/ComboBox';
import Model from 'backofficeCms/model/LayoutModel';

export default class ModuleBuilder extends React.Component {
    constructor(props) {
        super(props);

        const languages = ['default'].concat(_.keys(App.Config.locales))
        const id = this.props.routeParams.id;
        const model = new Model({ id });
        model.on('all', () => {
            this.setState({ layoutType: model.getLayoutType() });
        });
        this.state = {
            language: _.first(languages),
            languages: languages,
            layoutTypes: ['Regular', 'Full Page'],
            layoutType: model.getLayoutType(),
            rowWidth: 3,
            model: model
        };


    }

    goBack() {
        App.navigate('/cms/modules/');
    }

    setLayoutType(layoutType) {
        this.state.model.setLayoutType(layoutType);
        this.setState({ layoutType });
    }

    setLanguage(language) {
        this.setState({ language });
    }

    setRowWidth(rowWidth) {
        this.setState({ rowWidth });
    }

    render() {
        const id = this.props.routeParams.id;
        const sectionHeading = id.split(helper.CMS_DIVIDER).join(' / ');

		//TODO: Checking the permissions on every render, might not be ideal
		//but as a quick fix, it ensures they are reevaluated if the user has
		//logged out and logged in with different user
		const allowed = App.session.request('canCmsPageBuilder');

		if (!allowed){
			return <div><p><strong>YOU ARE NOT AUTHORIZED TO USE THIS FUNCTION.</strong></p></div>;
		}

        return (
            <div>
                <div className='module-layout-grid'>
                    <div className="page-selectors fixed">
                        <h1 className="heading">
                            <a onClick={::this.goBack} className="btn filled"><i className="fa fa-chevron-left"></i>Back</a>
                            {sectionHeading}
                            <ComboBox outerClassName='language-dropdown' labelStyle={{}} value={this.state.language} label="Language" onChange={::this.setLanguage}>
                                {_.map(this.state.languages, (lang, i) => (
                                    <option key={i}>{lang}</option>
                                ))}
                            </ComboBox>
                            <ComboBox outerClassName='layout-type-dropdown' labelStyle={{}} value={this.state.layoutType} label="Layout Type" onChange={::this.setLayoutType}>
                                {_.map(this.state.layoutTypes, (type, i) => (
                                    <option key={i}>{type}</option>
                                ))}
                            </ComboBox>
                        </h1>
                    </div>
                    <LayoutView
                        model={this.state.model}
                        layoutType={this.state.layoutType}
                        setRowWidth={::this.setRowWidth}
                        language={this.state.language}
                        close={::this.goBack} />
                </div>
                <AvailableModulesView
                    rowWidth={this.state.rowWidth}/>
            </div>
        );
    }
}

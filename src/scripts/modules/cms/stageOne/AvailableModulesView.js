import AvailableModulesCollection from 'backofficeCms/model/AvailableModulesCollection';

export default class AvailableModulesView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            modules: AvailableModulesCollection.models,
            draggingId: null
        };
        //AvailableModulesCollection.fetch();

        AvailableModulesCollection.on('all', () => {
            this.setState({ modules: AvailableModulesCollection.models });
        });
    }

    onDragStart(model, e) {
        this.setState({
            draggingId: e.currentTarget.id
        });
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('custom_container_type', JSON.stringify(model));

        // cannot use getData on drag enter event, so setting type
        // to json string as workaround
        e.dataTransfer.setData(JSON.stringify(model), '');
    }

    onDragEnd(model, e) {
        this.setState({
            draggingId: null
        });
    }

    getModules() {
        let draggingEl = this.state.draggingId;
        const mods = _.filter(this.state.modules, (model) => {
            return _.min(model.getRange()) <= this.props.rowWidth;
        });
        return _.map(mods, (model, i) => {
            let draggingClass = draggingEl === i ? 'active' : '';
            let schema = model.get('schema');
            let title = (schema) ? schema.title : 'Unknown';

            return (
                <li className={draggingClass} key={i} id={i} draggable="true"
                    onDragEnd={this.onDragEnd.bind(this, model)}
                    onDragStart={this.onDragStart.bind(this, model)}>
                    <span>{title}</span>
                    { schema.description && ( <p>{schema.description}</p> )}
                </li>
            );
        });
    }

    render() {
        return (
            <div>
                <div className="moduleNav">
                    <h5>Available Modules </h5>
                    <div className="padding">
                        <ul>
                            {this.getModules()}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

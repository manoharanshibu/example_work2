import { classNames } from "common/util/ReactUtil";
import get from 'common/util/get';

export default class ElementContainerView extends React.Component {
    constructor(props) {
        super(props);
    }

    onDropped(e) {
        e.preventDefault();
        let data = e.dataTransfer.getData('custom_container_type');

        try {
            data = JSON.parse(data)
        } catch (err) {
            return console.log('Error parsing JSON.', err.message);
        }
        if (_.isNumber(data.row) && _.isNumber(data.index)) {
            this.props.moveElement(data);
        } else {
            this.props.createElement(data);
        }
        this.props.clearOver();
    }

    onDragOver(e) {
        e.preventDefault();
    }

    onDragEnter(e) {
        e.preventDefault();
        let data = e.dataTransfer.types;
        try {
            data = JSON.parse(data[1])
        } catch (err) {
            console.error(err);
        }
        if (_.isNumber(data.row) && _.isNumber(data.index)) {
            const onRow = (data.row === this.props.row);
            const defaultTilespan = onRow ? 1 : 0;
            const availableTilespans = onRow ? [1] : [];
            this.props.setOver(defaultTilespan, availableTilespans);
        } else {
            const defaultTilespan = get(data, 'schema.properties.defaults.properties.tilespan.default');
            const availableTilespans = get(data, 'schema.properties.defaults.properties.tilespan.enum');
            this.props.setOver(defaultTilespan, availableTilespans);
        }
    }

    onDragLeave(e) {
        e.preventDefault();
        this.props.clearOver();
    }

    render() {
        let layoutType = this.props.layoutType === 'Regular' ? 'regular' : 'full';
        return (
            <div className={classNames('cell', `layout-style-${layoutType}`, `span-${this.props.span}`, { 'drop-zone': this.props.isOver })}
                onDragEnter={::this.onDragEnter}
                onDragLeave={::this.onDragLeave}
                onDragOver={::this.onDragOver}
                onDrop={::this.onDropped}>

                {this.props.children}
            </div>
        )
    }
}

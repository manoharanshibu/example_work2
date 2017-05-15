import collection from 'backofficeCms/model/AvailableModulesCollection';
import Form from 'react-json-editor';
import validate from 'plexus-validate';
import { classNames } from 'common/util/ReactUtil';
import PromoSelector from 'backoffice/components/PromotionSelector';
import BuilderPathSelector from 'backoffice/components/BuilderPathSelector';
import BuilderMultiplePathSelector from 'backoffice/components/BuilderMultiplePathSelector';
import BuilderPodcastSelector from 'backoffice/components/BuilderPodcastSelector';
import BuilderCasinoPopup from 'backoffice/components/BuilderCasinoPopup';
import BuilderWithAgainstSelector from 'backoffice/components/BuilderWithAgainstSelector';
import BuilderSelectionSelector from 'backoffice/components/BuilderSelectionSelector';
import MarkdownEditor from 'backoffice/components/MarkdownEditor';
import CarouselSelector from 'backoffice/components/CarouselSelector';
import PromotionRowSelector from 'backoffice/components/PromotionRowSelector';
import GameSelector from 'backoffice/components/GameSelector';

import get from 'common/util/get';

export default class ElementView extends React.Component {
    constructor(props)  {
        super(props);
        this.state = {
            isDragging: false,
            flipped:false
        };
    }

    getDeleteButton() {
        const { row, col, index } = this.props;
        let action = () => this.props.model.removeElement({ row, col, index });
        return <a className='removeBtn' type='submit' onClick={action}><i className="fa fa-close"></i></a>;
    }

    getPreviewButton(el) {
        return <a className='previewBtn' onClick={this.onPreviewMode.bind(this, el)}><i className="fa fa-eye"></i></a>;
    }

    getDetailsButton(el) {
        return <a className='detailsBtn' onClick={this.onPreviewMode.bind(this, el)}><i className="fa fa-cog"></i></a>;
    }

    onPreviewMode(el, e) {
        e.preventDefault();
        let isflipped = this.state.flipped;
        this.setState({
            flipped: !isflipped
        });
    }

    onDragStart(e) {
        if (!this.state.draggable) {
            return e.preventDefault();
        }
        let { col, row, index } = this.props;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('custom_container_type', JSON.stringify({ col, row, index }));

        // cannot use getData on drag enter event, so setting type
        // to json string as workaround
        e.dataTransfer.setData(JSON.stringify({ col, row, index }), '');
        this.setState({
            isDragging: true
        });
    }

    onDragEnd() {
        this.setState({
            isDragging: false
        });
    }

    getLayoutPreview(module) {
        const modName = module.settings.component;
        let preview = null;
        if (/MarkdownWidget/.test(modName) || /HelloSodaWidget/.test(modName)) {
            const html = get(module, [ 'data', 'markdown', 1 ]);
            preview = (
                <div className='markdown-preview' dangerouslySetInnerHTML={{ __html: html}} />
            );
        }
        return preview;
    }

    setValue(update/*, buttonVals, errors */) {
        let { col, row, index, language } = this.props;
        this.props.model.updateElementProps({ col, row, index, update, language });
    }

	/**
	 *
	 */
	componentWillMount() {
		collection.on('all', () => {
			this.forceUpdate();
		});
	}

	/**
	 *
	 */
	componentWillUnmount() {
		collection.off();
	}

        removeImpossibleSpans(schema, max) {
            // deep clone
            schema = JSON.parse(JSON.stringify(schema));

            const walk = (props, actor) => {
                _.each(props, (val, key) => {
                    if (_.isObject(val)) {
                        actor(val, key);
                        walk(val, actor);
                    }
                })
            }

            walk(schema, (val, key) => {
                if (key === 'tilespan' && val.enum) {
                   val.enum = _.filter(val.enum, (n) => n <= max);
                }
            })

            return schema;
        }

        isPreviewable(modName) {
            return /MarkdownWidget/.test(modName) || /HelloSodaWidget/.test(modName);
        }

        setDragable() {
            this.setState({draggable: true})
        }
        unsetDragable() {
            this.setState({draggable: false})
        }

	/**
	 * @returns {*}
     */
    render() {
        const module = this.props.module.translate(this.props.language);
        if (_.isEmpty(module)) return null;
        const { title, component } = module.settings;
        const model = collection.get(component);

		const customControls = {
			builderPathSelector: BuilderPathSelector,
			builderMultiplePathSelector: BuilderMultiplePathSelector,
			builderPodcastSelector: BuilderPodcastSelector,
			builderCasinoPopup: BuilderCasinoPopup,
			builderWithAgainstSelector: BuilderWithAgainstSelector,
			promoSelector: PromoSelector,
			carouselSelector: CarouselSelector,
			promotionRowSelector: PromotionRowSelector,
			markdown: MarkdownEditor,
			gameSelector: GameSelector,
			builderSelectionSelector: BuilderSelectionSelector
		};

        if (!model) return null;

        let schema = model.get('schema');
        schema = this.removeImpossibleSpans(schema, this.props.rowWidth);

        const { description } = schema;

        return (
            <div className={classNames({ 'drop-zone': this.props.isOver })}
                draggable="true"
                onDragStart={::this.onDragStart}
                onDragEnd={::this.onDragEnd}>
                <div className={classNames('flipper', { flipped: this.state.flipped })}>
                    <div className='front' style={{ visibility: this.state.flipped ?'hidden' : 'visible' }}>
                        <div className='drag-handle'
                            onMouseDown={::this.setDragable}
                            onMouseUp={::this.unsetDragable} >
                            <h3>{schema.title} {this.getDeleteButton()} {this.isPreviewable(component) && this.getPreviewButton()}</h3>
                        </div>
                        <div className="table no-border-bottom cms-tile">
                            <Form buttons={[]}
								handlers={customControls}
                                  validate={validate}
                                  values={module}
                                  schema={schema}
                                  submitOnChange={true}
                                  onSubmit={::this.setValue} />
                        </div>
                    </div>
                    <div className="back" style={{ visibility: this.state.flipped ? 'visible' : 'hidden' }}>
                        <h3>&#160; {this.getDeleteButton()} {this.getDetailsButton()}</h3>
                        {this.getLayoutPreview(module)}
                    </div>
                </div>
            </div>
        );
    }
}

ElementView.displayName = 'ElementView';

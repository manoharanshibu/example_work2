import {notify, errorPopup} from 'common/util/PopupUtil.js';
import Model from 'backofficeCms/model/LayoutModel';
import SpanCheck from 'backofficeCms/utils/SpanCheck';
import Element from 'cms/stageOne/ElementView';
import ElementContainer from 'cms/stageOne/ElementContainerView';
import React from 'react';
import { classNames } from 'common/util/ReactUtil';
import get from 'common/util/get';
import Tagger from './Tagger';
import TextAreaWithCounter from './TextAreaWithCounter';

export default class LayoutView extends React.Component{
    constructor(props) {
        super(props);
        this.dragStateCount = 0;
        this.state = {
            layout: null,
            over: [],
            column: 0,
            rowWidth: 3,
            metaDrawerOpen: false,
        };

        this.onModelUpdate = ::this.onModelUpdate

        this.props.model.on('all', this.onModelUpdate);
        this.refs = '';
        this.onTagChange = this.onTagChange.bind(this)
        this.toggleMetaDrawer = this.toggleMetaDrawer.bind(this)
    }

    onModelUpdate() {
        const layout = this.props.model.toJSON();
        const col = layout.page.layout.cols[this.state.column];
        const rowWidth = col.rowCount;
        this.props.setRowWidth(rowWidth);
        this.setState({ layout, rowWidth });
    }

    componentWillUnmount() {
        if (this.props.model) this.props.model.off();
    }

    componentWillReceiveProps(nextProps) {
        let { path, layoutType } = nextProps;

        if (this.props.path !== path) {
            if (this.props.model) this.props.model.off();
            this.initialiseModel(path);
        }

        if (this.props.layoutType !== layoutType) {
            this.setState({ column: 0 })
        }
    }


    prompt() {
		const message = `Are you sure you wish to delete this layout?`;

		App.bus.trigger('popup:confirm', {
			content: message, onConfirm: () => {
				this.props.model.deleteModel(status => {
					if (status.status === 'success') {
						this.props.close({ reload: true });
					} else {
						this.deleteError();
					}
				});
			}
		});
    }

    saveSuccess() {
        notify('Saved', 'Layout successfully saved');
        // this.props.close({ reload: true });
    }

    saveError() {
        errorPopup('Something went wrong saving this layout');
    }

    deleteError() {
        errorPopup('Something went wrong deleting this layout');
    }

    save() {
        this.props.model.save(null, {
            success: ::this.saveSuccess,
            error: ::this.saveError
        });
    }

    addRow(row, dir) {
        this.props.model.addRow(this.state.column, row, row+dir);
    }

    deleteAction(rowNum) {
        this.props.model.removeRow(this.state.column, rowNum);
    }

    changeToCol(column) {
        const layout = this.props.model.toJSON();
        const col = layout.page.layout.cols[column];
        const rowWidth = col.rowCount;
        this.setState({ column, rowWidth }, () => {
            this.props.setRowWidth(rowWidth);
        });

    }

    onTagChange(newTags) {
        this.props.model.set('meta', newTags);
    }

    toggleMetaDrawer(e) {
      e.preventDefault()
      this.setState({ metaDrawerOpen: !this.state.metaDrawerOpen })
    }

    render() {
      const drawerClasses = classNames(
        'o-drawer',
        {'o-drawer--open': this.state.metaDrawerOpen }
      )
      const drawerToggleBtnClasses = 'btn blue filled'
      return (!this.state) ? null : (
        <div className="rows-wrapper">
          <div className="c-meta-area ">
            { this.renderTitle() }
            <a
              className={ drawerToggleBtnClasses }
              href="#"
              onClick={ this.toggleMetaDrawer }
            >
                Meta Tags
            </a>
            <div className={ drawerClasses }>
              <TextAreaWithCounter
                  label={'Meta Description'}
                  className={'c-meta-description'}
                  textareaClassName={'c-meta-description__input'}
                  onUpdate={::this.descriptionChange}
                  initialValue={this.props.model.get('description')}
                  warningLength={150}
                  dangerLength={160}
              />
              <Tagger tags={ this.props.model.get('meta') || [] } autocomplete={ this.props.model.autocomplete } onTagChange={ this.onTagChange } />
            </div>
          </div>
          { this.getTabs() }
          { this.getRows() }
          <div className="buttonBar">
            <button className='btn red filled' type='submit' onClick={::this.prompt}>Delete</button>
            <button className='btn filled reset' type='submit' onClick={::this.props.model.reset}>Reset</button>
            <button className='btn green filled' type='submit' onClick={::this.save}>Save</button>
          </div>
        </div>
      )
    }

    renderTitle() {
        const { language } = this.props;
        return  (
            <div className="inline-form-elements o-form-block">
                <div>
                  <label>Page Title</label>
                </div>
                <input
                  className="o-form-input"
                  type="text"
                  onChange={ this.props.model.setTitle.bind(this.props.model, language) }
                  value={ this.props.model.getTitle(language) } />
            </div>
        );
    }

    descriptionChange(e) {
        const value = e.target.value;
        this.props.model.set('description', value);
    }

    getTabs() {
        const {layoutType} = this.props;
        switch (layoutType) {
            case 'Regular':
                return this.getThreeColTabs();
            case 'Full Page':
                return this.getOneColTab();
            default:
                throw new Error('Unknown page layout type: ' + layoutType)
        }
    }

    getThreeColTabs() {
        return (
            <ul className="tabs">
                <li className={classNames({ active: this.state.column === 0 })}>
                    <a onClick={this.changeToCol.bind(this, 0)}>
                        {this.getThreeColSvg(1)}
                        Main Column
                    </a>
                </li>
                <li>
                    <a className="disabled">
                        {this.getThreeColSvg(2)}
                        Second Column
                    </a>
                </li>
                <li className={classNames({ active: this.state.column === 2 })}>
                    <a onClick={this.changeToCol.bind(this, 2)}>
                        {this.getThreeColSvg(3)}
                        Third Column
                    </a>
                </li>
            </ul>
        );
    }

    getOneColTab() {
        return (
            <ul className="tabs">
                <li className={classNames({ active: this.state.column === 0 })}>
                    <a onClick={this.changeToCol.bind(this, 0)}>
                        <svg width="65" height="40" viewBox="0 0 65 40" className="highlight-1">
                           <rect x="1.813" y="1.719" width="59" height="35.906" className="col1"/>
                        </svg>
                        Main Column
                    </a>
                </li>
            </ul>
        );
    }


    getThreeColSvg(col) {
      let colClass = 'highlight-' + col;
      return (
        <svg width="65" height="40" viewBox="0 0 65 40" className={colClass}>
          <rect x="1.813" y="1.719" width="26.438" height="35.906" className="col1"/>
          <rect x="32.5" y="1.719" width="12.188" height="35.906" className="col2" />
          <rect x="48.75" y="1.719" width="12.188" height="35.906" className="col3" />
        </svg>
      )
    }

    getRows() {
        if (!this.state.layout) return null
        let layout = this.state.layout.page.layout.cols[this.state.column];
        return _.map(layout.rows, (row, rowNum) => {
            let rowType = get(row, [ 'modules', 0, 'attributes', 'settings', 'namespace' ]);
            let rowClass = rowType === 'carousel' ? 'row lift-index' : 'row';
            const zIndex = layout.rows.length - rowNum;
            return (
                <div className={rowClass} key={rowNum} style={{ zIndex }}>
                    {this.getMods(row, rowNum, layout.rowCount)}
                    <div className="vertical-buttons">
                        <a className="top" onClick={this.addRow.bind(this, rowNum, 0)}><i className="fa fa-caret-up"></i>Insert Above</a>
                        <a className="middle" onClick={this.deleteAction.bind(this, rowNum)}><i className="fa fa-times"></i></a>
                        <a className="bottom" onClick={this.addRow.bind(this, rowNum, 1)}>Insert Below<i className="fa fa-caret-down"></i></a>
                    </div>
                </div>
          )
        });
    }

    getMods(row, rowNum, rowSize) {
        let numberOfElem = this.props.model.getNumberOfElements(row.modules, rowSize);
        return _.times(numberOfElem, (index) => this.getModContainer(row, rowNum, rowSize, index));
    }

    isOver(row, index) {
        let over = false;
        if (this.state.over[row]) {
            over = this.state.over[row][index] || false;
        }
        return over;
    }

    getModContainer(row, rowNum, rowSize, index) {
        const col = this.state.column;
        let span = Model.getModuleSpan(row.modules[index]) || 1;
        let create = (module) => this.props.model.addElement({ col, row: rowNum, index, module, rowSize });

        let move = (from) => {
            if (from.row === rowNum) {
                this.props.model.moveElement({ col, row: rowNum, to: index, from: from.index});
            }
        };
        let setOver = (defaultSpan, range) => {
            const element = this.props.model.getElementNumber(row, index);
            let size = new SpanCheck({ row, element, defaultSpan, range, rowSize }).getSize();
            let over = { [rowNum]: {} };
            for (let i = 0; i < size; i += 1) {
                if (row.modules[index]) {
                    let span = row.modules[index].getTilespan();
                    size = size - (span - 1);
                }
                over[rowNum][index + i] = true;
            }
            this.dragStateCount++;
            this.setState({ over });
        };
        let clearOver = () => {
            if (this.dragStateCount === 1) {
                this.setState({ over: { [rowNum]: {} } });
            }
            this.dragStateCount--;
        };
        return (
            <ElementContainer
                key={index}
                isOver={this.isOver(rowNum, index)}
                setOver={setOver}
                clearOver={clearOver}
                moveElement={move}
                createElement={create}
                layoutType={this.props.layoutType}
                row={rowNum}
                col={this.state.column}
                span={span} >
                {this.getMod(row.modules, rowNum, index, this.isOver(rowNum, index))}
            </ElementContainer>
        );
    }

    getMod(modules, row, index, isOver) {
        let module = modules ? modules[index] : null;
        return module ? (
            <Element
                language={this.props.language}
                key={index}
                isOver={isOver}
                model={this.props.model}
                module={module}
                row={row}
                rowWidth={this.state.rowWidth}
                col={this.state.column}
                index={index} />
        ): null;
    }
}

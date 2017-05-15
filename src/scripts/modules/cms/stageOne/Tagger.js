import {classNames as cx} from 'common/util/ReactUtil';

// for extending String
function beginsWith(str) {
    return this.toLowerCase().indexOf(str.toLowerCase()) === 0;
}


export default class Tagger extends React.Component {

    // Life-Cycle Methods:

    constructor(props) {
        super(props);

        _.bindAll(this,
            'updateInput',
            'renderTag',
            'onInputKeyDown',
            'onInputBlur',
            'onInputFocus',
            'onMouseEnterMenu',
            'onMouseLeaveMenu',
            'onMouseEnterTag',
            'onMouseLeaveTag',
            'focusInput',
            'createTagAdder',
            'createTagRemover',
        );

        this.state = {
            input: "",
            inputFocus: false,
            mouseOverMenu: false,
            mouseOverTag: false,
            menuItemSelected: null
        };

        this.createTagSet(this.props.tags);
    }

    componentWillReceiveProps(newProps) {
        this.createTagSet(newProps.tags);
    }

    // Input Box Methods:

    updateInput(e) {
        e.preventDefault();
        const newValue = e.target.value;
        this.setState({
            input: newValue,
            menuItemSelected: null
        });
    }

    resetInput() {
        this.setState({
            input: '',
            mouseOverMenu: false,
            menuItemSelected: null
        });
    }

    addTag(tag) {
        if (!tag) {
            const i = this.state.menuItemSelected;
            tag = i !== null ?
                this.getAutocompleteItems()[i] :
                this.state.input;
        }
        // if we still don't have a tag...
        if (!tag) {
            return;
        }
        this.tagSet.add(tag);
        this.resetInput();
        this.tagSetToParent();
    }

    onInputKeyDown(e) {
        const char = e.key;
        if (char === 'Enter' || char === ',') {
            e.preventDefault();
            this.addTag();
        } else if (char === 'ArrowUp' || (e.shiftKey && char === 'Tab')) {
            e.preventDefault();
            this.setState({ menuItemSelected: this.updateIndex(-1) });
        } else if (char === 'ArrowDown' || char === 'Tab') {
            e.preventDefault();
            this.setState({ menuItemSelected: this.updateIndex(+1) });
        } else if (char === 'Backspace' && this.state.input === '') {
            e.preventDefault();
            this.removeLastTag();
        }
    }


    onInputFocus() {
        this.setState({ inputFocus: true });
    }

    onInputBlur() {
        this.setState({ inputFocus: false });
    }

    onMouseEnterMenu() {
        this.setState({ mouseOverMenu: true });
    }

    onMouseLeaveMenu() {
        this.setState({ mouseOverMenu: false });
    }

    onMouseEnterTag() {
        this.setState({ mouseOverTag: true });
    }

    onMouseLeaveTag() {
        this.setState({ mouseOverTag: false });
    }

    // Autocomplete Methods:

    getAutocompleteItems() {
        return _.filter(this.props.autocomplete, (tag) => {
            return this.isNotInTagSet(tag) && tag::beginsWith(this.state.input);
        })
    }

    isNotInTagSet(tag) {
        return !this.tagSet.has(tag);
    }

    createTagAdder(tag) {
        return () => {
            this.addTag(tag);
        }
    }

    updateIndex(unit) {
        const length = this.getAutocompleteItems().length;
        const index = this.state.menuItemSelected;
        if (!length) {
            return null;
        }
        if (index == null) {
            return unit === 1 ? 0 : length - 1;
        }
        const newIndex = index + unit;
        return (newIndex === -1 || newIndex === length) ? null : newIndex;
    }

    isMenuVisible(items) {
        const hasItems = items.length > 0;
        const mouseOver = this.state.mouseOverMenu;
        const hasFocus = this.state.inputFocus;
        const inputNotEmpty = this.state.input !== '';
        const itemSelected = this.state.menuItemSelected !== null;

        return hasItems && (mouseOver || (hasFocus && (inputNotEmpty || itemSelected)));
    }

    focusInput() {
        if (!this.state.mouseOverTag) {
            this.refs.input.focus()
        }
    }

    // Tag Set Methods:

    createTagSet(tags) {
        this.tagSet = new Set(tags);
    }

    tagSetToParent() {
        const tags = Array.from(this.tagSet);
        this.props.onTagChange(tags);
    }

    createTagRemover(tag) {
        return () => {
            this.setState({ mouseOverTag: false })
            this.tagSet.delete(tag);
            this.tagSetToParent();
        }
    }

    removeLastTag() {
        const tags = Array.from(this.tagSet);
        const lastTag = tags.pop()
        this.tagSet = new Set(tags);
        this.props.onTagChange(tags);
        this.setState({ input: lastTag });
    }

    // Render Methods:

    render() {
        // convert tags to array
        const tags = Array.from(this.tagSet);
        return (
            <div className="inline-form-elements" onClick={this.focusInput}>
                <label>Meta Keywords</label>
                <div className="c-tag-container">
                    {_.map(tags, tag =>this.renderTag(tag))}
                    {this.renderInput()}
                </div>
            </div>
        );
    }

    renderInput() {
        const i = this.state.menuItemSelected;
        const value = _.isNull(i) ? this.state.input : this.getAutocompleteItems()[i];
        const items = this.getAutocompleteItems();
        return (
            <div className="c-tag-container__tag-item">
                <div className="o-dropdown">
                    <input
                        className="c-tag-container__input"
                        type="text"
                        value={value}
                        onChange={this.updateInput}
                        onKeyDown={this.onInputKeyDown}
                        onBlur={this.onInputBlur}
                        onFocus={this.onInputFocus}
                        placeholder="Add a keyword..."
                        ref="input"
                    />
                    {this.isMenuVisible(items) && this.renderMenu(items)}
                </div>
            </div>
        );
    }

    renderMenu(items) {
        const menuItems = _.map(items, (item, i) => this.renderMenuItem2(item, i));
        return (
            <div
                className="o-dropdown__list"
                onMouseEnter={this.onMouseEnterMenu}
                onMouseLeave={this.onMouseLeaveMenu}
            >

                {menuItems}

            </div>
        );
    }

    renderTag(tag) {
        return (
            <div
                className="c-tag-container__tag-item"
                key={tag /* tag is a unique string due to coming from Set */}
                onMouseEnter={this.onMouseEnterTag}
                onMouseLeave={this.onMouseLeaveTag}
            >
                <div className="o-tag">
                    {tag}&nbsp;
                    <span
                        aria-disabled="false"
                        aria-label="Unselect"
                        className="o-tag__remove"
                        onClick={this.createTagRemover(tag)}
                    >
                        <span aria-hidden="true" >×</span>
                    </span>
                </div>
            </div>
        );
    }
}

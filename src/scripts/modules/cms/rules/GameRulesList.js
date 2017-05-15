import {notify, errorPopup} from 'common/util/PopupUtil.js';
import Component from 'common/system/react/BackboneComponent';
import RulesCollection from 'backoffice/collection/GameRules';
import service from 'backoffice/service/BackofficeRestfulService';
import Loader from 'app/view/Loader';

export default class GameRulesList extends Component {
    constructor(props) {
        super(props);

        this.collection = RulesCollection;
        this.state = {
            name: '',
            gameRules: this.collection.models,
            status: this.collection.status
        };

        this.observe = false;

        this.treeHeight = _.once(function(){
            return window.innerHeight - 35;
        });
    }

    /**
     * Reference the name and code inputs
     */
    componentDidMount() {
        const that = this;

        this.searchFilter = ReactDOM.findDOMNode(this.refs.name);

        if (this.collection.status === 'pending') {
            this.collection.on('changeStatus', (...rest)=>{
                this.setState({gameRules: this.collection.models, status: this.collection.status});
            });
        }
    }

    /**
     *
     * @returns {*}
     */
    heightFunction() {
        return this.treeHeight;
    }

    /**
     * Filter the records
     */
    onSearch() {
        const name = this.searchFilter.value;
        this.setState({name});
    }

    /**
     * Reset filtering
     */
    onClear(event) {
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        event.preventDefault();
        this.searchFilter.value = '';
        this.setState({name: ''});
    }

    onAddGameRules(){
        App.navigate('/cms/rules/creation');
    }

    onEditGameRules(ruleId, event){
        event.stopPropagation();
        App.navigate('/cms/rules/edit/' + ruleId);
    }


    onRemoveGameRules(ruleId, event){
        event.stopPropagation();

        const message = `Are you sure you wish to delete the game rule?`;
        let rules = this.state.gameRules,
            promise = {},
            ruleInCollection = this.collection.findWhere({id: ruleId});

        rules = rules.filter(function( obj ) {
            return obj.id !== ruleId;
        });

        App.bus.trigger('popup:confirm', {
            content: message, onConfirm: () => {
                this.setState({gameRules: rules});
                if (ruleInCollection) {
                    this.collection.remove(ruleInCollection);
                }
                promise = service.removeGamingRules(ruleId)
                    .then(::this.onRemoveSuccess)
                    .catch(::this.onRemoveFailure)
            }
        });
    }

    onRemoveSuccess(resp){
        notify('Success', 'The game rules has been deleted');
    }

    onRemoveFailure(err){
        console.log(err)
        errorPopup('There has been an error deleting the game rules');
    }

    /**
     * @returns {XML}
     */
    render() {
        if (!App.session.request('loggedIn')) {
            return <div className="panel padding white">Please log in to have access to the gaming rules</div>;
        }

        //TODO: Checking the permissions on every render, might not be ideal 
        //but as a quick fix, it ensures they are reevaluated if the user has
        //logged out and logged in with different user
        const allowed = App.session.request('canCmsPromotions');
        // TODO add in game rules permissions
        // const allowed = App.session.request('canCmsGameRules');

        if (!allowed){
            return <div><p><strong>YOU ARE NOT AUTHORIZED TO USE THIS FUNCTION.</strong></p></div>;
        }

        // Not to be removed, unless placed in the stylesheets
        const styleScrollable = {
            top: 0,
            bottom: 0,
            overflow: 'scroll'
        };

        const boxHeight = window.innerHeight - 50;

        return (

            <div className="box" style={styleScrollable}>
                <div style={{
                    position: 'relative',
                    height: boxHeight
                }}>
                    <div className="page-selectors">
                        <h1 className="heading main">Gaming Rules</h1>
                    </div>
                    <div className="table toolbar">
                        <div className="table-row">
                            <div className="table-cell">
                                <div className="inline-form-elements">
                                    <label>Search Gaming Rules by Name:</label>
                                    <input autoFocus ref="name" type="text" name="text" onChange={this.onSearch.bind(this)}/>
                                    <a href="#_" className="btn blue filled" onClick={this.onClear.bind(this)}>Clear</a>
                                </div>
                            </div>
                            <div className="table-cell right">
                                <div className="inline-form-elements">
                                    <a className="btn green filled" onClick={this.onAddGameRules.bind(this)}>Create Gaming Rules</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    {this.renderGameRules()}
                </div>
            </div>
        );
    }

    renderGameRules() {
        if (this.state.status === 'pending') {
            return <Loader />;
        }

        if (this.state.status === 'error'){
            return <p>There has been an error retrieving the gaming rules list.</p>;
        }

        const filtered = this.collection.filterBySearch(this.state.name);
        const hasRules = !!filtered.length;
        const noRules = !this.state.gameRules.length;

        return (
            <div className="table grid" style={{marginTop: '0px'}}>
                <div className="table-row header larger">
                    <div className="table-cell center" style={{minWidth: '250px'}}>Game Name</div>
                    <div className="table-cell center"> Provider </div>
                    <div className="table-cell center"> ID </div>
                    <div className="table-cell center"> Min Stake </div>
                    <div className="table-cell center"> Max Stake </div>
                    <div className="table-cell center"> Edit </div>
                    <div className="table-cell center"> Remove </div>
                </div>
                {noRules && (
                    <p className="table-row">
                        There are currently no saved game rules. Click on "Create Gaming Rules" to create one.
                    </p>
                )}

                {!hasRules && (
                    <p className="table-row">There are no game rules matching your search.</p>
                )}

                {hasRules && filtered.map((rule, index) => {
                    return this.renderRule(rule, index);
                })}
            </div>
        );
            
    }

    renderRule(rule, index) {
        let {attributes} = rule;
        return (
            <div key={index} className="table-row clickable"
                    onClick={this.onEditGameRules.bind(this, rule.id)}>
                <div className="table-cell">
                    {attributes.gameName}
                </div>
                <div className="table-cell center">
                    {attributes.gameProvider}
                </div>
                <div className="table-cell center">
                    {rule.id}
                </div>
                <div className="table-cell center">
                    {attributes.minStake}
                </div>
                <div className="table-cell center">
                    {attributes.maxStake}
                </div>
                <div className="table-cell center">
                    <a className="btn blue small" onClick={this.onEditGameRules.bind(this, rule.id)}>Edit</a>
                </div>
                <div className="table-cell center">
                    <a className="btn red small" onClick={this.onRemoveGameRules.bind(this, rule.id)}>Remove</a>
                </div>
            </div>
        )
    }
};


GameRulesList.displayName = 'GameRulesList';

import {notify} from 'common/util/PopupUtil.js';
import Component from 'common/system/react/BackboneComponent';
import RulesModel from 'backoffice/model/GameRules';
import OneTabList from 'backoffice/components/lists/OneTabList';
import TextInput from 'backoffice/components/elements/TextInput';
import TableRowWrapper from 'backoffice/components/TableRowWrapper';
import RulesCollection from 'backoffice/collection/GameRules';
import Tooltip from 'backoffice/components/tooltips/Tooltip';
import service from 'backoffice/service/BackofficeRestfulService';
import GameRulesImageControl from './GameRulesImageControl';
import ReactQuill from 'react-quill';


export default class GameRulesCreation extends Component {
    constructor(props) {
        super(props);

        this.collection = RulesCollection;
        this.forceRerender = ::this.forceRerender;

        this.state = {
            game: null,
            new: true,
            provider: '',
			providerObj: '',
			providers: [],
            status: 'pending',
            text: ''
        };
    }

    componentWillMount(){
        const gameId = this.props.routeParams.id,
            that = this;

        if (gameId) {
            if (this.collection.status === 'fetched') {
                this.initializeRules();
            } else {
                this.collection.on('changeStatus', ::this.initializeRules);
            }
            this.setState({ new: false });
        } else {
            this.setState({ status: 'ok' });
            this.model = new RulesModel();

            this.model.on('change', () => {
                let provider = that.model.get('gameProvider') || '';
                that.setState({ provider })
            });
        }

        // get list of all games
        service.getRgsGameList()
            .then(data => {
				if (!data || !data.length) {
					return;
				}
				//TODO: use models
				const providers = [];
				data.forEach((provider) => {
					provider.id = provider.name;
					providers.push(provider);
				});

				this.setState({ providers });
            });
	}

    initializeRules() {
        const gameId = parseInt(this.props.routeParams.id);
        if (this.collection.status === 'fetched') {
            this.model = this.collection.get(gameId);
            this.setState({text: this.model.get('word')});
            this.forceUpdate();
        }
    }

    forceRerender(){
        this.forceUpdate();
    }

    onSaveAndGotoList() {
        let data = this.model.attributes,
            promise = {};
        const that = this;


        if (!data.gameName) {
            console.log('you need to add a game game')
            return;
        }

        console.log(`saving ${this.state.new ? 'new':'existing'} game`)
        if (this.state.new) {
            promise = service.addGamingRules(JSON.stringify(data));
        } else {
            promise = service.updateGamingRules(JSON.stringify(data), data.id);
        }
        promise
            .then(function(id) {
                if (!that.model.id) {
                    that.model.id = id;
                }
                that.collection.add(that.model);
                that.onSaveSuccess(true);
            })
            .catch(this.onSaveError)

    }

    onSaveAndStay() {
        const backToList = false;
        this.model.save().then( this.onSaveSuccess.bind(backToList), this.onSaveError );
    }

    onSaveSuccess(backToList){
        notify('Success', 'The game rules were saved successfully');
        if (backToList) {
            this.backToList();
        }
    }

    onSaveError(err){
        console.log(err)
        notify('Error', 'There has been an error saving the game rules, this could be because the game has already been added');
    }

    backToList() {
        App.navigate('/cms/rules');
    }

    onContentChange(value) {
        this.setState({text: value});
        this.model.set('word', value)
    }

	onProviderSelected(value, providerObj){
		this.setState({providerObj});
	}

    render(){
        //TODO: Checking the permissions on every render, might not be ideal
        //but as a quick fix, it ensures they are reevaluated if the user has
        //logged out and logged in with different user
        const allowed = App.session.request('canCmsPromotions');


        if (!allowed){
            return <div><p><strong>YOU ARE NOT AUTHORIZED TO USE THIS FUNCTION.</strong></p></div>;
        }

        if (this.collection.status === 'pending'){
            return (
                <div>
                    <p>Please wait while the game rules data is retrieved</p>
                </div>
            );
        }
        // Not to be removed, unless placed in the stylesheets
        const styleScrollable = {
            position: 'absolute',
            top: 0,
            bottom: 0,
            overflow: 'scroll'
        };

        return (
            <div className="box" style={styleScrollable}>
                <div style={{position: 'relative'}}>
                    <div className="page-selectors">
                        <h1 className="heading main">Game Rules</h1>
                    </div>
                    {this.renderToolbar()}
                    {this.renderForm()}
                    {this.renderToolbar()}
                </div>
                <Tooltip place="right" type="info" effect="solid" />
            </div>
        );
    }

    renderToolbar(){
        return (
            <div className="table toolbar">
                <div className="table-row">
                    <div className="table-cell right">
                        <div className="inline-form-elements">
                            <a className="btn green filled" onClick={this.onSaveAndGotoList.bind(this)}>Save</a>
                            <a className="btn green filled" onClick={this.backToList.bind(this)}>Back to List</a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * @returns {XML}
     */
    renderForm() {
        return (
            <div className="box">
                <div style={{position: 'relative'}}>
                    <div className="table">
                        <div className="table-row">
                            <div className="table-cell" style={{width: '50%'}}>
                                <div className="table no-border-bottom">
                                    {this.renderProviderCombo()}
                                </div>
                            </div>
                        </div>
                        <div className="table-row">
                            <div className="table-cell" style={{width: '50%'}}>
                                <div className="table no-border-bottom">
                                    {this.renderNameCombo()}
                                </div>
                            </div>
                        </div>
                        <div className="table-row">
                            <div className="table-cell" style={{width: '50%'}}>
                                <div className="table no-border-bottom">
                                    <TableRowWrapper label="Min stake">
                                        <TextInput inputStyle={{width: '100%'}}
                                                   valueLink={this.bindTo(this.model, 'minStake')} />
                                    </TableRowWrapper>
                                    <TableRowWrapper label="Max stake">
                                        <TextInput inputStyle={{width: '100%'}}
                                                   valueLink={this.bindTo(this.model, 'maxStake')} />
                                    </TableRowWrapper>
                                </div>
                            </div>
                        </div>
                        <div className="table-row">
                            <div className="table-cell" style={{width: '50%'}}>
                                <div className="table no-border-bottom">
                                    <ReactQuill value={this.state.text} theme='snow'
                                                onChange={this.onContentChange.bind(this)} />
                                </div>
                            </div>
                        </div>
                        <div className="table-row">
                            <div className="table-cell" style={{width: '50%'}}>
                                <div className="table no-border-bottom">
                                    <GameRulesImageControl
                                        onSave={this.onSaveAndStay.bind(this)}
                                        model={this.model} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderProviderCombo() {

		const { providers } = this.state;
        return (
            <TableRowWrapper label="Game provider">
                <OneTabList list={providers} style={{width: '100%'}}
                            valueLink={this.bindTo(this.model, 'gameProvider')} onToggle={ ::this.onProviderSelected } />
            </TableRowWrapper>
        );
    }

	renderNameCombo() {
		const { providerObj } = this.state;
		if (!providerObj || !providerObj.games) {
			return (
				<TableRowWrapper label="Game ID/Game name">
					<TextInput inputStyle={{width: '100%'}}
						   valueLink={this.bindTo(this.model, 'gameName')} />
				</TableRowWrapper>
			);
		}
		let options = [];
		providerObj.games.forEach((game) => {
			const name = game.names && game.names.en || '';
			options.push({
				id: game.rgsGameId,
				name: `${name} (${game.rgsGameId})`,
				selected: false
			});
		})

		return (
			<TableRowWrapper label="Game ID/Game name">
				<OneTabList list={options} style={{width: '100%'}}
							valueLink={this.bindTo(this.model, 'gameName')}/>
			</TableRowWrapper>
		);
	}
};

GameRulesCreation.displayName = 'GameRulesCreation';

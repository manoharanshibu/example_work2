import {notify, errorPopup} from 'common/util/PopupUtil.js';
import Component from 'common/system/react/BackboneComponent';
import cache from 'backoffice/model/NodeCache';
import nodePromotions from 'backoffice/collection/NodePromotions';
import ComboBox from 'backoffice/components/elements/ComboBox';
import Loader from 'app/view/Loader';

export default class PromotionsView extends Component {
	constructor(props) {
		super(props);


		this.state = {
			name: '',
		};

		this.observe = false;

		this.treeHeight = _.once(function(){
			return window.innerHeight - 35;
		});

		this.collection = nodePromotions;
	}

	/**
	 * Reference the name and code inputs
	 */
	componentDidMount() {
		this.collection.on('change changeStatus add reset destroy update', (...rest)=>{
			this.forceUpdate();
		});

		this.searchFilter = ReactDOM.findDOMNode(this.refs.name);
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

	/**
	 *
	 */
	onToggle(node, expanded) {
		cache.toggleNode(node.id, 'openField2');
	}

	onAddPromotion(){
		App.navigate('/cms/promotions/creation');
	}

	onEditPromotion(promoId) {
		App.navigate('/cms/promotions/edit/' + promoId);
	}


	onRemovePromotion(promotion, event){
		event.stopPropagation();
		const promName = promotion.get('name');
		const message = `Are you sure you wish to delete the promotion named '${promName}'?`;

		const onRemoveSuccess = ::this.onRemoveSuccess;
		const onRemoveFailure = ::this.onRemoveFailure;

		App.bus.trigger('popup:confirm', {
			content: message, onConfirm: () => {
				promotion.destroy({wait: true})
					.done( onRemoveSuccess )
					.fail( onRemoveFailure );
			}
		});
	}

	onRemoveSuccess(){
		notify('Success', 'The promotion has been deleted');
		this.forceUpdate();
	}

	onRemoveFailure(){
		errorPopup('There has been an error deleting the promotion');
	}

	/**
	 * @returns {XML}
	 */
	render() {
		if (!App.session.request('loggedIn')) {
			return <div className="panel padding white">Please log in to have access to the campaigns</div>;
		}

		//TODO: Checking the permissions on every render, might not be ideal
		//but as a quick fix, it ensures they are reevaluated if the user has
		//logged out and logged in with different user
		const allowed = App.session.request('canCmsPromotions');

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
						<h1 className="heading main">Promotions</h1>
					</div>
					<div className="table toolbar">
						<div className="table-row">
							<div className="table-cell">
								<div className="inline-form-elements">
									<label>Search Promotions by Name:</label>
									<input autoFocus ref="name" type="text" name="text" onChange={this.onSearch.bind(this)}/>
									<a href="#_" className="btn blue filled" onClick={this.onClear.bind(this)}>Clear</a>
								</div>
							</div>
							<div className="table-cell right">
								<div className="inline-form-elements">
									<a className="btn green filled" onClick={this.onAddPromotion.bind(this)}>Create Promotion</a>
								</div>
							</div>
						</div>
					</div>
					{this.renderContents()}
				</div>
			</div>
		);
	}

	/**
	 * @returns {XML}
	 */
	renderContents(){
		if (this.collection.status === 'pending'){
			return <Loader />;
		}

		if (this.collection.status === 'error'){
			return <p>There has been an error retrieving the promotions list.</p>;
		}

		return (
			<div className="table grid" style={{marginTop: '0px'}}>
				<div className="table-row header larger">
					<div className="table-cell center" style={{minWidth: '250px'}}>Name</div>
					<div className="table-cell center"> Has selections? </div>
					<div className="table-cell center"> Promo type </div>
					<div className="table-cell center"> Is active now? </div>
					<div className="table-cell center"> Start Date </div>
					<div className="table-cell center"> End Date </div>
					<div className="table-cell center"> Remove </div>
					<div className="table-cell center"> Edit </div>
				</div>
				{this.renderRows()}
			</div>
		);
	}

	/**
	 * @returns {*}
	 */
	renderRows() {
		if (!this.collection.length){
			return <p>There are currently no saved promotions. Click on "Create Promotion" to create one.</p>;
		}

		var filteredBySearch = this.collection.filterBySearchAndType(this.state.name, 'promotions');

		const now = (new Date()).getTime();

		return _.reduce(filteredBySearch.models, (rows, promotion, index) => {
			const promoType = promotion.get('type');
			const hasSelections = promotion.hasSelections();
			const canBetElement = hasSelections ? <i className="fa fa-check"></i> : null ;

			const activeStart = promotion.get('activeStart');
			const activeEnd = promotion.get('activeEnd');

			const isBonusTile= promotion.get('isBonusTile');

			// There is no meaning for 'active' for bonus tiles, as only the
			// corresponding campaigns can be active
			const isActive = !isBonusTile && (activeStart < now) && (activeEnd > now);
			const isActiveIcon = isActive ? <i className="fa fa-check"></i> : null ;

			const startDate = isBonusTile ? '' :
						moment(activeStart).format('DD/MM/YYYY  - HH:mm');

			const endDate = isBonusTile ? '' :
						moment(activeEnd).format('DD/MM/YYYY  - HH:mm');

			rows.push((
				<div key={index} className="table-row clickable"
						onClick={this.onEditPromotion.bind(this, promotion.get('id'))}>
					<div className="table-cell">
						{promotion.get('name') || ''}
					</div>
					<div className="table-cell center">
						{canBetElement}
					</div>
					<div className="table-cell center">
						{promoType}
					</div>
					<div className="table-cell center">
						{isActiveIcon}
					</div>
					<div className="table-cell center">
						{startDate}
					</div>
					<div className="table-cell center">
						{endDate}
					</div>
					<div className="table-cell center">
						<a className="btn red small" onClick={this.onRemovePromotion.bind(this, promotion)}>Remove</a>
					</div>
					<div className="table-cell center">
						<a className="btn blue small" onClick={this.onEditPromotion.bind(this, promotion.get('id'))}>Edit</a>
					</div>
				</div>
			));

			return rows;
		}, [], this);
	}
};


PromotionsView.displayName = 'PromotionsView';

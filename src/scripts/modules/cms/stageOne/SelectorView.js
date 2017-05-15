import {notify, errorPopup} from 'common/util/PopupUtil.js';
import {removePartFromPath} from 'common/util/AppUtil.js';
import SegmentModel from 'backoffice/model/CustomerSegmentModel';
import * as helper from 'backofficeCms/utils/LayoutHelper';
import LayoutIdCollection from 'backofficeCms/model/LayoutIdCollection';
import TextInput from 'backoffice/components/elements/TextInput';
import { Link } from 'react-router';
import ComboBox from 'backoffice/components/elements/ComboBox';
import brandsModel from 'backoffice/model/BrandsModel';
import model from 'backoffice/model/SelectorModel'

export default class SelectorView extends React.Component {

    constructor(props) {
        super(props);
		const brands = brandsModel.get('brands') || [];
        this.state = {
            listState: 'pending',
            searchTerm: '',
			brands: [{ id: -1, name: 'All' }].concat(brands),
			segment: 'DEFAULT',
			segments: {
				regions: this.getRegionalSegments(),
				accounts: this.getAccountSegments()
			},
        };

		this.modulesDir = removePartFromPath(window.location.pathname, App.BaseName);
        this.modulesDir = _.initial(this.modulesDir.split('/')).join('/');
	}

	componentDidMount() {
		this.setSegments();
		LayoutIdCollection.fetch({
            success: ::this.onGetLayoutsSuccess,
            error: ::this.onGetLayoutsError
        });
    }


	setSegments()
	{
		SegmentModel.customerSegments.on('all', () => {
			this.setState({
				segments: {
					regions: this.getRegionalSegments(),
					accounts: this.getAccountSegments()
				},
			});
		});
	}
    onGetLayoutsSuccess() {
		const brands = brandsModel.get('brands') || [];
		this.setState({ listState: 'success', brands: [{ id: -1, name: 'All' }].concat(brands)});
		this.searchFilter = ReactDOM.findDOMNode(this.refs.search);
	}

    onGetLayoutsError() {
        this.setState({ listState: 'failure' });
    }

    getAccountSegments() {
        let filtered = SegmentModel.customerSegments.byNameAndCode('', '', 'ACCOUNT');
        let segments = _.reduce(filtered, (coll, segment) => {
            let forLayout = segment.get('forLayout');
            if (forLayout) {
                let name = segment.get('name');
                let value = segment.get('id');
				let brandId = segment.get('brandId')
                coll.push({ name , value , brandId });
            }
            return coll;
        }, []);
        return segments;
    }

    getRegionalSegments() {
        let filtered = SegmentModel.customerSegments.byNameAndCode('', '');
        let segments = _.reduce(filtered, (coll, segment) => {
            let forLayout = segment.get('forLayout');
            if (forLayout) {
                let name = segment.get('name');
                let code = segment.get('code');
				let brandId = segment.get('brandId')
				coll.push({ name: `${name}`, value: code , brandId});
            }
            return coll;
        }, []);

		return [{ name: 'All Segments', value: 'DEFAULT'}].concat(segments);
    }

    setPath(e) {
        e.preventDefault();
        let route = this.refs.route.input.value;
        let segment = this.state.segment;
        // let account = this.state.account;

        if (!route) {
            return errorPopup('Please enter a route');
        }

        if (!segment) {
            return errorPopup('Please select a segment');
        }

        route = route.charAt(0) === '/' ? route : `/${route}`;

        const id = helper.createPathString({ segment, route });
        if (id) {
            App.navigate(`/cms/modules/layouts/${id}`);
        }
    }

    notify(title = '', content = '', autoDestruct=2000){
        App.bus.trigger('popup:notification', {title, content, autoDestruct});
    }

    selectionToState(field, event) {
        const value = event.target.value;
        this.setState({
            [field]: value
        });
    }

    getSegment(value) {
        let result = _.findWhere(this.state.segments.regions, { value }) ||
            _.findWhere(this.state.segments.accounts, { value: Number(value) });
        return result;
    }

    onSearch(){
        const searchTerm = this.searchFilter.value;
        this.setState({searchTerm});
    }

    render() {
        //TODO: Checking the permissions on every render, might not be ideal
        //but as a quick fix, it ensures they are reevaluated if the user has
        //logged out and logged in with different user
        const allowed = App.session.request('canCmsPageBuilder');

        if (!allowed) {
            return <div><p><strong>YOU ARE NOT AUTHORIZED TO USE THIS FUNCTION.</strong></p></div>;
        }

        return (
            <div>
                <div className='module-layout-grid full-width'>
                    <div className="page-selectors">
                        <h1 className="heading main">Select Layout</h1>
						<div style={{float: 'right', margin: '7px 10px', padding: '5px', display: 'inline-flex'}}>
							<input autoFocus ref="search" type="text"
								   placeholder="Search by Route"
								   name="text" onChange={this.onSearch.bind(this)}/>
							<div style={ {width: 250, paddingLeft: 10} }>
								{this.renderBrandFilter()}
							</div>
						</div>
                    </div>
                    {this.renderTopRow()}
                    <div className="box">
                        <div className="table grid" style={{marginTop: '0px', border: 0}}>
                            <div className="table-row header larger">
                                <div className="table-cell routeHeader"> Route </div>
                                <div className="table-cell segmentHeader"> Segment </div>
                            </div>
                            {this.renderRows()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderTopRow() {
        return (
            <div className="table-row new-header">

                <TextInput
                    ref='route'
                    placeholder="Enter Route" />
                <div className="route-text-input">
                    {this.getDropDown('segment')}
                </div>
                <button className='btn green filled' type='submit' onClick={::this.setPath}>Create</button>
            </div>
        );
    }

    getDropDown(type) {
        let types = type + 's';
        return (
            <div className="sport-select">
                <select id={`${type}-select`}
                        onChange={this.selectionToState.bind(this, type)}
                        value={this.state[type]}>
                    <option disabled="disabled">Select {type}...</option>
                    {this.getDropDownOpts(type, this.state[types])}
                </select>
                <i className="fa fa-chevron-down"></i>
            </div>
        );
    }

    getDropDownOpts(type, data) {
        return _.isArray(data) ? _.map(data, (entry, i) => (
            <option key={i} value={entry.value}> {entry.name} </option>
        )) : _.map(data, (val, key) => (
            <optgroup label={key} key={key}>
                {this.getDropDownOpts(type, val)}
            </optgroup>
        ));
    }


    renderRows() {
        if (this.state.listState === 'pending'){
            return <p>Please wait why we retrieve the list of layouts...</p>;
        }

        if (this.state.listState === 'failure'){
            return <p>There has been an error retrieving the list of layouts.</p>;
        }
        const filteredCollection = LayoutIdCollection.bySearch( this.state.searchTerm );

        return _.map(filteredCollection.models, (mod, index) => {
            const id = mod.get('id');
            const { segment, route } = helper.parsePathString(id);
			const segmentObj = this.getSegment(segment);
			console.log(model.get('brandId'), 'sad')
			if(model.get('brandId') !== -1 && segmentObj &&
				segmentObj.brandId && segmentObj.brandId.toString() !== model.get('brandId') )
				return null;

			const url = helper.makeUrl(id);
            return (
                <Link to={`${this.modulesDir}/layouts/${url}`}
                      key={index}
                      className="table-row event-header">
                    <div className="table-cell">
                        {route}
                    </div>
                    <div className="table-cell">
                        {segmentObj &&  segmentObj.name}
                    </div>
                </Link>
            );
        });
    }

	renderBrandFilter() {
		const {brands} = this.state;

		const optionLink = {
			value: model.get('brandId'),
			requestChange: brand => {
				model.set('brandId', brand)
				this.forceUpdate();
			}
		};

		return (
			<ComboBox
				labelStyle={{ verticalAlign: 'middle' }}
				valueLink={ optionLink }
				subWrapperStyle={{ maxWidth: '100%' }}
			>
				{ _.map(brands, brand => {
					return <option key={brand.id} value={ brand.id }>{ _.titleize(brand.name) }</option>;
				}) }
			</ComboBox>
		);
	}
}

SelectorView.displayName = 'SelectorView';

import React from 'react';
import model from 'backoffice/model/CustomerModel';
import TraderComments from 'backoffice/collection/TraderComments';
import Paginator from 'backoffice/components/Paginator';
import PaginatorApp from 'backoffice/components/PaginatorApp';
import {DateTimePicker} from 'react-widgets';

const format ='YYYY-MM-DD';

export default class AccountTraderComments extends React.Component {
	constructor(props) {
		super(props);

		const accountId = model.currentAccount.id;
		this.forceRerender = ::this.forceRerender;
		this.onPageChange = ::this.onPageChange;

		const currentPage = 1;
		this.pageSize = 100;
		this.startDate = moment().subtract(1, 'months').format(format);
		this.endDate = moment().format(format);
		this.state = {currentPage};


		this.collection = new TraderComments(accountId, currentPage, this.pageSize, this.startDate, this.endDate);
	}

	componentDidMount(){
		this.collection.on('reset commentCountUpdated', this.forceRerender);
	}

	componentWillUnmount(){
		this.collection.off('reset commentCountUpdated', this.forceRerender);
	}

	forceRerender(){
		this.setState({currentPage: 1});
		this.forceUpdate();
	}

	onPageChange(newPage){
		this.setState({currentPage: newPage});
		this.loadComment(newPage);
	}

	loadComment(page){
		this.collection.fetchComments(page, this.startDate, this.endDate);
	}

	loadComments(e){
		e.preventDefault();
		this.setState({currentPage: 1});
		this.collection.models = [];
		this.collection.fetchComments(1, this.startDate, this.endDate);
	}

	onStartDateChange(date) {
		this.startDate = moment(date).format(format);
	}

	onEndDateChange(date) {
		this.endDate = moment(date).format(format);
	}

	render(){
		return (
			<div className="box">
				<div style={{minHeight: window.innerHeight - 120}}>
					{this.renderFilters()}
					<div className="padding">
						{this.collection.models.length > 0 && (
							this.renderPaginator()
						)}
						<br/>
						<div className="table grid inner">
							{this.renderHeaders()}
							{this.renderRows()}
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderFilters() {
		return (
			<form onSubmit={::this.loadComments}>
                <div className="table">
                    <div className="table-row">
                        <div className="table-cell">
                            <div className="inline-form-elements">
                                <label>From</label>
                                <DateTimePicker
                                    onChange={::this.onStartDateChange}
                                    format={format}
                                    time={false}
                                    defaultValue={new Date(moment().subtract(1, 'months'))}/>
                            </div>
                        </div>
                        <div className="table-cell">
                            <div className="inline-form-elements">
                                <label>To</label>
                                <DateTimePicker
                                    onChange={::this.onEndDateChange}
                                    format={format}
                                    time={false}
                                    defaultValue={new Date()}
                                    max={new Date()} />
                            </div>
                        </div>
                        <div className="table-cell right" style={{verticalAlign: 'middle'}}>
                            <a className="btn blue filled" onClick={::this.loadComments}>Search</a>
                        </div>
                    </div>
                </div>
			</form>
		);
	}

	renderPaginator(){
		// This needs to be zero until the API supports returning a count
		// with the total number of elements that match the query
		const _count = this.collection.commentCount;
		const totalPageCount = _count ? Math.ceil(_count/this.pageSize) : 0;//this.collection.commentCount;

		return (
		<table style={{width:'100%'}}>
			<tbody>
			<tr>
				<td style={{textAlign: 'left'}}>
					<PaginatorApp
						maxCount={totalPageCount}
						onChange={this.onPageChange}
					/>
				</td>
				<td style={{textAlign: 'right', paddingRight:'5px'}}>
					Total Comments : {this.collection.models.length} of {_count}
				</td>
			</tr>
			</tbody>
		</table>
		);
	}

	renderHeaders() {
		return (
				<div className="table-row header">
					<div className="table-cell">Date</div>
					<div className="table-cell">Comment</div>
					<div className="table-cell">trader Id</div>
					<div className="table-cell">trader Name</div>
				</div>
		);
	}

	renderRows() {
		if (this.collection.models.length === 0){
			return (
				<div className="table-row">
					<div className="table-cell">No messages for this customer.</div>
				</div>
			);
		}

		const comments = this.collection.models.map( (comment, index) => {
			const {date, details, traderId, traderName} = comment.attributes;
			const displayDate = moment(date).format('DD-MM-YYYY');

			return (
				<div key={index} className="table-row">
					<div className="table-cell">{displayDate}</div>
					<div className="table-cell">{details}</div>
					<div className="table-cell">{traderId}</div>
					<div className="table-cell">{traderName}</div>
				</div>
			);
		});

		return comments;
	}
}

AccountTraderComments.displayName = 'AccountTraderComments';

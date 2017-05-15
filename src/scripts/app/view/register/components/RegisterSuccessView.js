import Component from 'common/system/react/BackboneComponent';
import model from 'common/model/SessionModel.js';
//import PixelTracking from 'sportsbook/components/tracking/PixelTracking';
//import DoubleClick from 'sportsbook/components/tracking/DoubleClick';
import {classNames as cx} from 'common/util/ReactUtil.js';
import service from 'common/service/SessionService.js';

export default class RegisterSuccessView extends Component {
    constructor(props) {
        super(props);

		let welcomeText;
		if(this.props.model.get('brandId') === 3){
			welcomeText = 'Redzone';
		}else if(this.props.model.get('brandId') === 1){
			welcomeText = 'Welcome to Baja lottery site';
		}else{
			welcomeText = 'Bet On Brazil';
		}
        this.state = {
			welcomeTo: welcomeText
		};

		localStorage.setItem('returningVisit', true);
		//var session = window.location.query.sessionToken;
		//if(session){
			/*service.singleSignOnLogin(true, session)
				.then((resp) => {
					App.session.execute('storeSession', resp.Login);
				})*/
		//}
    }

    handleBtnClick(route) {
        App.navigate(route);
    }

    componentWillMount () {
        //let attributes = this.props.model.attributes;
        //model.login(attributes.username, attributes.password, App.Config.siteId, App.Config.env.BrandId);
    }

	render() {
		return (
			<div className="grid">
				<div className={cx("c-register-view--success", 'col-3_lg-4_md-6_xs-12')}>

					<h2 className="c-register-view--success__title"><i className="c-register-view--success__icon icon-check"></i>Success!</h2>

					<p><strong>Welcome to {this.state.welcomeTo}</strong></p>
					<p>You are now ready to start playing and winning. Good luck and have fun!</p>

					<hr/>
					<p><strong>Important Notice:</strong></p>
					<p>We are required by law to verify your registration data with official documents. You can make it very quick and precise on the document upload tool. See more about the identification policy here. Any data corrections can be made directly under your personal area 'My Account'.</p>
				</div>
			</div>
		);
	}
}

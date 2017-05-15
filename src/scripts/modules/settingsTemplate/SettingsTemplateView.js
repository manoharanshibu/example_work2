/**
 * Created by mboninsegni on 08/10/2015.
 */
import model from 'backoffice/model/SettingsTemplateModel';
import ComboBox from 'backoffice/components/elements/ComboBox';
import SplitPane from 'backoffice/components/pane/SplitPane';
import SaveButton from 'backoffice/components/elements/SaveButton';
import TreeMenu from 'backoffice/components/controls/TreeMenu';

export default class SettingsTemplateView extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			currentTemplatesType: null,
			currentTemplate: {
				name: "FirstTemplate",
				id: "0000",
				settings: [	{ category: '1',
					name: '1',
					value: '1'
				},
					{ category: '2',
						name: '2',
						value: '2'
					},
					{ category: '3',
						name: '3',
						value: '3'
					}],

				templateTypes: model.getSettingTemplatesTypes(),
				//templateTypes: [{num:1},{num:2},{num:3},{num:4},{num:5}],
				newTemplateName: null,
				typeName: null
			},
			allTemplateTypes: model.getSettingTemplatesTypes(),
			templates: (this.currentTemplatesType !== null ? model.getTemplatesForType(this.currentTemplatesType): [])


		}
	}
		/*events: {
		'change select': 'dropdownTypeChanger',
		'click  .nodeName' : 'onTemplateClick',
		'click #createNewTemplate' : 'onCreateNewTemplate',
		'click  #saveSettingsTemplate' : 'onSaveSettings',
		'click #removeSettingsTemplate' : 'removeTemplateSettings',
		'click #editTemplatesType' : 'editTemplateTypes',
		'click #addTemplatesTypes' : 'addTemplatesTypes',

		},*/

	componentDidMount(){

		_.bindAll(this, 'dropdownTypeChanger', 'onTemplateClick', 'onCreateNewTemplate', 'onSaveSettings', 'editTemplateTypes', 'addTemplatesTypes', 'onRemoveConfirm');
		this.listenTo(model, 'change:settingsTemplatesTypesReceived', this.forceUpdate);
	}

	/**
	 * When selects a type from the dropbox we get the settings and properties from that Type of SettingsTemplate
	 * The render() will update the list of templates that has that type of template
	 * @param e
	 */
	dropdownTypeChanger(e) {
		this.setState({currentTemplate: null});
		this.setState({currentTemplatesType: model.getSettingKeysForType(($(e.currentTarget).val()))});
		//this.forceUpdate();
	}

	/**
	 *  Calls the popup with an empty Settings Template Type in order to add the attributes and save it
	 * @param e
	 */
	addTemplatesTypes(e) {
		this.setState({currentTemplatesType: model.createNewTemplateType()});
		this.editTemplateTypes(e);
		//model.commands.execute('command:getSettingTemplateTypes');
		App.bus.request('command:getSettingTemplateTypes');

		//this.forceUpdate();
	}

	/**
	 * Popup with the attributes from the template in order to update it
	 * @param e
	 */
	editTemplateTypes (e) {
		e.preventDefault();

		let buttons = [
			{label: 'Cancel', className: 'cancel', id: 'btnCancel'},
			{label: 'Save', className: 'save', id: 'btnSave'}
		];

		let options = {
			selectedTemplatesType: this.state.currentTemplatesType
		};

		App.bus.trigger('popup:view', {
			view: 'editSettingsTemplatesTypePopup',
			options: options,
			buttons: buttons,
			cancelEl: '#btnCancel',
			submitEl: '#btnSave',
			clickOutsideEnabled: false
		});

	}

	/**
	 * @param e
	 */
	onTemplateClick(e) {
		e.preventDefault();
		let templateId =  $(e.currentTarget).closest('li').data('templateid');
		this.setState({currentTemplate: model.getTemplateForId(templateId)});

		//this.forceUpdate();
	}

	/**
	 * @param e
	 */
	onCreateNewTemplate() {
		var that=this;
		if(_.isUndefined(this.state.currentTemplatesType.id)){
			that.setState({currentTemplatesType: model.getTemplateTypeByType(that.state.currentTemplatesType.type)});
		}
		this.setState({currentTemplate: model.createNewTemplate(this.state.currentTemplatesType.type, this.state.currentTemplatesType.id)});
		//this.forceUpdate();
	}

	/**
	 * @param e
	 */
	onCreateNewSetting() {
		this.setState({currentTemplatesType: model.updateSettings(this.state.currentTemplatesType.id)});
		//this.forceUpdate();

	}

	/**
	 * @param e
	 */
	onSaveSettings() {
		let curTemp = this.state.currentTemplate;
		curTemp.name = this.state.newTemplateName;
		curTemp.settings = this.bindValues();
		this.setState({currentTemplate: curTemp});
		model.saveNewTemplate(this.state.currentTemplate);

	}

	removeTemplateSettings() {
		App.bus.trigger('popup:alert', {
			content: `Are you sure you wish to remove the template ${this.state.currentTemplate.name} ?`,
			confirm: {label: 'Yes', callback: this.onRemoveConfirm, data: {templateId: this.state.currentTemplate.id, type: this.state.currentTemplate.type}},
			cancel: {label: 'No'}
		});
	}

	/**
	 * @param data
	 */
	onRemoveConfirm(data) {
		var promise = model.removeSettingsTemplate(data.templateId, data.type);
		// if a promise has been returned, attach the done/fail resolvers
		if (promise) {
			promise.done(function(resp){
				that.trigger('show:feedback', 'Template successfully removed', true, 2000);
			});
			promise.fail(function(){
				that.trigger('show:feedback', 'Template failed to be removed', false, 2000);
			});
		}

		// and resets the ui
		//this.forceUpdate();
	}

	/**
	 * Bind the values from the table inputs to
	 * their corresponding model attributes
	 */
	bindValues() {

		var rows = $('#settingsTable').find('div.row');

		_.each(rows, function (r) {

			var settingName = $(r).find('input.settingValue').data('settingname');

			var settingUpdated = _.findWhere(this.state.currentTemplate.settings, {name: settingName});
			var settingValue = $(r).find('input.settingValue').val();
			settingUpdated.value = settingValue;

		}, this);

		return this.state.currentTemplate.settings;
	}

	/**
	 * Bind the values from the table inputs to
	 * their corresponding model attributes
	 */
	bindSettingKeys() {
		/*template.settings = [{
		 category: '',
		 name: '',
		 value: ''
		 }],*/
		var rows = $('#settingsKeysTable').find('div.row')
		var settingsUpdated = [];

		if(rows.length > 0) {
			_.each(rows, function (r) {

				var settingName = $(r).find('input.settingKeyName').val();

				var newSetting = {'category': '', 'name': settingName, 'value': ''};
				settingsUpdated.push(newSetting);

			}, this);
		}
		else{
			settingsUpdated.push({'category': '', 'name': '', 'value': ''});
		}

		return settingsUpdated;
	}

	getSettingsValues(setting){
		return(
				<div className="table-row row" >
					<div className="table-cell" style={{width: '100px'}}>
						{setting.name}
					</div>
					<div className="table-cell" style={{width: '100px'}}>
						<input className="settingValue" data-settingname={setting.name} value={setting.value}/>
					</div>
					<div className="table-cell" style={{width: '100px'}}>
	view					{setting.category}
					</div>
				</div>
			);

	}
	getTemplateValues(){

		return(
			<div className="scrollBox" id="templates-list">
				<ol className="ui-selectable">
						<li className="ui-widget-content ui-selectee" data-templateId={this.state.templates.id} >
							<a className="nodeName">{this.state.templates.name}</a>
						</li>
				</ol>
			</div>

			);
	}


	render(){

		let addOption = (val, index) => (<option key={index} value={val}>{val}</option>),
			tempTypes = this.state.templateTypes;
			console.log(tempTypes);

		return (
			<div className="box">
				<div style={{minHeight: '700px', overflowX :'scroll'}}>
					<SplitPane split="vertical">
						<div className="col-left">
							<h2>Select Type</h2>
							<br/>
							<div className="form-body">
								<div className="form-row">
									<div className="inline-form-elements">
											<ComboBox
												ref="typeSelector"
												style={{width:'90%', margin: '0 5% 5% 5%'}}
												placeHolder={this.props.templateTypePlaceholder}
												//value={}
												//onChange={}
												>
												{/*{this.tempTypes.map(addOption)}*/}
											</ComboBox>
									</div>
								</div>
							</div>
							<div className="inline-form-elements" style={{width:'90%', margin: '0 5% 5% 5%'}}>

							</div>
							<div className="inline-form-elements" style={{width:'90%', margin: '0 5% 5% 5%'}}>
								<a ref="editTemplatesType"
								   className="btn green filled"
								   href="javascript:void(0)"
								   style={{width:'40%',maxWidth: '200', minWidth:'150', margin: '0 5% 5% 5%'}}>
								   Edit Templates Type</a>
								<a ref="addTemplatesTypes"
								   className="btn blue filled"
								   href="javascript:void(0)"
								   style={{width:'40%', maxWidth: '200', minWidth:'150', margin: '0 5% 5% 5%'}}>
								   Add Templates Type</a>
							</div>
							<h2>Templates</h2>
							<br/>
								{this.getTemplateValues()}
							<div className="inline-form-elements">
								<a ref="createNewTemplate"
								   className="btn blue filled"
								   href="javascript:void(0)"
								   style={{width:'40%', maxWidth: '200', minWidth:'110', margin: '0 5% 5% 5%'}}>
								   Add Template</a>
							</div>
						</div>
						<div className="col-right">
							<h2>Type Name</h2>
							<div className="inline-form-elements"style={{width:'90%', margin: '0 5% 5% 5%'}}>
								<input 	className="templateName"
										value={this.state.currentTemplate.name}
										style={{width:'100%', marginTop: '5%'}} />
							</div>
							<h2>Settings Values</h2>
							<div className="table grid" ref="settingsTable">
								<div className="table-row header larger">
										<div className="table-cell">
											Setting Name
										</div>
										<div className="table-cell">
											Setting Value
										</div>
										<div className="table-cell">
											Setting Category
										</div>
								</div>
								{/*Start fake data*/}
								<div className="table-row">
										<div className="table-cell center">
											Setting Name
										</div>
										<div className="table-cell center">
											Setting Value
										</div>
										<div className="table-cell center">
											Setting Category
										</div>
									</div>
									<div className="table-row">
										<div className="table-cell center">
											Setting Name
										</div>
										<div className="table-cell center">
											Setting Value
										</div>
										<div className="table-cell center">
											Setting Category
										</div>
									</div>
								{/*End fake data*/}
							</div>
							<div className="inline-form-elements" style={{width:'90%', margin: '5%'}}>
										<a id="removeSettingsTemplate"
										   className="btn red filled"
										   href="javascript:void(0)"
										   style={{width:'40%',maxWidth: '200', minWidth:'150', margin: '0 5% 5% 5%'}}>
										   Remove Template</a>
										<a id="saveSettingsTemplate"
										   className="btn green filled"
										   href="javascript:void(0)"
										   style={{width:'40%',maxWidth: '200', minWidth:'150', margin: '0 5% 5% 5%'}}>
										   Save Template</a>
							</div>
						</div>
					</SplitPane>
				</div>
			</div>
			);
	}
}


SettingsTemplateView.defaultProps =
{
	templateTypePlaceholder: "Select Type"

};

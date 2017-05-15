import model from 'backoffice/model/SettingsTemplateModel';
import Popup from 'common/view/popup/Popup';
import TextInput from 'backoffice/components/elements/TextInput';
import SaveButton from 'backoffice/components/elements/SaveButton';



export default class EditSettingsTemplatesTypePopup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedTemplatesType: null,
			typename: ''

        }

    }

        // onRender() {
        //     this.delegateEvents();
        // }

        /**
         * @returns {{accountId: *}}
         */


        ComponentDidMount(options) {
            this.setState({typeName: ReactDOM.findDOMNode(this.refs.typeName)});
            this.setState({typeDescription: ReactDOM.findDOMNode(this.refs.typeDescription)});
            _.bindAll(this, 'beforeSubmit', 'templateHelpers', 'onRender');
        }

        beforeSubmit(e){
			let selectedTemplateType = this.state.selectedTemplatesType;
			let typeNameInput = this.refs.typeName;
			selectedTemplateType.type =  typeNameInput.value;
			let typeDescriptionInput = this.refs.typeDescription;
			selectedTemplateType.name =  typeDescriptionInput.value;
			selectedTemplateType.settings = this.bindSettingKeys();
			this.setState({selectedTemplatesType: selectedTemplateType});

            model.saveNewTemplateType(this.state.selectedTemplatesType);
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
            var rowsKeys = $('div').find('div.settingsClass');
            var settingsUpdated = [];

            _.each(rowsKeys, function (r) {
				let settingKeyName = $(r).refs.settingKeyName;
				let settingName = settingKeyName.value;
				let settingCat = $(r).refs.settingCategory;
                let settingCategory = settingCat.value;

                var newSetting = {'category': settingCategory, 'name': settingName, 'value': ''};
                settingsUpdated.push(newSetting);

            }, this);

            return settingsUpdated;
        }


        /**
         * @param e
		 * THIS IS NOW ACTUAL THE SAME METHOD AS beforeSubmit(e), so I Call it instead
         */
        onCreateNewSetting(e) {
			return beforeSubmit(e);
           /*// this.selectedTemplatesType = this.settingsModel.updateSettings(this.currentTemplatesType.id);
			let selectedTemplateType = this.state.selectedTemplatesType;
			let typeNameInput = this.refs.typeName;
			selectedTemplateType.type =  typeNameInput.value;
			let typeDescriptionInput = this.refs.typeDescription;
			selectedTemplateType.name =  typeDescriptionInput.value;


			selectedTemplateType.settings = this.bindSettingKeys();
            let newSetting = {'category':'','name':'',value:''};
			this.setState({selectedTemplatesType: selectedTemplateType});

			model.saveNewTemplateType(this.state.selectedTemplatesType);
            //this.forceUpdate();*/

        }

        render() {

            return (
                <Popup title={this.props.popupTitle}>
                    <form method="post" action="">
                        <div className="vertical-form">
                            <div className="table toolbar">
                                <div className="table-row">
                                    <div className="table-cell">
                                        <div className="inline-form-elements">
                                            <strong>Setting Name</strong>
                                        </div>
                                    </div>
                                    <div className="table-cell">
                                        <div className="inline-form-elements">
                                             <TextInput ref="typeName"
                                                        label="Type"
                                                        placeholder="Type Name"
                                                        valueLink={this.bindTo(this.state.selectedTemplatesType, 'type')}
                                                        focus="true"/>
                                        </div>
                                    </div>
                                    <div className="table-cell">
                                        <div className="inline-form-elements">
                                            <TextInput  ref="typeDescription"
                                                        label="Name"
                                                        placeholder="Type Description"
                                                        valueLink={this.bindTo(this.state.selectedTemplatesType, 'name')} />
                                        </div>
                                    </div>
                                    <div className="table-cell">
                                        <div className="inline-form-elements">
                                             <label>Setting Category</label>
                                        </div>
                                    </div>

                                    {_.each(this.state.selectedTemplatesType.settings, getRows(this))}

                                    <div ref="template-names-buttons" className="inline-form-elements">
                                        <SaveButton text="Add Setting"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </Popup>
            );
        }

        getRows(settingK){
            if(this.state.selectedTemplatesType.settings.length > 0){
                return (
						<div classname="settingsClass">
                            <div className="table-cell">
                                <div className="inline-form-elements">
                                    <TextInput refs="settingKeyName" valueLink={this.bindTo(settingK, 'name')} />
                                </div>
                            </div>
                            <div className="table-cell">
                                <div className="inline-form-elements">
                                   <TextInput ref={(c) => this._input = c} valueLink={this.bindTo(settingK, 'category')} />
                                </div>
                            </div>
						</div>
                );
            }
        }

};

EditSettingsTemplatesTypePopup.defaultProps = {
    popupTitle: "Edit Settings Templates Type"

};


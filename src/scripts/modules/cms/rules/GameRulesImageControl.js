import {notify, errorPopup} from 'common/util/PopupUtil.js';
import Component from 'common/system/react/BackboneComponent';
import TextInput from 'backoffice/components/elements/TextInput';
import TableRowWrapper from 'backoffice/components/TableRowWrapper';
import ComboBox from 'backoffice/components/elements/ComboBox';
import FileSelector from 'backoffice/components/FileSelector';
import service from 'backoffice/service/BackofficeRestfulService';
import Loader from 'app/view/Loader';

export default class GameRulesImageControl extends Component {
    constructor(props) {
        super(props);
        this.state = {
            missingFiles: '',
            verified: 'pending',
            showImagesPreview: false,
            uploadingImages: false,
            lastUploadAttempt: 0
        };

        this.resetState = ::this.resetState;
    }

    componentWillMount(){
        this.props.model.on('change:imageUrl', this.resetState);
    }

    componentWillUnmount(){
        this.props.model.off('change:imageUrl', this.resetState);
    }

    resetState(){
        this.setState({ verified: 'pending' } );
    }

    onImageUpload(event){
        const files = event.currentTarget.files;

        if (files.length){
            let data = new window.FormData();

            //not the best solution, need to change the DomainResolver
            const bucket = App.Urls.bucketName.replace(App.Urls.s3,'');
            const s3 = bucket.replace(/^\/|\/$/g, '').split('/');

            const bucketName = s3[0];
            const folderName = s3[1];

            let sizeError = false;

            // This is to help ensure different image sets have different image
            // base names, so that the images for one promotion never get
            // overwritten by another's
            const imageNamePrefix = this.props.model.get('gameName');

            data.append('bucketName', bucketName);

            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                if (file.size > 5242880){
                    sizeError = true;
                    break;
                }

                const keyName = `${folderName}/${imageNamePrefix}${file.name}`;

                data.append('file', file);
                data.append('keyName', keyName);
            }

            if (sizeError){
                errorPopup('At least one of your files exceeds the maximum supported size of 5Mb. Your files were NOT uploaded.');
                return;
            }

            this.setState({uploadingImages: true});
            service.s3Upload(data)
                .then( this.onImageUploadSuccess.bind(this, files) )
                .catch( this.onImageUploadError.bind(this, files) );
        }
    }

    onImageUploadSuccess(files){
        const imageNamePrefix = this.props.model.get('gameName'),
              numImages = files.length,
              now = (new Date()).getTime();

        let images = '',
            message = '';

        _.map(files, (file, ind) => {
            let separator = ind === 0 ? '' : ',';
            images += `${separator}${imageNamePrefix}${file.name}`;
        });

        this.setState({
            uploadingImages: false,
            lastUploadAttempt: now
        });
        this.props.model.set('imageUrl', images);

        message = `Your ${numImages} images have been successfully uploaded`;

        if (numImages === 1){
            message = 'Your image has been succesfully uploaded';
        }

        // If the onSave prop is available we understand that it needs to be
        // used to save the promo as soon as any images have been uploaded
        // This helps not losing track of the name given to already uploaded
        // images
        if (this.props.onSave){
            this.props.onSave();
        }

        notify('Success', message);
    }

    onImageUploadError(files, resp){
        this.setState({uploadingImages: false});
        // Somehow it fails, when it shouldn't
        // oh my
        if (resp.status === 200){
            this.onImageUploadSuccess(files);
            return;
        }
        errorPopup('There has been an error uploading your image');
    }

    render(){
        return (
            <div className="table">
                <div className="table-row">
                    <div className="table-cell" style={{padding: 0, borderBottom: 'none'}}>
                        <div className="table no-border-bottom">
                            {this.renderRow()}
                        </div>
                    </div>
                </div>
                {this.renderUploadAdvice()}
                <div className="table-row">
                    {this.renderLoader()}
                </div>
                <div className="table-row">
                    {this.renderImagesPreview()}
                </div>
            </div>
        );
    }

    renderRow() {
        return (
            <div className="table-row">
                <div className="table-cell" style={{width: '50%', borderBottom: 'none'}}>
                    <div className="table no-border-bottom">
                        <TableRowWrapper>
                            <div className="inline-form-elementns">
                                <FileSelector
                                    classes="btn blue filled fileUpload"
                                    style={{
                                        display: 'inline-block',
                                        marginRight: '10px'
                                    }}
                                    multiple
                                    accept=".jpg"
                                    uploadButtonLabel="Upload images"
                                    onSelected={::this.onImageUpload} />
                            </div>
                        </TableRowWrapper>
                    </div>
                </div>
            </div>
        );
    }

    renderUploadAdvice() {
        if (this.state.uploadingImages){
            return null;
        }

        const imageUrl = this.props.model.get('imageUrl');

        // If there is no imageUrl yet, it means that no images have been uplaoded
        // so far, in which case we don't need this clarification.
        if (!imageUrl){
            return null;
        }

        return (
            <TableRowWrapper>
                <div className="inline-form-elements">
                    <p>Click on <strong>"Upload images"</strong> to upload missing images or replace existing ones.</p>
                </div>
            </TableRowWrapper>

        );
    }

    renderLoader(){
        if (!this.state.uploadingImages){
            return null;
        }

        return <Loader />;
    }

    renderImagesPreview(){
        if (this.state.uploadingImages){
            return null;
        }

        const imageUrl = this.props.model.get('imageUrl');

        let images = [],
            allImages = {};

        if (!imageUrl) {
            return null;
        }

        images = imageUrl.split(',');

        allImages = images.map((image, ind) => {
            return this.renderImage(image, ind);
        });

        return allImages;

    }

    renderImage(image, ind) {
        const blankImg = `${App.Urls.bucketName}/blank.jpg`;
        const imagePath = `${App.Urls.bucketName}/${image}`;
        const style = {
            padding: 5,
            display: 'inline-block',
            overflow: 'hidden'
        };

        return (
            <a href={imagePath} target='_blank' style={style} key={ind}>
                <img height={255} src={imagePath} />
                <div style={{fontSize: 10, whiteSpace: 'no-wrap'}}>{imagePath}</div>
            </a>
        );
    }
}


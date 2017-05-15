import {notify, errorPopup} from 'common/util/PopupUtil.js';
import Component from 'common/system/react/BackboneComponent';
import TextInput from 'backoffice/components/elements/TextInput';
import TableRowWrapper from 'backoffice/components/TableRowWrapper';
import ComboBox from 'backoffice/components/elements/ComboBox';
import FileSelector from 'backoffice/components/FileSelector';
import service from 'backoffice/service/BackofficeRestfulService';
import PromoImagesPreview from './PromoImagesPreview';
import Loader from 'app/view/Loader';

export default class PromotionsImageControl extends Component {
	constructor(props) {
		super(props);
		this.state = {
			missingFiles: '',
			verified: 'pending',
			showImagesPreview: false,
			uploadingImages: false,
			lastUploadAttempt: 0
		};

		this.sliderResolutions = {
			"slider_TDLHU_3-1@3": 3200 /*4060*/,
			"slider_TDLHU_3-1@2": 2160	/*2700*/,
			"slider_TDLHU_3-1@1": 1080 /*1350*/,
			"slider_P_16-9@3": 2880 /*3600*/,
			"slider_P_16-9@2": 1920, /*2400*/
			"slider_P_16-9@1": 1200 /*1200*/,
			"slider_M_16-9@3": 1920,
			"slider_M_16-9@2": 1280,
			"slider_M_16-9@1": 640,
			"slider_H_16-9@3": 2880,
			"slider_H_16-9@2": 1920,
			"slider_H_16-9@1": 960};

		this.boxResolutions = {
			"box_TDLHU_16-9@3": 1300,
			"box_TDLHU_16-9@2": 866,
			"box_TDLHU_16-9@1": 433,
			"box_P_16-9@3": 1730,
			"box_P_16-9@2": 1156,
			"box_P_16-9@1": 578,
			"box_M_16-9@3": 1920,
			"box_M_16-9@2": 1280,
			"box_M_16-9@1": 640,
			"box_H_16-9@3": 2880,
			"box_H_16-9@2": 1920,
			"box_H_16-9@1": 960};

		this.resetState = ::this.resetState;
		this.checkAllImagesPresence = ::this.checkAllImagesPresence;
	}

	componentWillMount(){
		this.checkAllImagesPresence();
		this.props.model.on('change:imageURL', this.resetState);
		this.props.model.on('change:usedin', this.checkAllImagesPresence);
	}

	componentWillUnmount(){
		this.props.model.off('change:imageURL', this.resetState);
		this.props.model.off('change:usedin', this.checkAllImagesPresence);
	}

	resetState(){
		this.setState({ verified: 'pending' } );
	}

	onSlideImgSelected(event)
	{
		const files = event.currentTarget.files;
		const file = files[0];
		this.setState({uploadingImages: true});
		if(file)
			this.generateImages(file, true);
	}

	onBoxImgSelected(event)
	{
		const files = event.currentTarget.files;
		const file = files[0];
		var that = this;
		this.setState({uploadingImages: true});

		setTimeout(function() {
			that.generateImages(file, false)
		}, 500);
	}

    generateImages(file, slider) {
        const reader = new FileReader();

        const imageNamePrefix = this.props.model.get('imageNamePrefix');
        const baseName = this.props.model.get('imageURL') || file.name;

        // I *think* the following regex matches...
        //    ([^-]*)  ... any non-hyphen characters (group 1)
        //    (?:.*)   ... followed by any characters, including hyphens
        //    \.       ... followed by a dot
        //    (.*)     ... and all remaining characters (group 2)
        const re = /([^-]*)(?:.*)\.(.*)/;
        const matched = baseName.match(re);
        const prehypenName = matched[1];
        const extension = matched[2];

        const isNew = !this.props.model.get('imageURL');

        if (isNew) {
            const baseImageName = `${imageNamePrefix}.${extension}`;
            this.props.model.set('imageURL', baseImageName);
        }

        reader.onload = (e) => {
            const src = e.target.result;
            const fileNames = this.getRequiredImageFilenames(true);
            const results = [];
			const count = fileNames.length;
            const process = () => {
                const filename = fileNames.shift();
                const name = isNew ? `${imageNamePrefix}-${filename}.jpg` : `${prehypenName}-${filename}.jpg`;

                const maxWidth = slider ? this.sliderResolutions[filename] : this.boxResolutions[filename]
                if (maxWidth) {
                    this.getDownScaleImage(src, name, maxWidth, results, count)
                }
				if (fileNames.length > 0) {
					setTimeout(process, 100);
				}
            };
			process();
        }

        reader.readAsDataURL(file);
    }

	getDownScaleImage(src, name,  maxWidth, results)
	{
		var image = new Image();
		image.src = src;
		image.onload = this.onDownScaleImageLoad.bind(this, name, maxWidth, image, results);
	}

	onDownScaleImageLoad(name,  maxWidth, image, results) {
		var blobBin = atob(this.downScaleImage(image, image.width > maxWidth ? maxWidth : image.width).toDataURL('image/jpeg').split(',')[1]);

		var array = [];
		for(var i = 0; i < blobBin.length; i++) {
			array.push(blobBin.charCodeAt(i));
		}
		results.push(new File([new Uint8Array(array)], name, {type: 'image/jpeg'}));
		if(results.length === 12) {
			const fs = _.compact(results); // remove undefined / null
			this.onImageUpload(fs);
		}
	}


	downScaleImage(img, width) {
		var tempCanvas = document.createElement('canvas');
		tempCanvas.width = img.width;
		tempCanvas.height = img.height;
		var imgCtx = tempCanvas.getContext('2d');
		imgCtx.drawImage(img, 0, 0);
		return this.downScaleCanvas(tempCanvas, img ,width);
	}

	//down scale the canvas to fit the defined with
	downScaleCanvas(cv, img, width) {
		var scale = width/img.width;
		var srcw = cv.width;
		var srch = cv.height;
		var srcB = cv.getContext('2d').getImageData(0, 0, srcw, srch).data;

		var crossX = false;
		var crossY = false;

		var tw = Math.floor(srcw * scale);
		var th = Math.floor(srch * scale);
		var sx = 0, sy = 0, sIndex = 0;
		var tx = 0, ty = 0, yIndex = 0, tIndex = 0;
		var tX = 0, tY = 0; // rounded tx, ty
		var w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0;


		var tarB = new Float32Array(3 * tw * th);
		var sR = 0, sG = 0,  sB = 0;
		for (sy = 0; sy < srch; sy++) {
			ty = sy * scale;
			tY = 0 | ty;
			yIndex = 3 * tY * tw;
			crossY = (tY != (0 | ty + scale));
			if (crossY) {
				wy = (tY + 1 - ty);
				nwy = (ty + scale - tY - 1);
			}
			for (sx = 0; sx < srcw; sx++, sIndex += 4) {
				tx = sx * scale;
				tX = 0 |  tx;
				tIndex = yIndex + tX * 3;
				crossX = (tX != (0 | tx + scale));
				if (crossX) {
					wx = (tX + 1 - tx);
					nwx = (tx + scale - tX - 1);
				}
				sR = srcB[sIndex];
				sG = srcB[sIndex + 1];
				sB = srcB[sIndex + 2];

				if (!crossX && !crossY) {
					tarB[tIndex] += sR * scale * scale;
					tarB[tIndex + 1] += sG * scale * scale;
					tarB[tIndex + 2] += sB * scale * scale;
				} else if (crossX && !crossY) {

					w = wx * scale;
					tarB[tIndex] += sR * w;
					tarB[tIndex + 1] += sG * w;
					tarB[tIndex + 2] += sB * w;

					nw = nwx * scale
					tarB[tIndex + 3] += sR * nw;
					tarB[tIndex + 4] += sG * nw;
					tarB[tIndex + 5] += sB * nw;
				} else if (crossY && !crossX) {
					w = wy * scale;

					tarB[tIndex    ] += sR * w;
					tarB[tIndex + 1] += sG * w;
					tarB[tIndex + 2] += sB * w;

					nw = nwy * scale
					tarB[tIndex + 3 * tw    ] += sR * nw;
					tarB[tIndex + 3 * tw + 1] += sG * nw;
					tarB[tIndex + 3 * tw + 2] += sB * nw;
				} else {

					w = wx * wy;
					tarB[tIndex] += sR * w;
					tarB[tIndex + 1] += sG * w;
					tarB[tIndex + 2] += sB * w;

					nw = nwx * wy;
					tarB[tIndex + 3] += sR * nw;
					tarB[tIndex + 4] += sG * nw;
					tarB[tIndex + 5] += sB * nw;

					nw = wx * nwy;
					tarB[tIndex + 3 * tw    ] += sR * nw;
					tarB[tIndex + 3 * tw + 1] += sG * nw;
					tarB[tIndex + 3 * tw + 2] += sB * nw;

					nw = nwx * nwy;
					tarB[tIndex + 3 * tw + 3] += sR * nw;
					tarB[tIndex + 3 * tw + 4] += sG * nw;
					tarB[tIndex + 3 * tw + 5] += sB * nw;
				}
			}
		}

		var resCanvas = document.createElement('canvas');
		resCanvas.width = tw;
		resCanvas.height = th;
		var resContext = resCanvas.getContext('2d');
		var imgRes = resContext.getImageData(0, 0, tw, th);
		var tByteBuffer = imgRes.data;

		var pxIndex = 0
		for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
			tByteBuffer[tIndex] = Math.ceil(tarB[sIndex]);
			tByteBuffer[tIndex + 1] = Math.ceil(tarB[sIndex + 1]);
			tByteBuffer[tIndex + 2] = Math.ceil(tarB[sIndex + 2]);
			tByteBuffer[tIndex + 3] = 255;
		}

		resContext.putImageData(imgRes, 0, 0);
		return resCanvas;
	}

	onImageUpload(files){
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
			const imageNamePrefix = this.props.model.get('imageNamePrefix');

			data.append('bucketName', bucketName);

			for (let i = 0; i < files.length; i++) {
				const file = files[i];

				if (file.size > 5242880){
					sizeError = true;
					break;
				}

				const keyName = `${folderName}/${file.name}`;

				data.append('file', file);
				data.append('keyName', keyName);
			}

			if (sizeError){
				errorPopup('At least one of your files exceeds the maximum supported size of 5Mb. Your files were NOT uploaded.');
				return;
			}

			service.s3Upload(data)
				.then( this.onImageUploadSuccess.bind(this, files) )
				.catch( this.onImageUploadError.bind(this, files) );
		}
	}

	onImageUploadSuccess(files){
		const numImages = files.length;
		const firstImage = files[0];
	/*	const imageNamePrefix = this.props.model.get('imageNamePrefix');
		const imageNameParts = firstImage.name.match(/([^-]*)(?:.*)\.(.*)/);
		const baseImageName = `${imageNamePrefix}${imageNameParts[1]}.${imageNameParts[2]}`;*/
		const now = (new Date()).getTime();

		this.setState({
			uploadingImages: false,
			lastUploadAttempt: now
		});
		//this.props.model.set('imageURL', baseImageName);

		let message = `Your ${numImages} images have been successfully uploaded`;

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
		this.checkAllImagesPresence();

		notify('Success', message);
	}

	onImageUploadError(files, resp){
		this.setState({uploadingImages: false});
		// Somehow it fails, when it shouldn't
		if (resp.status === 200){
			this.onImageUploadSuccess(files);
			return;
		}
		errorPopup('There has been an error uploading your image');
	}

	// Returns and array with the full list filenames of all the expected files
	// necessary to ensure the Promotion will work in all tilespans and
	// screen resolutions
	getRequiredImageFilenames(typeOnly=false){
		const imageUrl = this.props.model.get('imageURL');
		const fileNameParts = imageUrl.match(/(.*)(\.jpg|\.png)$/i);

		if (!fileNameParts){
			return [];
		}

		const beforeExtension = fileNameParts[1];
		const extension = fileNameParts[2];
		let filenames;


		if ( imageUrl ){
			const imagesSupported = [];

			const standaloneNameSchema = {
				widgetType: 'box',
				devices: [
					{ acronym: 'H', ratios: ['16-9'] },
					{ acronym: 'M', ratios: ['16-9'] },
					{ acronym: 'P', ratios: ['16-9'] },
					{ acronym: 'TDLHU', ratios: ['16-9'] }
				]
			};

			const sliderNameSchema = {
				widgetType: 'slider',
				devices: [
					{ acronym: 'H', ratios: ['16-9'] },
					{ acronym: 'M', ratios: ['16-9'] },
					{ acronym: 'P', ratios: ['16-9'] },
					{ acronym: 'TDLHU', ratios: ['3-1'] }
				]
			}

			// Where the Promotion is meant to be used in
			const usedin = this.props.model.get('usedin');

			switch (usedin){
				case 'standalone':
					imagesSupported.push(standaloneNameSchema);
					break;
				case 'slider':
					imagesSupported.push(sliderNameSchema);
					break;
				case 'both':
					imagesSupported.push(standaloneNameSchema);
					imagesSupported.push(sliderNameSchema);
					break;
				default:
					imagesSupported.push(standaloneNameSchema);
					imagesSupported.push(sliderNameSchema);
			}

			const variants = imagesSupported.reduce( (prev, widget) => {
				const {widgetType, devices} = widget;

				const ratiosArr = devices.map( device => {
					const {acronym, ratios} = device;
					return ratios.map( ratio => `${acronym}_${ratio}`);
				});

				const withWidgetArr = ratiosArr.map( ratioString => `${widgetType}_${ratioString}` );

				return prev.concat(withWidgetArr);
			}, []);

			const createTileSpanVariants = (variant) => {
				const tilespans = ['1', '2', '3'];
				if(typeOnly)
					return tilespans.map( tileSuffix =>
						`${variant}@${tileSuffix}` );

				return tilespans.map( tileSuffix =>
				`${beforeExtension}-${variant}@${tileSuffix}${extension}` );
			};

			// Create a flat array with a tileSpan variation for each
			// pre-existing screen size variations
			filenames = variants.reduce( (prev, curr) => {
					const tileSpans = createTileSpanVariants(curr);
					return prev.concat(tileSpans);
				}, []);
		}
		return filenames;
	}

	// Checks all necessary image alternatives for the promotion
	// (different ratios and resolutions)
	// are available for the punter client to read with expected filenames
	checkAllImagesPresence(){
		this.setState({ verified: 'checking' });
		const imageUrl = this.props.model.get('imageURL');

		if (!imageUrl){
			this.setState({ verified: 'none-uploaded' });
			return;
		}

		const filenames = this.getRequiredImageFilenames();

		// If filenames is empty, it means an error has already been triggered
		// because of a problem with the base image url
		if (!filenames) {
			this.setState({ verified: 'error' });
			return [];
		}

		const verificationPromises = filenames.map( ::this.checkOneImagePresence );

		Promise.all(verificationPromises).then( ::this.onCheckedAllImages );
	}

	onCheckedAllImages(responses){
		const missingFiles = responses.filter( resp => !!resp );
		const numMissing = missingFiles.length;

		if (numMissing){
			const filenameList = missingFiles.reduce(
				(prev, curr) => prev + decodeURIComponent(curr) + ' <br/> ',
					'Missing images: <br />');

			this.setState({
				missingFiles: filenameList,
				verified: 'fail'
			});
		} else {
			this.setState({
				missingFiles: '',
				verified: 'success'
			});
		}
	}


	// Returns a Promise that is resolved if the resource is available
	// to retrieve and rejected if not
	checkOneImagePresence(imageFilename){
		const imageUrl = this.prependCDNpath(imageFilename);

		const promise = new Promise( (resolve, reject)=>{
			const img = new Image();

			img.onload = ()=>{ resolve(); };
			img.onerror = ()=>{ resolve(imageFilename); };
			img.src = imageUrl;
		});

		return promise;
	}

	// Prepends the client-specific CDN path to the filename
	prependCDNpath(imageFilename){
		return `${App.Urls.bucketName}/${imageFilename}`;
	}

	render(){
		return (
			<div className="table no-border-bottom">
				{this.renderScopeSelector()}
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

	renderScopeSelector() {
		return (
				<TableRowWrapper>
				<div className="table-row">
					<div className="table-cell" style={{padding: 0, borderBottom: 'none'}}>
						<ComboBox label="Promotion used in"
							valueLink={this.bindTo(this.props.model, 'usedin')}
							style={{width:'150px'}} labelStyle={{verticalAlign:'middle'}}>
							<option value="both">Slider and standalone</option>
							<option value="slider">Slider only</option>
							<option value="standalone">Standalone only</option>
						</ComboBox>
					</div>
				</div>
			</TableRowWrapper>
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
									accept=".jpg"
									uploadButtonLabel="Upload Slide Image"
									onSelected={::this.onSlideImgSelected} />
								<FileSelector
									classes="btn blue filled fileUpload"
									style={{
										display: 'inline-block',
										marginRight: '10px'
									}}
									accept=".jpg"
									uploadButtonLabel="Upload Box Image"
									onSelected={::this.onBoxImgSelected} />
							</div>
						</TableRowWrapper>
					</div>
				</div>
				<div className="table-cell">
					<div className="table no-border-bottom">
						<TableRowWrapper label="Base Image URL"
							data-tip="Defines the name and location of all the necessary image files
							<br>There must be one for each possible tilespan (1,2 and 3) and<br>
							for each of those, one for each possible resolution (M, L, T and HDLU)"
							data-multiline >
							<TextInput inputStyle={{width: '100%'}}
								readOnly
								placeholder="(Background image url)"
								maxLength={255}
								valueLink={this.bindTo(this.props.model, 'imageURL')} />
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

		return (
			<TableRowWrapper>
				<div className="inline-form-elements">
					<p>Click on <strong>"Upload Slide Image"</strong> or <strong>"Upload Box Image"</strong> to select a source file and generate the images</p>
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

	renderVerificationStatus(){
		const state = this.state.verified;

		if (state === 'none-uploaded'){
			return <p style={{display: 'inline-block'}}>No images have been uploaded for this promotion</p>;
		}

		if (state === 'pending'){
			return <p style={{display: 'inline-block'}}>Checking images availabiity...</p>;
		}

		if (state === 'error'){
			return <p style={{color: 'red', display: 'inline-block'}}>
				Wrong file name format, please check the file naming convention</p>;
		}
		if (state === 'fail'){
			return <p style={{color: 'red', display: 'inline-block'}}
						data-tip={this.state.missingFiles}
						data-place="left"
						data-multiline>Some images are missing (hover for details)</p>;
		}

		return (
			<p style={{color: 'green', display: 'inline-block'}}>
				All the necessary images are available</p>
		);
	}

	renderImagesPreview(){
		if (this.state.uploadingImages){
			return null;
		}

		const imageUrl = this.props.model.get('imageURL');

		if (!imageUrl) {
			return null;
		}

		const imageFilenames = this.getRequiredImageFilenames();

		if (!imageFilenames.length){
			return null;
		}

		const imageList = imageFilenames.map( (filename) => {
			return (
				{
					filename,
					path: this.prependCDNpath(filename)
				}
			);
		});

		return <PromoImagesPreview imageList={imageList}
			lastUploadAttempt={this.state.lastUploadAttempt}/>;
	}
}

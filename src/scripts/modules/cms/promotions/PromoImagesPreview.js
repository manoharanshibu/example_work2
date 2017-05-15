import React from 'react';

export default class PromoImagesPreview extends React.Component {
	constructor(props) {
		super(props);
		// Using this.mounted until we take the time to write a cancellable
		// promise wrapper
		this.state = {show: true};
		this.mounted = false;
	}

	componentWillMount(){
		this.mounted = true;
	}

	componentWillUnmount(){
		this.mounted = false;
	}

	componentWillReceiveProps(nextProps){
		if (nextProps.lastUploadAttempt !== this.props.lastUploadAttempt){
			this.setState({show: false});
			window.setTimeout( ::this.forceRerender, 1000 );
		}
	}

	forceRerender(){
		if (this.mounted){
			this.setState({show: true});
		}
	}

	render(){
		return (
			<div style={{textAlign: 'center'}}>
				{this.renderImageList()}
			</div>
		);
	}

	renderImageList(){
		const {imageList} = this.props;
		const images = imageList.map( ::this.renderImage );
		return images;
	}


	renderImage(image, index){
		const blankImg = `${App.Urls.bucketName}/blank.jpg`;
		//date passed to ignore cache
		const imagePath = this.state.show ? image.path + "?" + (this.props.lastUploadAttempt) : blankImg;

		//TODO: Might be moved to SASS files
		const style = {
			maxWidth: 170,
			padding: 5,
			display: 'inline-block',
			overflow: 'hidden'
		};

		return (
				<a href={imagePath} target='_blank' style={style} key={index}>
					<img height={55} src={imagePath} />
					<div style={{fontSize: 10, whiteSpace: 'no-wrap'}}>{image.filename}</div>
				</a>
		);
	}

}

PromoImagesPreview.displayName = 'PromoImagesPreview';

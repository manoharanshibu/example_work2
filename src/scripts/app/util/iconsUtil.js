/**
 * Created by mboninsegni on 20/10/16.
 */
export const Tick = () =>  <i className="highlightGreen fa fa-check"></i>

export const Cross = () =>  <i className="highlightRed fa fa-close"></i>

export const CircleMarker = (props) =>  {
	const colour = _.titleize(props.colour) || 'Green'
	return <i className={`highlight${colour} fa fa-circle`}></i>
}

export const Icon = (props) =>  {
	const clickableClass = props.onClick ? 'clickable-icon' : '';
	const iconClass = `fa fa-${props.name} ${clickableClass}`;
	const styleObj = props.style || {};
	const style = Object.assign({}, styleObj, {
		color: props.color,
		fontSize: props.fontSize
	});

	return (
		<i
			style={style}
			data-tip={props['data-tip']}
			data-place={props['data-place']}
			data-type={props['data-type']}
			data-effect={props['data-effect']}
			data-multiline={props['data-multiline']}
			onClick={props.onClick}
			className={iconClass}
		></i>
	);
}

Icon.displayName = 'Icon';

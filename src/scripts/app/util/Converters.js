export const JsonToXls = (jsonObject, name) => {
	var data = typeof jsonObject != "object"
		? JSON.parse(jsonObject)
		: jsonObject;

	let xml = `<?xml version="1.0"?>\n
		<ss:Workbook xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n
		<ss:Worksheet ss:Name="${name}">\n
		<ss:Table>\n\n`;

	for (let row = 0; row < data.length; row++) {
		xml += '<ss:Row>\n';
		for (let col in data[row]) {
			xml += '  <ss:Cell>\n';
			xml += '    <ss:Data ss:Type="String">';
			xml += data[row][col] + '</ss:Data>\n';
			xml += '  </ss:Cell>\n';
		}
		xml += '</ss:Row>\n';
	}

	xml += `\n</ss:Table>\n</ss:Worksheet>\n</ss:Workbook>\n`;

	return xml;
};

export const DownloadJsonInXls = (jsonObject, name) => {
	const content = JsonToXls(jsonObject, name);
	const a = document.createElement("a");
	const blob = new Blob([content], {
		'type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	});
	a.href = window.URL.createObjectURL(blob);
	a.download = name+'.xls';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
};

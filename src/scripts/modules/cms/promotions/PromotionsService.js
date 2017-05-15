//import rethink from 'rethinkdb';

class PromotionsService extends Backbone.Model {
	constructor() {
		super();
		this.connection = null;
	}

	initialize() {
		//r.connect({host: 'localhost', port: 8080}, function(err, conn) {
		//	if (err) throw err;
		//	this.connection = conn;
		//}.bind(this));
	}

	//savePromo(data) {
	//	return new Promise((resolve, reject) => {
	//		r.table('promotions').insert(data).run(this.connection, function(err, result) {
	//			if (err) throw err;
	//			const str = JSON.stringify(result, null, 2);
	//			console.log(str);
	//			resolve(str);
	//		})
	//	})
	//}

}

let inst = new PromotionsService();
export default inst;

var safeEval = require("notevil")

class Parameterize {
	
	constructor(template, context) {
		this.template = template;
		this.context = context;
	}

	/* private */
	_attachArrayAccessor(context) {
		for (var key in context) {
			if (context.hasOwnProperty(key)) {
				
				var value = context[key];
				if (value instanceof Array) {
					context["$" + key] = this._generateArrayAccessorFunc(value);
				} 
				if (value instanceof Array || value instanceof Object){
					this._attachArrayAccessor(value);
				}
			}
		}
	}

	/* private */
	_generateArrayAccessorFunc(context) {
		return function(index) {
			return context[index];
		}
	}

	/* public */
	render() {
		this._attachArrayAccessor(this.context);
		this._render(this.template)
	}

	/* private */
	_render(template) {
		for (var key in template) {
			if (template.hasOwnProperty(key)) {
				var value = template[key];
				if (typeof value === 'string' || value instanceof String) {
					template[key] = this._replace(template[key]);
				} else {
					this._handleConstructs(template, key);
				}
			}
		}
	}

	/* private */
	_handleConstructs(template, key) {
		if (template[key]["$if"]) {
			var condition = template[key]["$if"];
			var hold = undefined;
			if (typeof condition === 'string' || condition instanceof String) {
				hold = safeEval(condition, this.context);
			} else {
				var err = new Error("invalid construct");
				err.message = "$if construct must be a string which eval can process";
				throw err;
			}

			if (hold) {
				template[key] = template[key]["$then"];
			} else {
				template[key] = template[key]["$else"];
			}
		} else {
			this._render(template[key]);
		}
	}

	/* private */
	_replace(parameterizedString) {
		var match = this.PARSEEXPR.exec(parameterizedString);
		if (match) {
			//var replacementValue = this._fetchContextPropertyValue(match[1]);
			var replacementValue = safeEval(match[1].trim(), this.context);
			return parameterizedString.replace(this.PARSEEXPR, replacementValue);
		}
		return parameterizedString;
	}

	/* private */
	_fetchContextPropertyValue(propertyString) {
		var propertyString = propertyString.trim();
		var keys = propertyString.split(".");
		var result = this.context;

		for (var key in keys) {
			if (keys.hasOwnProperty(key)) {
				result = result[keys[key]];
			}
		}

		return result;
	}

	/* public */
	gettemplate() {
		return this.template;
	}
};

//Parameterize.prototype.PARSEEXPR = /{{(\s*([\d\w]+\b.?\b)+\s*)}}/;
Parameterize.prototype.PARSEEXPR = /{{(\s*([\w\W]+)+\s*)}}/;

module.exports = Parameterize;

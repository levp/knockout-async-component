const componentName = 'load-async';

const compParam = 'comp';
const loadConfig = 'loadData';

ko.components.register(componentName, {
	viewModel: class {
		constructor(params) {
			this.isLoading = ko.observable(true);
			this.componentName = getComponentName(params);

			callComponentLoadData(this.componentName).then(data => {
				this.loadedData = data;
				this.isLoading(false);
			});
		}
	},
	template: `
		<!-- ko if: isLoading -->
		<i>Loading . . .</i>
		<!--/ko-->
		<!-- ko ifnot: isLoading -->
			<!-- ko component: {
					name: componentName,
					params: { data: loadedData }
			} --><!-- /ko -->
		<!--/ko-->
	`
});

//=============================================================================
// Helpers
//=============================================================================

function getComponentName(params) {
	if (!(compParam in params)) {
		throw makeError(Error, `Missing required param "${compParam}"`);
	}
	const componentName = params[compParam];
	if (typeof componentName !== 'string') {
		throw makeError(TypeError, `Param "${compParam}" must be a string.`);
	}
	return componentName;
}

function callComponentLoadData(componentName) {
	let dataPromise;
	ko.components.defaultLoader.getConfig(componentName, config => {
		if (!(loadConfig in config)) {
			throw makeLoadError(componentName, Error, `Property "${loadConfig}" missing from component configuration.`);
		}
		if (typeof config[loadConfig] !== 'function') {
			throw makeLoadError(componentName, Error, `Configuration property "${loadConfig}" must be a function.`);
		}
		dataPromise = config[loadConfig]();
		if (!dataPromise || typeof dataPromise.then !== 'function') {
			throw makeLoadError(componentName, TypeError, `Configuration property "${loadConfig}" function must return a promise.`);
		}
	});
	return dataPromise;
}

function makeLoadError(componentName, errorConstructor, errorMessage) {
	return makeError(errorConstructor, `Cannot load data for component "${componentName}": ${errorMessage}`);
}

function makeError(errorConstructor, errorMessage) {
	return new errorConstructor(`[Component "${componentName}"] - ${errorMessage}`)
}

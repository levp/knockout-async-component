const componentName = 'load-async';

const compParam = 'comp';
const loadConfig = 'loadData';

ko.components.register(componentName, {
	viewModel: class {
		private readonly isLoading: KnockoutObservable<boolean>;
		private readonly componentName: string;
		private loadedData?: any;

		constructor(params: any) {
			this.isLoading = ko.observable(true);
			this.componentName = getComponentName(params);

			callComponentLoadData(this.componentName).then(data => {
				this.loadedData = data;
				this.isLoading(false);
				// Avoid holding on to the loaded data.
				this.loadedData = null;
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

function getComponentName(params: any): string {
	if (!(compParam in params)) {
		throw makeError(Error, `Missing required param "${compParam}"`);
	}
	const componentName = params[compParam];
	if (typeof componentName !== 'string') {
		throw makeError(TypeError, `Param "${compParam}" must be a string.`);
	}
	return componentName;
}

function callComponentLoadData(componentName: string): Promise<any> {
	let dataPromise: Promise<any>;
	ko.components.defaultLoader.getConfig!(componentName, (config: KnockoutComponentTypes.ComponentConfig) => {
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
	return dataPromise!;
}

interface GenericErrorConstructor<T extends Error> {
	new(message: string): T;
}

function makeLoadError<T extends Error>(componentName: string, errorConstructor: GenericErrorConstructor<T>, errorMessage: string): T {
	return makeError(errorConstructor, `Cannot load data for component "${componentName}": ${errorMessage}`);
}

function makeError<T extends Error>(errorConstructor: GenericErrorConstructor<T>, errorMessage: string): T {
	return new errorConstructor(`[Component "${componentName}"] - ${errorMessage}`)
}

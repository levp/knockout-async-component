ko.components.register('data-widget', {
	loadData() {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve({value: 42});
			}, 1000);
		});
	},
	viewModel: class {
		private data: any;

		constructor(props: any) {
			this.data = props.data;
		}
	},
	template: `
		<b>WOW! <span data-bind="text: data.value"></span></b>
	`
});

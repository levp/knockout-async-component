ko.components.register('data-widget', {
	loadData() {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve({data: 42});
			}, 2000);
		});
	},
	viewModel: class {
	},
	template: `
		<b>WOW!</b>
	`
});

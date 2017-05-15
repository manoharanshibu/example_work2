Adding a new Widget
===================


To add a new widget, to be available for inclusion in page builder pages, you need to perform the following steps for `exampleWidget`:

1. Create new widget folder and main widget view

Add new folder `sportsbook-widgets/exampleWidget`
Add new widget view `sportsbook-widgets/exmapleWidget/ExampleWidget.js`
Add new widget config `sportsbook-widgets/exampleWidget/config.json`

2. Import and initialize new widget in `AvailableWidgetsCollection`

`import example from 'widgets/exampleWidget/config.json!';`
`this.addWidget(example);`

3. Add widget to widgets.json so it's included in the build

```
[
	"exampleWidget",
	"audioBoom",
	"carousel",
]
```

4. Add widget mapping to sportsbook webpack config

Open `sportsbook-app/config/config.js` and add your mapping to the `widgets` object:

	exampleWidget: `${repoRoot}/sportsbook-widgets/exampleWidget`

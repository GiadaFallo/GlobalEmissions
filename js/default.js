/***********************************************
 *********** GLOBAL VARIABLES *******************
 **********************************************/


/* All the country iso code to exclude when doing min or max */
var excluding = ["ARB", "CEB", "CSS", "EAP", "EAR", "EAS", "ECA", "ECS", "EMU", "EUU", "FCS", "HIC", "HPC", "IBD", "IBT", "IDA", "IDB", "IDX", "LAC", "LCN", "LDC", "LIC", "LMC", "LMY", "LTE", "MEA", "MIC", "MNA", "NAC", "OED", "OSS", "PRE", "PSS", "PST", "SAS", "SSA", "SSF", "SST", "TEA", "TEC", "TLA", "TMN", "TSA", "TSS", "UMC", "WLD"];


var firstYear = 1980,
	lastYear = 2011,
	selectedYear = firstYear,
	dataset = {},
	allMinMaxValues = {},
	fillings = [],
	yearsArray = allYearsInData(firstYear, lastYear),
	map,
	GEO,
	mappingCountryCodes, CHART, currentCountries = [];;

/************************************************
 *********** Functions to draws charts **********
 ************************************************/


function updateLineCharts() {

	var filling = $('#fill-options input:checked').val();
	var emissionInvolved = getInfoFromFilling(filling);

	$("#comparisonInfoTitle").remove();

	if ($("#lineChartVisualization").length === 0) {

		GEO = currentCountries[0];
		if (currentCountries.length >= 2)
			$('#comparisonChart')
			.append('<h4 id="comparisonInfoTitle"> Comparison of ' + emissionInvolved.textToShow + ' between ' + '<strong>' + currentCountries[0].name + '</strong> and <strong>' + currentCountries[1].name + '</strong></h4>');
		return drawLineCharts(true);
	}


	$('#comparisonChart').append('<h4 id="comparisonInfoTitle"> Comparison of ' + emissionInvolved.textToShow + ' between ' + '<strong>' + currentCountries[0].name + '</strong> and <strong>' + currentCountries[1].name + '</strong></h4>');


	var keys = [filling];
	var dataForLinesChart = [],
		count = 0;


	/* parse data */
	$.each(currentCountries, (i, geo) => {

		var countryDataForCharts = {
			key: geo.iso,
			type: "line",
			values: [],

		};


		$.each(dataset[geo.iso], (year, item) => {

			if (parseFloat(item[filling])) {

				countryDataForCharts.values.push({
					yValue: parseFloat(item[filling]),
					year: parseInt(year)
				});
			}
		});
		countryDataForCharts.series = count++;
		dataForLinesChart.push(countryDataForCharts);
	});


	d3.select("#lineChartVisualization")
		.attr('perserveAspectRatio', 'xMidYMid')
		.datum(dataForLinesChart)
		.call(CHART);

	CHART.update();

}

/* Draws Multi Charts */
function drawMultiCharts() {

	var filling = $('#fill-options input:checked').val();
	var emissionInvolved = getInfoFromFilling(filling);


	$("#infoTitle").remove();
	$("#lineChartVisualization").remove();
	$("#divForPieChart").remove();

	$('#spaceForGraph').append('<svg id="lineChartVisualization" width="900" height="400"></svg>');

	$('#normalChart').append('<h4 id="infoTitle">' + emissionInvolved.textToShow + ' of ' + '<strong>' + GEO.name + '</strong></h4>');

	var keys = ["TotalGHGEmissions", "Population"];
	var dataForLinesChart = [];

	/* parse data */
	$.each(keys, (i, key) => {

		var countryDataForCharts = {
			key: key,
			type: "line",
			yAxis: (key === "Population") ? 2 : 1,
			values: []
		};

		$.each(dataset[GEO.iso], (year, item) => {
			if (parseInt(item[key])) {

				countryDataForCharts.values.push({
					yValue: parseInt(item[key]),
					year: parseInt(year)
				});
			}
		});

		dataForLinesChart.push(countryDataForCharts);
	});

	nv.addGraph(function () {

		var chart = nv.models.multiChart()
			.x(function (d) {
				return d.year;
			})
			.y(function (d) {
				return d.yValue;
			})
			.color(d3.scale.category10().range());

		chart.xAxis
			.axisLabel('Year')
			.tickFormat(function (d) {
				return d;
			});

		chart.xAxis.tickValues(allYearsInData(firstYear, lastYear, 8));
		chart.yAxis1
			.axisLabel('Total GHG Emissions')
			.tickFormat((d) => {
				return convertFormat("TotalGHGEmissions", d);
			});

		chart.yAxis2
			.axisLabel('Population')
			.tickFormat((d) => {
				return convertFormat("Population", d);
			});

		d3.select('#lineChartVisualization')
			.datum(dataForLinesChart)
			.call(chart);

		nv.utils.windowResize(chart.update);

		return chart;
	});
}

/* Draws Pie Charts */
function drawPieChart(filling) {

	$("#infoTitle").remove();
	$("#lineChartVisualization").remove();
	$("#divForPieChart").remove();

	var keys = [];

	var CO2keys = [
		"Electricity/Heat", "Fugitive Emissions", "Manufacturing Construction", "Other Fuel Combustion", "Transportation"
	];
	var GHGkeys = [
		"Energy", "Industrial", "Agriculture", "Waste", "Land-Use Change and Forestry", "Bunker Fuels"
	];

	var emissionInvolved = getInfoFromFilling(filling);

	$('#spaceForGraph')
		.append('<div id="divForPieChart" style="display:flex;"><div><svg id="lineChartVisualization" width="900" height="400"></svg></div></div>');

	$('#normalChart').append('<h4 id="infoTitle">' + emissionInvolved.textToShow + ' of ' + '<strong>' + GEO.name + '</strong></h4>');

	if (filling === "GHGEmissionsPerCapita") keys = GHGkeys;
	if (filling === "CO2EmissionsPerCapita") keys = CO2keys;


	var dataForLinesChart = [];
	/* parse data */
	$.each(keys, (i, key) => {


		var countryDataForCharts = {
			key: "",
			value: ""
		};

		$.each(dataset[GEO.iso][selectedYear], (k, value) => {
			if (key === k && value && (value != 0)) {
				countryDataForCharts.key = key;
				countryDataForCharts.value = value;
			}
		});

		if (countryDataForCharts.key != "") {
			dataForLinesChart.push(countryDataForCharts);
		}

	});


	if (filling === "GHGEmissionsPerCapita" && dataForLinesChart.length != 0)

		$("#divForPieChart")
		.append("<div id='pieChartInfo'><div style='padding:15px;'><h4 style='text-align: center;'>GHG emissions by main source sectors of <strong>" + GEO.name + ' in ' + selectedYear + "</strong></h4></div></div>");


	if (filling === "CO2EmissionsPerCapita" && dataForLinesChart.length != 0)
		$("#divForPieChart")
		.append("<div id='pieChartInfo'><div style='padding:15px;'><h4 style='text-align: center;'>CO2 emissions by energy's sub-sectors of <strong>" + GEO.name + ' in ' + selectedYear + "</strong></h4></div></div>");

	var width = 450;
	var height = 450;

	nv.addGraph(function () {
		var chart = nv.models.pieChart()
			.x(function (d) {
				return d.key;
			})
			.y(function (d) {
				return d.value;
			})
			.width(width)
			.height(height)
			.showTooltipPercent(true)
			.labelType('percent');

		chart.legendPosition("top");
		chart.noData("There is no Data to display");
		chart.margin({
			"left": 5,
			"right": 5,
			"top": 5,
			"bottom": 10
		})

		d3.select("#lineChartVisualization")
			.datum(dataForLinesChart)
			.transition().duration(1200)
			.attr('width', width)
			.attr('height', height)
			.call(chart);

		return chart;
	});
}

/* Draws Line Charts */
function drawLineCharts(compare) {

	$("#infoTitle").remove();
	$("#lineChartVisualization").remove();
	$("#divForPieChart").remove();

	var filling = $('#fill-options input:checked').val();
	var emissionInvolved = getInfoFromFilling(filling);

	if (!compare) {
		$('#spaceForGraph').append('<svg id="lineChartVisualization" width="900" height="400"></svg>');
		$('#normalChart').append('<h4 id="infoTitle">' + emissionInvolved.textToShow + ' of ' + '<strong>' + GEO.name + '</strong></h4>');
	} else {
		$('#spaceForComparingCharts').append('<svg id="lineChartVisualization" width="900" height="400"></svg>');
		GEO = currentCountries[0];
	}


	switch (filling) {
	case "CO2EmissionsPerCapita":
		$("#GHGEmissions").hide();
		$("#CO2Emissions").show();
		$("#compareTotalandPerCapita").hide();
		break;
	case "GHGEmissionsPerCapita":
		$("#GHGEmissions").show();
		$("#CO2Emissions").hide();
		$("#compareTotalandPerCapita").show();
		break;
	default:
		$("#GHGEmissions").hide();
		$("#CO2Emissions").hide();
		$("#compareTotalandPerCapita").hide();
		break;
	}

	var keys = [filling];
	var dataForLinesChart = [];

	if (!compare) {

		$.each(keys, (i, key) => {

			var countryDataForCharts = {
				key: key,
				type: "line",
				values: []
			};

			$.each(dataset[GEO.iso], (year, item) => {
				if (parseFloat(item[key]))
					countryDataForCharts.values.push({
						yValue: parseFloat(item[key]),
						year: parseInt(year)
					});
			});

			dataForLinesChart.push(countryDataForCharts);
		});


	} else {
		var count = 0;

		/* parse data */
		$.each(currentCountries, (i, geo) => {

			var countryDataForCharts = {
				key: geo.iso,
				type: "line",
				values: [],

			};


			$.each(dataset[geo.iso], (year, item) => {

				if (parseFloat(item[filling])) {

					countryDataForCharts.values.push({
						yValue: parseFloat(item[filling]),
						year: parseInt(year)
					});
				}
			});
			countryDataForCharts.series = count++;
			dataForLinesChart.push(countryDataForCharts);
		});

	}
	/* parse data */

	nv.addGraph(function () {

		var chart = nv.models.lineChart()
			.useInteractiveGuideline(true)
			.interpolate("linear")
			.x(function (d) {
				return parseInt(d.year);
			})
			.y(function (d) {
				return parseFloat(d.yValue);
			})
			.color(d3.scale.category10().range())

		chart.xAxis
			.axisLabel('Year')
			.tickFormat((d) => {
				return d;
			});

		//		chart.yDomain([getMin(filling, GEO.iso), getMax(filling, GEO.iso)]);
		//		chart.forceY([getMin(filling, GEO.iso), getMax(filling, GEO.iso)]);

		chart.xAxis.tickValues(allYearsInData(firstYear, lastYear, 8));
		chart.yAxis
			.axisLabel(emissionInvolved.textToShow)
			.tickFormat((d) => {
				return convertFormat(filling, d);
			});

		chart.noData("There is no Data to display");

		chart.interactiveLayer.tooltip.contentGenerator(makeTooltip);

		d3.select("#lineChartVisualization")
			.attr('perserveAspectRatio', 'xMidYMid')
			.datum(dataForLinesChart)
			.call(chart);

		nv.utils.windowResize(chart.update);

		CHART = chart;

		return chart;
	});




	$(".nv-legend-text").text(filling);
}

function drawHistogram() {

	$("#infoTitle").remove();
	$("#lineChartVisualization").remove();
	$("#divForPieChart").remove();
	var filling = $('#fill-options input:checked').val();
	var emissionInvolved = getInfoFromFilling(filling);

	$('#spaceForComparingCharts').append('<svg id="lineChartVisualization" width="900" height="400"></svg>');

	//$('#normalChart').append('<h4 id="infoTitle">' + emissionInvolved.textToShow + ' of ' + '<strong>' + GEO.name + '</strong></h4>');

	var keys = ["GHGEmissionsPerCapita", "TotalGHGEmissions"];

	var dataForLinesChart = [{
		key: "prova",
		values: []
	}];


	/* parse data */
	$.each(keys, (j, key) => {
		for (var i in currentCountries) {
			var countryDataForCharts = {
				label: "",
				value: []
			};

			var value = dataset[currentCountries[i].iso][selectedYear][key]
			if (parseFloat(value) && (value != 0)) {
				countryDataForCharts.label = currentCountries[i].name + " " + key;
				countryDataForCharts.value = parseFloat(value);
			};

			if (countryDataForCharts.label != "") {
				dataForLinesChart[0].values.push(countryDataForCharts);
			}
		}
	});



	nv.addGraph(function () {
		var chart = nv.models.discreteBarChart()
			.x(function (d) {
				return d.label
			})
			.y(function (d) {
				return d.value
			})
			.staggerLabels(true)
			.showValues(true)
			.duration(250);

		d3.select('#lineChartVisualization')
			.datum(dataForLinesChart)
			.call(chart);

		nv.utils.windowResize(chart.update);
		return chart;

	});
}

/* Creates the choropleth map */
function mapCreation() {

	map = new Datamap({

		scope: 'world',
		element: document.getElementById('dataMapContainer'),
		projection: 'equirectangular',
		height: '900',

		data: dataset,
		responsive: true,

		fills: {
			defaultFill: (obj) => {
				var country = obj.properties.iso,
					filling = $('#fill-options input:checked').val();

				if (dataset[country] && dataset[country][selectedYear][filling + "-fillColor"] != "") {
					return dataset[country][selectedYear][filling + "-fillColor"];
				} else return '#9B9B9B';
			}
		},

		geographyConfig: {
			hideAntarctica: false,
			borderColor: '#27282A',
			highlightBorderWidth: 2,
			// does not change color on mouse hover
			highlightFillColor: (data) => {

				var filling = $('#fill-options input:checked').val();
				var color = "";

				if ($.isEmptyObject(data) || data[selectedYear][filling] == "") {
					color = '#9B9B9B';
				} else color = data[selectedYear][filling + "-fillColor"];

				return color;
			},
			// only changes border
			highlightBorderColor: '#27282A', // show desired information in tooltip		

			popupOnHover: true, //disable the popup while hovering
			highlightOnHover: true,

			popupTemplate: (geo, data) => { //this function should just return a string  

				var filling = $('#fill-options input:checked').val();

				if ($.isEmptyObject(data) || data[selectedYear][filling] == "") {
					return '<div class="popupTooltip"><strong>' + geo.properties.name + '</strong></div>';
				} else {

					var valueToShow = "";

					valueToShow = convertFormat(filling, data[selectedYear][filling]);

					return '<div class="popupTooltip"><strong>' + geo.properties.name + ' </br> ' + '</strong>' +
						filling + ': ' + '<strong>' + valueToShow + '</strong></div>';
				}

			},

		},
		done: (datamap) => {

			datamap.svg.call(d3.behavior.zoom().on("zoom", redraw));

			function redraw() {
				datamap.svg.selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
			}

			datamap.svg.selectAll('.datamaps-subunit').on('click', (geo) => {

				GEO = geo.properties;

				drawLineCharts();

				var filling = $('#fill-options input:checked').val();

				setTitleOfInfoTooltip(filling);

				$('.datamaps-subunit').attr('data-toggle', "modal");
				$('.datamaps-subunit').attr('data-target', "#graphDialogBox");

			});
		}
	});

};


/************************************************
 ****** Functions to parse and set up data ******
 ************************************************/


/** Completes the dataset:
 *	- adds the fillColor depending on emissions;
 *	- creates the corresponding legend 
 **/
function dataConfiguration(dataset) {

	$('#legendContainer').remove();
	$('#dataMapContainer').append('<div id="legendContainer" style="width: 500px;"></div>');

	var values = [],
		colors = [],
		filling = $('#fill-options input:checked').val();

	/* Choose the correct scales depending on emissions */
	switch (filling) {
	case "CO2EmissionsPerCapita":
		colors = colorbrewer.YlOrBr[9];
		break;
	case "GHGEmissionsPerCapita":
		colors = colorbrewer.PuBu[9];
		break;
	case "MethaneEmissions":
		colors = colorbrewer.Purples[6];
		break;
	case "NOEmissions":
		colors = colorbrewer.Reds[6];
		break;
	};

	getMinMaxValues();

	var paletteScale = d3.scale.quantize()
		.domain([allMinMaxValues[filling].min, allMinMaxValues[filling].max])
		.range(colors);

	for (var country in dataset) {
		for (var year in dataset[country]) {

			var value = dataset[country][year][filling];
			if (value != "") {
				dataset[country][year][filling + "-fillColor"] = paletteScale(value);
			}
		}
	};

	var legend = d3.select('#legendContainer')
		.append('ul')
		.attr('class', 'list-inline');

	var keys = legend.selectAll('li.key')
		.data(paletteScale.range());

	keys.enter().append('li')
		.attr('class', 'key')
		.style('border-top-color', String)
		.text(function (d) {
			var ranges = paletteScale.invertExtent(d);
			var text = "";

			switch (filling) {
			case "CO2EmissionsPerCapita":
				text = Math.floor(ranges[0]) + "-" + Math.floor(ranges[1]);
				break;
			case "GHGEmissionsPerCapita":
				text = Math.floor(ranges[0]) + "-" + Math.floor(ranges[1]);
				break;
			case "MethaneEmissions":
				text = numeral(ranges[0]).format('0.0a'); + "-" + numeral(ranges[1]).format('0.0a');
				break;
			case "NOEmissions":
				text = numeral(ranges[0]).format('0.0a'); + "-" + numeral(ranges[1]).format('0.0a');
				break;
			};
			return text;
		});


};
/* Parses Data obtained from csv Files and creates a dataset */
function parseData(dataObjects, mappingFile) {

	/* Adds country code to objects of CO2EmissionsEnergy */
	dataObjects["CO2EmissionsEnergy"].forEach((item) => {

		$.each(mappingFile[0], (key, value) => {

			var countryCode = value[0];
			var countryName = value[1];

			if (item["Country Name"] == countryName) {
				item = $.extend(item, {
					"Country Code": countryCode
				});
			}
			if (item["Country Name"] != undefined && item["Country Code"] == undefined && item["Country Name"].includes(countryName)) {

				item = $.extend(item, {
					"Country Code": countryCode
				});
			}
			if (item["Country Name"] != undefined && item["Country Code"] == undefined && countryName.includes(item["Country Name"])) {

				item = $.extend(item, {
					"Country Code": countryCode
				});
			}
		});
	});
	/* Adds country code to objects of SocioEconomicData */
	dataObjects["SocioEconomicData"].forEach((item) => {

		$.each(mappingFile[0], (key, value) => {

			var countryCode = value[0];
			var countryName = value[1];

			if (item["Country"] == countryName) {
				item = $.extend(item, {
					"Country Code": countryCode
				});
			};
			if (item["Country"] != undefined && item["Country Code"] == undefined && item["Country"].includes(countryName)) {

				item = $.extend(item, {
					"Country Code": countryCode
				});
			}
			if (item["Country"] != undefined && item["Country Code"] == undefined && countryName.includes(item["Country"])) {

				item = $.extend(item, {
					"Country Code": countryCode
				});
			}
		});
	});
	/* Adds country code to objects of GHGEmissionsSector */
	dataObjects["GHGEmissionsSector"].forEach((item) => {

		$.each(mappingFile[0], (key, value) => {

			var countryCode = value[0];
			var countryName = value[1];

			if (item["Country"] == countryName) {
				item = $.extend(item, {
					"Country Code": countryCode
				});
			};
			if (item["Country"] != undefined && item["Country Code"] == undefined && item["Country"].includes(countryName)) {

				item = $.extend(item, {
					"Country Code": countryCode
				});
			}
			if (item["Country"] != undefined && item["Country Code"] == undefined && countryName.includes(item["Country"])) {

				item = $.extend(item, {
					"Country Code": countryCode
				});
			}
		});
	});

	/*  CO2 emissions by sub-sectors */
	dataObjects["CO2EmissionsEnergy"].forEach(function (item) {

		var iso = item["Country Code"],
			year = item["Year"],
			ElectricityHeat = item["Electricity/Heat (CO2) (MtCO2)"],
			FugitiveEmissions = item["Fugitive Emissions (CO2) (MtCO2)"],
			ManufacturingConstruction = item["Manufacturing/Construction (CO2) (MtCO2)"],
			OtherFuelCombustion = item["Other Fuel Combustion (CO2) (MtCO2)"],
			Transportation = item["Transportation (CO2) (MtCO2)"];

		var countryData = dataset[iso] || {};

		if (($.inArray(+year, yearsArray)) >= 0) {

			countryData[year] = {
				"Electricity/Heat": ElectricityHeat,
				"Fugitive Emissions": FugitiveEmissions,
				"Manufacturing Construction": ManufacturingConstruction,
				"Other Fuel Combustion": OtherFuelCombustion,
				Transportation: Transportation,
				"CO2EmissionsPerCapita-fillColor": "",
				"GHGEmissionsPerCapita-fillColor": ""
			};
		};
		dataset[iso] = countryData;
	});
	/*SocioEconomic Data*/
	dataObjects["SocioEconomicData"].forEach(function (item) {

		var iso = item["Country Code"],
			year = item["Year"],
			Population = item["Population (People)"],
			GDPPPP = item["GDP-PPP (Million Intl$ (2011))"],
			GDPUSD = item["GDP-USD (Million US$ (2005))"];

		var countryData = {};

		if ($.inArray(+year, yearsArray) >= 0) {

			countryData[year] = {
				Population: Population,
				"GDP-PPP": GDPPPP,
				"GDP-USD": GDPUSD
			};
		};

		$.extend(dataset[iso][year], countryData[year]);
	});

	/*  GHG Emissions by sectors */
	dataObjects["GHGEmissionsSector"].forEach(function (item) {

		var iso = item["Country Code"],
			year = item["Year"],
			Energy = item["Energy (MtCO2e)"],
			Industrial = item["Industrial Processes (MtCO2e)"],
			Agriculture = item["Agriculture (MtCO2e)"],
			Waste = item["Waste (MtCO2e)"],
			LandUse = item["Land-Use Change and Forestry"],
			Bunker = item["Bunker Fuels (MtCO2)"];

		var countryData = {};

		if ($.inArray(+year, yearsArray) >= 0) {

			countryData[year] = {
				"Energy": Energy,
				"Industrial": Industrial,
				"Agriculture": Agriculture,
				"Waste": Waste,
				"Land-Use Change and Forestry": LandUse,
				"Bunker Fuels": Bunker
			};
		};

		$.extend(dataset[iso][year], countryData[year]);
	});

	/*  GHG Emissions Data */
	dataObjects["GHGEmissions"].forEach(function (item) {

		var iso = item["Country Code"];

		$.each(yearsArray, (i, year) => {

			if (!(dataset[iso])) {
				dataset[iso] = {};
			};
			var totalGHG = item[year],
				population = dataset[iso][year] ? dataset[iso][year].Population : "",
				GHGEmissionsPerCapita = (parseFloat(totalGHG) / parseInt(population)) * 1000;

			dataset[iso][year] = $.extend(dataset[iso][year] || {
				"GHGEmissionsPerCapita-fillColor": "",
				"Population": population
			}, {
				TotalGHGEmissions: totalGHG,
				GHGEmissionsPerCapita: GHGEmissionsPerCapita ? GHGEmissionsPerCapita.toFixed(3) : "",
				"GHGEmissionsPerCapita-fillColor": ""
			});
		});

	});

	/* CO2 Emissions Per Capita */
	dataObjects["CO2EmissionsPerCapita"].forEach(function (item) {

		var iso = item["Country Code"];

		$.each(yearsArray, (i, year) => {

			var CO2EmissionsPerCapita = item[year];

			if (!(dataset[iso])) {
				dataset[iso] = {};
			}

			dataset[iso][year] = $.extend(dataset[iso][year] || {
				"CO2EmissionsPerCapita-fillColor": ""
			}, {
				CO2EmissionsPerCapita: (CO2EmissionsPerCapita != "") ? (+CO2EmissionsPerCapita).toFixed(3) : "",
				"CO2EmissionsPerCapita-fillColor": ""
			});
		});
	});

	/* METHANE Emissions Data   */
	dataObjects["METHEmissionsData"].forEach(function (item) {

		var iso = item["Country Code"];

		$.each(yearsArray, (i, year) => {

			var MethaneEmissions = item[year],
				population = dataset[iso][year] ? dataset[iso][year].Population : "",
				MethEmissionsPerCapita = (parseFloat(MethaneEmissions) / parseInt(population)) * 1000;

			if (!(dataset[iso])) {
				dataset[iso] = {};
			}

			dataset[iso][year] = $.extend(dataset[iso][year] || {
				"MethaneEmissions-fillColor": ""
			}, {
				MethaneEmissions: (MethaneEmissions != "") ? (+MethaneEmissions) : "",
				MethEmissionsPerCapita: MethEmissionsPerCapita ? MethEmissionsPerCapita.toFixed(3) : "",
				"MethaneEmissions-fillColor": ""
			});
		});
	});

	/* N2O Emissions Data   */
	dataObjects["NOEmissionsData"].forEach(function (item) {

		var iso = item["Country Code"];

		$.each(yearsArray, (i, year) => {

			var NOEmissions = item[year],
				population = dataset[iso][year] ? dataset[iso][year].Population : "",
				NOEmissionsPerCapita = (parseFloat(NOEmissions) / parseInt(population)) * 1000;

			if (!(dataset[iso])) {
				dataset[iso] = {};
			}

			dataset[iso][year] = $.extend(dataset[iso][year] || {
				"NOEmissions-fillColor": ""
			}, {
				NOEmissions: (NOEmissions != "") ? (+NOEmissions) : "",
				NOEmissionsPerCapita: NOEmissionsPerCapita ? NOEmissionsPerCapita.toFixed(3) : "",
				"NOEmissions-fillColor": ""
			});
		});
	});

	$("#fill-options input").each((i, d) => {
		fillings.push($(d).val());
	});

	dataConfiguration(dataset);
	mapCreation();
}


/*** DOCUMENT READY FUNCTION ****/
$(function () {

	$("#yearSlider")
		.slider({
			ticks: allYearsInData(firstYear, lastYear, 1),
			ticks_labels: allYearsInData(firstYear, lastYear, 1)
		});

	selectedYear = $("#yearSlider").slider('getValue');


	/*** Gets all the files ***/
	$.when(
		/* 1st ** GHG emissions */
		$.get("data/API_EN.ATM.GHGT.KT.CE_DS2_en_csv_v2.csv"),
		/* 2nd ** CO2 emissions */
		$.get("data/API_EN.ATM.CO2E.PC_DS2_en_csv_v2.csv"),
		/* 3rd ** CO2 Emissions-Energy Sub-Sector*/
		$.get("data/CAIT Country CO2 Emissions-Energy Sub-Sector.csv"),
		/* 4th ** Socio-Economic Dat */
		$.get("data/CAIT Country Socio-Economic Data.csv"),
		/* 5th ** METHANE emissions */
		$.get("data/API_EN.ATM.METH.KT.CE_DS2_en_csv_v2.csv"),
		/* 6th ** N2O emissions */
		$.get("data/API_EN.ATM.NOXE.KT.CE_DS2_en_csv_v2.csv"),
		/* 7th ** mapping of country name and country iso code */
		$.get("data/MappingIsoCodeAndCountryName.json"),
		/* 8th ** GHG emissions by sectors */
		$.get("data/CAIT Country GHG Emissions.csv")


	).then(function (firstCsvFile, secondCsvFile, thirdCsvFile, fourthCsvFile, fifthCsvFile, sixthCsvFile, seventhFile, eighthCsvFile) {

		var GHGEmissions = $.csv.toObjects(firstCsvFile[0]);
		var CO2EmissionsPerCapita = $.csv.toObjects(secondCsvFile[0]);
		var CO2EmissionsEnergy = $.csv.toObjects(thirdCsvFile[0]);

		var SocioEconomicData = $.csv.toObjects(fourthCsvFile[0]);
		var METHEmissions = $.csv.toObjects(fifthCsvFile[0]);
		var NOEmissions = $.csv.toObjects(sixthCsvFile[0]);
		var GHGEmissionsSector = $.csv.toObjects(eighthCsvFile[0]);


		var allDataObtainedFromFiles = {
			GHGEmissions: GHGEmissions,
			CO2EmissionsPerCapita: CO2EmissionsPerCapita,
			CO2EmissionsEnergy: CO2EmissionsEnergy,
			SocioEconomicData: SocioEconomicData,
			METHEmissionsData: METHEmissions,
			NOEmissionsData: NOEmissions,
			GHGEmissionsSector: GHGEmissionsSector
		};

		mappingCountryCodes = seventhFile;

		parseData(allDataObtainedFromFiles, mappingCountryCodes);


		var count = 0,
			data = mappingCountryCodes[0],
			newData = [];

		var obj = {};
		for (var i in data) {
			var key = i;
			if (!excluding.includes(data[i][0])) {
				obj = {
					id: i,
					iso: data[i][0],
					text: data[i][1]
				};
				newData.push(obj);
			}
		}

		$(".js-example-basic-multiple").select2({
			data: newData,
			maximumSelectionLength: 2
		});

	});


	bindEventsOnView();


	$(".js-example-basic-multiple").on("select2:select", function (e) {

		var geo = {
			iso: e.params.data.iso,
			name: e.params.data.text
		}

		currentCountries.push(geo);
		updateLineCharts();
	});


	$(".js-example-basic-multiple").on("select2:unselect", function (e) {

		var geo = {
			iso: e.params.data.iso,
			name: e.params.data.text
		}

		currentCountries.splice(currentCountries.indexOf(geo, 1));

		$("#comparisonInfoTitle").remove();
		$("#lineChartVisualization").remove();

		updateLineCharts();
	});


});
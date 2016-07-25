/* Function to update the map */
function updateDataOnMap() {

	map.updateChoropleth(null, {
		reset: true
	});
}

/* Binds events on view */
function bindEventsOnView() {

	$(window).on('resize', () => {
		map.resize();
	});

	/* on slider change */
	$("#yearSlider")
		.on('slideStop', function () {
			selectedYear = $("#yearSlider").slider('getValue');
			updateDataOnMap();
		});


	/* Global statistics button */
	$('#globalStatistics').mouseup(() => {

		$("#infoTitle").remove();

		GEO = {
			name: "the World",
			iso: "WLD"
		}

		var title = "";
		$("#info").attr('title', title);
		$("#info").attr('data-original-title', title);
		$('[data-toggle="tooltip"]').tooltip();

		$('#GHGEmissions label').removeClass('active');
		$('#GHGEmissions input').prop('checked', false);
		$("#GHG").parent().addClass('active');
		$('#GHG').prop('checked', true);

		drawLineCharts();
	});

	/* Emissions radio buttons */
	$('#fill-options input').change(() => {
		dataConfiguration(dataset);
		updateDataOnMap();
	});

	/* radio button of GHG emisions */
	/*GHG general radio button */
	$("#GHG").change(function () {

		drawLineCharts();

		$('.datamaps-subunit').attr('data-toggle', "modal");
		$('.datamaps-subunit').attr('data-target', "#graphDialogBox");
	});
	/* population and GHG emissions compares radio button */
	$("#popAndGHG").change(function () {

		drawMultiCharts();

		$('.datamaps-subunit').attr('data-toggle', "modal");
		$('.datamaps-subunit').attr('data-target', "#graphDialogBox");

	});
	/* pie Chart radio button of GHG emisions */
	$("#pieChartGHG").change(function () {

		var filling = $('#fill-options input:checked').val();

		drawPieChart(filling);
		$('.datamaps-subunit').attr('data-toggle', "modal");
		$('.datamaps-subunit').attr('data-target', "#graphDialogBox");

	});

	/* radio button of CO2 emisions */
	/* pie Chart radio button of GHG emisions */
	$("#CO2").change(function () {

		drawLineCharts();

		$('.datamaps-subunit').attr('data-toggle', "modal");
		$('.datamaps-subunit').attr('data-target', "#graphDialogBox");
	});
	/* pie Chart radio button of CO2 emisions */
	$("#pieChart").change(function () {

		var filling = $('#fill-options input:checked').val();

		drawPieChart(filling);
		$('.datamaps-subunit').attr('data-toggle', "modal");
		$('.datamaps-subunit').attr('data-target', "#graphDialogBox");

	});

	/* radio button of CO2 emisions */
	/* pie Chart radio button of GHG emisions */
	$("#histogram").mouseup(function () {

		drawHistogram();

		$('.datamaps-subunit').attr('data-toggle', "modal");
		$('.datamaps-subunit').attr('data-target', "#graphDialogBox");
	});


	$("#graphDialogBox").on('hidden.bs.modal', function (e) {
		$("#infoTitle").remove();
		$("#lineChartVisualization").remove();
		$("#divForPieChart").remove();

	});


	$("#graphComparisonDialogBox").on('hidden.bs.modal', function () {

		$("#comparisonInfoTitle").remove();
		$("#lineChartVisualization").remove();
		//$("#divForPieChart").remove();
	});


	$("#compareButton").mouseup(function () {

		if (currentCountries.length != 0) updateLineCharts();

	});

}
/* Make the Map Tooltip */
function makeTooltip(data) {

	var emissionInvolved = getInfoFromFilling($('#fill-options input:checked').val());

	var element = "<div class='popupTooltip'><div>" + emissionInvolved.textToShow + " in <b>" + data.value + "</b></div></br>";


	if (data.series.length > 1) {
		data.series.forEach(function (s) {

			element = (s.data.yValue) ?
				element + '<div><strong>' + currentCountries[s.data.series].name + '</strong>' + ': ' + s.data.yValue + ' ' + emissionInvolved.unit + '</div></br>' : element + "";
		})

	} else {

		data.series.forEach(function (s) {

			element = (s.data.yValue) ?
				element + '<div><strong>' + s.data.yValue + '</strong>' + ' ' + emissionInvolved.unit + '</div></br>' : element + "";
		})
	}


	element = element + '</div>';

	return element;
};

/* Convert values of charts and tooltips with right formats depending on the emissions involved */
function convertFormat(type, val) {

	var valueToShow = "";

	switch (type) {
	case "CO2EmissionsPerCapita":
	case "GHGEmissionsPerCapita":
		valueToShow = (+val).toFixed(2);
		break;
	case "MethaneEmissions":
	case "NOEmissions":
	case "TotalGHGEmissions":
	case "Population":
		valueToShow = numeral(val).format('0.0a');
		break;
	};


	return valueToShow;
}

/* Gets information from emissions */
function getInfoFromFilling(filling) {

	var info = {};

	switch (filling) {

	case "CO2EmissionsPerCapita":
		info = {
			textToShow: "CO2 Emissions Per Capita",
			unit: "metric tons per capita"
		}
		break;
	case "GHGEmissionsPerCapita":
		info = {
			textToShow: "Greenhouse gas Emissions Per Capita",
			unit: "kt of CO2 equivalent per capita"
		}
		break;
	case "TotalGHGEmissions":
		info = {
			textToShow: "Total GHG Emissions",
			unit: "kt of CO2 equivalent"
		}
		break;
	case "MethaneEmissions":
		info = {
			textToShow: "Methane Emissions",
			unit: "kt of CO2 equivalent"
		}
		break;
	case "NOEmissions":
		info = {
			textToShow: "N2O Emissions",
			unit: "kt of CO2 equivalent"
		}
		break;
	}

	return info;

}

/* Return an array with all the years involved (if wanted, with a particular step) */
function allYearsInData(min, max, step) {

	step = step || 1;

	var year = min,
		i = 0,
		years = [year],
		length = max - min;

	while (i < length) {
		year = year + step;
		years.push(year);
		i = i + step;
	}
	return years;
}

/* Gets the min value of all the values (of one country or all the countries) of the particular emission (filling) */
function getMin(filling, country) {

	var min = Infinity;

	if (!country) {
		for (var country in dataset) {
			if (!excluding.includes(country)) {
				for (var year in dataset[country]) {
					var value = parseFloat(dataset[country][year][filling]);
					if (value < min) min = value;
				}
			}
		};
	} else {
		for (var year in dataset[country]) {
			var value = parseFloat(dataset[country][year][filling]);
			if (value < min) min = value;
		}
	}
	return min;
}
/* Gets the max value of all the values (of one country or all the countries) of the particular emission (filling) */
function getMax(filling, country) {

	var max = -Infinity;
	if (!country) {
		for (var country in dataset) {
			if (!excluding.includes(country)) {
				for (var year in dataset[country]) {
					var value = parseFloat(dataset[country][year][filling]);
					if (value > max) {
						max = value;
					}
				}
			}

		};
	} else {
		for (var year in dataset[country]) {
			var value = parseFloat(dataset[country][year][filling]);
			if (value > max) {

				max = value;
			}
		}
	}

	return max;
}
/* Gets all the min and max values of all kind of emissions */
function getMinMaxValues() {

	$("#fill-options input").each(function (i, d) {

		var filling = $(d).val();

		var min = getMin(filling);
		var max = getMax(filling);

		allMinMaxValues[filling] = {
			min: min,
			max: max
		};
	});
}
/* Sets the title of the Info tooltip in the dialog boxes of the charts */
function setTitleOfInfoTooltip(type) {

	var title = "";

	switch (type) {

	case "CO2EmissionsPerCapita":

		title = "CO2 emissions (metric tons per capita)";
		$("#info").attr('title', title);
		$("#info").attr('data-original-title', title);
		$('[data-toggle="tooltip"]').tooltip();

		$('#CO2Emissions label').removeClass('active');
		$('#CO2Emissions input').prop('checked', false);
		$("#CO2").parent().addClass('active');
		$('#CO2').prop('checked', true);
		break;

	case "GHGEmissionsPerCapita":

		title = "Greenhouse gas emissions per capita (kt of CO2 equivalent)";
		$("#info").attr('title', title);
		$("#info").attr('data-original-title', title);
		$('[data-toggle="tooltip"]').tooltip();

		$('#GHGEmissions label').removeClass('active');
		$('#GHGEmissions input').prop('checked', false);
		$("#GHG").parent().addClass('active');
		$('#GHG').prop('checked', true);
		break;

	case "MethaneEmissions":

		title = "Methane emissions (kt of CO2 equivalent)";
		$("#info").attr('title', title);
		$("#info").attr('data-original-title', title);
		$('[data-toggle="tooltip"]').tooltip();
		break;

	case "NOEmissions":

		title = "Nitrous oxide emissions (thousand metric tons of CO2 equivalent)";
		$("#info").attr('title', title);
		$("#info").attr('data-original-title', title);
		$('[data-toggle="tooltip"]').tooltip();
		break;
	};

}
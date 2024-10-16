
let scaleToChartInt = function(s) {
    if(s == "linear") return 0;
    if(s == "logarithmic") return 1;
    if(s == "percentage") return 2
    return 0;
}


let round = (x) => Math.round(x * 100) / 100


let slast = (series) => series.data().at(-1)


function parseStopLoss(stopLoss, price, dailyHigh = 0) {
    if (stopLoss.toString().endsWith("%")) {
        return round((1 + parseFloat(stopLoss.substring(0, stopLoss.indexOf("%"))) / 100) * price);
    } else {
        return round(parseFloat(stopLoss))
    }
}


let createReferenceChart = (id) => 
    window.LightweightCharts.createChart(document.getElementById(id), {
        autoSize: true,
        rightPriceScale: { mode: scaleToChartInt("logarithmic"), entireTextOnly: true, visible: true, minimumWidth: 80 },
        leftPriceScale: { visible: true, minimumWidth: 80 },
        timeScale: { visible: false }
    });


let createTickerChart = (id) =>
    window.LightweightCharts.createChart(document.getElementById(id), {
        autoSize: true,
        rightPriceScale: { mode: scaleToChartInt("logarithmic"), entireTextOnly: true, visible: true, minimumWidth: 80 },
        leftPriceScale: { visible: true, minimumWidth: 80 },
    });


function getCrosshairDataPoint(series, param) {
    if (!param.time) {
        return null;
    }
    const dataPoint = param.seriesData.get(series);
    return dataPoint || null;
}


function syncCrosshair(chart, series, dataPoint) {
    if (dataPoint) {
        chart.setCrosshairPosition(dataPoint.value, dataPoint.time, series);
        return;
    }
    chart.clearCrosshairPosition();
}


function createLegend(chartId, text) {
    const container = document.getElementById(chartId);

    legendHtml = `
        <div class="card p-2" style="position: absolute; left: 90px; top: 26px; z-index: 1000000; font-size: 18px; font-family: sans-serif; line-height: 18px; font-weight: 300;">
            <strong>${text}</strong>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', legendHtml);
}


function createTimeScaleMarkers(chartId) {
    const container = document.getElementById(chartId);

    html = `
        <div id="time-scale-markers" style="position: absolute; left: 80px; bottom: 30px; width: calc(100% - 80px); height: 600px;"></div>
    `;

    container.insertAdjacentHTML('afterbegin', html);
}


function drawTimeScaleMarkers(containerId, chart) {
    const markers = [
        { time: '2014-07-14', label: 'E' },
        { time: '2014-10-13', label: 'E' },
    ];

    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear previous markers

    markers.forEach(marker => {
        const coordinate = chart.timeScale().timeToCoordinate(marker.time);
        if (coordinate) {
            html = `
                <div class='earnings-box' style="position: absolute; left: ${coordinate - 15}px; bottom: 0; z-index: 10">${marker.label}</div>
            `

            if(coordinate + 90 >= container.getBoundingClientRect().left && coordinate + 95 + 90 <= container.getBoundingClientRect().right) {
                container.insertAdjacentHTML('beforeend', html)
            }
        }
    });
}


function scrollToTime(time, timeScale){
    const currentPosition = timeScale.scrollPosition();
    const currentVisibleLogicalRange = timeScale.getVisibleLogicalRange();

    const coordinate = timeScale.timeToCoordinate(time);
    const logicalIndex = timeScale.coordinateToLogical(coordinate);

    const targetPosition = currentPosition - currentVisibleLogicalRange.to + logicalIndex;
    timeScale.scrollToPosition(targetPosition, false);
}

function createCharts(tickerChart, referenceChart) {
    const chart = createTickerChart(tickerChart)
    const chartSPY = createReferenceChart(referenceChart)

    return [chart, chartSPY]
}


function setUpCharts(tickerChart, referenceChart, tickerLegend, referenceLegend) {
    const chart = createTickerChart(tickerChart)
    const chartSPY = createReferenceChart(referenceChart)

    // Set up chart series
    const tickerPrices = chart.addBarSeries();
    const spyPrices = chartSPY.addCandlestickSeries();

    tickerPrices.priceScale().applyOptions({
        scaleMargins: {
            top: 0.1, // highest point of the series will be 10% away from the top
            bottom: 0.35, // lowest point will be 40% away from the bottom
        },
    });

    // Set up chart legends
    createLegend(tickerChart, tickerLegend)
    createLegend(referenceChart, referenceLegend)

    // Set up functionality for time scale markers (not provided by default from the library) 
    createTimeScaleMarkers(tickerChart)
    drawTimeScaleMarkers('time-scale-markers', chart)

    // Set up time syncing between the two charts 
    chart.subscribeCrosshairMove(param => {
        const dataPoint = getCrosshairDataPoint(tickerPrices, param);
        syncCrosshair(chartSPY, spyPrices, dataPoint);
    });

    chartSPY.subscribeCrosshairMove(param => {
        const dataPoint = getCrosshairDataPoint(spyPrices, param);
        syncCrosshair(chart, tickerPrices, dataPoint);
    });

    chartSPY.timeScale().subscribeVisibleLogicalRangeChange(timeRange => {
        chart.timeScale().setVisibleLogicalRange(timeRange);
    });

    chart.timeScale().subscribeVisibleLogicalRangeChange(timeRange => {
        chartSPY.timeScale().setVisibleLogicalRange(timeRange);
        // When the time scale of the ticker chart changes, make sure to redraw the time scale markers
        drawTimeScaleMarkers('time-scale-markers', chart);
    });

    return [chart, chartSPY, tickerPrices, spyPrices];
}

function setUpIndicators(chart) {
    // Set up volume series
    const volumeSeries = chart.addHistogramSeries({
        priceFormat: {
            type: 'volume',
        },
        priceScaleId: 'left', // set as an overlay by setting a blank priceScaleId
    });
    volumeSeries.priceScale().applyOptions({
        // set the positioning of the volume series
        scaleMargins: {
            top: 0.7, // highest point of the series will be 70% away from the top
            bottom: 0,
        },
    });

    indicators = {
        volume50Day: chart.addLineSeries({ color: "purple", lineWidth: 2, priceScaleId: 'left', visible: true }),
        stock20Day:  chart.addLineSeries({ color: "gold", lineWidth: 3, visible: false }),
        stock10Week: chart.addLineSeries({ color: "blue", lineWidth: 2, visible: false }),
        stock30Week: chart.addLineSeries({ color: "green", lineWidth: 2, visible: false }),
        stock40Week: chart.addLineSeries({ color: "red", lineWidth: 2, visible: false }),
        stock52High: chart.addLineSeries({ color: "lightgreen", lineWidth: 3, visible: false }),
        stock52Low:  chart.addLineSeries({ color: "#FFCCCB", lineWidth: 3, visible: false }),
        stockStrength: chart.addLineSeries({ color: "#FFCCCB", lineWidth: 3, priceScaleId: '', visible: false }),
        volume: volumeSeries,
    }

    return indicators;
}
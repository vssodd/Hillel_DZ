/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 69.76405509794102, "KoPercent": 30.23594490205898};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6917944533664888, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.6486270546673232, 500, 1500, "HTTP Request | Update character"], "isController": false}, {"data": [0.6622383843967833, 500, 1500, "HTTP Request | Delete character"], "isController": false}, {"data": [0.563903743315508, 500, 1500, "HTTP Request | Get all characters"], "isController": false}, {"data": [0.6149478883333765, 500, 1500, "HTTP Request | Get character by id"], "isController": false}, {"data": [0.6611352919840406, 500, 1500, "HTTP Request | Create character"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 694908, 210112, 30.23594490205898, 48.277560482824754, 0, 1110, 14.0, 124.0, 339.0, 539.0, 1052.6006464883926, 1387.1997504689048, 122.5679158715892], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Debug Sampler", 115821, 0, 0.0, 0.04238436898317238, 0, 33, 0.0, 0.0, 0.0, 1.0, 175.79240222751426, 64.53011598269184, 0.0], "isController": false}, {"data": ["HTTP Request | Update character", 115773, 40657, 35.11785995007472, 25.514645038134862, 0, 875, 16.0, 90.0, 184.0, 340.0, 175.7470231408672, 156.54770459217713, 29.832144058691636], "isController": false}, {"data": ["HTTP Request | Delete character", 115771, 39085, 33.76061362517383, 23.67789861018752, 0, 898, 14.0, 84.0, 161.0, 291.0, 175.75759415937827, 149.1606532361427, 25.492898408714478], "isController": false}, {"data": ["HTTP Request | Get all characters", 115940, 46606, 40.19837847162325, 181.58555287217558, 1, 1110, 76.0, 592.9000000000015, 692.0, 893.9900000000016, 175.6182386069296, 674.2546157607864, 18.871240241327392], "isController": false}, {"data": ["HTTP Request | Get character by id", 115809, 44550, 38.46851280988524, 31.11043183172309, 0, 886, 20.0, 133.0, 213.0, 449.0, 175.77445549062762, 176.8164788789178, 20.139785468999012], "isController": false}, {"data": ["HTTP Request | Create character", 115794, 39214, 33.865312537782614, 27.570824049605058, 1, 865, 17.0, 95.0, 172.0, 308.9900000000016, 175.76182583195205, 167.39997792665054, 28.453671331407897], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 33: http://localhost:3001/character/${character_id}", 2358, 1.1222586049345111, 0.3393254934466145], "isController": false}, {"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 195950, 93.25978525738654, 28.197977286201915], "isController": false}, {"data": ["404/Not Found", 11804, 5.617956137678952, 1.6986421224104487], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 694908, 210112, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 195950, "404/Not Found", 11804, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 33: http://localhost:3001/character/${character_id}", 2358, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["HTTP Request | Update character", 115773, 40657, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 35483, "404/Not Found", 4388, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 33: http://localhost:3001/character/${character_id}", 786, "", "", "", ""], "isController": false}, {"data": ["HTTP Request | Delete character", 115771, 39085, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 32494, "404/Not Found", 5805, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 33: http://localhost:3001/character/${character_id}", 786, "", "", "", ""], "isController": false}, {"data": ["HTTP Request | Get all characters", 115940, 46606, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 46606, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request | Get character by id", 115809, 44550, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 42153, "404/Not Found", 1611, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 33: http://localhost:3001/character/${character_id}", 786, "", "", "", ""], "isController": false}, {"data": ["HTTP Request | Create character", 115794, 39214, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: connect", 39214, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

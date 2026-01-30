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

    var data = {"OkPercent": 53.26, "KoPercent": 46.74};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4057, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.351, 500, 1500, "HTTP Request | Update character"], "isController": false}, {"data": [0.351, 500, 1500, "HTTP Request | Delete character"], "isController": false}, {"data": [0.0015, 500, 1500, "HTTP Request | Get all characters"], "isController": false}, {"data": [0.351, 500, 1500, "HTTP Request | Get character by id"], "isController": false}, {"data": [0.974, 500, 1500, "HTTP Request | Create character"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5000, 2337, 46.74, 2968.6915999999983, 1, 23972, 24.0, 16419.0, 18299.9, 21329.719999999994, 198.11395514700055, 25544.670672695935, 35.03262224869245], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["HTTP Request | Update character", 1000, 649, 64.9, 39.40599999999996, 3, 281, 22.0, 47.0, 235.0, 270.95000000000005, 52.66206751277055, 14.232232312128074, 11.894890216046132], "isController": false}, {"data": ["HTTP Request | Delete character", 1000, 649, 64.9, 32.79800000000003, 2, 217, 21.0, 44.89999999999998, 178.0, 212.0, 53.44449788894233, 14.614773729357063, 9.570844857303191], "isController": false}, {"data": ["HTTP Request | Get all characters", 1000, 390, 39.0, 9134.282000000014, 1, 23972, 9902.5, 19347.5, 21328.6, 23719.63, 39.6589331746976, 25522.31957509171, 4.203924375371803], "isController": false}, {"data": ["HTTP Request | Get character by id", 1000, 649, 64.9, 5121.877000000001, 2, 19016, 18.0, 18257.1, 18565.55, 18944.74, 49.295080350980975, 16.17798104296066, 7.569683217489894], "isController": false}, {"data": ["HTTP Request | Create character", 1000, 0, 0.0, 515.0949999999995, 2, 18789, 21.0, 299.69999999999993, 427.0, 18421.73, 50.26135906714917, 14.033521185162845, 11.039436318858062], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 23,290 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,113 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,720 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,095 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,141 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,145 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,160 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,063 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,149 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,918 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,360 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,528 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,599 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,574 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,675 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,656 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 22,934 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,643 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,302 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,124 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,725 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,653 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,930 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,523 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,627 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,167 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,857 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,622 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,260 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,683 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,972 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,318 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,408 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 2, 0.08557980316645272, 0.04], "isController": false}, {"data": ["The operation lasted too long: It took 20,217 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,246 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,210 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:3001 [/127.0.0.1] failed: Connection refused: connect", 339, 14.505776636713735, 6.78], "isController": false}, {"data": ["The operation lasted too long: It took 20,343 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["404/Not Found", 1921, 82.19940094137783, 38.42], "isController": false}, {"data": ["The operation lasted too long: It took 23,016 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,528 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,525 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,379 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,312 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,970 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,330 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,306 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,284 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,137 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,610 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,642 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,800 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,687 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,776 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,247 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,681 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,558 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,104 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,933 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,496 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,403 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,257 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,633 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,023 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,968 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,893 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,441 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,157 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,208 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,235 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,487 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,242 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,953 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,273 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 20,277 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 21,221 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,746 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}, {"data": ["The operation lasted too long: It took 23,793 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, 0.04278990158322636, 0.02], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5000, 2337, "404/Not Found", 1921, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:3001 [/127.0.0.1] failed: Connection refused: connect", 339, "The operation lasted too long: It took 21,408 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 2, "The operation lasted too long: It took 23,290 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, "The operation lasted too long: It took 20,113 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["HTTP Request | Update character", 1000, 649, "404/Not Found", 649, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request | Delete character", 1000, 649, "404/Not Found", 649, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP Request | Get all characters", 1000, 390, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:3001 [/127.0.0.1] failed: Connection refused: connect", 313, "The operation lasted too long: It took 21,408 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 2, "The operation lasted too long: It took 23,290 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, "The operation lasted too long: It took 20,113 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1, "The operation lasted too long: It took 23,720 milliseconds, but should not have lasted longer than 20,000 milliseconds.", 1], "isController": false}, {"data": ["HTTP Request | Get character by id", 1000, 649, "404/Not Found", 623, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 127.0.0.1:3001 [/127.0.0.1] failed: Connection refused: connect", 26, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

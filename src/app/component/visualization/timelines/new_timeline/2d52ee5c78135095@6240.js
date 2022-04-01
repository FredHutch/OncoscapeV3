import define1 from "./e93997d5089d7165@2303.js";

function _1(md){return(
md`# Timeline Conversion  build 0212`
)}

function _2(md){return(
md`Recent Changes:
1. For LARGE TEST, set smallTest=False in loadedRawData.
2. Pushes cases of unmatched events to bottom of sort.
3. Now looks at negative event dates for sorting, exceptin case of -1234 error code.
4. Now coloring non-matches a different shade, to distinguish from matches (e.g., do they have a Death event)`
)}

function _miniButtonStyle(html)
{ return html`
<link rel="stylesheet">
<style>

    .timeline-mini-btn {
      background-color: DodgerBlue; /* Blue background */
      border: none; /* Remove borders */
      color: white; /* White text */
      padding: 3px 3px; /* Some padding */
      font-size: 9px; /* Set a font size */
      cursor: pointer; /* Mouse pointer on hover */
    }

    /* Darker background on mouse-over */
    .timeline-mini-btn:hover {
      background-color: RoyalBlue;
    }
</style>`}


function _4(minMax){return(
minMax
)}

function _maxLogNegativeArea(minMax){return(
Math.log10(Math.abs(minMax.min)+1)
)}

function _maxLogPositiveArea(minMax){return(
Math.log10(Math.abs(minMax.max)+1)
)}

function _totalLogArea(maxLogNegativeArea,maxLogPositiveArea){return(
maxLogNegativeArea + maxLogPositiveArea
)}

function _pixelsForLogNegativeArea(rightSideWidth,maxLogNegativeArea,totalLogArea){return(
rightSideWidth * (maxLogNegativeArea/totalLogArea)
)}

function _logScaleFunction(rightLogScale,pixelsForLogNegativeArea,leftLogScale){return(
function(i){
  // ====== Does not include getStretcherVal =======
  if(i >=0) {
    return rightLogScale(i+1);  //+1 because log scale cannot start at zero.
  } else {
    return pixelsForLogNegativeArea  - leftLogScale(-i);
  }
}
)}

function _smartPixelScale(use_logscale,logScaleFunction){return(
function(i){
  // ====== Does not include getStretcherVal =======
  if(use_logscale) {
    return logScaleFunction(i);
  } else {
    return i;
  }
}
)}

function _rightSvgStraightScale(use_logscale,d3,minMax,pixelsForLogNegativeArea,getStretcherVal,rightSideWidth){return(
use_logscale ?  // Used only to create axis at top.
            d3.scaleLog()
            .domain([1, minMax.max+1])
            .range([pixelsForLogNegativeArea * getStretcherVal(), rightSideWidth * getStretcherVal()]) //rightSideWidth])
            :
            d3.scaleLinear()
            .domain([0, minMax.max ])
            .range([0, minMax.max * getStretcherVal()])
)}

function _leftLogScale(d3,minMax,pixelsForLogNegativeArea){return(
d3.scaleLog()
  .domain([1, Math.abs(minMax.min)+1])
  .range([0, pixelsForLogNegativeArea])
)}

function _rightLogScale(d3,minMax,pixelsForLogNegativeArea,rightSideWidth){return(
d3.scaleLog()
  .domain([1, minMax.max+1])
  .range([pixelsForLogNegativeArea, rightSideWidth])
)}

function _brushHorizontal(d3,rightSideWidth,brushHeight,brushedHorizontal){return(
d3.brushX()
    .extent([[0, 0], [rightSideWidth , brushHeight]])  // was [0,0]  // x was width.
    .on('brush end', brushedHorizontal)
)}

function _dynamicTrackHeight(html){return(
html`<input id="stretcher" type="range" min="0.01" max="40" step="0.01" value="16"></input>`
)}

function _16(useMultipleTracks){return(
useMultipleTracks
)}

function _useMultipleTracks(html){return(
html`<input type=checkbox>`
)}

function _18(use_logscale){return(
use_logscale
)}

function _use_logscale(html){return(
html`<input type=checkbox>`
)}

function _rowSelectionChangedCounter(){return(
0
)}

function _currentSelectionLinkedToCounter(d3)
{
  // let rr = mutable rowSelectionChangedCounter;
  let selection = [];
  d3.selectAll(".timeline-svg-id-rect.timeline-svg-id-rect-selected")
    .filter((d) => {
      selection.push(d.id);
    });
  selection.sort();
  /*
  console.log(`sel@${Date.now()} len=${selection.length}...`);
  console.dir(selection); 
  */
  return selection;
}


function _onOncoscapeEventClicked(){return(
function(event) {
    console.log("=================");
    console.log('EMITTED oncoscapeEventClicked for PID=' +event.detail.pid);
      console.dir(event.detail);
  }
)}

function _onOncoscapeRowSelectionChanged(){return(
function(event) {
    console.log("=================");
    console.log('EMITTED oncoscapeRowSelectionChanged.');
}
)}

function _onOncoscapeIdGroupClicked(){return(
function(event) {
    console.log("=================");
    console.log('EMITTED onOncoscapeIdGroupClicked.');
    console.dir(event.detail);
}
)}

function _onOncoscapeCreateCohortFromTimelineSelection(){return(
function(event) {
    console.log("=================");
    console.log('EMITTED onOncoscapeCreateCohortFromTimelineSelection.');
    console.dir(event.detail);
}
)}

function _setupEventPlaceholders(onOncoscapeEventClicked,onOncoscapeRowSelectionChanged,onOncoscapeIdGroupClicked,onOncoscapeCreateCohortFromTimelineSelection){return(
function(caller) {
    console.log("oncoscapeEventClicked caller...")
    let shmee = caller;
    
    console.dir(shmee);
    //oncoscapeRowSelectionChanged
    caller.addEventListener("oncoscapeEventClicked", onOncoscapeEventClicked); 
    caller.addEventListener("oncoscapeRowSelectionChanged", onOncoscapeRowSelectionChanged); 
    caller.addEventListener("oncoscapeIdGroupClicked", onOncoscapeIdGroupClicked); 
    caller.addEventListener("oncoscapeCreateCohortFromTimelineSelection", onOncoscapeCreateCohortFromTimelineSelection); 
  }
)}

function _stretcher(html){return(
html`<input id="stretcher" type="range" min="0.01" max="4" step="0.01"  value="1.0"></input>`
)}

function _sortTools(eventTypes,eventTypeForDiagnosis,html,generateAlignOptions,eventTypeForDeath,d3,processSort,processAlignment,generateGroupingOptions,dlaGroupableFields,processGrouping)
{
  let eventTypesWithDay0IfNoDiagnosis = [ ...eventTypes];
  
  if(eventTypeForDiagnosis==null){
    eventTypesWithDay0IfNoDiagnosis.unshift("Day 0");
  }

  // For each change in "Type:", and at end of list, add "[All]" version
  //console.log("=============================")
  //console.log("==lastTypeNameWithColon==")
  let newEventList = []
  let lastTypeNamePrefix= null
  for (let index = 0; index < eventTypesWithDay0IfNoDiagnosis.length; ++index) {
    let currentEventType = eventTypesWithDay0IfNoDiagnosis[index]
    let currentEventTypeParts = currentEventType.split(":")
    let thisTypePrefix = currentEventTypeParts[0]
    //console.log("==currentEventType="+currentEventType+"!")
    if (lastTypeNamePrefix){ 
      //console.log("lastTypeNamePrefix true")
      if (lastTypeNamePrefix != thisTypePrefix){
        //console.log("change in prefix")
        // A list of event types under lastTypeNamePrefix has ended. Add "{All]"
        newEventList.push(lastTypeNamePrefix+":[All]")
        if (currentEventTypeParts.length > 1) {
          // We have switched to a new type with subtypes.
          lastTypeNamePrefix = thisTypePrefix
        } else {
          // We have switched to a type without subtypes.
          lastTypeNamePrefix = null
        }
      }
      newEventList.push(currentEventType)

    } else {
        newEventList.push(currentEventType)
        if (currentEventTypeParts.length > 1) {
          // We have switched to a new type with subtypes.
          lastTypeNamePrefix = thisTypePrefix
        }
    }
    if(lastTypeNamePrefix){
      if(index == eventTypesWithDay0IfNoDiagnosis.length-1 && currentEventTypeParts.length > 1){
        // last row, and an active type with subtypes. Add "[All]"
        newEventList.push(lastTypeNamePrefix+":[All]")
      }
    }
  }
  eventTypesWithDay0IfNoDiagnosis = newEventList
  console.dir(newEventList)
  console.log("====end newEventList==")
  
  const sortByDiv = html`
<label for="measure">Sort by </label>

<select name="measure" id="measure" style="font-size:14px"  >
<option value="none">none</option>
<option value="start of">start of</option>
<option value="interval from start" selected>interval from start of</option>
<option value="end">end of</option>
<option value="interval from end of" >interval from end of</option>
<option disabled value="duration">duration of</option>
<option disabled value="count">count of</option>

</select>
<label for="sortBy">&nbsp;1st&nbsp;event&nbsp;</label>
<select name="sortBy" id="sortBy" style="font-size:14px"  >
<!--<option value="none">None</option>-->
${generateAlignOptions(eventTypesWithDay0IfNoDiagnosis, eventTypeForDiagnosis)}
</select>

<label id="label-toevent">to&nbsp;start&nbsp;of&nbsp;event&nbsp;</label>
<select name="sortByTo" id="sortByTo" style="font-size:14px">
<!--<option value="none">None</option>-->
${generateAlignOptions(eventTypesWithDay0IfNoDiagnosis, eventTypeForDeath)}
</select>
 
`;
  
  sortByDiv.onchange = (e) => {
    console.log('onchange!!!');
    view.dispatchEvent(new CustomEvent("input"));
    let action = e.srcElement.value;
    console.log("ACTION=" + action);
    let label= d3.select("#label-toevent");
    let sortByTo = document.getElementById("sortByTo");
    let measureValue = document.getElementById("measure").value;
    if(measureValue.toLowerCase().startsWith("interval")) {
      label.classed("to-event-disabled", false)
      sortByTo.disabled = false;
      console.log("==== sortByTo AVAILABLE");
    } else {
      label.classed("to-event-disabled", true)
      sortByTo.disabled = true;
      console.log("==== sortByTo UNAVAILABLE");
    }
    processSort();
  };
  sortByDiv.oninput = (e) => {
    console.log('INPUT!!!');
  };
  
  const sortByToDiv = html`
`;
  
/*
  sortByToDiv.onchange = (e) => {
    console.log('onchange!!!');
    view.dispatchEvent(new CustomEvent("input"));
    let action = e.srcElement.value;
    processSort();
  };
*/
  
  const whichSort = html`
<!--<label for="whichSort">Alignment Type:</label>
  <select name="whichSort" id="whichSort">
    <option value="none">Start of 1st</option>
    <option value="saab">Start of Last</option>
  </select>-->
`;
  whichSort.onchange = (e) => {
    console.log('whichSort!!!');
    view.dispatchEvent(new CustomEvent("input"));
  };

  
  // ===== Align
  const alignByDiv = html`
<span>
<label for="alignBy">Align By:</label>
<select name="alignBy" id="alignBy" style="font-size:14px">
<option value="none">None</option>
${generateAlignOptions(eventTypes)}
</select>
</span>`;
  alignByDiv.onchange = (e) => {
    console.log('onchange!!!');
    view.dispatchEvent(new CustomEvent("input"));
    console.log(e.srcElement.value);
    let action = e.srcElement.value;
    processAlignment(action);
  };

  const whichAlign = html`
<!--<label for="whichAlign">Alignment Type:</label>
  <select name="whichAlign" id="whichAlign">
    <option value="none">Start of 1st</option>
    <option value="saab">Start of Last</option>
  </select>-->
`;
  whichAlign.onchange = (e) => {
    console.log('whichAlign!!!');
    view.dispatchEvent(new CustomEvent("input"));
  };

  const groupByDiv = html`
<span>
<label for="groupBy">Group By:</label>
<select name="groupBy" id="groupBy" style="font-size:14px">
<option value="none">None</option>
${generateGroupingOptions(dlaGroupableFields)}
</select>
</span>`;
  groupByDiv.onchange = (e) => {
    console.log('groupby onchange!!!');
    view.dispatchEvent(new CustomEvent("input"));
    console.log(e.srcElement.value);
    let action = e.srcElement.value;
    processGrouping(action);
  };

  const view = html`<div style="font-family: Arial, Helvetica, sans-serif; font-size:14px">
<table width="100%" border="1" ><tr><td width="100%" style="padding:6px;white-space: nowrap;">
    ${sortByDiv} &nbsp;&nbsp; ${whichSort}<br />
${sortByToDiv}
</td>
</tr><tr>
<td style="padding:6px">${alignByDiv} &nbsp;&nbsp; ${groupByDiv} &nbsp;&nbsp; ${whichAlign}
</td></tr></table>

</div>`;
  
  return view;
}


function _tooltip(){return(
"empty"
)}

function _31(transformData){return(
transformData.map(v => v.events).flat(Infinity).filter(v => v.subtype=="Radiation").map(v => v.p+"_"+v.start)
)}

function _svgTable(d3,html,miniBtnView,createLeftSVG,createRightSVG,createLowerRightSVG,createUpperRightSVG,createOuterSvgEventHandlers,stretcher,getData,barHeight,mousemoveEventSpaceBackground,mouseoverEventSpaceBackground,mouseoutEventSpaceBackground,clickIdGroup,smartPixelScale,numTracks,trackHeight,createEventElementGroups,addVerticalCrosshair,recalcVertScrollbarDiv,processSort,setupEventPlaceholders)
{    
  const tbl = d3.select(html`
 
<table id="timelineSvgMasterTable">
<tr><td class="timeline-td-control" colspan="2" id="UpperRightTd">${miniBtnView}</td><td id="upperRightTd"></td></tr>
<tr><td id="farRightSvgTd">
<div id="vertScrollbarDiv" style="float:left;  display:block;
width:25px;
overflow-y: scroll; max-height: 100px;" onscroll='(function(){ 
let g= 5;
  console.log(">> onscroll start fn")
  let sb = document.getElementById("vertScrollbarDiv");
  let scrollTopInt = (sb.scrollTop).toFixed(0);
  let barHeight = 16; // !!!

  let scrollTopDesired = Math.max(0, (scrollTopInt -(scrollTopInt % barHeight)));
  let aChartVertOffsetElement = document.getElementById("aChartVertOffset");
  let aChartHorOffsetElement = document.getElementById("aChartHorOffset");
  let chartHorVal = parseInt(aChartHorOffsetElement.value);  
  let newVal = scrollTopDesired;

  // Manually scroll the timeline rows, and the ID column

  let rightTransform = "translate(" + (0-chartHorVal) + "," + (0-newVal) + ")";
  let els = document.querySelectorAll(".timeline-svg-right-rows");

  for (var i=0; i < els.length; i++) {
      els[i].setAttribute("transform", rightTransform);
  }

  let leftTransform = "translate(0,-"+newVal+")";
  els = document.querySelectorAll("#svgFirstLeftGroup");
  for (var i=0; i < els.length; i++) {
      els[i].setAttribute("transform", leftTransform);
  }
  console.log(">> onscroll end fn")
  

  aChartVertOffsetElement.value = newVal;
}());'>

<div id="vertScrollbarInnerDiv" style="float:left; 
width:0px;

"></div>

</div>

</td><td id="leftSvgTd" ></td><td id="rightSvgTd"></td></tr>
<tr><td id="farLowerRightTd"></td><td id=lowerLeftTd" ></td><td id="lowerRightTd"></td></tr>
</table>`);
  
  let leftTableCell = tbl.selectAll("#leftSvgTd")
  let leftSvg = createLeftSVG(leftTableCell);
  
  let rightTableCell = tbl.selectAll("#rightSvgTd")
  let rightSvg = createRightSVG(rightTableCell);

  let lowerRightTableCell = tbl.selectAll("#lowerRightTd")
  let lowerRightSvg = createLowerRightSVG(lowerRightTableCell);
  let upperRightTableCell = tbl.selectAll("#upperRightTd")
  let upperRightSvg = createUpperRightSVG(upperRightTableCell);
  
  /*
  let rightBrushGroupTableCell = tbl.selectAll("#farRightSvgTd")
  let rightBrushSvg = createRightBrushGroupSVG(rightBrushGroupTableCell);
  */
  
  createOuterSvgEventHandlers(leftSvg);
  createOuterSvgEventHandlers(rightSvg);
  
  let stretcherVal = stretcher;
  
  var svgRightFirstGroup = rightSvg
  .append("g")
  .attr("id", "svgRightFirstGroup")
  .classed("timeline-svg-right-rows", true)
  //.attr("transform",   "translate(" + 0 + "," + 0 + ")")
  .attr('width', 200)
  .attr('height', 250); //250

  let localData = getData();
  
  let bar = svgRightFirstGroup.selectAll("g")
  .data(localData)
  .enter().append("g") 
  .attr("id", function(d, i) { return "eventrow-" + d.id })
  .classed("timeline-svg-row", true)
  .attr("hAlignment", 0)
 // .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; })
  .attr("transform", function(d, i) { return `translate(${d.hAlignment ? d.hAlignment : 0},${i * barHeight })`; });

  bar.on("mousemove", mousemoveEventSpaceBackground);
  bar.on("mouseover", mouseoverEventSpaceBackground);
  bar.on("mouseout", mouseoutEventSpaceBackground);
  
  bar.append('rect')
    .attr("fill", "#F8F8F8")
    // =====   .on("click", popupPatientData)
    .classed("events-group-rect", true)
    .on("click",  clickIdGroup)
    .attr("id", (d)=>{return "id-rect-"+d.id})
    .attr("stroke", "#BBB")
    .attr("x", (d)=>{return stretcherVal * smartPixelScale(Math.min(...d.events.map(d2 => d2.start ? d2.start : 0))) ;}) // move to start of 1st event
    .attr("y", (d)=>{return 0})
    .attr("width", (d)=>{
      let dMin = stretcherVal * smartPixelScale(Math.min(...d.events.map(d2 => d2.start ? d2.start : 0)));
      let dMax = stretcherVal * smartPixelScale(Math.max(...d.events.map(d2 => d2.end ? d2.end : d2.start)));
      // console.log(`!${d.id} min${dMin} max ${dMax}.`);
      return Math.max(10, dMax-dMin);
    })  // 1500
    .attr("height", barHeight-0);

  // If more than one track, draw line between each, starting with '1' (second).
  for (let track = 1; track < numTracks; track++) {
    bar.append('line')
//      .attr("stroke", "red")  
      .style("stroke", "#EEE")  
      .attr("x1", (d)=>{return stretcherVal * smartPixelScale(Math.min(...d.events.map(d2 => d2.start ? d2.start : 0)));}) // move to start of 1st event
      .attr("y1", (d)=>{return track * trackHeight})
      .attr("x2", (d)=>{
        //let dMin = stretcherVal * Math.min(...d.events.map(d2 => d2.start ? d2.start : 0));
        let dMax = stretcherVal * smartPixelScale(Math.max(...d.events.map(d2 => d2.end ? d2.end : d2.start)));
        return Math.max(10, dMax);
      }) 
      .attr("y2", (d)=>{return track * trackHeight});
  }
  
  let eventGroups = bar.append('g')
  .classed("timeline-event-group", true) 
  .attr("transform", function(d, i) { return `translate(0,0)`; });

  const eventElementGroups =  createEventElementGroups(eventGroups);
  
  addVerticalCrosshair(rightSvg);

  // Adjust vertical scrollbar
  setTimeout(function(){
    recalcVertScrollbarDiv(localData);
  },500);

  setTimeout(function(){
      const s = document.getElementById('sortBy');
      s.value = "Status:Diagnosis";
      //console.log('====calling sortBy b====');
    //  s.dispatchEvent(new CustomEvent("input"));
      processSort();
  },200 );

  setupEventPlaceholders(tbl.node());
  return tbl.node();
}


function _processSort(d3,barHeight){return(
function () {
    let measure = document.getElementById("measure").value.toLowerCase(); 
    /*
    none
    start of
    interval from start of
    end of
    interval from end of
    duration TBD
    count TBD
     */

    let startTime = (new Date()).getTime()


  
    let action = document.getElementById("sortBy").value;
    console.log(`process sort value ${action}.`);
    let actionTo = document.getElementById("sortByTo").value;
    //console.log(`process sortTo value ${actionTo}.`);

    let allRightRows = d3.selectAll("#rightSvgTimeline .timeline-svg-row");
    let theType = action.split(":")[0];
    let theSubtype = action.split(":")[1]; // undefined if theType is None. '[All]' for all subtypes
    console.log("SUBTYPE====[" + theSubtype + "]")
    let theToType = actionTo.split(":")[0];
    let theToSubtype = actionTo.split(":")[1]; // undefined if theType is None.
    console.log("MEASURE=[" + measure + "]. actionTo=[" + actionTo + "]")

    // d.originalOrderPos holds the order it came out of timeline compute.
    allRightRows.attr("sortPos", (d, i) => {
        // console.log("BEFORE #"+String(i)+" CHECK ID="+String(d.id));

        if (measure != "none") {
            let matchingEventsInThisPatient = d.events
                // .filter(v=>v.type == theType)
                .filter(v => v.type == theType)
                .filter(v => v.subtype == theSubtype || theSubtype == "[All]")
                .sort(function (a, b) {
                    return a.start - b.start;
                });

            if (matchingEventsInThisPatient.length == 0) {
                d.sortPos = 25000000; // Make this 100million if allowed.
            } else {
                // Look for INTERVAL to a second event type.
                if (measure.toLowerCase().startsWith("interval")) { // was (measure != "none") {
                    if (theType == "Day 0" || matchingEventsInThisPatient.length > 0) {
                        let firstOfFirstType = {
                            start: 0,
                            end: 0
                        };
                        if (matchingEventsInThisPatient.length > 0) {
                            firstOfFirstType = matchingEventsInThisPatient[0];
                        }

                        let useStartAndNotEnd = measure.includes("start");
                        // console.log(`useStartAndNotEnd = ${useStartAndNotEnd} [${measure}]`);
                        let startOrEndOfFirstOfFirstType = useStartAndNotEnd ? firstOfFirstType.start : firstOfFirstType.end;

                        let matchingToEventsInThisPatient = d.events
                            .filter(v => v.type == theToType)
                            .filter(v => v.subtype == theToSubtype)
                            .sort(function (a, b) {
                                return a.start - b.start;
                            });

                        if (matchingToEventsInThisPatient.length > 0) {
                            let firstOfSecondType = matchingToEventsInThisPatient[0];

                            let startOfFirstOfSecondType = firstOfSecondType.start;
                            // e.g., from start of radiation to start of death event.
                            let diff = startOfFirstOfSecondType - startOrEndOfFirstOfFirstType;
                            if (diff == -1234) { // Special value for bad date. In general negative numbers might be bogus. TBD: consider more smarts here.
                                d.sortPos = 1100000 + diff;
                            } else {
                                d.sortPos = diff;
                            }
                            // console.log(`${d.id} sort=${d.sortPos}. 1=${startOrEndOfFirstOfFirstType} 2=${startOfFirstOfSecondType}`);

                        } else {
                            //console.log("INTERVAL Fail1");
                            d.sortPos = 25000000; // no events of the second type # was RETURN
                        }
                    } else {
                        //console.log("INTERVAL Fail2");
                        d.sortPos = 25000000; // no events of theType for this patient.
                    }

                } else {
                    // Normal, just sort by start date.  First event of type theType.
                    //console.log("00A BEFORE #"+String(i)+" CHECK ID="+String(d.id));
                    matchingEventsInThisPatient.sort(function (a, b) {
                        return a.start - b.start;
                    });

                    if (matchingEventsInThisPatient.length > 0) {
                        d.sortPos = matchingEventsInThisPatient[0].start;
                    } else {
                        d.sortPos = 25000000;
                    }

                }
            }
        } else {
            //console.log("00C ORiG #"+String(i)+" CHECK ID="+String(d.id));
            d.sortPos = d.originalOrderPos;
        }
        //console.log("ID="+String(d.id)+", POS=["+String(d.sortPos)+"]")
        return d.sortPos;
    });

    // Add 3 million to each group, so we can group first and sort within groups.
    allRightRows.each((d, i) => {
        if (d._groupByIdx) {
            d.sortPos = d.sortPos + 90000000 * d._groupByIdx;
        }
    });

    console.log(">>> allRightRows....")
    console.dir(allRightRows)
    let innerRightStartTime = (new Date()).getTime()
    let sortedAllRightRows = allRightRows.sort(function (x, y) {
        if (x.sortPos == 25000000 && y.sortPos == 25000000) {
            return d3.ascending(x.originalOrderPos, y.originalOrderPos);
        } else {
            return d3.ascending(x.sortPos, y.sortPos);
        }
    });
    let innerRightEndTime = (new Date()).getTime()
    console.log(">> end inner RIGHT sort at duration " + (innerRightEndTime - innerRightStartTime))
  
    let pidYLookup = new Map();

    // Now fix their y in transform.
    sortedAllRightRows.attr("transform", function (d, i) {
        let newY = i * barHeight;
        pidYLookup.set(d.id, newY);
        let t = d3.select(this).attr("transform");
        let tParts = t.split(",");
        return tParts[0] + `, ${newY})`;
    })

    // Now color the rows dim if they are "fail" cases.
    sortedAllRightRows.each((d,i) => {
      if(d.sortPos == 25000000){
        d3.select("#id-rect-"+d.id).classed("timeline-svg-id-rect-sortfailure", true) ;
      } else {
        d3.select("#id-rect-"+d.id).classed("timeline-svg-id-rect-sortfailure", false) ;
      }
    });

    // Use pidYLookup set in a sort function for ID column.
    let innerLeftStartTime = (new Date()).getTime()
    
    let allLeftRows = d3.selectAll("#svgFirstLeftGroup .timeline-svg-row");
    let sortedAllLeftRows = allLeftRows.sort(function (x, y) {
        let xPos = pidYLookup.get(x.id);
        let yPos = pidYLookup.get(y.id);
        return d3.ascending(xPos, yPos);
    });
    // Now fix ID rows y in transform.
    sortedAllLeftRows.attr("transform", function (d, i) {
        let newY = i * barHeight;
        pidYLookup.set(d.id, newY);
        let t = d3.select(this).attr("transform");
        let tParts = t.split(",");
        return tParts[0] + `, ${newY})`;
    })
    console.log('TBD move by sortedAllLeftRows');
    let innerLeftEndTime = (new Date()).getTime()
    console.log(">> end inner LEFT sort at duration " + (innerLeftEndTime - innerLeftStartTime))
  
    let endTime = (new Date()).getTime()
    console.log(">> end sort at duration " + (endTime - startTime))

    const anSvg = document.getElementById('timelineSvgMasterTable');
    anSvg.dispatchEvent(new CustomEvent("input"));
}
)}

function _arrayIdsToSelect(){return(
[]
)}

function _rowIdToSelect(){return(
""
)}

function _currentEventMousedOver(){return(
null
)}

function _processAlignment(d3,smartPixelScale,stretcher,barHeight,svgTable){return(
function(action){
  //console.log(`process align ${action}.`);
  let globalMinStart = 0;
  let globalMaxEnd = 0;

  let allRightRows = d3.selectAll("#rightSvgTimeline .timeline-svg-row") ; //.timeline-event-group"); //
  let theType = action.split(":")[0];
  let theSubtype = action.split(":")[1]; // undefined if theType is None.
  let duration = 200 + Math.max(1200, allRightRows.size() / 50);

  allRightRows.transition().duration(duration).attr("transform", (d,i) => {
    let offset = 0;  // none - default
    if (theType != "None") {

      let matchingEventsInThisPatient = d.events
      .filter(v=>v.type == theType)
      .filter(v=>v.subtype == theSubtype);

      matchingEventsInThisPatient.sort(function(a, b) {
        return a.start - b.start;
      });

      // for now, grab first date we see, UNSORTED.
      if (matchingEventsInThisPatient.length > 0 ){
        let thisOffset = smartPixelScale(matchingEventsInThisPatient[0].start) * stretcher;
        offset = 0-thisOffset

        // See if our first event is less than global min. Then check last event for global max.
        let firstStart = 0;
        let lastEnd = 0;
        if(d.events.length > 0) {
          d.events.sort(function(a, b) {
            return a.start - b.start;
          });
          firstStart = (smartPixelScale(d.events[0].start) * stretcher)-thisOffset;
          lastEnd = (smartPixelScale(d.events[d.events.length-1].end) * stretcher)-thisOffset;
        }      
        if(firstStart < globalMinStart) {
          globalMinStart = firstStart;
          //console.log(`@offset ${thisOffset}, min ${firstStart} for #${i} ${d.id}.`);
        }
        if(lastEnd > globalMaxEnd) {
          globalMaxEnd = lastEnd;
        }

      } else {
        offset = 0; // -1;
      }
    }
    d.horizontalOffset = offset;
    let xform= `translate(${offset},${barHeight*i})`;
    return xform;
  });

  console.log('=============');
  console.log(`globalMinStart=${globalMinStart}, globalMaxEnd=${globalMaxEnd}.`);
  console.log('=============');
  //let reselection = d3.selectAll("#rightSvgTimeline .timeline-svg-row") ;
  //reselection.attr("visibility", d => d.horizontalOffset == -1 ? "visible" : "hidden");

  let anSvg = svgTable; //.leftSvg;
  anSvg.dispatchEvent(new CustomEvent("input"));
}
)}

function _miniBtnStyle(html)
{ return html`miniBtnStyle
<hr>
<link rel="stylesheet">
<style>

    .timeline-mini-btn {
      background-color: DodgerBlue; /* Blue background */
      border: 1px solid white;; /* Remove borders */
      color: white; /* White text */
      padding: 5px 8px; /* Some padding */
      font-size: 10px; /* Set a font size */
      cursor: pointer; /* Mouse pointer on hover */
    }

    /* Darker background on mouse-over */
    .timeline-mini-btn:hover {
      background-color: RoyalBlue;
    }
</style>`}


function _miniBtnView(html,miniBtnCmds,d3,pbcopy,selectAllRows,updateRowSelectionChangedCounter,requestCreateCohortFromTimelineSelection){return(
html`${miniBtnCmds.map((v, i) => {
    const iconToTooltipDict = {
      copy: "Copy IDs of Selected Patients",
      plus: "Select All Patients",
      minus: "Deselect All Patients",
      asterisk: "Create a Cohort From Selected Patients"
    }
    
    // const div = html`<div style="display:inline-block;width:26px;height:26px;margin-right:4px;"></div>`;
    const div = html`<button title="${iconToTooltipDict[v]}" class="timeline-mini-btn"><i class="fa fa-${v}"></i></button> `;
    div.onclick = (q) => {
      console.dir(v);
      switch(v) {
        case 'copy':
          console.log('copy...');
          let results = [];
          d3.selectAll("g.timeline-svg-row > rect.timeline-svg-id-rect-selected")
            .each(function (p, j) { 
              console.log('=== inner');
              console.log(p.id);
              results.push(p.id);
            }); 
          if(results.length > 0){
            pbcopy(results.join("\r\n"))
          } else {
            console.warn('No rows were selected. Nothing copied to clipboard.');
          }

          break;
        case 'plus':
          selectAllRows(true);
          updateRowSelectionChangedCounter();
          break;
        case 'minus':
          selectAllRows(false);
          updateRowSelectionChangedCounter();
          break;
        case 'adjust':
          // Should invert selection
          console.log('NYI');
          break;
        case 'asterisk': // create cohort
          let selectdIdsForCohort = [];
          d3.selectAll("g.timeline-svg-row > rect.timeline-svg-id-rect-selected")
            .each(function (p, j) { 
              //console.log(p.id);
              selectdIdsForCohort.push(p.id);
            }); 
          console.log('*** IDs for cohort...');
          console.dir(selectdIdsForCohort);
          requestCreateCohortFromTimelineSelection(selectdIdsForCohort);
          break;

        default:
          // code block
      }
      
    };
    return div;
  })}`
)}

function _miniBtnCmds(){return(
['asterisk', 'copy', 'plus','minus']
)}

function _pbcopy(){return(
function pbcopy(text) {
  const fake = document.body.appendChild(document.createElement("textarea"));
  fake.style.position = "absolute";
  fake.style.left = "-9999px";
  fake.setAttribute("readonly", "");
  fake.value = "" + text;
  fake.select();
  try {
    return document.execCommand("copy");
  } catch (err) {
    return false;
  } finally {
    fake.parentNode.removeChild(fake);
  }
}
)}

function _clickIdGroup(selectAllRows,d3,findFirstSelectedIdAbove,selectRowById,updateRowSelectionChangedCounter){return(
function(evt, data){
  evt.stopPropagation(); // If click text label in ID row, do not also let the background rect process it.
  
  if(evt.shiftKey || evt.ctrlKey) {
    // extend selection. Shift extends continuously, Ctrl extends discontinuously.

  } else {
    selectAllRows(false);
  }
  
  // popupPatientData(evt, data);
  

  
  let target = d3.select(this);
  if(target.node().tagName == 'text') {
    // Jump up to rect right above.
    target = d3.select(this.previousSibling);
  }

  
  if(evt.shiftKey){  // || evt.ctrlKey) {
    // extend selection. Shift extends continuously, Ctrl extends discontinuously.
    let firstSelectedIdAbove = findFirstSelectedIdAbove(data.id);
    let final_group_id = "idgroup-"+data.id
    console.warn('from FIRSTABOVE = ' + firstSelectedIdAbove + ' to ' + final_group_id);
    if (firstSelectedIdAbove != null) {
      let allGroups = d3.selectAll('.timeline-idgroup'); //  timeline-idgroup-selected
      let shouldSelect=false;
      allGroups
        .each(function (p, j) { 
          let _id = d3.select(this).attr("id");
          if(_id == firstSelectedIdAbove){
            shouldSelect = true;
          }       
          if(shouldSelect){
            //console.log(`SHOULDSELECT= ${_id}.`);
            selectRowById(_id.substring(8));
          }        
          if(_id == final_group_id){
            shouldSelect = false;
          }

        }); 
    }
    
    selectRowById(data.id);
  } else {
    selectRowById(data.id);
  }

  updateRowSelectionChangedCounter();
  
  console.warn('SHOULD EMIT oncoscapeIdGroupClicked.');
  const event = new CustomEvent('oncoscapeIdGroupClicked', { detail: {pid: data.id } });
  const timelineTable = document.getElementById('timelineSvgMasterTable');
  timelineTable.dispatchEvent(event);  
}
)}

function _updateRowSelectionChangedCounter($0){return(
function(){
  $0.value++
  console.log(`new rowSelectionChangedCounter ${$0.value}!`);
  
  const event = new CustomEvent('oncoscapeRowSelectionChanged', { detail: {} });
  const timelineTable = document.getElementById('timelineSvgMasterTable');
  timelineTable.dispatchEvent(event);
 
}
)}

function _requestCreateCohortFromTimelineSelection(){return(
function(pids){
  console.log(`Calling requestCreateCohortFromTimelineSelection.`);
  
  const event = new CustomEvent('oncoscapeCreateCohortFromTimelineSelection', { detail: {
    selectionType: "patient",
    ids: pids} 
  });
  const timelineTable = document.getElementById('timelineSvgMasterTable');
  timelineTable.dispatchEvent(event);
 
}
)}

function _processExternalArrayIdsToSelect(arrayIdsToSelect,selectAllRows,selectRowById)
{
  let rowId = arrayIdsToSelect;
  if(arrayIdsToSelect.length == 0) {
    // do nothing
  } else {
    if(arrayIdsToSelect[0] == "__all_true") {
      selectAllRows(true);
    } else {
      if(arrayIdsToSelect[0] == "__all_false") {
        selectAllRows(false);
      } else {
        selectAllRows(false);
        arrayIdsToSelect.map(rowId => { selectRowById(rowId)});
      }
    }
  }
}


function _processExternalRowSelect(rowIdToSelect,selectAllRows,selectRowById)
{
  let rowId = rowIdToSelect;
  if(rowId =="") {
    // do nothing
  } else {
    if(rowId == "__all_true") {
      selectAllRows(true);
    } else {
      if(rowId == "__all_false") {
        selectAllRows(false);
      } else {
        selectRowById(rowId)
      }
    }
  }
}


function _selectRowById(d3){return(
function(id){
  let idgroup_target = d3.select("#idgroup-"+id);

  idgroup_target.classed("timeline-idgroup-selected", true )  // no visible effect, just for tracking
  idgroup_target.select("rect").classed("timeline-svg-id-rect-selected", true )
  d3.select("#id-rect-"+id).classed("timeline-svg-id-rect-selected", true )

}
)}

function _findFirstSelectedIdAbove(d3){return(
function findFirstSelectedIdAbove(id) {
  let result = id;
  let target = d3.select("g #idgroup-"+id);
  let prev = d3.select(target.node().parentNode.previousSibling);
  if(prev.empty() == false) {
    let prevSubgroup = prev.select(".timeline-idgroup")
    let isSelected = prevSubgroup.attr("class").includes("timeline-idgroup-selected");
    if(isSelected == false ){
      let newId = prevSubgroup.attr("id").substring(8)
      result = findFirstSelectedIdAbove(newId)
    } else {
      result = prevSubgroup.attr("id");
    }
  } else {
    return null
  }
  return result;
}
)}

function _selectAllRows(d3){return(
function(truthy){
/*  
  d3.selectAll(".timeline-svg-id-rect-selected")
    .classed("timeline-svg-id-rect-selected", truthy);

  d3.selectAll(".timeline-idgroup-selected")
    .classed("timeline-idgroup-selected", truthy);
  */
  
  d3.selectAll("rect.events-group-rect")
    .classed("timeline-svg-id-rect-selected", truthy);

  d3.selectAll("rect.timeline-svg-id-rect")
    .classed("timeline-svg-id-rect-selected", truthy);

  d3.selectAll("g.timeline-idgroup")
    .classed("timeline-idgroup-selected", truthy);
}
)}

function _horizontalBrushScale(d3,rightSideWidth,minMax){return(
d3.scaleLinear()
            .domain([0, rightSideWidth])
            .range([minMax.min, minMax.max])
)}

function _popupPatientData(){return(
function(evtToIgnore, data) {
  evtToIgnore.stopPropagation();
  console.log("in popupPatientData");
  let eventCopy = data.events.slice().sort(function(a, b){return a.start-b.start});
  //let report = `${eventCopy.map(e=> e.type + ':'+e.subtype + " from " + e.start +"-" + e.end +".\n")}`;

  let report = `  
<div style="
position: relative;
height: 350px;
overflow: auto;
display: block;
"
>
<table class="table table-bordered">
    <thead>
      <tr>
        <th>Event</th>
        <th>Start</th>
        <th>End</th>
      </tr>
    </thead>
    <tbody>`;
  eventCopy.map(e=> {
    report = report + `<tr><td>${e.type}:${e.subtype}</td><td>${e.start}</td><td>${e.end}</td></tr>`;
  });
  report = report + `</tbody></table>
  </div>`;
  
  let d = data;
/*  
  let emc = $('#exampleModalCenter');
  let innerDiv = emc.find('div').first();
  innerDiv.removeClass('modal-dialog-centered');
  innerDiv.css("top", "123px");

  $('#exampleModalLongTitle').text('Patient ' + d.id);
  //$('#exampleModalLongTitle').find('p').text('content...' + d.id);

  let modalBodyP = emc.find('.modal-body').find('p').first();
  modalBodyP.html(report);
  emc.modal('show');
  */
  console.log('Do not popup patient. Just note hit on ' + d.id);

}
)}

function _brushedHorizontal(horizontalBrushScale,getStretcherVal,d3){return(
(e) => {
  if (e.type == "brush") {
    const sel = e.selection;
    let aChartHorOffsetElement = document.getElementById("aChartHorOffset");
    let startingPixel = horizontalBrushScale(sel[0]) * getStretcherVal(); // MJ rightSvgXScale(sel[0]);
    
    aChartHorOffsetElement.value = startingPixel;
    
    let aChartVertOffsetElement = document.getElementById("aChartVertOffset");
    let chartVertVal = parseInt(aChartVertOffsetElement.value);  
    d3.select('#svgRightFirstGroup')
      .attr('transform', `translate(${-startingPixel},${-chartVertVal})`) 
    
    d3.select('#xAxisSvg #xAxisGroup')
      .attr('transform', `translate(${-startingPixel},0)`) //  `translate(${-rightSvgXScale(sel[0])},0)`) 

  }
}
)}

function _53(tlConfig){return(
tlConfig.bars
)}

function _getEventStyle(tlConfig){return(
function(event){
  // This is hardcoded, but will be pulled out of IndexedDB overrides, etc. in Oncoscape.
  const styleDict__old = {
    Treatment: "Bars",
    Medicine: "Arcs",
    Status: "Symbols",
    Outcome: "Symbols",
    Origin: "Symbols"
  };  
  const styleDict = {};
  tlConfig.bars.map(v => {
    styleDict[v.label] = v.style;
  });
  //console.log('geteventstyle....');
  //console.dir(styleDict);
  return styleDict[event.type];
}
)}

function _lastGroupedByField(){return(
"none"
)}

function _processGrouping(d3,$0,dataLoadedAction,rawPatientsFromJson,updateGroupingRects,processSort){return(
function(action){
  let allRightRows = d3.selectAll("#rightSvgTimeline .timeline-svg-row") ; //.timeline-event-group"); //

  let fieldName = action;
  $0.value = fieldName;
  
  if (fieldName  != "none") {
    
    // Use this for coloring left edge of ID bar. ...
    // Build up map of string values for property, to color we want.
    let colors = ["red","blue","green","orange","cyan","yellow","black","magenta","cyan"];
    
    // dataLoadedAction.fields.filter(v => console.log(`fields!!`));
    // dataLoadedAction.fields.filter(v => console.log(JSON.stringify(v)));
    
    let fieldValues = dataLoadedAction.fields.filter(v => v.label == fieldName)[0].values;
    let fieldValToColorMap = new Map();
    let colorIdx = -1; 
    fieldValues.map( v => {
      colorIdx++
      if (colorIdx == colors.length) { colorIdx = colors.length-1 }  // re-use last color for rest of value
      fieldValToColorMap.set(v, colors[colorIdx]);
    });
    
    let cleanFieldName = fieldName.replaceAll(" ", "_");
    allRightRows.filter((d,i) => {
      let patient = rawPatientsFromJson.find((v) => { return v.p == d.id}) // 
      if(patient == null) {
        d["_groupByIdx"] = 0;
        console.log("Cannot find patient " + d.id);
      } else {
        let pFieldVal = '';
        pFieldVal = patient[cleanFieldName]; // HACK!
        d["_groupByIdx"] = fieldValues.findIndex(v => v == pFieldVal);
        // console.log(`${i}  pfieldval ${pFieldVal}.`);
      }
    });

    updateGroupingRects(true);
  } else {
    
    // we should reorder based on originalOrderPos.
    console.log('TBD: handle none for group'); 
    allRightRows.filter((d,i) => {
      d["_groupByIdx"] = null;
    })
    updateGroupingRects(false);
  }
  /*
  allRightRows.filter((d,i) => {
      return i < 99
    })
  .filter((d,i) => {
    console.log(`${i} = ${d["_groupByIdx"]}.`);
  });  
  */


  setTimeout(function(){
    // console.log('====calling processSort after grouping====');
    processSort();
  },200 );
  
}
)}

function _updateGroupingRects(d3,$0,dataLoadedAction,cellGroupingColorList){return(
function(useColors){
  let groupingRects = d3.selectAll(".timeline-svg-id-grouping-rect"); 
  //console.log('===> GROUPING RECTS');
  //console.log(groupingRects);
  
  if(useColors){ 
    let groupBy = $0.value;
    let groupValues = dataLoadedAction.fields.filter(v => v.label == groupBy)[0].values
    // console.log('use colors');
    groupingRects
      .classed("timeline-svg-id-rect", false)
      .attr("fill", (d) => {
        let dgrpId = d["_groupByIdx"];
        // console.log(`${d.id} > ${dgrpId}`);
        return(dgrpId ? cellGroupingColorList[dgrpId] : "red");
      });
    // Update tooltip text
    groupingRects
      .selectAll(function() { return this.childNodes; })
      .filter(function(d){ 
        d3.select(this).text(groupBy + ": " + groupValues[d["_groupByIdx"]])
        return true;
      });
      
  } else {
    groupingRects
      .classed("timeline-svg-id-rect", true)
    // Remove tooltip text
    groupingRects
      .selectAll(function() { return this.childNodes; })
      .filter(function(d){ 
        d3.select(this).text("")
        return true;
      });    
  }
}
)}

function _eventTypeForDeath(eventTypes){return(
eventTypes.find(v=>v.endsWith(":Death"))
)}

function _59(eventTypes){return(
eventTypes.find(v=>v.endsWith(":Death"))
)}

function _popupEventData(getData){return(
function(d) {
  console.log("==POPUP EVENT");
  let actionDropdown = `
  <div class="dropdown">
  <button class="btn btn-secondary  btn-sm dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Actions</button>
  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
    <a class="dropdown-item" href="#">Action</a>
    <a class="dropdown-item" href="#">Another action</a>
    <a class="dropdown-item" href="#">Something else here</a>
  </div>
</div>`;
  
  let allThisPatientEvents = getData().find(v => v.id == d.p);
  let overlapEvents = allThisPatientEvents.events.filter(v => {
    if(v.i == d.i) {
      return false;
    }
    
    let overlapResult = false;
    let A = d;
    let B = v;
    if (A.start == B.start && A.end == B.end) {
      overlapResult = true;
    } else {
      if (B.end >= A.start && B.start <= A.end) {
        overlapResult = true;
      }
    }
    return overlapResult;
  });

  let overlapTable = "";
  if(overlapEvents.length > 0) {
    let overlapRows = overlapEvents.map(v => {
      return `<tr><td>${v.type} : ${v.subtype}</td><td>${v.start}</td><td>${v.end}</td></tr>`;
    });
    
    overlapTable = `<hr><b>Overlapping Events</b><br /><table class="table table-bordered">
<thead>

<tr>
<th>Event</th>
<th>Start</th>
<th>End</th>
</tr>
</thead>
<tbody>${ overlapRows.join("")}</tbody></table>
</div>`;
  }
    console.log('overlaptable=' + overlapTable);
  
  let report = `  
<div style="
position: relative;
height: 350px;
overflow: auto;
display: block;
"
>
<table border="1" class="table  ">
<thead><th>${d.type}<!--<br /><small>type</small>--></th><th>${d.subtype}
   <!--<div style="">${d.subtype} </td><td>${actionDropdown}</td></tr></div>-->
<!--<div class="table">
  <div class="table-row">
    <div class="table-cell">${d.subtype}</div>
   <!-- <div class="table-cell">${actionDropdown}</div> 
  </div>
</div>
<br /><small>subtype</small>--></th><thead>
</table>

<b>Start Date:</b> ${d.start}&nbsp;&nbsp;&nbsp;<b>End Date:</b> ${d.end}<br />
<table class="table table-bordered">
<thead>

<tr>
<th>Variable</th>
<th>Value</th>
</tr>
</thead>
<tbody>`;

  let keys = Object.keys(d.data);
  keys.map(k => {
    report = report + `<tr><td>${k}</td><td>${d.data[k]}</td></tr>`;
  });
  report = report + `</tbody></table>
</div>`;

  report = report + overlapTable;
  
  console.warn('SHOULD EMIT CLICKED EVENT.');
  const event = new CustomEvent('oncoscapeEventClicked', { detail: {pid: d.p, report: report } });
  const timelineTable = document.getElementById('timelineSvgMasterTable');
  timelineTable.dispatchEvent(event);
}
)}

function _setupEventContextMenu(popupEventData){return(
function(eventElementGroups){
  eventElementGroups.on("mouseup", function(event, d) {
//    const e = selection.nodes();
//    const i = e.indexOf(this);
    console.log(event);
    console.log(d);
    if(event.button == 2) {
      // show right context menu.
      console.log("CONTEXT");
    } else {
      // left button. Pop up info on event?
      event.preventDefault();
      popupEventData(d);
    }
  });
  
  eventElementGroups
    .on("contextmenu",  function(event) {  event.preventDefault();  });
}
)}

function _eventTypeForDiagnosis(eventTypes){return(
eventTypes.find(v=>v.toLowerCase().endsWith(":diagnosis"))
)}

function _getStretcherVal(stretcher){return(
function(){
  return stretcher
}
)}

function _tlConfig(computeTlConfig){return(
computeTlConfig()
)}

function _computeTlConfig(rawTlConfig,useMultipleTracks){return(
function(){
  console.log("=========")
  //console.log(JSON.stringify(rawTlConfig));
  //console.dir(rawTlConfig.bars);
  //console.log("========= useMultipleTracks = " + useMultipleTracks)
  let newTlConfig = JSON.parse(JSON.stringify(rawTlConfig));
  if (!useMultipleTracks) {
    console.log("Do NOT use multiple tracks")
    newTlConfig.bars.map((b) => {
      b.row = 0;
      b.track = 0;
    });
  } else {
        console.log("Do NOT use multiple tracks")
  }
  //console.dir(rawTlConfig.bars);

  return newTlConfig;
}
)}

function _createUpperRightSVG(rightSideWidth,rightSvgStraightScale,d3,use_logscale,getStretcherVal){return(
function(tableCell){


  var upperRightSvg = tableCell.append('svg')
  .attr("id","xAxisSvg")
  .attr("z-index", -1000)
  .attr('width', rightSideWidth) // minMax.max-minMax.min) // rightSideWidth) 
  .attr('height', 35); 
  
  var logFormat10alt = rightSvgStraightScale.tickFormat(10, "d")
  rightSvgStraightScale.ticks(10).map(logFormat10alt)
  let x_axis = {}
  x_axis = d3.axisBottom().scale(rightSvgStraightScale).tickFormat(logFormat10alt);

  if(use_logscale) {
    x_axis = d3.axisBottom().scale(rightSvgStraightScale).tickFormat(logFormat10alt);
  } else {
   // x_axis = d3.axisBottom().scale(rightSvgStraightScale).tickFormat(logFormat10alt)

    let pixelsForRightwardScale = rightSideWidth * getStretcherVal();
    let tickValuesToUse = [0,60,120,180,240,300,360,420,480,540,600, 660, 720, 780, 840, 900, 960, 1020, 1080, 1140, 1200, 1260, 1320, 1380, 1440, 1500, 1560, 1620, 1680, 1740, 1800, 1860, 1920, 1980, 2040, 2100, 2160, 2220, 2280, 2340, 2400, 2460, 2520, 2580, 2640, 2700, 2760, 2820, 2880, 2940, 3000, 3060, 3120, 3180, 3240, 3300, 3360, 3420, 3480, 3540, 3600, 3660, 3720, 3780, 3840, 3900, 3960, 4020, 4080, 4140, 4200, 4260, 4320, 4380, 4440, 4500, 4560, 4620, 4680, 4740, 4800, 4860, 4920, 4980, 5040, 5100, 5160, 5220, 5280, 5340, 5400, 5460, 5520, 5580, 5640, 5700, 5760, 5820, 5880, 5940, 6000];
    if (pixelsForRightwardScale > 820) {
      tickValuesToUse = [0,30,60,90,120,150,180,210,240,270,300,330,360,390,420,450,480,510, 540, 570, 600, 630, 660, 690, 720, 750, 780, 810, 840, 870, 900, 930, 960, 990, 1020, 1050, 1080, 1110, 1140, 1170, 1200, 1230, 1260, 1290, 1320, 1350, 1380, 1410, 1440, 1470, 1500, 1530, 1560, 1590, 1620, 1650, 1680, 1710, 1740, 1770, 1800, 1830, 1860, 1890, 1920, 1950, 1980, 2010, 2040, 2070, 2100, 2130, 2160, 2190, 2220, 2250, 2280, 2310, 2340, 2370, 2400, 2430, 2460, 2490, 2520, 2550, 2580, 2610, 2640, 2670, 2700, 2730, 2760, 2790, 2820, 2850, 2880, 2910, 2940, 2970, 3000, 3030, 3060, 3090, 3120, 3150, 3180, 3210, 3240, 3270, 3300, 3330, 3360, 3390, 3420, 3450, 3480, 3510, 3540, 3570, 3600, 3630, 3660, 3690, 3720, 3750, 3780, 3810, 3840, 3870, 3900, 3930, 3960, 3990, 4020, 4050, 4080, 4110, 4140, 4170, 4200, 4230, 4260, 4290, 4320, 4350, 4380, 4410, 4440, 4470, 4500, 4530, 4560, 4590, 4620, 4650, 4680, 4710, 4740, 4770, 4800, 4830, 4860, 4890, 4920, 4950, 4980, 5010, 5040, 5070, 5100, 5130, 5160, 5190, 5220, 5250, 5280, 5310, 5340, 5370, 5400, 5430, 5460, 5490, 5520, 5550, 5580, 5610, 5640, 5670, 5700, 5730, 5760, 5790, 5820, 5850, 5880, 5910, 5940, 5970, 6000 ];
    }
    if (pixelsForRightwardScale < 300) {
      tickValuesToUse = [0,180,360,540, 720, 900, 1080, 1260, 1440, 1620, 1800, 1980, 2160, 2340, 2520, 2700, 2880, 3060, 3240, 3420, 3600, 3780, 3960, 4140, 4320, 4500, 4680, 4860, 5040, 5220, 5400, 5580, 5760, 5940, 6120, ];
    }
    x_axis = d3.axisBottom().scale(rightSvgStraightScale).tickFormat(logFormat10alt)
    .tickValues(tickValuesToUse);
    
  }
  
  //Append group and insert axis
  let xAxisGroup = upperRightSvg.append("g")
    .attr("id", "xAxisGroup")
    .call(x_axis);

  return upperRightSvg;
}
)}

function _rightSideWidth(){return(
900
)}

function _vb3(slider,maxHeight){return(
slider({
  min: 1, 
  max: maxHeight, 
  step: 1, 
  value:  300, 
  title: "height"
})
)}

function _mouseoverEventSpaceBackground(d3){return(
function  (event, d) {  // Add interactivity
  d3.select("#idgroup-"+d.id+" rect").classed("timeline-svg-id-rect-highlight", true ) ;
  let theBar = d3.select("#id-rect-"+d.id);
  theBar.classed("timeline-eventbar-hover", true);
}
)}

function _mouseoutEventSpaceBackground(d3){return(
function  (event, d) {  // Add interactivity
  d3.select("#idgroup-"+d.id+" rect").classed("timeline-svg-id-rect-highlight", false ) ;
  let theBar = d3.select("#id-rect-"+d.id);
  theBar.classed("timeline-eventbar-hover", false);
}
)}

function _stretcherCurrentVal(stretcher){return(
stretcher
)}

function _eventTypes(dataLoadedAction)
{
  let result = dataLoadedAction.events.map(v => `${v.type}:${v.subtype}`).sort(); // rawEventTypes
  return result;
}


function _73(dataLoadedAction){return(
dataLoadedAction.events
)}

function _brushedVertical(availableVertBrushHeight,d3){return(
(e) => {
//  console.log(`brushedVertical  evtype ${e.type}.`);
  if (e.type == "brush") {
    const sel = e.selection;
  //  console.log(`e ${JSON.stringify(e)}.`);
    let vertSelAsPercentOfHeight = sel[0]/availableVertBrushHeight();
    console.log(sel[0] + ', is ' + (vertSelAsPercentOfHeight).toFixed(4) +'%');
    let aChartHorOffsetElement = document.getElementById("aChartHorOffset");
    let chartHorVal = parseInt(aChartHorOffsetElement.value);  
    let negChartHorVal = 0 - chartHorVal;
    d3.select('#svgRightFirstGroup')
      .attr('transform', `translate(    ${negChartHorVal},${-sel[0]})`);
    d3.select('#svgFirstLeftGroup')
      .attr('transform', `translate(0,${-sel[0]})`);
    
    /*
            newVal = newVal + (rowChange * barHeight);
        //console.log(`delta ${event.deltaY}, rows: ${rowChange} newval ${newVal}.`);
        d3.select(".timeline-svg-right-rows").attr("transform",`translate(0,-${newVal})`);
        d3.select("#svgFirstLeftGroup").attr("transform",`translate(0,-${newVal})`);
        */
  }
}
)}

function _recalcVertScrollbarDiv(barHeight){return(
function(data){
  let leftSvgTd = document.getElementById("leftSvgTd");

  let vertScrollbarDiv = document.getElementById("vertScrollbarDiv");
  if(vertScrollbarDiv) {
    let leftOffsetHeight = leftSvgTd.offsetHeight + "px";
    vertScrollbarDiv.style.maxHeight = leftOffsetHeight;
    vertScrollbarDiv.style.height = leftOffsetHeight;

    let vertScrollbarInnerDiv = document.getElementById("vertScrollbarInnerDiv");
    let newInnerHeightInt =Math.max(0,(barHeight * (data.length-1))).toFixed(0);
    let newInnerHeight = newInnerHeightInt + "px";

    vertScrollbarInnerDiv.style.height = newInnerHeight;
    console.log(`newInnerHeight = ${newInnerHeight}.`);
  } else {
    console.log('Cannot call recalcVertScrollbarDiv yet.');
  }
}
)}

function _fontSize(barHeight){return(
Math.min(barHeight * 0.6, 14)
)}

function _mousemoveEventSpaceBackground(d3){return(
function  (event, d) {  // Add interactivity
  let coordinates = d3.pointer(event, event.currentTarget); // d3.select('#rightSvgTimeline');
  //console.log(`move ${event.y} ${coordinates}`);
}
)}

function _brushHeight(){return(
20
)}

function _brushVertical(d3,brushHeight,availableVertBrushHeight,brushedVertical){return(
d3.brushY()
    .extent([[0, 0], [brushHeight, availableVertBrushHeight()]])
    .on('brush end', brushedVertical)
)}

function _availableVertBrushHeight(){return(
function(){
  let idTableCell = document.getElementById("leftSvgTd");
  console.log('ID=='+JSON.stringify(idTableCell));
  let result =  (idTableCell ? idTableCell.offsetHeight : 100);
  console.log('RESULT ' + result);
  return result;
//  return 300;
}
)}

function _transformData(transformData1){return(
transformData1
)}

function _verticalLine(){return(
function(svg) {
  let l = svg.append("line");
  l
    .attr("opacity", 0)
    .attr("id", "verticalCrosshairLine")
    .attr("y1", 0)
    .attr("y2", 2000)
    .attr("stroke", "gray")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3, 3")
    .attr("pointer-events", "none");
  return l;
}
)}

function _createLowerRightSVG(rightSideWidth,brushHeight,minMax,brushHorizontal){return(
function(tableCell){

  
  var lowerRightSvg = tableCell.append('svg')
  .attr("id","lowerRightSliderSvg")
  //.attr("class", "timeline-svg-left")
  .attr("z-index", -1000)
  .attr('width', rightSideWidth)
  .attr('height', brushHeight+4); // TBD: get rid of 4

  var minmaxRange = minMax.max - minMax.min;
  // horizontalBrushWidth should be percentage of minmax range showing in rightSideWidth, or minimum of 20.
  var horizontalBrushWidth = Math.max(20, (rightSideWidth/minmaxRange)*rightSideWidth);
  const brushHorizontalGroup = lowerRightSvg.append('g')
    .attr('class', 'brush')
    .attr('transform', `translate(${0}, ${0})`)
    .call(brushHorizontal)
    .call(brushHorizontal.move, [0, horizontalBrushWidth]); //  // was width 180 x2(data[anchorIdx].name)]);
  
  brushHorizontalGroup.selectAll('rect').attr('height', brushHeight);
  return lowerRightSvg;
}
)}

function _createRightBrushGroupSVG(brushHeight,availableVertBrushHeight,vertPercentVisibleRows,brushVertical){return(
function(tableCell){

  var rightBrushSvg = tableCell.append('svg')
  .attr("id","rightBrushGroupSvg")
  //.attr("class", "timeline-svg-left")
  .attr("z-index", -1000)
  .attr('width', brushHeight+4)
  .attr('height', availableVertBrushHeight()); 

  console.log('PERCENTrows ' + vertPercentVisibleRows());
  console.log('AVAILheight ' + availableVertBrushHeight());
  let vertBrushLength = vertPercentVisibleRows() * availableVertBrushHeight();
  
  const brushVerticalGroup = rightBrushSvg.append('g')
    .attr('class', 'brush')
    .attr('transform', `translate(${0}, ${0})`)
    .call(brushVertical)
    .call(brushVertical.move, [0,  5]); // vertBrushLength]); //vertPercentVisibleRows() * availableVertBrushHeight()]); 
  
  brushVerticalGroup.selectAll('rect').attr('width', brushHeight);
  return rightBrushSvg;
  
}
)}

function _vertPercentVisibleRows(){return(
function(){
  return 22/100;
}
)}

function _86(html){return(
html`<input id="aChartHorOffset" value="0">`
)}

function _addVerticalCrosshair(verticalLine,d3){return(
function(anElement) {
  let elementId = anElement._groups[0][0].id;
  if(elementId.includes('right')){
    let verticalCrosshair  = verticalLine(anElement);
    anElement.on("mousemove", function(event){  
        let mouse = d3.pointer(event);
        // console.log(`vertcross ${JSON.stringify(mouse[0])} => ${verticalCrosshair.attr("x1")}`);
        let mousex = mouse[0];
        verticalCrosshair.attr("x1", mousex).attr("x2", mousex).attr("opacity", 1);
    }).on("mouseout", function(event){  
        verticalCrosshair.attr("opacity", 0);
    });
  } else {
    // no crosshair
  }
}
)}

function _createOuterSvgEventHandlers(barHeight,d3){return(
function(anElement){

  
  anElement
    .on(
    "wheel",
    function(event) {
      event.preventDefault();
      let rowChangeUnsigned = event.shiftKey ? 10 : 1; 
      let rowChange = event.deltaY > 0 ? rowChangeUnsigned : 0-rowChangeUnsigned;

      let aChartVertOffsetElement = document.getElementById("aChartVertOffset");
      let chartVertVal = parseInt(aChartVertOffsetElement.value);
      
      let aChartHorOffsetElement = document.getElementById("aChartHorOffset");
      let chartHorVal = parseInt(aChartHorOffsetElement.value);  
      
      let newVal = 0;
      if (rowChange > 0) {
        // scroll a row down unless we are beyond bounds
        newVal = chartVertVal + (rowChange * barHeight);
        
        d3.select(".timeline-svg-right-rows").attr("transform",`translate(${-chartHorVal},${-newVal})`);
        d3.select("#svgFirstLeftGroup").attr("transform",`translate(0,${-newVal})`);
        aChartVertOffsetElement.value = newVal;
      } else {
        newVal = Math.max(0, chartVertVal + (rowChange * barHeight));

        d3.select(".timeline-svg-right-rows").attr("transform",`translate(${-chartHorVal},${-newVal})`);
        d3.select("#svgFirstLeftGroup").attr("transform",`translate(0,${-newVal})`);
        aChartVertOffsetElement.value = newVal;
      }
      
      let vs = document.getElementById("vertScrollbarDiv");
      vs.scroll(0, newVal);

    }
  );
  
  return  0;
}
)}

function _89(tlConfig){return(
tlConfig.firmColors
)}

function _90(getData){return(
getData()[0].events[0]
)}

function _theAttrs(tlConfig){return(
tlConfig.attrs
)}

function _createEventElementGroups(tlConfig,trackHeight,minMax,stretcher,smartPixelScale,d3,hideSvgEventTooltip,$0,showSvgEventTooltip,setupEventContextMenu){return(
function(eventGroups) {
  //console.log(`CEEG ${Date.now()}`);

  // Map event "Radiation" to track "1" (0-based). Tells us the Y offset to draw in.
  let eventTrackYOffsetMap = new Map();
  tlConfig.bars.map(b => {
    b.events.map(e => {
      eventTrackYOffsetMap.set(e.toLowerCase(), b.row * trackHeight); // here "row" from config's bar is same as "track". 
    });
  });
  /*
  function logMapElements(value, key, map) {
    console.log(`map.get('${key}') = ${value}`)
  }
  eventTrackYOffsetMap.forEach(logMapElements)
  console.log('end of eventTrakYOffsetMap')
  */
  
  let eventElementGroups =  eventGroups.selectAll('g events')  
  .data(function(d,i){return d.events})
  .enter()
  .append('g')
  .classed('events', true); 

  
  let maxiMin = minMax.max - minMax.min; 
  let stretcherVal = stretcher;

  // use smartPixelScale to compute start and end pixels.
  //let smartPixelStart = smartPixelScale()
  
  // We need a new map to turn the Oncoscape/three.js integer colors into web colors.
  let firmColorKeys = Object.keys(tlConfig.firmColors);
  let firmColorsSet = new Set(firmColorKeys);
  let firmColorsMap = new Map();
  firmColorKeys.map(v => {
    let newColor = '#' + ("000000"+(tlConfig.firmColors[v]).toString(16)).slice(-6);
    // console.log(`${v}, pre:${tlConfig.firmColors[v+""]} post:${newColor}`);
    firmColorsMap.set(v, newColor);
  });
  
  function properColorFromD(d) {
      // see if type is in tlConfig.firmColors.
      let lookupType =d.subtype.toLowerCase();
      if(firmColorsSet.has(lookupType)){
        let c = firmColorsMap.get(lookupType);
        //console.log('firm color ' + c); //     +", lt=" + lookupType);
        return c;
      } else {
        console.log(`no firm for [${lookupType}]`);
        return d.color 
      }
  }
  
  // Create groups for bars or arcs
  let barsOrArcs = eventElementGroups
    .filter(function(d) { return (d.dateError == false) && (d.style =="Bars" || d.style == "Arcs")})
    .sort(function(a, b) {
       return b.end - a.end;  // reverse sort: first event to end is last to be drawn, on top.
     })
    .filter(function(d) { 
      if (d.end == d.start) {
        d["barArcWidth"] = 1;
      } else {
        let expectedW = (smartPixelScale(d.end) - smartPixelScale(d.start)) * stretcherVal;
        if(expectedW < 0) {
          expectedW = 2; // !!! TBD - fix cause of negative width.
        }
        d["barArcWidth"] = expectedW; 
      }
      return d;
    })
    .classed("g-bars-arcs", true);
  
  // Add bars
  let barGroups = barsOrArcs
    .filter(function(d) { return d.style =="Bars" });
  barGroups.classed("g-bars", true).raise();
  barGroups
    .append('rect')
    .attr("idDataForSvg", (d)=> { return d.idDataForSvg })  
    .attr("fill", (d)=> {  
      return properColorFromD(d);
    }) 
  .filter(function(d) {
    // console.log(`${d.subtype}=> map ${eventTrackYOffsetMap.get(d.subtype)}`);
  return true;
})
    .attr("transform", (d,i)=> `translate(${1+ Math.min(maxiMin, smartPixelScale(d.start) * stretcherVal)}, ${eventTrackYOffsetMap.get(d.subtype.toLowerCase())})`)
    .attr("x", (d,i)=> 0)
    .attr("y", (d,i)=> trackHeight * 0.3)
    .attr("rx", 3)
    .attr("width", (d)=> {
      return d["barArcWidth"];  // already scaled for log if needed, above.
    })
    .attr("height", trackHeight * 0.4);
    

  // Add arcs
  let arcMidpointHeight = trackHeight * 0.9;
  let arcGroups = barsOrArcs
    .filter(function(d) { return d.style =="Arcs" });
  arcGroups.classed("g-arcs", true).raise();
  arcGroups
    .append('path')
    .attr("idDataForSvg", (d)=> { return d.idDataForSvg }) 
    .attr('fill', 'none')
    .attr("stroke", (d)=> {  
      return properColorFromD(d);
    }) 
    .attr('d', (d) => { return `M 0,${arcMidpointHeight + eventTrackYOffsetMap.get(d.subtype.toLowerCase()) } S ${d["barArcWidth"] / 2},${eventTrackYOffsetMap.get(d.subtype.toLowerCase()) -arcMidpointHeight},${d["barArcWidth"]},${arcMidpointHeight + eventTrackYOffsetMap.get(d.subtype.toLowerCase()) }`})
    .attr("transform", (d,i)=> `translate(${1+ Math.min(maxiMin, smartPixelScale(d.start) * stretcherVal)}, 0)`);
  
  let subtypeToShapeMap = new Map();
  tlConfig.bars.map(bar => {
    bar.events.map(e => {
      subtypeToShapeMap.set(e.toLowerCase(), bar.shape ? bar.shape.toLowerCase() : "circle");
    });
  });
  
  // Good symbols
  let allGoodSymbols = eventElementGroups
    .filter(function(d) {
      return  (d.dateError == false) && (d.style =="Symbols") && (d.start == d.end);
    })
    .filter(function(d) {
      // If no shape property exists, default to circle.
      // Do this mapping once and store it, as we'll check it several times.
      d.shapeForSubtype = subtypeToShapeMap.get(d.subtype.toLowerCase());
      return d;
    })
  .filter(function(d) {
    // console.log(`SYMBOL ${d.subtype}=>   ${d.shapeForSubtype}`);
  return true;
})
    .classed("actualGoodSymbols", true)
    .raise();
  
  // add circles
  allGoodSymbols
    .filter(function(d) {
      return (d.shapeForSubtype == "circle"); //  (subtypeToShapeMap.get(d.subtype.toLowerCase()) == "circle");
    })
    .append('circle')
    .attr('idDataForSvg', (d)=> { return d.idDataForSvg })  
    .attr("fill", (d)=> {  
      return properColorFromD(d);
    }) 
    .attr("transform", (d,i)=> `translate(${Math.min(maxiMin, smartPixelScale(d.start))*stretcherVal}, 0)`)
    .attr("cx", (d,i)=> 0)
    .attr("cy", (d,i)=> eventTrackYOffsetMap.get(d.subtype.toLowerCase()) + trackHeight * 0.5) 
    .attr("r", trackHeight * 0.35)
    .attr("height", trackHeight * 0.2);

  // add squares
  allGoodSymbols
    .filter(function(d) { return (d.shapeForSubtype == "square" ) })
    .append('rect')
    .attr('idDataForSvg', (d)=> { return d.idDataForSvg })  
    .attr("fill", (d)=> {  
      return  properColorFromD(d);
    }) 
    .attr("transform", (d,i)=> `translate(${Math.min(maxiMin, smartPixelScale(d.start))*stretcherVal}, 0)`)
    .attr("x", (d,i)=> trackHeight * -0.1)
    .attr("y", (d,i)=> eventTrackYOffsetMap.get(d.subtype.toLowerCase())  + (trackHeight * 0.1) ) 
    .attr("width", trackHeight * 0.8)
    .attr("height", trackHeight * 0.8);

  // add diamonds
  let halfTrackHeight = (trackHeight * 0.5);
  let diamondLength = (trackHeight * 0.4);
  allGoodSymbols
    .filter(function(d) { return (d.shapeForSubtype == "diamond" ) })  
    .append('polygon')
    .attr('idDataForSvg', (d)=> { return d.idDataForSvg }) 
    .attr("fill", (d)=> {  
      return  properColorFromD(d);
    }) 
    .attr("transform", (d,i)=> `translate(${Math.min(maxiMin, smartPixelScale(d.start) )*stretcherVal}, ${eventTrackYOffsetMap.get(d.subtype.toLowerCase()) })`)
    .attr("points", `${0},${halfTrackHeight - diamondLength} ${diamondLength},${halfTrackHeight} ${0},${halfTrackHeight + diamondLength} ${-diamondLength},${halfTrackHeight}`);

  // add triangles
  allGoodSymbols
    .filter(function(d) { return (d.shapeForSubtype == "triangle" ) }) // really triangles
    .append('polygon')
    .attr('idDataForSvg', (d)=> { return d.idDataForSvg })  
    .attr("fill", (d)=> {  
      return  properColorFromD(d);
    }) 
    .attr("transform", (d,i)=> `translate(${Math.min(maxiMin, smartPixelScale(d.start) )*stretcherVal}, ${eventTrackYOffsetMap.get(d.subtype.toLowerCase())} )`)
    .attr("points", `${0},${halfTrackHeight - diamondLength} ${diamondLength},${halfTrackHeight + diamondLength} ${0-diamondLength},${halfTrackHeight + diamondLength}`);

  
  // Bad "symbols", where start != end.
  let badGroups = eventElementGroups
    .filter(function(d) { return d.dateError })
    .classed("actualBadSymbols", true)
    .raise()
    .append('g')
    .attr('idDataForSvg', (d)=> { return d.idDataForSvg }) 

    .attr("transform", (d,i)=> `translate(${ Math.min(maxiMin, smartPixelScale(d.start))*stretcherVal}, ${eventTrackYOffsetMap.get(d.subtype.toLowerCase())} )`);
  
  let exclamationHalfWidth = trackHeight * 0.12
  badGroups
    .append('rect')
    .attr("fill", (d)=> d.color) 
    .attr("x", (d,i)=> -exclamationHalfWidth)
    .attr("y", trackHeight * 0.1)  // top part of exclamation is .2 to .6. Bottom is .8 to .9
    .attr("width", exclamationHalfWidth+exclamationHalfWidth)
    .attr("height", trackHeight * 0.5); 
  badGroups
    .append('rect')
    .attr("fill", (d)=> d.color) 
    .attr("x", (d,i)=> -exclamationHalfWidth)
    .attr("y", trackHeight * 0.7)  // top part of exclamation is .2 to .6. Bottom is .8 to .9
    .attr("width", exclamationHalfWidth+exclamationHalfWidth)
    .attr("height", trackHeight * 0.2);



  eventElementGroups
    .classed("timeline-svg-event-actual", true)  // way to find all actual timeline events
    .classed("timeline-svg-event-no-highlight",true)
    .attr("cursor", "pointer")
    .attr("id", (d,i)=> "event-actual-pidid-"+d.p+"-"+i)
    .on("mouseout", function(event, d, i) {
      d3.select(this)
        .classed("timeline-svg-event-highlight", false )
        .classed("timeline-svg-event-no-highlight", true );
      hideSvgEventTooltip();
      $0.value = null;
    })
    .on("mouseover", function(event,d, i) {

    let te = d3.select(this);
    te
      .classed("timeline-svg-event-highlight", true )
      .classed("timeline-svg-event-no-highlight", false );
    let thisEvent = te.data()[0];
    showSvgEventTooltip(thisEvent);

    $0.value = { 
      timelineEvent:thisEvent,
      mouseEvent: event
    }
  });

  setupEventContextMenu(eventElementGroups);

  return eventElementGroups;
}
)}

function _clickEventSpaceBackground(){return(
function handleMouseOver(event, d) {  // Add interactivity
  console.log('should deselect all rows?');
}
)}

function _createRightSVG(rightSideWidth,maxHeight,clickEventSpaceBackground,vb3){return(
function(outerSvg) {
  var rightSVG = outerSvg.append('svg')
      .attr("id","rightSvgTimeline")
      .attr("class", "timeline-svg-right")
      .attr('width', rightSideWidth) // 1000
      .attr('height', maxHeight); // 200

  rightSVG.on("click", clickEventSpaceBackground);
  
  var margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left:  0 //+ leftPanelOffset
  };
  var w =  rightSideWidth ; //1000 - margin.left - margin.right;  //inner width for the chart, within SVG element
  var h = vb3; //300 - margin.top - margin.bottom;  //inner height for the chart, within SVG element

  rightSVG
  .attr("viewBox", `0 0 ${rightSideWidth} ${vb3}`) //    3rd was vb2, now is rightsidewidth
  .attr("width", w + margin.left + margin.right)
  .attr("height", h + margin.top + margin.bottom);

 // rightSVG.call(tool_tip);
  return rightSVG;  
}
)}

function _cellGroupingColorList(){return(
["red","blue","green","orange","cyan","yellow","black","gray","red","blue","green","orange","cyan","yellow","black","gray","red","blue","green","orange","cyan","yellow"]
)}

function _cellAttrColorList(){return(
["orange","cyan","yellow","black","magenta","red","blue","green","purple","yellowgreen","orange","cyan","yellow","black","magenta","red","blue","green","purple","yellowgreen","orange","cyan","yellow","black","magenta","red","blue","green","purple","yellowgreen","orange","cyan","yellow","black","magenta","red","blue","green","purple","yellowgreen","orange","cyan","yellow","black","magenta","red","blue","green","purple","yellowgreen"]
)}

function _createLeftSVG(vb3,getData,barHeight,d3,clickIdGroup,fontSize,tlConfig,dataLoadedAction,cellAttrColorList,rawPatientsFromJson){return(
function(tableCell) {
  let cellWidth = 100; //100
  var leftSvg = tableCell.append('svg') 
  .attr("id","leftSvgTimeline")
  .attr("class", "timeline-svg-left")
  .attr("z-index", -1000)
  .attr('width', cellWidth)
  .attr('height', vb3);

  let d = 12345;
  
  var svgFirstLeftGroup = leftSvg
  .append("g")
  .attr("id", "svgFirstLeftGroup");
  
  let localData = getData();
  let idBars = svgFirstLeftGroup.selectAll("g")
  .data(localData)
  .enter().append("g") 
  .classed("timeline-svg-row", true)   
  .attr("transform", function(d, i) { 
    return "translate(0," + i * barHeight + ")"; 
  });

  var idGroupWidth = 120; //135;
  
    // ID column in left side.
  let idBarGroups = idBars.append("g")
    .attr("patientData", d)
    .classed("timeline-idgroup", true)
    .attr("id", function(d,i) { return "idgroup-"+d.id})
    .on("mouseover", function(e,d) {
      let theBar = d3.select("#id-rect-"+d.id);
      theBar.classed("timeline-eventbar-hover", true);
    })
    .on("mouseout", function(e,d) {
      let theBar = d3.select("#id-rect-"+d.id);
      theBar.classed("timeline-eventbar-hover", false);
    })
    .on("click", clickIdGroup);
  
  let idBarRects = idBarGroups
    .append("rect")
    .attr("width", idGroupWidth)
    .attr("class", "timeline-svg-id-rect")
    .attr("fill", "red")
    .attr("height", barHeight - 1)
    .on("mouseover", function() {
      d3.select(this)
        .attr('fill', null) // Un-sets the "explicit" fill
        .classed("timeline-svg-id-rect-highlight", true ) 
    })
    .on("mouseout",  function() {
      d3.select(this)
        .classed("timeline-svg-id-rect-highlight", false)
    });

    idBarGroups.append("text")
    .classed( "timeline-svg-id-text", true)
    .classed('noselect', true)
    .attr("font-size", fontSize)
    .attr("x", 25)
    .attr("y", barHeight / 2)
    .text(function(d,i) { return i +" " + d.id; })
    .on("click", clickIdGroup)
  
  // MNJ ==== highlight parent rect
    .on("mouseover", function(e,d) {
      d3.select("#idgroup-"+d.id).select('rect')
      //d3.select(this).parentNode.select('.timeline-svg-id-rect')
        .attr('fill', null) // Un-sets the "explicit" fill for timeline-svg-id-rect
        .classed("timeline-svg-id-rect-highlight", true ) 
    })
    .on("mouseout",  function(e,d) {
      d3.select("#idgroup-"+d.id).select('rect')
      //d3.select(this).parentNode.select('.timeline-svg-id-rect')
        .classed("timeline-svg-id-rect-highlight", false)
    });
  
  let idBarGroupingRects = idBarGroups
    .append("rect") 
    .classed("timeline-svg-id-rect", true)
    .classed("timeline-svg-id-grouping-rect", true)
    .attr("width", 24)
    //.attr("class", "timeline-svg-id-rect")
    /*.attr("fill", (d) => {
      let dgrpId = d["_groupByIdx"];
      return(dgrpId ? cellGroupingColorList[dgrpId] : "red");
    })
    */
    .attr("x", 0)
    .attr("y", 1)
    .attr("height", barHeight - 2)
      .append("title")
      .text("");
  
  //let theBar = d3.select("#id-rect-"+d.id);
  //theBar.classed("timeline-eventbar-hover", false);

  let spaceBetweenAttrBoxes = 5;
  let currentAttrBoxOffset = spaceBetweenAttrBoxes;
  let attrCount = 0;
  tlConfig.attrs.map(a => {
    console.log('ATTR ' + a);
    let boxWidth = barHeight - 4; // 2 in from each side
    currentAttrBoxOffset = currentAttrBoxOffset + boxWidth;
    //console.log(`Create box at ${currentAttrBoxOffset}.`);
    
    let field = dataLoadedAction.fields.filter(v => v.label == a)[0];
    //console.dir(field);
    let numberRange = 0;
    if(field.type == "NUMBER") {
      numberRange = field.values.max - field.values.min;
    }
    
    let colorFromFieldValue = function(value, pid){ // pid is for debugging
      if(field.type == "STRING") {
        // console.log('valid color for '+value);
        let idx = field.values.indexOf(value) 
        return cellAttrColorList[idx + attrCount*4]  // assume 4 colors per attribute, so they don't overlap
      } else {
        // Find number
        let percent = (value-field.values.min)/numberRange;
        // console.log(`${pid} val=${value}  %=${percent}.`)
        return d3.interpolateViridis(percent);
      }
    }

    idBarGroups
      .append("rect")
      .classed("timeline-svg-id-attr-rect", true)
      .attr("width", boxWidth)
      .attr("stroke-width", 1)
      .attr("stroke", "white") 
      .attr("fill", (d) => {
        let patient = rawPatientsFromJson.find(v => v.p == d.id);
        if(patient) {
          let fieldValue = patient[field.key]
          return colorFromFieldValue(fieldValue, d.id);
        } else {
          return "white"
        }
      })
      
      .attr("x", (17+cellWidth) - currentAttrBoxOffset )  
      .attr("y", 2)
      .attr("height", boxWidth)
        .append("title")
        .text((d) => {
          let patient = rawPatientsFromJson.find(v => v.p == d.id);
          if(patient) {
            let fieldValue = patient[field.key]
            // return colorFromFieldValue(fieldValue, d.id);
            return`${a}: ${fieldValue}`;
          } else {
            return ""
          }
           
        });
    currentAttrBoxOffset = currentAttrBoxOffset + spaceBetweenAttrBoxes;
    attrCount++;
  });

  
  //
  leftSvg.attr("viewBox", `17 0 ${cellWidth} ${vb3}`) // ${vb1}
  return leftSvg;
}
)}

function _tool_tip(d3Tip){return(
d3Tip()
      .attr("class", "tooltip-nowrap") //"d3-tip")
      .offset([-8, 0])
      .html(function(d) { return `ITEM ${d.p}_${d.i} ${d.start}-${d.end}`; })
)}

function _margin(){return(
{top: 20, right: 0, bottom: 100, left: 40}
)}

function _showSvgEventTooltip(tool_tip,$0){return(
function(event){
  //log(`ITEM ${event.p}_${event.i} ${event.start}-${event.end}`);
  let dataAsStr = event.data;
  if(dataAsStr != null) {
    let s = '';
    for (const [key, value] of Object.entries(dataAsStr)) {
      if (value && value != '' && value != ' ') {
        s = s + ` ${key}=${value}`;
      }
    }
    dataAsStr = s.substring(0,80);
  }
  
  tool_tip.show;
  $0.value = `${event.p}_${event.i} ${event.subtype}   ${event.start} to ${event.end}. Data: ${dataAsStr}`;

  
}
)}

function _hideSvgEventTooltip($0,tool_tip){return(
function(){
  $0.value = '';
  tool_tip.hide
}
)}

function _generateAlignOptions(){return(
function(_alignOptionsData, preferedSelection){
  let options = _alignOptionsData.map(v => `<option  value="${v}" ${ v == preferedSelection ? "selected" : ""}>${v}</option>`);
  return options;
}
)}

function _generateGroupingOptions(){return(
function(_groupingOptionsData, preferedSelection){
  let options = _groupingOptionsData.map(v => `<option  value="${v}" ${ v == preferedSelection ? "selected" : ""}>${v}</option>`);
  return options;
}
)}

function _getData(transformData){return(
function(){
  let result = transformData; 
  result.map((v,i) => v["originalOrderPos"] = i);
  return result; //.filter(v=>v.id=="a2-a04p" )
}
)}

function _105(transformData1){return(
transformData1.slice(0,4)
)}

function _transformData1(loadedRawData,getEventStyle){return(
loadedRawData.patients.map(u=> { 
  return {id: u[0].p, 
          events:  u.map((v,i) => {
            // Look for conditions marking a date error
            let dateError = v.end==null && v.start == null;
            if (dateError == false){
              dateError = (getEventStyle(v) == "Symbols" && v.start != v.end); 

            }

            let eventSubtype = v.subtype ? v.subtype.replaceAll(" ","_") : "null";
            let idDataForSvg = `patientId:${v.p}.type:${v.type}.subtype:${eventSubtype}.style:tic.i:${i}`;

            return {
              p: v.p,
              i: i,
              start: v.start ? v.start : 0, 
              end: v.end, 
              type: v.type, 
              subtype: v.subtype,
              data: v.data,
              //originals, and data
              color: '#'+v.color.toString(16),
              style: getEventStyle(v),
              dateError: dateError,
              idDataForSvg: idDataForSvg
            }
          })
         }})
)}

function _107(html){return(
html`<input id="aChartVertOffset" value="0">`
)}

function _d3Tip(require){return(
require("d3-tip")
)}

function _l(loadedRawData){return(
loadedRawData.patients.slice(2,8)
)}

function _minMax(loadedRawData){return(
loadedRawData.minMax
)}

function _testSliceSizeForLoadedRawData(){return(
10000
)}

function _numShmoopLoops(){return(
10
)}

function _shmoop2(rawDataFromJson,numShmoopLoops)
{
   let basics = []
   rawDataFromJson.patients.map( pEventList =>  {

     for (let i = 0; i < numShmoopLoops; i++) {
       let pMoreEvents = [];
       let newEvents = []
       pEventList.map(pel => {
         //console.dir(pel)
         let pelNew = { ...pel }
         pelNew['p'] = (100+i)+"_"+pel['p']
         pelNew['start'] = pelNew['start']+(i*3)
         pelNew['end'] = pelNew['end']+(i*3)
         newEvents.push(pelNew)
       });
       //console.log('neweventslen= ' + newEvents.length)
       //console.dir(newEvents)
       //console.log('after newevents')
       pMoreEvents = pMoreEvents.concat(newEvents) //pEventList)
       basics.push(pMoreEvents)
   
     }
   
   });

   return basics
 }


function _shmoopPids(rawDataFromJson,numShmoopLoops)
{
   let pids = []
   rawDataFromJson.patients.map( pEventList =>  {
     for (let i = 0; i < numShmoopLoops; i++) {
       let pid = (100+i)+"_"+pEventList[0]['p']
       pids.push(pid)
     }
   });

   return pids
 }


function _115(rawDataFromJson){return(
rawDataFromJson.attrs
)}

function _loadedRawData(rawPatientsFromJson,rawDataFromJson,shmoop2,shmoopPids,testSliceSizeForLoadedRawData)
{
  let testPatientStuff= {
    minMax: {min:-500, max:5000}, attrs:{pids: rawPatientsFromJson.map(v=>v.p), attrs:[]}
  }
  let thesePatients = []
  let result = {}

  let smallTest = true

  if (smallTest){
    console.log('===small test==')
      console.dir(rawDataFromJson)
    thesePatients = rawDataFromJson.patients
    result = {
      minMax: rawDataFromJson.minMax,
      attrs: rawDataFromJson.attrs,
    }
  } else {
    console.log('===large test==')
      console.dir(rawDataFromJson)
    thesePatients = shmoop2 //rawDataFromJson.patients
    result = {
      minMax: rawDataFromJson.minMax,
      attrs: rawDataFromJson.attrs,
    }
    result.attrs.pids = shmoopPids
  }

  console.dir(thesePatients)
  
  let patientArray = thesePatients.slice(0, testSliceSizeForLoadedRawData) // 1000
  .map(v => {
      return v;
    });

  result['patients'] = patientArray

  return result
  //return {
    //minMax: rawDataFromJson.minMax, 
  //  attrs: rawDataFromJson.attrs,
  //  patients: patientArray
  //}
}


function _rawDataFromJson(tinyEventData)
{
  // let myUrl = "https://oncoscape-sites-dev.s3-us-west-2.amazonaws.com/TcgaGliomaEvents.json"
  // let url = "https://cors-anywhere.herokuapp.com/" + myUrl
  // let url = "http://thingproxy.freeboard.io/fetch/" + myUrl
  
  //      https://oncoscape-sites-dev.s3-us-west-2.amazonaws.com/tcgaBreastEvents.txt");  

  
  // let loadedJson = await d3.json(url); 
  let loadedJson = JSON.parse(tinyEventData)
  
  //return loadedRawDataOriginalFromBrain; // !!! 
  return loadedJson;
}


function _loadedRawDataOriginalFromBrain(){return(
JSON.parse(`{
  
  "minMax": {
    "min": -325,
    "max": 6423
  },
  "patients": [
    [
      {
        "p": "06-0876",
        "start": 98,
        "end": 271,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": "350 mg",
          "prescribed dose": " mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 98,
        "originalEnd": 271,
        "originalIndex": 0,
        "color": 3697840
      },
      {
        "p": "06-0876",
        "start": 17,
        "end": 60,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 17,
        "originalEnd": 60,
        "originalIndex": 1,
        "color": 3697840
      },
      {
        "p": "06-0876",
        "start": 112,
        "end": 416,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 112,
        "originalEnd": 416,
        "originalIndex": 2,
        "color": 3697840
      },
      {
        "p": "06-0876",
        "start": 462,
        "end": 1146,
        "data": {
          "response": "",
          "type": "Targeted Molecular therapy",
          "drug": "Bevacizumab",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 462,
        "originalEnd": 1146,
        "originalIndex": 3,
        "color": 3697840
      },
      {
        "p": "06-0876",
        "start": 462,
        "end": 560,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Irintocean",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 462,
        "originalEnd": 560,
        "originalIndex": 4,
        "color": 3697840
      },
      {
        "p": "06-0876",
        "start": 271,
        "end": 271,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Alive",
          "performance  scale timing": "Preoperative"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 271,
        "originalEnd": 271,
        "originalIndex": 1505,
        "color": 8374655
      },
      {
        "p": "06-0876",
        "start": 1405,
        "end": 1405,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Alive",
          "performance  scale timing": "Post-Adjuvant Therapy"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 1405,
        "originalEnd": 1405,
        "originalIndex": 1506,
        "color": 8374655
      },
      {
        "p": "06-0876",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2160,
        "color": 12496596
      },
      {
        "p": "06-0876",
        "start": 17,
        "end": 60,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 17,
        "originalEnd": 60,
        "originalIndex": 4358,
        "color": 15729279
      },
      {
        "p": "06-0876",
        "start": 446,
        "end": 446,
        "data": {
          "type": "OTHER",
          "dose": "2000",
          "course": "2"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 446,
        "originalEnd": 446,
        "originalIndex": 4359,
        "color": 15729279
      }
    ],
    [
      {
        "p": "06-0167",
        "start": 24,
        "end": 68,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 24,
        "originalEnd": 68,
        "originalIndex": 5,
        "color": 3697840
      },
      {
        "p": "06-0167",
        "start": 77,
        "end": 197,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 77,
        "originalEnd": 197,
        "originalIndex": 6,
        "color": 3697840
      },
      {
        "p": "06-0167",
        "start": 258,
        "end": 289,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "PS341",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 258,
        "originalEnd": 289,
        "originalIndex": 7,
        "color": 3697840
      },
      {
        "p": "06-0167",
        "start": 347,
        "end": 347,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 347,
        "originalEnd": 347,
        "originalIndex": 2162,
        "color": 16629894
      },
      {
        "p": "06-0167",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2163,
        "color": 12496596
      },
      {
        "p": "06-0167",
        "start": 24,
        "end": 68,
        "data": {
          "type": "External",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 24,
        "originalEnd": 68,
        "originalIndex": 4360,
        "color": 15729279
      }
    ],
    [
      {
        "p": "02-0085",
        "start": 740,
        "end": 786,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": "75 mg/m2/day",
          "prescribed dose": " mg/m2/day"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 740,
        "originalEnd": 786,
        "originalIndex": 8,
        "color": 3697840
      },
      {
        "p": "02-0085",
        "start": 1561,
        "end": 1561,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": ""
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 1561,
        "originalEnd": 1561,
        "originalIndex": 1507,
        "color": 8374655
      },
      {
        "p": "02-0085",
        "start": 1561,
        "end": 1561,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 1561,
        "originalEnd": 1561,
        "originalIndex": 2166,
        "color": 16629894
      },
      {
        "p": "02-0085",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2167,
        "color": 12496596
      },
      {
        "p": "02-0085",
        "start": 740,
        "end": 786,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 740,
        "originalEnd": 786,
        "originalIndex": 4361,
        "color": 15729279
      }
    ],
    [
      {
        "p": "26-6174",
        "start": 29,
        "end": 66,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": "2850 mg/m2",
          "prescribed dose": "75 mg/m2"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 29,
        "originalEnd": 66,
        "originalIndex": 9,
        "color": 3697840
      },
      {
        "p": "26-6174",
        "start": 71,
        "end": 71,
        "data": {
          "person neoplasm cancer": "",
          "vital": "Alive",
          "performance  scale timing": "Post-Adjuvant Therapy"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 71,
        "originalEnd": 71,
        "originalIndex": 1508,
        "color": 8374655
      },
      {
        "p": "26-6174",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2170,
        "color": 12496596
      },
      {
        "p": "26-6174",
        "start": 29,
        "end": 70,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "60",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 29,
        "originalEnd": 70,
        "originalIndex": 4362,
        "color": 15729279
      }
    ],
    [
      {
        "p": "06-2563",
        "start": 27,
        "end": 57,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": "120 mg",
          "prescribed dose": "75 mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 27,
        "originalEnd": 57,
        "originalIndex": 10,
        "color": 3697840
      },
      {
        "p": "06-2563",
        "start": 934,
        "end": null,
        "data": {
          "response": "",
          "type": "Targeted Molecular therapy",
          "drug": "Bevacizumab",
          "total dose": "549 mg",
          "prescribed dose": "10 mg/kg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 934,
        "originalEnd": null,
        "originalIndex": 11,
        "color": 3697840
      },
      {
        "p": "06-2563",
        "start": 885,
        "end": 931,
        "data": {
          "response": "",
          "type": "Targeted Molecular therapy",
          "drug": "R04929097",
          "total dose": "20 mg/day",
          "prescribed dose": "20 mg/day"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 885,
        "originalEnd": 931,
        "originalIndex": 12,
        "color": 3697840
      },
      {
        "p": "06-2563",
        "start": 259,
        "end": 259,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Alive",
          "performance  scale timing": "Preoperative"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 259,
        "originalEnd": 259,
        "originalIndex": 1510,
        "color": 8374655
      },
      {
        "p": "06-2563",
        "start": 932,
        "end": 932,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Alive",
          "performance  scale timing": "Post-Adjuvant Therapy"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 932,
        "originalEnd": 932,
        "originalIndex": 1511,
        "color": 8374655
      },
      {
        "p": "06-2563",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2177,
        "color": 12496596
      },
      {
        "p": "06-2563",
        "start": 27,
        "end": 57,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "46",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 27,
        "originalEnd": 57,
        "originalIndex": 4363,
        "color": 15729279
      },
      {
        "p": "06-2563",
        "start": 566,
        "end": 576,
        "data": {
          "type": "OTHER",
          "dose": "3200",
          "course": "2"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 566,
        "originalEnd": 576,
        "originalIndex": 4364,
        "color": 15729279
      }
    ],
    [
      {
        "p": "12-1096",
        "start": 202,
        "end": 277,
        "data": {
          "response": "",
          "type": "Targeted Molecular therapy",
          "drug": "Avastin",
          "total dose": " mg/m2",
          "prescribed dose": " mg/m2"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 202,
        "originalEnd": 277,
        "originalIndex": 13,
        "color": 3697840
      },
      {
        "p": "12-1096",
        "start": 63,
        "end": 101,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodor",
          "total dose": "75 mg/m2",
          "prescribed dose": " mg/m2"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 63,
        "originalEnd": 101,
        "originalIndex": 14,
        "color": 3697840
      },
      {
        "p": "12-1096",
        "start": 130,
        "end": 201,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodor",
          "total dose": "300 mg/m2",
          "prescribed dose": " mg/m2"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 130,
        "originalEnd": 201,
        "originalIndex": 15,
        "color": 3697840
      },
      {
        "p": "12-1096",
        "start": 202,
        "end": 277,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "CPT-11",
          "total dose": "250 mg/m2",
          "prescribed dose": " mg/m2"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 202,
        "originalEnd": 277,
        "originalIndex": 16,
        "color": 3697840
      },
      {
        "p": "12-1096",
        "start": null,
        "end": null,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": "Pre-Adjuvant Therapy"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": null,
        "originalEnd": null,
        "originalIndex": 1512,
        "color": 8374655
      },
      {
        "p": "12-1096",
        "start": 277,
        "end": 277,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 277,
        "originalEnd": 277,
        "originalIndex": 2179,
        "color": 16629894
      },
      {
        "p": "12-1096",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2180,
        "color": 12496596
      },
      {
        "p": "12-1096",
        "start": 63,
        "end": 104,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 63,
        "originalEnd": 104,
        "originalIndex": 4365,
        "color": 15729279
      }
    ],
    [
      {
        "p": "19-2629",
        "start": 148,
        "end": 198,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Avastin",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 148,
        "originalEnd": 198,
        "originalIndex": 17,
        "color": 3697840
      },
      {
        "p": "19-2629",
        "start": 10,
        "end": 69,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": "7560 mg",
          "prescribed dose": "180 mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 10,
        "originalEnd": 69,
        "originalIndex": 18,
        "color": 3697840
      },
      {
        "p": "19-2629",
        "start": 104,
        "end": 135,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": "3500 mg",
          "prescribed dose": "350 mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 104,
        "originalEnd": 135,
        "originalIndex": 19,
        "color": 3697840
      },
      {
        "p": "19-2629",
        "start": 501,
        "end": 501,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": ""
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 501,
        "originalEnd": 501,
        "originalIndex": 1513,
        "color": 8374655
      },
      {
        "p": "19-2629",
        "start": 737,
        "end": 737,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 737,
        "originalEnd": 737,
        "originalIndex": 2182,
        "color": 16629894
      },
      {
        "p": "19-2629",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2183,
        "color": 12496596
      },
      {
        "p": "19-2629",
        "start": 10,
        "end": 69,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 10,
        "originalEnd": 69,
        "originalIndex": 4366,
        "color": 15729279
      }
    ],
    [
      {
        "p": "02-0010",
        "start": 509,
        "end": 569,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": "200 mg/m2",
          "prescribed dose": " mg/m2"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 509,
        "originalEnd": 569,
        "originalIndex": 20,
        "color": 3697840
      },
      {
        "p": "02-0010",
        "start": null,
        "end": null,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Thalidomide",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": null,
        "originalEnd": null,
        "originalIndex": 21,
        "color": 3697840
      },
      {
        "p": "02-0010",
        "start": null,
        "end": null,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "CPT 11",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": null,
        "originalEnd": null,
        "originalIndex": 22,
        "color": 3697840
      },
      {
        "p": "02-0010",
        "start": 1077,
        "end": 1077,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": ""
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 1077,
        "originalEnd": 1077,
        "originalIndex": 1515,
        "color": 8374655
      },
      {
        "p": "02-0010",
        "start": 1077,
        "end": 1077,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 1077,
        "originalEnd": 1077,
        "originalIndex": 2190,
        "color": 16629894
      },
      {
        "p": "02-0010",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2191,
        "color": 12496596
      },
      {
        "p": "02-0010",
        "start": 139,
        "end": 182,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 139,
        "originalEnd": 182,
        "originalIndex": 4367,
        "color": 15729279
      }
    ],
    [
      {
        "p": "02-0432",
        "start": 105,
        "end": 329,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "CCNU",
          "total dose": "100 mg/m2",
          "prescribed dose": " mg/m2"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 105,
        "originalEnd": 329,
        "originalIndex": 23,
        "color": 3697840
      },
      {
        "p": "02-0432",
        "start": 1433,
        "end": 1433,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": ""
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 1433,
        "originalEnd": 1433,
        "originalIndex": 1518,
        "color": 8374655
      },
      {
        "p": "02-0432",
        "start": 1433,
        "end": 1433,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 1433,
        "originalEnd": 1433,
        "originalIndex": 2202,
        "color": 16629894
      },
      {
        "p": "02-0432",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2203,
        "color": 12496596
      },
      {
        "p": "02-0432",
        "start": 18,
        "end": 56,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 18,
        "originalEnd": 56,
        "originalIndex": 4368,
        "color": 15729279
      }
    ],
    [
      {
        "p": "32-1970",
        "start": 28,
        "end": 67,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": "6800 mg",
          "prescribed dose": "170 mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 28,
        "originalEnd": 67,
        "originalIndex": 24,
        "color": 3697840
      },
      {
        "p": "32-1970",
        "start": null,
        "end": null,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": " mg",
          "prescribed dose": "200 mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": null,
        "originalEnd": null,
        "originalIndex": 25,
        "color": 3697840
      },
      {
        "p": "32-1970",
        "start": 468,
        "end": 468,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": "Pre-Adjuvant Therapy"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 468,
        "originalEnd": 468,
        "originalIndex": 1519,
        "color": 8374655
      },
      {
        "p": "32-1970",
        "start": 468,
        "end": 468,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 468,
        "originalEnd": 468,
        "originalIndex": 2206,
        "color": 16629894
      },
      {
        "p": "32-1970",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2207,
        "color": 12496596
      },
      {
        "p": "32-1970",
        "start": 28,
        "end": 67,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "600",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 28,
        "originalEnd": 67,
        "originalIndex": 4369,
        "color": 15729279
      }
    ],
    [
      {
        "p": "02-0111",
        "start": 28,
        "end": 74,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": "75 ug/m2",
          "prescribed dose": " ug/m2"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 28,
        "originalEnd": 74,
        "originalIndex": 26,
        "color": 3697840
      },
      {
        "p": "02-0111",
        "start": 705,
        "end": 705,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": ""
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 705,
        "originalEnd": 705,
        "originalIndex": 1520,
        "color": 8374655
      },
      {
        "p": "02-0111",
        "start": 705,
        "end": 705,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 705,
        "originalEnd": 705,
        "originalIndex": 2210,
        "color": 16629894
      },
      {
        "p": "02-0111",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2211,
        "color": 12496596
      },
      {
        "p": "02-0111",
        "start": 28,
        "end": 74,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 28,
        "originalEnd": 74,
        "originalIndex": 4370,
        "color": 15729279
      }
    ],
    [
      {
        "p": "28-1756",
        "start": 21,
        "end": 69,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": " mg",
          "prescribed dose": "160 mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 21,
        "originalEnd": 69,
        "originalIndex": 27,
        "color": 3697840
      },
      {
        "p": "28-1756",
        "start": 86,
        "end": 86,
        "data": {
          "person neoplasm cancer": "TUMOR FREE",
          "vital": "Alive",
          "performance  scale timing": "Other"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 86,
        "originalEnd": 86,
        "originalIndex": 1521,
        "color": 8374655
      },
      {
        "p": "28-1756",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2214,
        "color": 12496596
      },
      {
        "p": "28-1756",
        "start": 25,
        "end": 69,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "NA",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 25,
        "originalEnd": 69,
        "originalIndex": 4371,
        "color": 15729279
      },
      {
        "p": "28-1756",
        "start": 10,
        "end": 10,
        "data": {
          "type": "OTHER",
          "dose": "1500",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 10,
        "originalEnd": 10,
        "originalIndex": 4372,
        "color": 15729279
      }
    ],
    [
      {
        "p": "14-1037",
        "start": 25,
        "end": 95,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Oxaliplatin",
          "total dose": " mg",
          "prescribed dose": " mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 25,
        "originalEnd": 95,
        "originalIndex": 28,
        "color": 3697840
      },
      {
        "p": "14-1037",
        "start": 326,
        "end": null,
        "data": {
          "response": "",
          "type": "Hormone Therapy",
          "drug": "Dexamethasone",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 326,
        "originalEnd": null,
        "originalIndex": 29,
        "color": 3697840
      },
      {
        "p": "14-1037",
        "start": 346,
        "end": 433,
        "data": {
          "response": "",
          "type": "Targeted Molecular therapy",
          "drug": "PS 341",
          "total dose": "36.8 mg",
          "prescribed dose": " mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 346,
        "originalEnd": 433,
        "originalIndex": 30,
        "color": 3697840
      },
      {
        "p": "14-1037",
        "start": 439,
        "end": 538,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": "6000 mg",
          "prescribed dose": " mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 439,
        "originalEnd": 538,
        "originalIndex": 31,
        "color": 3697840
      },
      {
        "p": "14-1037",
        "start": 0,
        "end": null,
        "data": {
          "response": "",
          "type": "Hormone Therapy",
          "drug": "Dexamethasome",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 0,
        "originalEnd": null,
        "originalIndex": 32,
        "color": 3697840
      },
      {
        "p": "14-1037",
        "start": 587,
        "end": 587,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": "Pre-Adjuvant Therapy"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 587,
        "originalEnd": 587,
        "originalIndex": 1522,
        "color": 8374655
      },
      {
        "p": "14-1037",
        "start": 587,
        "end": 587,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 587,
        "originalEnd": 587,
        "originalIndex": 2217,
        "color": 16629894
      },
      {
        "p": "14-1037",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2218,
        "color": 12496596
      },
      {
        "p": "14-1037",
        "start": 118,
        "end": 165,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 118,
        "originalEnd": 165,
        "originalIndex": 4373,
        "color": 15729279
      }
    ],
    [
      {
        "p": "12-1600",
        "start": 106,
        "end": 218,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": "12000 mg",
          "prescribed dose": " mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 106,
        "originalEnd": 218,
        "originalIndex": 33,
        "color": 3697840
      },
      {
        "p": "12-1600",
        "start": 43,
        "end": 84,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": "5880 mg",
          "prescribed dose": " mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 43,
        "originalEnd": 84,
        "originalIndex": 34,
        "color": 3697840
      },
      {
        "p": "12-1600",
        "start": 414,
        "end": 414,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": "Post-Adjuvant Therapy"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 414,
        "originalEnd": 414,
        "originalIndex": 1523,
        "color": 8374655
      },
      {
        "p": "12-1600",
        "start": 448,
        "end": 448,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 448,
        "originalEnd": 448,
        "originalIndex": 2221,
        "color": 16629894
      },
      {
        "p": "12-1600",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2222,
        "color": 12496596
      },
      {
        "p": "12-1600",
        "start": 43,
        "end": 84,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 43,
        "originalEnd": 84,
        "originalIndex": 4374,
        "color": 15729279
      }
    ]
     ]
}`)
)}

function _rawTlConfig(){return(
JSON.parse(`{
    \"hasAppliedMetafileOverrides\": false,
    \"isScatterVisualization\": false,
    \"dirtyFlag\": 1,
    \"label\": \"Timelines\",
    \"enableCohorts\": true,
    \"enableGenesets\": false,
    \"enablePathways\": false,
    \"enablePreprocessing\": true,
    \"enableBehaviors\": false,
    \"enableSupplemental\": false,
    \"enableLabel\": false,
    \"enableColor\": false,
    \"enableShape\": false,
    \"enableSize\": false,
    \"enableMarkerBaseSize\": false,
    \"enableGenesetOverlay\": false,
    \"uiOptions\": {},
    \"reuseLastComputation\": false,
    \"patientSelect\": [],
    \"patientFilter\": [],
    \"sampleSelect\": [],
    \"markerSelect\": [],
    \"sampleFilter\": [],
    \"firstGenesetOverlay\": {
        \"n\": \"None\",
        \"g\": []
    },
    \"secondGenesetOverlay\": {
        \"n\": \"None\",
        \"g\": []
    },
    \"proteinName\": \"2POR\",
    \"cohortName\": \"All Patients\",
    \"markerName\": \"Pathways in Cancer\",
    \"pathwayName\": \"integrated cancer pathway\",
    \"pathwayUri\": \"https://oncoscape.v3.sttrcancer.org/data/pathways/http___identifiers.org_panther.pathway_P02742.json.gz\",
    \"markerFilter\": [\"ABCG2\", \"AHNAK2\", \"AKT1\", \"ARHGAP26\", \"ASNS\", \"ATP2B3\", \"BCL11A\", \"BCL2\", \"BCL6\", \"BCOR\", \"BMI1\", \"BRAF\", \"BRCA1\", \"BRD4\", \"CACNA1D\", \"CAMTA1\", \"CARD11\", \"CBLB\", \"CCND3\", \"CD44\", \"CDKN2C\", \"CIITA\", \"COL1A1\", \"CREBBP\", \"CUL1\", \"DAXX\", \"DDX5\", \"DMRTA1\", \"DNAH5\", \"DOCK5\", \"ECT2L\", \"EGFR\", \"ELN\", \"ERBB2\", \"ERCC5\", \"EZH2\", \"EZR\", \"FAM46C\", \"FBXW7\", \"FCRL4\", \"FGFR3\", \"FLG\", \"FLI1\", \"FLT3\", \"FOXA1\", \"GLI1\", \"HGF\", \"HMCN1\", \"HNRNPA2B1\", \"HOOK3\", \"HOXA9\", \"IDH1\", \"IGF1R\", \"IRF4\", \"IRS1\", \"KCNJ5\", \"KDM5A\", \"KDR\", \"KEL\", \"KIT\", \"KLF4\", \"KMT2C\", \"KMT2D\", \"LDLR\", \"LPA\", \"LPP\", \"LRP2\", \"MALT1\", \"MAX\", \"MDM2\", \"MECOM\", \"MED12\", \"MLIP\", \"MLLT4\", \"MLLT6\", \"MSH6\", \"MTOR\", \"MUC16\", \"MUC17\", \"MYB\", \"MYH11\", \"MYH9\", \"NF1\", \"NIN\", \"NLRP2\", \"NOTCH2\", \"NTRK1\", \"OBSCN\", \"OLIG2\", \"OR4K5\", \"OR4Q3\", \"PAX3\", \"PAX5\", \"PCLO\", \"PCM1\", \"PDE4DIP\", \"PDGFRA\", \"PDGFRB\", \"PDPR\", \"PICALM\", \"PIK3C2G\", \"PIK3CA\", \"PIK3CB\", \"PIK3CG\", \"PIK3R1\", \"PIK3R2\", \"PIM1\", \"PKHD1\", \"PMS1\", \"PRKCD\", \"PRKCQ\", \"PTCH1\", \"PTEN\", \"PTPN11\", \"PTPRC\", \"RABEP1\", \"RANBP17\", \"RB1\", \"RPL10\", \"RPL22\", \"RPL5\", \"RYR2\", \"RYR3\", \"SDC4\", \"SETBP1\", \"SETD2\", \"SF3B1\", \"SHH\", \"SIRPB1\", \"SLC34A2\", \"SLC45A3\", \"SPTA1\", \"SREBF2\", \"SRSF2\", \"SS18\", \"STAG2\", \"TCF12\", \"TCHH\", \"TET2\", \"TMPRSS2\", \"TP53\", \"TPM3\", \"TRIM24\", \"TRRAP\", \"TTN\", \"UBR5\", \"USH2A\", \"USP6\", \"VOPP1\", \"VSTM2A\", \"WIF1\", \"ZNF521\", \"ZRSR2\", \"ABCA1\", \"ABI1\", \"ABL1\", \"AFF3\", \"AGAP2\", \"AKAP9\", \"AKT1S1\", \"AKT2\", \"AKT3\", \"ALK\", \"ARHGEF12\", \"ARPC1A\", \"ASPSCR1\", \"ATF1\", \"ATM\", \"ATRX\", \"BAGE\", \"BAGE2\", \"BAGE3\", \"BAGE4\", \"BAGE5\", \"BCL11B\", \"BCL3\", \"BCL7A\", \"BCR\", \"BIRC3\", \"BMPR1A\", \"BRCA2\", \"BRD3\", \"BRIP1\", \"CALR\", \"CANT1\", \"CBL\", \"CBLC\", \"CBX4\", \"CCDC6\", \"CCND1\", \"CCND2\", \"CCNE1\", \"CD274\", \"CD79B\", \"CDK2\", \"CDK4\", \"CDK6\", \"CDKN1A\", \"CDKN1B\", \"CDKN2A\", \"CDKN2B\", \"CEBPA\", \"CHI3L1\", \"CHIC2\", \"CLP1\", \"CLTC\", \"CLTCL1\", \"CNBP\", \"CNOT3\", \"CNTRL\", \"CREB3L2\", \"DDIT3\", \"DDX10\", \"DDX6\", \"DEPTOR\", \"DICER1\", \"DNM2\", \"DNMT3A\", \"E2F1\", \"EED\", \"EIF4A2\", \"ELAVL2\", \"ELF4\", \"ELK4\", \"ERBB3\", \"ERC1\", \"ETV1\", \"ETV5\", \"ETV6\", \"EXT1\", \"FANCC\", \"FANCD2\", \"FANCG\", \"FAS\", \"FCGR2B\", \"FGFR2\", \"FH\", \"FIP1L1\", \"FNBP1\", \"FOXL2\", \"FOXO3\", \"FOXO4\", \"FSTL3\", \"FZD1\", \"GATA1\", \"GATA2\", \"GATA3\", \"GIMAP8\", \"GMPS\", \"GNA11\", \"GNAQ\", \"GPC3\", \"GRB2\", \"GUSB\", \"H3F3A\", \"H3F3B\", \"HIP1\", \"HMGA2\", \"HNF1A\", \"HOXA11\", \"HOXA13\", \"HOXA4\", \"HOXA5\", \"HOXA7\", \"HOXC11\", \"HOXC13\", \"HRAS\", \"HSP90AA1\", \"HSP90AB1\", \"IFNA1\", \"IFNA14\", \"IFNA2\", \"IFNA4\", \"IFNA6\", \"IFNA7\", \"IFNA8\", \"IFNB1\", \"IFNW1\", \"IKZF1\", \"JAK1\", \"JAK2\", \"JAZF1\", \"KDM5C\", \"KIAA1549\", \"KLF6\", \"KMT2A\", \"KRAS\", \"LANCL2\", \"LMO2\", \"LRIG3\", \"LYL1\", \"MALAT1\", \"MAML2\", \"MAP2K2\", \"MAPK1\", \"MDM4\", \"MEN1\", \"MET\", \"MGAM\", \"MIR200C\", \"MLF1\", \"MLLT1\", \"MLLT10\", \"MLLT3\", \"MNX1\", \"MSI2\", \"MTAP\", \"MTCP1\", \"MUC1\", \"MUC20\", \"MYC\", \"MYCN\", \"NACA\", \"NCOA1\", \"NDRG1\", \"NFIB\", \"NFKB2\", \"NONO\", \"NOTCH1\", \"NR1H2\", \"NR2E1\", \"NR4A3\", \"NRAS\", \"NRCAM\", \"NT5C2\", \"NUMA1\", \"NUP214\", \"NUTM2A\", \"OR2Z1\", \"PAFAH1B2\", \"PAX7\", \"PBX1\", \"PCSK7\", \"PDCD1LG2\", \"PDGFA\", \"PDPK1\", \"PHF6\", \"PIK3C2B\", \"PKM\", \"PMEL\", \"PMS2\", \"POT1\", \"POTED\", \"POU2AF1\", \"PPARG\", \"PPP2R1A\", \"PRCC\", \"PRDM16\", \"PRH1\", \"PRKAR1A\", \"PRKCA\", \"PRKCG\", \"PRKCI\", \"PRKCZ\", \"PRR4\", \"PRRX1\", \"PSIP1\", \"RAC1\", \"RAD21\", \"RAF1\", \"RALGDS\", \"RASA3\", \"RECQL4\", \"RELA\", \"RHOH\", \"RNF213\", \"RNF43\", \"RPN1\", \"RPS6KA4\", \"RPS6KB1\", \"SBDS\", \"SDHC\", \"SDHD\", \"SEC61G\", \"SEPT14\", \"SEPT5\", \"SEPT9\", \"SERPINE1\", \"SET\", \"SF3B6\", \"SH3GL1\", \"SMARCA4\", \"SMO\", \"SOX2\", \"SPRY2\", \"SRGAP3\", \"SRSF3\", \"SSX2\", \"STIL\", \"STK11\", \"SUFU\", \"SYK\", \"TAL2\", \"TARP\", \"TBL1XR1\", \"TCF3\", \"TCL1A\", \"TCL6\", \"TFEB\", \"TFG\", \"TFPT\", \"TFRC\", \"TLX1\", \"TNFRSF14\", \"TPM4\", \"TSC1\", \"VHL\", \"VTI1A\", \"WHSC1\", \"WT1\", \"WWTR1\", \"XPA\", \"XPC\", \"ZBTB16\", \"ZEB1\", \"ZNF331\", \"ZNF384\", \"ZNF713\", \"ACKR3\", \"ACSL3\", \"ACSL6\", \"AFF4\", \"ALDH2\", \"ARAF\", \"ARID2\", \"ATIC\", \"ATP1A1\", \"AXIN1\", \"BCL10\", \"BCL9\", \"BTG1\", \"BUB1B\", \"CARS\", \"CASC5\", \"CASP8\", \"CBFA2T3\", \"CCNB1IP1\", \"CD74\", \"CDH11\", \"CDX2\", \"CHN1\", \"CREB1\", \"CREB3L1\", \"CRLF2\", \"DUSP22\", \"EBF1\", \"EP300\", \"ERCC2\", \"ERRFI1\", \"EXT2\", \"FANCA\", \"FANK1\", \"FEV\", \"FGFR1OP\", \"FN1\", \"FOXO1\", \"FRG1\", \"FUBP1\", \"FUS\", \"GAS7\", \"GDF2\", \"GOLGA5\", \"GOPC\", \"GPHN\", \"GYS1\", \"HEATR4\", \"HERPUD1\", \"HIF1A\", \"HIST1H3B\", \"HMGN2P46\", \"HOXD11\", \"HOXD13\", \"IL21R\", \"ITK\", \"JUN\", \"KDM6A\", \"KLK2\", \"KTN1\", \"LCP1\", \"LHFP\", \"LMO1\", \"MAFB\", \"MAP2K4\", \"MAPK3\", \"MGMT\", \"MKL1\", \"MLST8\", \"MYCL\", \"NCKIPSD\", \"NCOA4\", \"NFE2L2\", \"NFKB1\", \"NOTCH2NL\", \"NPM1\", \"NRXN3\", \"NSD1\", \"NTRK3\", \"NUP98\", \"NUTM1\", \"OR4K1\", \"OR4K2\", \"OR4M1\", \"OR52N5\", \"P2RY8\", \"PALB2\", \"PATZ1\", \"PER1\", \"PHF21A\", \"PHOX2B\", \"PIK3CD\", \"POTEB\", \"PRF1\", \"PRKCB\", \"PRKCH\", \"RAD51B\", \"RBM15\", \"ROS1\", \"RPS6KA5\", \"SEC22B\", \"SH2B3\", \"SPECC1\", \"SSX1\", \"SSX4\", \"TAF15\", \"TAL1\", \"TCF7L2\", \"TERT\", \"TET1\", \"TFE3\", \"TLX3\", \"TNFAIP3\", \"TRAF7\", \"TRIM33\", \"TRIP11\", \"TSC2\", \"TSHR\", \"TTL\", \"WAS\", \"WWOX\", \"YWHAE\", \"ZMYM2\"],
    \"pointIntersect\": {
        \"key\": \"None\",
        \"label\": \"None\",
        \"type\": \"UNDEFINED\",
        \"tbl\": null,
        \"values\": null,
        \"ctype\": 0
    },
    \"preprocessing\": {
        \"steps\": [],
        \"n\": \"None\"
    },
    \"database\": \"tcga_brain\",
    \"datasetName\": \"\",
    \"firmColors\": {
        \"follow up\": 8374655,
        \"diagnosis\": 12496596,
        \"death\": 1234560,
        \"drug\": 12474436,
        \"radiation\": 15729279
    },
    \"attrs\": ["gender", "days to death"],
    \"group\": {
        \"label\": \"None\"
    },
    \"range\": [0, 100],
    \"align\": \"None\",
    \"sort\": {
        \"label\": \"None\"
    },
    \"sortComparison\": \"First StartDate\",
    \"bars\": [{
            \"label\": \"Status\",
            \"style\": \"Symbols\",
            \"events\": [\"Follow Up\", \"Diagnosis\"],
            \"subtypeColors": {\"Follow Up\": "#0000CC", \"Diagnosis\": "#00DD00" },
            \"row\": 0,
            \"z\": 0,
            \"track\": 0,
            \"setAliases\": {}
        }, {
            \"label\": \"Outcome\",
            \"style\": \"Symbols\",
            \"shape\": \"diamond\",
            \"events\": [\"Death\"],
            \"row\": 1,
            \"z\": 1,
            \"track\": 1,
            \"setAliases\": {}
        }, {
            \"label\": \"Treatment\",
            \"style\": \"Arcs\",
            \"events\": [\"Drug\", \"Radiation\"],
            \"row\": 1,
            \"z\": 1,
            \"track\": 1,
            \"setAliases\": {}
        }
    ],
    \"visualization\": 128,
    \"entity\": \"Patients\",
    \"graph\": 1,
    \"table\": {
        \"tbl\": \"events\",
        \"map\": \"eventsMap\",
        \"label\": \"events\",
        \"ctype\": 16384
    }
}`)
)}

function _dlaGroupableFields(dataLoadedAction){return(
dataLoadedAction.fields.filter(v => v.type == "STRING").map(v => v.label)
)}

function _121(dataLoadedAction){return(
dataLoadedAction.fields.filter(v => v.type == "STRING")
)}

function _dataLoadedAction(){return(
JSON.parse(`
{
    "dataset": "tcga_brain",
    "tables": [{
            "tbl": "patient",
            "map": "patientMap",
            "label": "Patient",
            "ctype": 4
        }, {
            "tbl": "events",
            "map": "eventsMap",
            "label": "events",
            "ctype": 16384
        }, {
            "tbl": "gistic",
            "map": "gisticMap",
            "label": "gistic",
            "ctype": 16
        }, {
            "tbl": "gistic threshold",
            "map": "gistic thresholdMap",
            "label": "gistic threshold",
            "ctype": 32
        }, {
            "tbl": "mutations",
            "map": "mutationsMap",
            "label": "mutations",
            "ctype": 64
        }, {
            "tbl": "rna",
            "map": "rnaMap",
            "label": "rna",
            "ctype": 32768
        }
    ],
    "fields": [{
            "ctype": 4,
            "key": "age_at_diagnosis",
            "label": "age at diagnosis",
            "tbl": "patient",
            "type": "NUMBER",
            "values": {
                "min": 9578,
                "max": 10027
            }
        }, {
            "ctype": 4,
            "key": "vital_status",
            "label": "vital status",
            "tbl": "patient",
            "type": "STRING",
            "values": ["dead", "alive", "not reported"]
        }, {
            "ctype": 4,
            "key": "days_to_death",
            "label": "days to death",
            "tbl": "patient",
            "type": "NUMBER",
            "values": {
                "min": 1,
                "max": 1561
            }
        }, {
            "ctype": 4,
            "key": "days_to_last_follow_up",
            "label": "days to last follow up",
            "tbl": "patient",
            "type": "NUMBER",
            "values": {
                "min": -1,
                "max": 993
            }
        }, {
            "ctype": 4,
            "key": "gender",
            "label": "gender",
            "tbl": "patient",
            "type": "STRING",
            "values": ["female", "male"]
        }, {
            "ctype": 4,
            "key": "year_of_birth",
            "label": "year of birth",
            "tbl": "patient",
            "type": "NUMBER",
            "values": {
                "min": 1912,
                "max": 1993
            }
        }, {
            "ctype": 4,
            "key": "race",
            "label": "race",
            "tbl": "patient",
            "type": "STRING",
            "values": ["white", "black or african american", "not reported", "asian", "american indian or alaska native"]
        }, {
            "ctype": 4,
            "key": "year_of_death",
            "label": "year of death",
            "tbl": "patient",
            "type": "NUMBER",
            "values": {
                "min": 1990,
                "max": 2013
            }
        }, {
            "ctype": 4,
            "key": "diagnosis",
            "label": "diagnosis",
            "tbl": "patient",
            "type": "STRING",
            "values": ["gbm", "astrocytoma", "oligodendroglioma", "oligoastrocytoma"]
        }, {
            "ctype": 4,
            "key": "glioma_8",
            "label": "glioma 8",
            "tbl": "patient",
            "type": "STRING",
            "values": ["nonCIMP.gainNRAS.mutTP53", "nonCIMP.gainNRAS.wtTP53", "nonCIMP.wtNRAS.wtTP53", "nonCIMP.wtNRAS.mutTP53", "lggCIMP.not1p19q.mutATRX.mutTP53", "lggCIMP.not1p19q.wtATRX.mutTP53", "lggCIMP.del1p19q.mutCIC.mutFUBP1", "lggCIMP.del1p19q.wtCIC.wtFUBP1"]
        }, {
            "ctype": 4,
            "key": "tumor_grade",
            "label": "tumor grade",
            "tbl": "patient",
            "type": "STRING",
            "values": ["g3", "g2", "g4", "na"]
        }, {
            "ctype": 4,
            "key": "verhaak_plus_1",
            "label": "verhaak plus 1",
            "tbl": "patient",
            "type": "STRING",
            "values": ["g-cimp", "classical", "na", "proneural", "neural", "mesenchymal"]
        }, {
            "ctype": 4,
            "key": "cnv_subtype",
            "label": "cnv subtype",
            "tbl": "patient",
            "type": "STRING",
            "values": ["m1", "m2", "m3", "O", "w1", "w2", "w3", "w4"]
        }, {
            "ctype": 4,
            "key": "idh_diagnosis",
            "label": "idh diagnosis",
            "tbl": "patient",
            "type": "STRING",
            "values": ["AstroGBM_IDHmut", "AstroGBM_IDHwt", "Oligodendroglioma"]
        }, {
            "ctype": 4,
            "key": "mutation_counts",
            "label": "mutation counts",
            "tbl": "patient",
            "type": "NUMBER",
            "values": {
                "min": 0,
                "max": 514
            }
        }
    ],
    "events": [{
            "type": "Treatment",
            "subtype": "Drug"
        }, {
            "type": "Status",
            "subtype": "Follow Up"
        }, {
            "type": "Status",
            "subtype": "Birth"
        }, {
            "type": "Status",
            "subtype": "Last Follow Up"
        }, {
            "type": "Status",
            "subtype": "Diagnosis"
        }, {
            "type": "Status",
            "subtype": "Death"
        }, {
            "type": "Treatment",
            "subtype": "Radiation"
        }
    ],
    "genesets": [{
            "n": "Glioma Markers",
            "g": ["ABCG2", "AHNAK2", "AKT1", "ARHGAP26"]
        }
    ],
    "cohorts": [{
            "n": "All Patients",
            "pids": [],
            "sids": []
        }, {
            "n": "Astros",
            "pids": ["cs-4938", "cs-4941", "cs-4942", "cs-4943"],
            "sids": ["cs-4938-01b", "cs-4941-01a", "cs-4942-01a", "cs-4943-01a"],
            "conditions": [],
            "fromSelection": true
        }
    ],
    "pathways": [{
            "n": "integrated cancer pathway",
            "uri": "https://oncoscape.v3.sttrcancer.org/data/pathways/http___identifiers.org_wikipathways_WP1971.json.gz"
        }
    ],
    "preprocessings": [],
    "datasetName": "",
    "datasetDesc": {
        "hasEvents": true,
        "hasPatientFields": true,
        "hasSampleFields": false,
        "hasMatrixFields": true,
        "hasMutations": true,
        "hasSurvival": true,
        "hasPrecomputed": false,
        "hasCopyNumber": true,
        "mutationVariantNames": []
    },
    "visSettings": [],
    "type": "[Data] Loaded"
}
`)
)}

function _rawPatientsFromJson(reallyRawPatientsFromJson){return(
reallyRawPatientsFromJson
)}

function _old__reallyRawPatientsFromJson()
{
  //let loadedJson = await d3.json("https://cors-anywhere.herokuapp.com/https://oncoscape-sites-dev.s3-us-west-2.amazonaws.com/TcgaGliomaPatients.json");   
  let tinyPatientData = `
[
{
"p": "02-0001",
"vital_status": "dead",
"gender": "female"
},
{
"p": "02-0003",
"vital_status": "dead",
"gender": "male"
},
{
"p": "02-0004",
"vital_status": "dead",
"gender": "male"
},
{
"p": "26-1799",
"vital_status": "dead",
"gender": "male"
},
{
"p": "26-5132",
"vital_status": "alive",
"gender": "male"
},
{
"p": "26-5133",
"vital_status": "alive",
"gender": "male"
},
{
"p": "26-5134",
"vital_status": "alive",
"gender": "male"
}]`;

  let loadedJson = JSON.parse(tinyPatientData);
  return loadedJson;
}


function _reallyRawPatientsFromJson(reallyRawPatient1,reallyRawPatient2){return(
JSON.parse(reallyRawPatient1).concat(JSON.parse(reallyRawPatient2))
)}

function _reallyRawPatient1(){return(
`
[
{
"p":"02-0001",
"vital_status":"dead",
"days_to_death":358,
"gender":"female"
},
{
"p":"02-0003",
"vital_status":"dead",
"days_to_death":144,
"gender":"male"
},
{
"p":"02-0004",
"vital_status":"dead",
"days_to_death":345,
"gender":"male"
},
{
"p":"02-0006",
"vital_status":"dead",
"days_to_death":558,
"gender":"female"
},
{
"p":"02-0007",
"vital_status":"dead",
"days_to_death":705,
"gender":"female"
},
{
"p":"02-0009",
"vital_status":"dead",
"days_to_death":322,
"gender":"female"
},
{
"p":"02-0010",
"vital_status":"dead",
"days_to_death":1077,
"gender":"female"
},
{
"p":"02-0011",
"vital_status":"dead",
"days_to_death":630,
"gender":"female"
},
{
"p":"02-0014",
"vital_status":"dead",
"days_to_death":2512,
"gender":"male"
},
{
"p":"02-0015",
"vital_status":"dead",
"days_to_death":627,
"gender":"male"
},
{
"p":"02-0016",
"vital_status":"alive",
"days_to_death":2648,
"gender":"male"
},
{
"p":"02-0021",
"vital_status":"dead",
"days_to_death":2362,
"gender":"female"
},
{
"p":"02-0023",
"vital_status":"dead",
"days_to_death":612,
"gender":"female"
},
{
"p":"02-0024",
"vital_status":"dead",
"days_to_death":1615,
"gender":"male"
},
{
"p":"02-0025",
"vital_status":"dead",
"days_to_death":1300,
"gender":"male"
},
{
"p":"02-0026",
"vital_status":"dead",
"days_to_death":748,
"gender":"male"
},
{
"p":"02-0027",
"vital_status":"dead",
"days_to_death":370,
"gender":"female"
},
{
"p":"02-0028",
"vital_status":"dead",
"days_to_death":2755,
"gender":"male"
},
{
"p":"02-0033",
"vital_status":"dead",
"days_to_death":86,
"gender":"male"
},
{
"p":"02-0034",
"vital_status":"dead",
"days_to_death":430,
"gender":"male"
},
{
"p":"02-0037",
"vital_status":"dead",
"days_to_death":110,
"gender":"female"
},
{
"p":"02-0038",
"vital_status":"dead",
"days_to_death":326,
"gender":"female"
},
{
"p":"02-0039",
"vital_status":"dead",
"days_to_death":320,
"gender":"male"
},
{
"p":"02-0043",
"vital_status":"dead",
"days_to_death":557,
"gender":"female"
},
{
"p":"02-0046",
"vital_status":"dead",
"days_to_death":209,
"gender":"male"
},
{
"p":"02-0047",
"vital_status":"dead",
"days_to_death":448,
"gender":"male"
},
{
"p":"02-0048",
"vital_status":"dead",
"days_to_death":98,
"gender":"male"
},
{
"p":"02-0051",
"vital_status":"dead",
"days_to_death":459,
"gender":"male"
},
{
"p":"02-0052",
"vital_status":"dead",
"days_to_death":383,
"gender":"male"
},
{
"p":"02-0054",
"vital_status":"dead",
"days_to_death":199,
"gender":"female"
},
{
"p":"02-0055",
"vital_status":"dead",
"days_to_death":76,
"gender":"female"
},
{
"p":"02-0057",
"vital_status":"dead",
"days_to_death":604,
"gender":"female"
},
{
"p":"02-0058",
"vital_status":"dead",
"days_to_death":254,
"gender":"female"
},
{
"p":"02-0059",
"vital_status":"dead",
"days_to_death":291,
"gender":"female"
},
{
"p":"02-0060",
"vital_status":"dead",
"days_to_death":183,
"gender":"female"
},
{
"p":"02-0064",
"vital_status":"dead",
"days_to_death":600,
"gender":"male"
},
{
"p":"02-0068",
"vital_status":"dead",
"days_to_death":804,
"gender":"male"
},
{
"p":"02-0069",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"02-0070",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"02-0071",
"vital_status":"dead",
"days_to_death":167,
"gender":"male"
},
{
"p":"02-0074",
"vital_status":"dead",
"days_to_death":310,
"gender":"female"
},
{
"p":"02-0075",
"vital_status":"dead",
"days_to_death":634,
"gender":"male"
},
{
"p":"02-0079",
"vital_status":"dead",
"days_to_death":829,
"gender":"male"
},
{
"p":"02-0080",
"vital_status":"dead",
"days_to_death":2729,
"gender":"male"
},
{
"p":"02-0083",
"vital_status":"dead",
"days_to_death":691,
"gender":"female"
},
{
"p":"02-0084",
"vital_status":"dead",
"days_to_death":384,
"gender":"female"
},
{
"p":"02-0085",
"vital_status":"dead",
"days_to_death":1561,
"gender":"female"
},
{
"p":"02-0086",
"vital_status":"dead",
"days_to_death":268,
"gender":"female"
},
{
"p":"02-0087",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"02-0089",
"vital_status":"dead",
"days_to_death":516,
"gender":"male"
},
{
"p":"02-0099",
"vital_status":"dead",
"days_to_death":106,
"gender":"male"
},
{
"p":"02-0102",
"vital_status":"dead",
"days_to_death":822,
"gender":"male"
},
{
"p":"02-0104",
"vital_status":"dead",
"days_to_death":1977,
"gender":"female"
},
{
"p":"02-0106",
"vital_status":"dead",
"days_to_death":355,
"gender":"male"
},
{
"p":"02-0107",
"vital_status":"dead",
"days_to_death":537,
"gender":"male"
},
{
"p":"02-0111",
"vital_status":"dead",
"days_to_death":705,
"gender":"male"
},
{
"p":"02-0113",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"02-0114",
"vital_status":"dead",
"days_to_death":3041,
"gender":"female"
},
{
"p":"02-0115",
"vital_status":"dead",
"days_to_death":476,
"gender":"male"
},
{
"p":"02-0116",
"vital_status":"dead",
"days_to_death":1489,
"gender":"male"
},
{
"p":"02-0258",
"vital_status":"dead",
"days_to_death":503,
"gender":"female"
},
{
"p":"02-0260",
"vital_status":"dead",
"days_to_death":515,
"gender":"male"
},
{
"p":"02-0266",
"vital_status":"dead",
"days_to_death":539,
"gender":"male"
},
{
"p":"02-0269",
"vital_status":"dead",
"days_to_death":327,
"gender":"male"
},
{
"p":"02-0271",
"vital_status":"dead",
"days_to_death":440,
"gender":"male"
},
{
"p":"02-0281",
"vital_status":"dead",
"days_to_death":121,
"gender":"female"
},
{
"p":"02-0285",
"vital_status":"dead",
"days_to_death":422,
"gender":"female"
},
{
"p":"02-0289",
"vital_status":"dead",
"days_to_death":432,
"gender":"male"
},
{
"p":"02-0290",
"vital_status":"dead",
"days_to_death":485,
"gender":"male"
},
{
"p":"02-0317",
"vital_status":"dead",
"days_to_death":372,
"gender":"male"
},
{
"p":"02-0321",
"vital_status":"dead",
"days_to_death":301,
"gender":"male"
},
{
"p":"02-0324",
"vital_status":"dead",
"days_to_death":235,
"gender":"female"
},
{
"p":"02-0325",
"vital_status":"dead",
"days_to_death":323,
"gender":"male"
},
{
"p":"02-0326",
"vital_status":"dead",
"days_to_death":223,
"gender":"female"
},
{
"p":"02-0330",
"vital_status":"dead",
"days_to_death":484,
"gender":"female"
},
{
"p":"02-0332",
"vital_status":"dead",
"days_to_death":782,
"gender":"female"
},
{
"p":"02-0333",
"vital_status":"dead",
"days_to_death":133,
"gender":"female"
},
{
"p":"02-0337",
"vital_status":"dead",
"days_to_death":764,
"gender":"male"
},
{
"p":"02-0338",
"vital_status":"dead",
"days_to_death":322,
"gender":"male"
},
{
"p":"02-0339",
"vital_status":"dead",
"days_to_death":377,
"gender":"male"
},
{
"p":"02-0422",
"vital_status":"dead",
"days_to_death":441,
"gender":"male"
},
{
"p":"02-0430",
"vital_status":"dead",
"days_to_death":321,
"gender":"female"
},
{
"p":"02-0432",
"vital_status":"dead",
"days_to_death":1433,
"gender":"male"
},
{
"p":"02-0439",
"vital_status":"dead",
"days_to_death":20,
"gender":"female"
},
{
"p":"02-0440",
"vital_status":"dead",
"days_to_death":345,
"gender":"male"
},
{
"p":"02-0446",
"vital_status":"dead",
"days_to_death":282,
"gender":"male"
},
{
"p":"02-0451",
"vital_status":"dead",
"days_to_death":493,
"gender":"female"
},
{
"p":"02-0456",
"vital_status":"dead",
"days_to_death":102,
"gender":"female"
},
{
"p":"02-2466",
"vital_status":"dead",
"days_to_death":511,
"gender":"male"
},
{
"p":"02-2470",
"vital_status":"dead",
"days_to_death":393,
"gender":"male"
},
{
"p":"02-2483",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"02-2485",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"02-2486",
"vital_status":"alive",
"days_to_death":618,
"gender":"male"
},
{
"p":"06-0119",
"vital_status":"dead",
"days_to_death":82,
"gender":"female"
},
{
"p":"06-0122",
"vital_status":"dead",
"days_to_death":187,
"gender":"female"
},
{
"p":"06-0124",
"vital_status":"dead",
"days_to_death":620,
"gender":"male"
},
{
"p":"06-0125",
"vital_status":"dead",
"days_to_death":1448,
"gender":"female"
},
{
"p":"06-0126",
"vital_status":"dead",
"days_to_death":211,
"gender":"male"
},
{
"p":"06-0127",
"vital_status":"dead",
"days_to_death":121,
"gender":"male"
},
{
"p":"06-0128",
"vital_status":"dead",
"days_to_death":691,
"gender":"male"
},
{
"p":"06-0129",
"vital_status":"dead",
"days_to_death":1024,
"gender":"male"
},
{
"p":"06-0130",
"vital_status":"dead",
"days_to_death":394,
"gender":"male"
},
{
"p":"06-0132",
"vital_status":"dead",
"days_to_death":771,
"gender":"male"
},
{
"p":"06-0133",
"vital_status":"dead",
"days_to_death":435,
"gender":"male"
},
{
"p":"06-0137",
"vital_status":"dead",
"days_to_death":812,
"gender":"female"
},
{
"p":"06-0138",
"vital_status":"dead",
"days_to_death":737,
"gender":"male"
},
{
"p":"06-0139",
"vital_status":"dead",
"days_to_death":362,
"gender":"male"
},
{
"p":"06-0140",
"vital_status":"dead",
"days_to_death":6,
"gender":"male"
},
{
"p":"06-0141",
"vital_status":"dead",
"days_to_death":313,
"gender":"male"
},
{
"p":"06-0142",
"vital_status":"dead",
"days_to_death":67,
"gender":"male"
},
{
"p":"06-0143",
"vital_status":"dead",
"days_to_death":357,
"gender":"male"
},
{
"p":"06-0145",
"vital_status":"dead",
"days_to_death":71,
"gender":"female"
},
{
"p":"06-0146",
"vital_status":"dead",
"days_to_death":611,
"gender":"female"
},
{
"p":"06-0147",
"vital_status":"dead",
"days_to_death":541,
"gender":"female"
},
{
"p":"06-0148",
"vital_status":"dead",
"days_to_death":307,
"gender":"male"
},
{
"p":"06-0149",
"vital_status":"dead",
"days_to_death":262,
"gender":"female"
},
{
"p":"06-0150",
"vital_status":"dead",
"days_to_death":592,
"gender":"male"
},
{
"p":"06-0151",
"vital_status":"dead",
"days_to_death":1417,
"gender":"female"
},
{
"p":"06-0152",
"vital_status":"dead",
"days_to_death":375,
"gender":"male"
},
{
"p":"06-0154",
"vital_status":"dead",
"days_to_death":424,
"gender":"male"
},
{
"p":"06-0155",
"vital_status":"dead",
"days_to_death":318,
"gender":"male"
},
{
"p":"06-0156",
"vital_status":"dead",
"days_to_death":178,
"gender":"male"
},
{
"p":"06-0157",
"vital_status":"dead",
"days_to_death":97,
"gender":"female"
},
{
"p":"06-0158",
"vital_status":"dead",
"days_to_death":329,
"gender":"male"
},
{
"p":"06-0159",
"vital_status":"dead",
"days_to_death":287,
"gender":"male"
},
{
"p":"06-0160",
"vital_status":"dead",
"days_to_death":359,
"gender":"female"
},
{
"p":"06-0162",
"vital_status":"dead",
"days_to_death":104,
"gender":"female"
},
{
"p":"06-0164",
"vital_status":"dead",
"days_to_death":1731,
"gender":"male"
},
{
"p":"06-0165",
"vital_status":"dead",
"days_to_death":324,
"gender":"male"
},
{
"p":"06-0166",
"vital_status":"dead",
"days_to_death":178,
"gender":"male"
},
{
"p":"06-0167",
"vital_status":"dead",
"days_to_death":347,
"gender":"male"
},
{
"p":"06-0168",
"vital_status":"dead",
"days_to_death":598,
"gender":"female"
},
{
"p":"06-0169",
"vital_status":"dead",
"days_to_death":100,
"gender":"male"
},
{
"p":"06-0171",
"vital_status":"dead",
"days_to_death":399,
"gender":"male"
},
{
"p":"06-0173",
"vital_status":"dead",
"days_to_death":136,
"gender":"female"
},
{
"p":"06-0174",
"vital_status":"dead",
"days_to_death":98,
"gender":"male"
},
{
"p":"06-0175",
"vital_status":"dead",
"days_to_death":123,
"gender":"male"
},
{
"p":"06-0176",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"06-0177",
"vital_status":"dead",
"days_to_death":127,
"gender":"male"
},
{
"p":"06-0178",
"vital_status":"alive",
"days_to_death":2681,
"gender":"male"
},
{
"p":"06-0179",
"vital_status":"dead",
"days_to_death":616,
"gender":"male"
},
{
"p":"06-0182",
"vital_status":"dead",
"days_to_death":111,
"gender":"male"
},
{
"p":"06-0184",
"vital_status":"alive",
"days_to_death":2126,
"gender":"male"
},
{
"p":"06-0185",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"06-0187",
"vital_status":"dead",
"days_to_death":828,
"gender":"male"
},
{
"p":"06-0188",
"vital_status":"alive",
"days_to_death":1356,
"gender":"male"
},
{
"p":"06-0189",
"vital_status":"dead",
"days_to_death":469,
"gender":"male"
},
{
"p":"06-0190",
"vital_status":"dead",
"days_to_death":317,
"gender":"male"
},
{
"p":"06-0192",
"vital_status":"alive",
"days_to_death":1185,
"gender":"male"
},
{
"p":"06-0194",
"vital_status":"dead",
"days_to_death":142,
"gender":"female"
},
{
"p":"06-0195",
"vital_status":"dead",
"days_to_death":225,
"gender":"male"
},
{
"p":"06-0197",
"vital_status":"dead",
"days_to_death":169,
"gender":"female"
},
{
"p":"06-0201",
"vital_status":"dead",
"days_to_death":12,
"gender":"female"
},
{
"p":"06-0206",
"vital_status":"dead",
"days_to_death":233,
"gender":"male"
},
{
"p":"06-0208",
"vital_status":"dead",
"days_to_death":256,
"gender":"female"
},
{
"p":"06-0209",
"vital_status":"dead",
"days_to_death":232,
"gender":"male"
},
{
"p":"06-0210",
"vital_status":"dead",
"days_to_death":225,
"gender":"female"
},
{
"p":"06-0211",
"vital_status":"dead",
"days_to_death":360,
"gender":"male"
},
{
"p":"06-0213",
"vital_status":"dead",
"days_to_death":16,
"gender":"female"
},
{
"p":"06-0214",
"vital_status":"dead",
"days_to_death":457,
"gender":"male"
},
{
"p":"06-0216",
"vital_status":"dead",
"days_to_death":735,
"gender":"female"
},
{
"p":"06-0219",
"vital_status":"dead",
"days_to_death":22,
"gender":"male"
},
{
"p":"06-0221",
"vital_status":"dead",
"days_to_death":603,
"gender":"male"
},
{
"p":"06-0237",
"vital_status":"dead",
"days_to_death":415,
"gender":"female"
},
{
"p":"06-0238",
"vital_status":"dead",
"days_to_death":405,
"gender":"male"
},
{
"p":"06-0240",
"vital_status":"dead",
"days_to_death":621,
"gender":"male"
},
{
"p":"06-0241",
"vital_status":"alive",
"days_to_death":1481,
"gender":"female"
},
{
"p":"06-0394",
"vital_status":"dead",
"days_to_death":329,
"gender":"male"
},
{
"p":"06-0397",
"vital_status":"dead",
"days_to_death":274,
"gender":"female"
},
{
"p":"06-0402",
"vital_status":"dead",
"days_to_death":8,
"gender":"male"
},
{
"p":"06-0409",
"vital_status":"dead",
"days_to_death":2201,
"gender":"male"
},
{
"p":"06-0410",
"vital_status":"dead",
"days_to_death":143,
"gender":"female"
},
{
"p":"06-0412",
"vital_status":"dead",
"days_to_death":291,
"gender":"female"
},
{
"p":"06-0413",
"vital_status":"dead",
"days_to_death":96,
"gender":"female"
},
{
"p":"06-0414",
"vital_status":"dead",
"days_to_death":1068,
"gender":"male"
},
{
"p":"06-0644",
"vital_status":"alive",
"days_to_death":384,
"gender":"male"
},
{
"p":"06-0645",
"vital_status":"dead",
"days_to_death":175,
"gender":"female"
},
{
"p":"06-0646",
"vital_status":"dead",
"days_to_death":175,
"gender":"male"
},
{
"p":"06-0648",
"vital_status":"dead",
"days_to_death":298,
"gender":"male"
},
{
"p":"06-0649",
"vital_status":"dead",
"days_to_death":64,
"gender":"female"
},
{
"p":"06-0650",
"vital_status":"dead",
"days_to_death":717,
"gender":"female"
},
{
"p":"06-0686",
"vital_status":"alive",
"days_to_death":432,
"gender":"male"
},
{
"p":"06-0743",
"vital_status":"alive",
"days_to_death":803,
"gender":"male"
},
{
"p":"06-0744",
"vital_status":"alive",
"days_to_death":1426,
"gender":"male"
},
{
"p":"06-0745",
"vital_status":"dead",
"days_to_death":239,
"gender":"male"
},
{
"p":"06-0747",
"vital_status":"dead",
"days_to_death":82,
"gender":"male"
},
{
"p":"06-0749",
"vital_status":"dead",
"days_to_death":82,
"gender":"male"
},
{
"p":"06-0750",
"vital_status":"dead",
"days_to_death":28,
"gender":"male"
},
{
"p":"06-0875",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"06-0876",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"06-0877",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"06-0878",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"06-0879",
"vital_status":"alive",
"days_to_death":1229,
"gender":"male"
},
{
"p":"06-0881",
"vital_status":"alive",
"days_to_death":504,
"gender":"male"
},
{
"p":"06-0882",
"vital_status":"alive",
"days_to_death":632,
"gender":"male"
},
{
"p":"06-0939",
"vital_status":"alive",
"days_to_death":814,
"gender":"female"
},
{
"p":"06-1084",
"vital_status":"alive",
"days_to_death":728,
"gender":"male"
},
{
"p":"06-1086",
"vital_status":"dead",
"days_to_death":208,
"gender":"male"
},
{
"p":"06-1087",
"vital_status":"dead",
"days_to_death":123,
"gender":"male"
},
{
"p":"06-1800",
"vital_status":"dead",
"days_to_death":815,
"gender":"male"
},
{
"p":"06-1801",
"vital_status":"alive",
"days_to_death":360,
"gender":"female"
},
{
"p":"06-1802",
"vital_status":"alive",
"days_to_death":466,
"gender":"male"
},
{
"p":"06-1804",
"vital_status":"dead",
"days_to_death":414,
"gender":"female"
},
{
"p":"06-1805",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"06-1806",
"vital_status":"dead",
"days_to_death":466,
"gender":"male"
},
{
"p":"06-2557",
"vital_status":"dead",
"days_to_death":33,
"gender":"male"
},
{
"p":"06-2558",
"vital_status":"dead",
"days_to_death":380,
"gender":"female"
},
{
"p":"06-2559",
"vital_status":"dead",
"days_to_death":150,
"gender":"male"
},
{
"p":"06-2561",
"vital_status":"alive",
"days_to_death":537,
"gender":"female"
},
{
"p":"06-2562",
"vital_status":"alive",
"days_to_death":382,
"gender":"male"
},
{
"p":"06-2563",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"06-2564",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"06-2565",
"vital_status":"alive",
"days_to_death":506,
"gender":"male"
},
{
"p":"06-2566",
"vital_status":"dead",
"days_to_death":182,
"gender":"female"
},
{
"p":"06-2567",
"vital_status":"dead",
"days_to_death":133,
"gender":"male"
},
{
"p":"06-2569",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"06-2570",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"06-5408",
"vital_status":"dead",
"days_to_death":357,
"gender":"female"
},
{
"p":"06-5410",
"vital_status":"dead",
"days_to_death":108,
"gender":"female"
},
{
"p":"06-5411",
"vital_status":"dead",
"days_to_death":254,
"gender":"male"
},
{
"p":"06-5412",
"vital_status":"dead",
"days_to_death":138,
"gender":"female"
},
{
"p":"06-5413",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"06-5414",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"06-5415",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"06-5416",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"06-5417",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"06-5418",
"vital_status":"dead",
"days_to_death":83,
"gender":"female"
},
{
"p":"06-5856",
"vital_status":"dead",
"days_to_death":114,
"gender":"male"
},
{
"p":"06-5858",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"06-5859",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"06-6388",
"vital_status":"dead",
"days_to_death":159,
"gender":"female"
},
{
"p":"06-6389",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"06-6390",
"vital_status":"dead",
"days_to_death":164,
"gender":"male"
},
{
"p":"06-6391",
"vital_status":"dead",
"days_to_death":45,
"gender":"female"
},
{
"p":"06-6693",
"vital_status":"dead",
"days_to_death":3667,
"gender":"female"
},
{
"p":"06-6694",
"vital_status":"dead",
"days_to_death":224,
"gender":"female"
},
{
"p":"06-6695",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"06-6697",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"06-6698",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"06-6699",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"06-6700",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"06-6701",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"06-a5u0",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"06-a5u1",
"vital_status":"dead",
"days_to_death":57,
"gender":"female"
},
{
"p":"06-a6s0",
"vital_status":"dead",
"days_to_death":95,
"gender":"male"
},
{
"p":"06-a6s1",
"vital_status":"dead",
"days_to_death":78,
"gender":"female"
},
{
"p":"06-a7tk",
"vital_status":"alive",
"days_to_death":444,
"gender":"male"
},
{
"p":"06-a7tl",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"08-0244",
"vital_status":"dead",
"days_to_death":690,
"gender":"male"
},
{
"p":"08-0245",
"vital_status":"dead",
"days_to_death":1151,
"gender":"female"
},
{
"p":"08-0246",
"vital_status":"dead",
"days_to_death":127,
"gender":"female"
},
{
"p":"08-0344",
"vital_status":"dead",
"days_to_death":3524,
"gender":"male"
},
{
"p":"08-0345",
"vital_status":"dead",
"days_to_death":53,
"gender":"female"
},
{
"p":"08-0346",
"vital_status":"dead",
"days_to_death":256,
"gender":"male"
},
{
"p":"08-0347",
"vital_status":"dead",
"days_to_death":782,
"gender":"male"
},
{
"p":"08-0348",
"vital_status":"dead",
"days_to_death":370,
"gender":"male"
},
{
"p":"08-0349",
"vital_status":"dead",
"days_to_death":298,
"gender":"male"
},
{
"p":"08-0350",
"vital_status":"dead",
"days_to_death":889,
"gender":"male"
},
{
"p":"08-0351",
"vital_status":"dead",
"days_to_death":1987,
"gender":"male"
},
{
"p":"08-0352",
"vital_status":"dead",
"days_to_death":39,
"gender":"male"
},
{
"p":"08-0353",
"vital_status":"dead",
"days_to_death":256,
"gender":"male"
},
{
"p":"08-0354",
"vital_status":"dead",
"days_to_death":546,
"gender":"female"
},
{
"p":"08-0355",
"vital_status":"dead",
"days_to_death":747,
"gender":"female"
},
{
"p":"08-0356",
"vital_status":"dead",
"days_to_death":946,
"gender":"female"
},
{
"p":"08-0357",
"vital_status":"dead",
"days_to_death":1143,
"gender":"male"
},
{
"p":"08-0358",
"vital_status":"dead",
"days_to_death":678,
"gender":"male"
},
{
"p":"08-0359",
"vital_status":"dead",
"days_to_death":103,
"gender":"female"
},
{
"p":"08-0360",
"vital_status":"dead",
"days_to_death":468,
"gender":"male"
},
{
"p":"08-0373",
"vital_status":"dead",
"days_to_death":134,
"gender":"male"
},
{
"p":"08-0375",
"vital_status":"dead",
"days_to_death":372,
"gender":"female"
},
{
"p":"08-0380",
"vital_status":"dead",
"days_to_death":454,
"gender":"female"
},
{
"p":"08-0385",
"vital_status":"dead",
"days_to_death":82,
"gender":"male"
},
{
"p":"08-0386",
"vital_status":"dead",
"days_to_death":548,
"gender":"male"
},
{
"p":"08-0389",
"vital_status":"dead",
"days_to_death":467,
"gender":"male"
},
{
"p":"08-0390",
"vital_status":"dead",
"days_to_death":425,
"gender":"male"
},
{
"p":"08-0392",
"vital_status":"dead",
"days_to_death":22,
"gender":"male"
},
{
"p":"08-0509",
"vital_status":"dead",
"days_to_death":382,
"gender":"male"
},
{
"p":"08-0510",
"vital_status":"dead",
"days_to_death":130,
"gender":"male"
},
{
"p":"08-0511",
"vital_status":"dead",
"days_to_death":235,
"gender":"male"
},
{
"p":"08-0512",
"vital_status":"dead",
"days_to_death":1282,
"gender":"male"
},
{
"p":"08-0514",
"vital_status":"dead",
"days_to_death":337,
"gender":"female"
},
{
"p":"08-0516",
"vital_status":"dead",
"days_to_death":596,
"gender":"male"
},
{
"p":"08-0517",
"vital_status":"dead",
"days_to_death":1785,
"gender":"female"
},
{
"p":"08-0518",
"vital_status":"dead",
"days_to_death":588,
"gender":"female"
},
{
"p":"08-0520",
"vital_status":"dead",
"days_to_death":327,
"gender":"male"
},
{
"p":"08-0521",
"vital_status":"dead",
"days_to_death":146,
"gender":"male"
},
{
"p":"08-0522",
"vital_status":"dead",
"days_to_death":635,
"gender":"male"
},
{
"p":"08-0524",
"vital_status":"dead",
"days_to_death":221,
"gender":"female"
},
{
"p":"08-0525",
"vital_status":"dead",
"days_to_death":486,
"gender":"male"
},
{
"p":"08-0529",
"vital_status":"dead",
"days_to_death":560,
"gender":"female"
},
{
"p":"08-0531",
"vital_status":"dead",
"days_to_death":230,
"gender":"male"
},
{
"p":"12-0615",
"vital_status":"dead",
"days_to_death":467,
"gender":"female"
},
{
"p":"12-0616",
"vital_status":"dead",
"days_to_death":448,
"gender":"female"
},
{
"p":"12-0618",
"vital_status":"dead",
"days_to_death":395,
"gender":"male"
},
{
"p":"12-0619",
"vital_status":"dead",
"days_to_death":1062,
"gender":"male"
},
{
"p":"12-0620",
"vital_status":"dead",
"days_to_death":318,
"gender":"male"
},
{
"p":"12-0653",
"vital_status":"notreported",
"days_to_death":320,
"gender":"male"
},
{
"p":"12-0654",
"vital_status":"dead",
"days_to_death":231,
"gender":"female"
},
{
"p":"12-0656",
"vital_status":"dead",
"days_to_death":2883,
"gender":"female"
},
{
"p":"12-0657",
"vital_status":"dead",
"days_to_death":3,
"gender":"male"
},
{
"p":"12-0662",
"vital_status":"dead",
"days_to_death":1161,
"gender":"male"
},
{
"p":"12-0670",
"vital_status":"dead",
"days_to_death":790,
"gender":"male"
},
{
"p":"12-0688",
"vital_status":"dead",
"days_to_death":811,
"gender":"male"
},
{
"p":"12-0691",
"vital_status":"dead",
"days_to_death":369,
"gender":"male"
},
{
"p":"12-0692",
"vital_status":"dead",
"days_to_death":111,
"gender":"female"
},
{
"p":"12-0703",
"vital_status":"dead",
"days_to_death":620,
"gender":"male"
},
{
"p":"12-0707",
"vital_status":"dead",
"days_to_death":864,
"gender":"male"
},
{
"p":"12-0769",
"vital_status":"dead",
"days_to_death":458,
"gender":"male"
},
{
"p":"12-0772",
"vital_status":"dead",
"days_to_death":1638,
"gender":"male"
},
{
"p":"12-0773",
"vital_status":"dead",
"days_to_death":1315,
"gender":"male"
},
{
"p":"12-0775",
"vital_status":"dead",
"days_to_death":232,
"gender":"female"
},
{
"p":"12-0776",
"vital_status":"dead",
"days_to_death":296,
"gender":"male"
},
{
"p":"12-0778",
"vital_status":"dead",
"days_to_death":454,
"gender":"male"
},
{
"p":"12-0780",
"vital_status":"dead",
"days_to_death":452,
"gender":"female"
},
{
"p":"12-0818",
"vital_status":"dead",
"days_to_death":2791,
"gender":"female"
},
{
"p":"12-0819",
"vital_status":"dead",
"days_to_death":754,
"gender":"female"
},
{
"p":"12-0820",
"vital_status":"dead",
"days_to_death":562,
"gender":"male"
},
{
"p":"12-0821",
"vital_status":"dead",
"days_to_death":323,
"gender":"male"
},
{
"p":"12-0822",
"vital_status":"dead",
"days_to_death":715,
"gender":"male"
},
{
"p":"12-0826",
"vital_status":"dead",
"days_to_death":845,
"gender":"female"
},
{
"p":"12-0827",
"vital_status":"dead",
"days_to_death":1179,
"gender":"female"
},
{
"p":"12-0828",
"vital_status":"dead",
"days_to_death":272,
"gender":"male"
},
{
"p":"12-0829",
"vital_status":"dead",
"days_to_death":626,
"gender":"male"
},
{
"p":"12-1088",
"vital_status":"dead",
"days_to_death":3881,
"gender":"female"
},
{
"p":"12-1089",
"vital_status":"dead",
"days_to_death":177,
"gender":"male"
},
{
"p":"12-1090",
"vital_status":"dead",
"days_to_death":231,
"gender":"male"
},
{
"p":"12-1091",
"vital_status":"dead",
"days_to_death":1010,
"gender":"female"
},
{
"p":"12-1092",
"vital_status":"dead",
"days_to_death":661,
"gender":"male"
},
{
"p":"12-1093",
"vital_status":"dead",
"days_to_death":486,
"gender":"female"
},
{
"p":"12-1094",
"vital_status":"dead",
"days_to_death":372,
"gender":"male"
},
{
"p":"12-1095",
"vital_status":"dead",
"days_to_death":482,
"gender":"female"
},
{
"p":"12-1096",
"vital_status":"dead",
"days_to_death":277,
"gender":"male"
},
{
"p":"12-1097",
"vital_status":"dead",
"days_to_death":442,
"gender":"male"
},
{
"p":"12-1098",
"vital_status":"dead",
"days_to_death":121,
"gender":"female"
},
{
"p":"12-1099",
"vital_status":"dead",
"days_to_death":126,
"gender":"female"
},
{
"p":"12-1597",
"vital_status":"dead",
"days_to_death":675,
"gender":"female"
},
{
"p":"12-1598",
"vital_status":"dead",
"days_to_death":476,
"gender":"female"
},
{
"p":"12-1599",
"vital_status":"dead",
"days_to_death":781,
"gender":"female"
},
{
"p":"12-1600",
"vital_status":"dead",
"days_to_death":448,
"gender":"male"
},
{
"p":"12-1602",
"vital_status":"dead",
"days_to_death":206,
"gender":"male"
},
{
"p":"12-3644",
"vital_status":"dead",
"days_to_death":1818,
"gender":"female"
},
{
"p":"12-3646",
"vital_status":"dead",
"days_to_death":1339,
"gender":"female"
},
{
"p":"12-3648",
"vital_status":"dead",
"days_to_death":819,
"gender":"female"
},
{
"p":"12-3649",
"vital_status":"dead",
"days_to_death":463,
"gender":"male"
},
{
"p":"12-3650",
"vital_status":"dead",
"days_to_death":333,
"gender":"male"
},
{
"p":"12-3651",
"vital_status":"dead",
"days_to_death":386,
"gender":"male"
},
{
"p":"12-3652",
"vital_status":"dead",
"days_to_death":1062,
"gender":"male"
},
{
"p":"12-3653",
"vital_status":"dead",
"days_to_death":442,
"gender":"female"
},
{
"p":"12-5295",
"vital_status":"dead",
"days_to_death":454,
"gender":"female"
},
{
"p":"12-5299",
"vital_status":"dead",
"days_to_death":98,
"gender":"female"
},
{
"p":"12-5301",
"vital_status":"dead",
"days_to_death":62,
"gender":"male"
},
{
"p":"14-0736",
"vital_status":"dead",
"days_to_death":460,
"gender":"male"
},
{
"p":"14-0740",
"vital_status":"dead",
"days_to_death":364,
"gender":"male"
},
{
"p":"14-0781",
"vital_status":"dead",
"days_to_death":29,
"gender":"male"
},
{
"p":"14-0783",
"vital_status":"dead",
"days_to_death":189,
"gender":"female"
},
{
"p":"14-0786",
"vital_status":"dead",
"days_to_death":701,
"gender":"female"
},
{
"p":"14-0787",
"vital_status":"dead",
"days_to_death":68,
"gender":"male"
},
{
"p":"14-0789",
"vital_status":"dead",
"days_to_death":342,
"gender":"male"
},
{
"p":"14-0790",
"vital_status":"dead",
"days_to_death":419,
"gender":"female"
},
{
"p":"14-0812",
"vital_status":"dead",
"days_to_death":99,
"gender":"male"
},
{
"p":"14-0813",
"vital_status":"dead",
"days_to_death":41,
"gender":"male"
},
{
"p":"14-0817",
"vital_status":"dead",
"days_to_death":164,
"gender":"female"
},
{
"p":"14-0862",
"vital_status":"dead",
"days_to_death":88,
"gender":"male"
},
{
"p":"14-0865",
"vital_status":"dead",
"days_to_death":502,
"gender":"male"
},
{
"p":"14-0866",
"vital_status":"dead",
"days_to_death":801,
"gender":"male"
},
{
"p":"14-0867",
"vital_status":"dead",
"days_to_death":62,
"gender":"male"
},
{
"p":"14-0871",
"vital_status":"dead",
"days_to_death":880,
"gender":"female"
},
{
"p":"14-1034",
"vital_status":"dead",
"days_to_death":485,
"gender":"female"
},
{
"p":"14-1037",
"vital_status":"dead",
"days_to_death":587,
"gender":"female"
},
{
"p":"14-1043",
"vital_status":"dead",
"days_to_death":24,
"gender":"male"
},
{
"p":"14-1395",
"vital_status":"dead",
"days_to_death":42,
"gender":"male"
},
{
"p":"14-1396",
"vital_status":"dead",
"days_to_death":34,
"gender":"female"
},
{
"p":"14-1401",
"vital_status":"dead",
"days_to_death":114,
"gender":"male"
},
{
"p":"14-1402",
"vital_status":"dead",
"days_to_death":975,
"gender":"female"
},
{
"p":"14-1450",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"14-1451",
"vital_status":"dead",
"days_to_death":703,
"gender":"male"
},
{
"p":"14-1452",
"vital_status":"dead",
"days_to_death":216,
"gender":"male"
},
{
"p":"14-1453",
"vital_status":"dead",
"days_to_death":35,
"gender":"male"
},
{
"p":"14-1454",
"vital_status":"dead",
"days_to_death":918,
"gender":"female"
},
{
"p":"14-1455",
"vital_status":"dead",
"days_to_death":28,
"gender":"male"
},
{
"p":"14-1456",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"14-1458",
"vital_status":"dead",
"days_to_death":203,
"gender":"male"
},
{
"p":"14-1459",
"vital_status":"dead",
"days_to_death":378,
"gender":"female"
},
{
"p":"14-1794",
"vital_status":"dead",
"days_to_death":30,
"gender":"male"
},
{
"p":"14-1795",
"vital_status":"dead",
"days_to_death":60,
"gender":"male"
},
{
"p":"14-1821",
"vital_status":"dead",
"days_to_death":541,
"gender":"male"
},
{
"p":"14-1823",
"vital_status":"dead",
"days_to_death":543,
"gender":"female"
},
{
"p":"14-1825",
"vital_status":"dead",
"days_to_death":232,
"gender":"male"
},
{
"p":"14-1827",
"vital_status":"dead",
"days_to_death":179,
"gender":"male"
},
{
"p":"14-1829",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"14-2554",
"vital_status":"dead",
"days_to_death":532,
"gender":"female"
},
{
"p":"14-2555",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"14-3476",
"vital_status":"dead",
"days_to_death":12,
"gender":"male"
},
{
"p":"14-3477",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"14-4157",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"15-0742",
"vital_status":"dead",
"days_to_death":419,
"gender":"male"
},
{
"p":"15-1444",
"vital_status":"dead",
"days_to_death":1537,
"gender":"male"
},
{
"p":"15-1446",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"15-1447",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"15-1449",
"vital_status":"dead",
"days_to_death":404,
"gender":"male"
},
{
"p":"16-0846",
"vital_status":"dead",
"days_to_death":119,
"gender":"male"
},
{
"p":"16-0848",
"vital_status":"dead",
"days_to_death":535,
"gender":"male"
},
{
"p":"16-0849",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"16-0850",
"vital_status":"dead",
"days_to_death":498,
"gender":"female"
},
{
"p":"16-0861",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"16-1045",
"vital_status":"dead",
"days_to_death":883,
"gender":"female"
},
{
"p":"16-1047",
"vital_status":"dead",
"days_to_death":139,
"gender":"female"
},
{
"p":"16-1055",
"vital_status":"dead",
"days_to_death":313,
"gender":"male"
},
{
"p":"16-1056",
"vital_status":"dead",
"days_to_death":426,
"gender":"male"
},
{
"p":"16-1060",
"vital_status":"dead",
"days_to_death":278,
"gender":"female"
},
{
"p":"16-1062",
"vital_status":"dead",
"days_to_death":646,
"gender":"female"
},
{
"p":"16-1063",
"vital_status":"dead",
"days_to_death":425,
"gender":"male"
},
{
"p":"16-1460",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"19-0955",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"19-0957",
"vital_status":"dead",
"days_to_death":666,
"gender":"female"
},
{
"p":"19-0960",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"19-0962",
"vital_status":"dead",
"days_to_death":20,
"gender":"female"
},
{
"p":"19-0963",
"vital_status":"dead",
"days_to_death":434,
"gender":"male"
},
{
"p":"19-0964",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"19-1385",
"vital_status":"dead",
"days_to_death":327,
"gender":"male"
},
{
"p":"19-1386",
"vital_status":"dead",
"days_to_death":276,
"gender":"male"
},
{
"p":"19-1387",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"19-1388",
"vital_status":"dead",
"days_to_death":394,
"gender":"male"
},
{
"p":"19-1389",
"vital_status":"dead",
"days_to_death":141,
"gender":"male"
},
{
"p":"19-1390",
"vital_status":"dead",
"days_to_death":772,
"gender":"female"
},
{
"p":"19-1392",
"vital_status":"dead",
"days_to_death":111,
"gender":"female"
},
{
"p":"19-1786",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"19-1787",
"vital_status":"dead",
"days_to_death":385,
"gender":"male"
},
{
"p":"19-1788",
"vital_status":"dead",
"days_to_death":112,
"gender":"male"
},
{
"p":"19-1789",
"vital_status":"dead",
"days_to_death":99,
"gender":"female"
},
{
"p":"19-1790",
"vital_status":"dead",
"days_to_death":154,
"gender":"male"
},
{
"p":"19-1791",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"19-2619",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"19-2620",
"vital_status":"dead",
"days_to_death":148,
"gender":"male"
},
{
"p":"19-2621",
"vital_status":"dead",
"days_to_death":33,
"gender":"male"
},
{
"p":"19-2623",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"19-2624",
"vital_status":"dead",
"days_to_death":5,
"gender":"male"
},
{
"p":"19-2625",
"vital_status":"dead",
"days_to_death":124,
"gender":"female"
},
{
"p":"19-2629",
"vital_status":"dead",
"days_to_death":737,
"gender":"male"
},
{
"p":"19-2631",
"vital_status":"dead",
"days_to_death":213,
"gender":"female"
},
{
"p":"19-4065",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"19-4068",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"19-5947",
"vital_status":"dead",
"days_to_death":202,
"gender":"female"
},
{
"p":"19-5950",
"vital_status":"alive",
"days_to_death":523,
"gender":"female"
},
{
"p":"19-5951",
"vital_status":"dead",
"days_to_death":244,
"gender":"female"
},
{
"p":"19-5952",
"vital_status":"dead",
"days_to_death":575,
"gender":"male"
},
{
"p":"19-5953",
"vital_status":"dead",
"days_to_death":144,
"gender":"male"
},
{
"p":"19-5954",
"vital_status":"alive",
"days_to_death":368,
"gender":"female"
},
{
"p":"19-5955",
"vital_status":"dead",
"days_to_death":54,
"gender":"male"
},
{
"p":"19-5956",
"vital_status":"alive",
"days_to_death":684,
"gender":"female"
},
{
"p":"19-5958",
"vital_status":"alive",
"days_to_death":428,
"gender":"male"
},
{
"p":"19-5959",
"vital_status":"alive",
"days_to_death":511,
"gender":"female"
},
{
"p":"19-5960",
"vital_status":"alive",
"days_to_death":455,
"gender":"male"
},
{
"p":"19-a60i",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"19-a6j4",
"vital_status":"dead",
"days_to_death":121,
"gender":"male"
},
{
"p":"19-a6j5",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"26-1438",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"26-1439",
"vital_status":"dead",
"days_to_death":422,
"gender":"male"
},
{
"p":"26-1440",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"26-1442",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"26-1443",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"26-1799",
"vital_status":"dead",
"days_to_death":285,
"gender":"male"
},
{
"p":"26-5132",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"26-5133",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"26-5134",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"26-5135",
"vital_status":"dead",
"days_to_death":270,
"gender":"female"
},
{
"p":"26-5136",
"vital_status":"alive",
"days_to_death":577,
"gender":"female"
},
{
"p":"26-5139",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"26-6173",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"26-6174",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"26-a7ux",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"27-1830",
"vital_status":"dead",
"days_to_death":154,
"gender":"male"
},
{
"p":"27-1831",
"vital_status":"dead",
"days_to_death":505,
"gender":"male"
},
{
"p":"27-1832",
"vital_status":"dead",
"days_to_death":300,
"gender":"female"
},
{
"p":"27-1833",
"vital_status":"dead",
"days_to_death":737,
"gender":"female"
},
{
"p":"27-1834",
"vital_status":"dead",
"days_to_death":1233,
"gender":"male"
},
{
"p":"27-1835",
"vital_status":"dead",
"days_to_death":648,
"gender":"female"
},
{
"p":"27-1836",
"vital_status":"dead",
"days_to_death":914,
"gender":"female"
},
{
"p":"27-1837",
"vital_status":"dead",
"days_to_death":427,
"gender":"male"
},
{
"p":"27-1838",
"vital_status":"dead",
"days_to_death":350,
"gender":"female"
},
{
"p":"27-2518",
"vital_status":"dead",
"days_to_death":753,
"gender":"male"
},
{
"p":"27-2519",
"vital_status":"alive",
"days_to_death":550,
"gender":"male"
},
{
"p":"27-2521",
"vital_status":"alive",
"days_to_death":510,
"gender":"male"
},
{
"p":"27-2523",
"vital_status":"dead",
"days_to_death":489,
"gender":"male"
},
{
"p":"27-2524",
"vital_status":"dead",
"days_to_death":231,
"gender":"male"
},
{
"p":"27-2526",
"vital_status":"dead",
"days_to_death":87,
"gender":"female"
},
{
"p":"27-2527",
"vital_status":"dead",
"days_to_death":438,
"gender":"male"
},
{
"p":"27-2528",
"vital_status":"dead",
"days_to_death":480,
"gender":"male"
},
{
"p":"28-1745",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"28-1746",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"28-1747",
"vital_status":"dead",
"days_to_death":77,
"gender":"male"
},
{
"p":"28-1749",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"28-1750",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"28-1751",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"28-1752",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"28-1753",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"28-1755",
"vital_status":"dead",
"days_to_death":47,
"gender":"female"
},
{
"p":"28-1756",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"28-1757",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"28-1760",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"28-2499",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"28-2502",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"28-2506",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"28-2509",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"28-2512",
"vital_status":"dead",
"days_to_death":343,
"gender":"male"
},
{
"p":"28-2513",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"28-2514",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"28-5204",
"vital_status":"dead",
"days_to_death":454,
"gender":"male"
},
{
"p":"28-5207",
"vital_status":"dead",
"days_to_death":343,
"gender":"male"
},
{
"p":"28-5208",
"vital_status":"alive",
"days_to_death":544,
"gender":"male"
},
{
"p":"28-5209",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"28-5211",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"28-5213",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"28-5214",
"vital_status":"alive",
"days_to_death":713,
"gender":"male"
},
{
"p":"28-5215",
"vital_status":"dead",
"days_to_death":335,
"gender":"female"
},
{
"p":"28-5216",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"28-5218",
"vital_status":"dead",
"days_to_death":157,
"gender":"male"
},
{
"p":"28-5219",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"28-5220",
"vital_status":"alive",
"days_to_death":388,
"gender":"male"
},
{
"p":"28-6450",
"vital_status":"dead",
"days_to_death":165,
"gender":"male"
},
{
"p":"32-1970",
"vital_status":"dead",
"days_to_death":468,
"gender":"male"
},
{
"p":"32-1973",
"vital_status":"dead",
"days_to_death":641,
"gender":"male"
},
{
"p":"32-1976",
"vital_status":"dead",
"days_to_death":15,
"gender":"male"
},
{
"p":"32-1977",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
}]
`
)}

function _reallyRawPatient2(){return(
`
[{
"p":"32-1978",
"vital_status":"dead",
"days_to_death":482,
"gender":"male"
},
{
"p":"32-1979",
"vital_status":"dead",
"days_to_death":593,
"gender":"female"
},
{
"p":"32-1980",
"vital_status":"dead",
"days_to_death":36,
"gender":"male"
},
{
"p":"32-1982",
"vital_status":"dead",
"days_to_death":142,
"gender":"female"
},
{
"p":"32-1986",
"vital_status":"dead",
"days_to_death":386,
"gender":"male"
},
{
"p":"32-1987",
"vital_status":"dead",
"days_to_death":452,
"gender":"female"
},
{
"p":"32-1991",
"vital_status":"dead",
"days_to_death":515,
"gender":"male"
},
{
"p":"32-2491",
"vital_status":"dead",
"days_to_death":372,
"gender":"male"
},
{
"p":"32-2494",
"vital_status":"dead",
"days_to_death":632,
"gender":"female"
},
{
"p":"32-2495",
"vital_status":"dead",
"days_to_death":457,
"gender":"female"
},
{
"p":"32-2615",
"vital_status":"dead",
"days_to_death":485,
"gender":"male"
},
{
"p":"32-2616",
"vital_status":"dead",
"days_to_death":224,
"gender":"female"
},
{
"p":"32-2632",
"vital_status":"dead",
"days_to_death":269,
"gender":"male"
},
{
"p":"32-2634",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"32-2638",
"vital_status":"alive",
"days_to_death":766,
"gender":"male"
},
{
"p":"32-4208",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"32-4209",
"vital_status":"alive",
"days_to_death":618,
"gender":"male"
},
{
"p":"32-4210",
"vital_status":"dead",
"days_to_death":113,
"gender":"male"
},
{
"p":"32-4211",
"vital_status":"dead",
"days_to_death":383,
"gender":"male"
},
{
"p":"32-4213",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"32-4719",
"vital_status":"dead",
"days_to_death":330,
"gender":"male"
},
{
"p":"32-5222",
"vital_status":"alive",
"days_to_death":585,
"gender":"male"
},
{
"p":"41-2571",
"vital_status":"dead",
"days_to_death":26,
"gender":"male"
},
{
"p":"41-2572",
"vital_status":"dead",
"days_to_death":406,
"gender":"male"
},
{
"p":"41-2573",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"41-2575",
"vital_status":"dead",
"days_to_death":290,
"gender":"male"
},
{
"p":"41-3392",
"vital_status":"dead",
"days_to_death":30,
"gender":"male"
},
{
"p":"41-3393",
"vital_status":"dead",
"days_to_death":135,
"gender":"female"
},
{
"p":"41-3915",
"vital_status":"alive",
"days_to_death":360,
"gender":"male"
},
{
"p":"41-4097",
"vital_status":"dead",
"days_to_death":6,
"gender":"female"
},
{
"p":"41-5651",
"vital_status":"alive",
"days_to_death":460,
"gender":"female"
},
{
"p":"41-6646",
"vital_status":"alive",
"days_to_death":379,
"gender":"female"
},
{
"p":"4w-aa9r",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"4w-aa9s",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"4w-aa9t",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"74-6573",
"vital_status":"dead",
"days_to_death":105,
"gender":"male"
},
{
"p":"74-6575",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"74-6577",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"74-6578",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"74-6581",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"74-6584",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"76-4925",
"vital_status":"dead",
"days_to_death":146,
"gender":"male"
},
{
"p":"76-4926",
"vital_status":"dead",
"days_to_death":138,
"gender":"male"
},
{
"p":"76-4927",
"vital_status":"dead",
"days_to_death":535,
"gender":"male"
},
{
"p":"76-4928",
"vital_status":"dead",
"days_to_death":94,
"gender":"female"
},
{
"p":"76-4929",
"vital_status":"dead",
"days_to_death":111,
"gender":"female"
},
{
"p":"76-4931",
"vital_status":"dead",
"days_to_death":279,
"gender":"female"
},
{
"p":"76-4932",
"vital_status":"dead",
"days_to_death":1458,
"gender":"female"
},
{
"p":"76-4934",
"vital_status":"dead",
"days_to_death":77,
"gender":"female"
},
{
"p":"76-4935",
"vital_status":"alive",
"days_to_death":1121,
"gender":"female"
},
{
"p":"76-6191",
"vital_status":"dead",
"days_to_death":508,
"gender":"male"
},
{
"p":"76-6192",
"vital_status":"dead",
"days_to_death":100,
"gender":"male"
},
{
"p":"76-6193",
"vital_status":"dead",
"days_to_death":82,
"gender":"male"
},
{
"p":"76-6280",
"vital_status":"dead",
"days_to_death":346,
"gender":"male"
},
{
"p":"76-6282",
"vital_status":"dead",
"days_to_death":519,
"gender":"male"
},
{
"p":"76-6283",
"vital_status":"notreported",
"days_to_death":165,
"gender":"female"
},
{
"p":"76-6285",
"vital_status":"dead",
"days_to_death":254,
"gender":"female"
},
{
"p":"76-6286",
"vital_status":"dead",
"days_to_death":638,
"gender":"male"
},
{
"p":"76-6656",
"vital_status":"dead",
"days_to_death":147,
"gender":"male"
},
{
"p":"76-6657",
"vital_status":"dead",
"days_to_death":153,
"gender":"male"
},
{
"p":"76-6660",
"vital_status":"notreported",
"days_to_death":114,
"gender":"male"
},
{
"p":"76-6661",
"vital_status":"alive",
"days_to_death":727,
"gender":"male"
},
{
"p":"76-6662",
"vital_status":"alive",
"days_to_death":1048,
"gender":"male"
},
{
"p":"76-6663",
"vital_status":"alive",
"days_to_death":567,
"gender":"female"
},
{
"p":"76-6664",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"81-5910",
"vital_status":"dead",
"days_to_death":49,
"gender":"male"
},
{
"p":"81-5911",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"87-5896",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"cs-4938",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"cs-4941",
"vital_status":"dead",
"days_to_death":234,
"gender":"male"
},
{
"p":"cs-4942",
"vital_status":"dead",
"days_to_death":1335,
"gender":"female"
},
{
"p":"cs-4943",
"vital_status":"alive",
"days_to_death":1106,
"gender":"male"
},
{
"p":"cs-4944",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"cs-5390",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"cs-5393",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"cs-5394",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"cs-5395",
"vital_status":"dead",
"days_to_death":639,
"gender":"male"
},
{
"p":"cs-5396",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"cs-5397",
"vital_status":"dead",
"days_to_death":194,
"gender":"female"
},
{
"p":"cs-6186",
"vital_status":"dead",
"days_to_death":538,
"gender":"male"
},
{
"p":"cs-6188",
"vital_status":"alive",
"days_to_death":814,
"gender":"male"
},
{
"p":"cs-6290",
"vital_status":"alive",
"days_to_death":1137,
"gender":"male"
},
{
"p":"cs-6665",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"cs-6666",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"cs-6667",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"cs-6668",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"cs-6669",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"cs-6670",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-5270",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"db-5273",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-5274",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"db-5275",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-5276",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-5277",
"vital_status":"dead",
"days_to_death":1547,
"gender":"male"
},
{
"p":"db-5278",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-5279",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-5280",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-5281",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-a4x9",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"db-a4xa",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-a4xb",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-a4xc",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-a4xd",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-a4xe",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"db-a4xf",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"db-a4xg",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-a4xh",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"db-a64l",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"db-a64o",
"vital_status":"alive",
"days_to_death":775,
"gender":"male"
},
{
"p":"db-a64p",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-a64q",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"db-a64r",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"db-a64s",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-a64u",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"db-a64v",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-a64w",
"vital_status":"alive",
"days_to_death":438,
"gender":"female"
},
{
"p":"db-a64x",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"db-a75k",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"db-a75l",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"db-a75m",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-a75o",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"db-a75p",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"dh-5140",
"vital_status":"dead",
"days_to_death":607,
"gender":"female"
},
{
"p":"dh-5141",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"dh-5142",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"dh-5143",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"dh-5144",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"dh-a669",
"vital_status":"dead",
"days_to_death":919,
"gender":"male"
},
{
"p":"dh-a66b",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"dh-a66d",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"dh-a66f",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"dh-a66g",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"dh-a7ur",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"dh-a7us",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"dh-a7ut",
"vital_status":"alive",
"days_to_death":531,
"gender":"male"
},
{
"p":"dh-a7uu",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"dh-a7uv",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-5847",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-5849",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-5851",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-5852",
"vital_status":"dead",
"days_to_death":205,
"gender":"female"
},
{
"p":"du-5853",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-5854",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-5855",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-5870",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-5871",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-5872",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-5874",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-6392",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-6393",
"vital_status":"dead",
"days_to_death":1585,
"gender":"male"
},
{
"p":"du-6394",
"vital_status":"dead",
"days_to_death":682,
"gender":"male"
},
{
"p":"du-6395",
"vital_status":"dead",
"days_to_death":1491,
"gender":"male"
},
{
"p":"du-6396",
"vital_status":"dead",
"days_to_death":2286,
"gender":"female"
},
{
"p":"du-6397",
"vital_status":"dead",
"days_to_death":1401,
"gender":"male"
},
{
"p":"du-6399",
"vital_status":"dead",
"days_to_death":2000,
"gender":"male"
},
{
"p":"du-6400",
"vital_status":"dead",
"days_to_death":37,
"gender":"female"
},
{
"p":"du-6401",
"vital_status":"dead",
"days_to_death":2660,
"gender":"female"
},
{
"p":"du-6402",
"vital_status":"dead",
"days_to_death":214,
"gender":"male"
},
{
"p":"du-6403",
"vital_status":"dead",
"days_to_death":354,
"gender":"female"
},
{
"p":"du-6404",
"vital_status":"dead",
"days_to_death":4068,
"gender":"female"
},
{
"p":"du-6405",
"vital_status":"dead",
"days_to_death":605,
"gender":"female"
},
{
"p":"du-6406",
"vital_status":"dead",
"days_to_death":512,
"gender":"female"
},
{
"p":"du-6407",
"vital_status":"dead",
"days_to_death":2875,
"gender":"female"
},
{
"p":"du-6408",
"vital_status":"dead",
"days_to_death":3470,
"gender":"female"
},
{
"p":"du-6410",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-6542",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-7006",
"vital_status":"dead",
"days_to_death":349,
"gender":"female"
},
{
"p":"du-7007",
"vital_status":"dead",
"days_to_death":1915,
"gender":"male"
},
{
"p":"du-7008",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-7009",
"vital_status":"alive",
"days_to_death":4695,
"gender":"female"
},
{
"p":"du-7010",
"vital_status":"dead",
"days_to_death":456,
"gender":"female"
},
{
"p":"du-7011",
"vital_status":"dead",
"days_to_death":3200,
"gender":"male"
},
{
"p":"du-7012",
"vital_status":"dead",
"days_to_death":199,
"gender":"female"
},
{
"p":"du-7013",
"vital_status":"dead",
"days_to_death":269,
"gender":"male"
},
{
"p":"du-7014",
"vital_status":"dead",
"days_to_death":3571,
"gender":"male"
},
{
"p":"du-7015",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-7018",
"vital_status":"dead",
"days_to_death":933,
"gender":"female"
},
{
"p":"du-7019",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-7290",
"vital_status":"dead",
"days_to_death":315,
"gender":"female"
},
{
"p":"du-7292",
"vital_status":"dead",
"days_to_death":242,
"gender":"male"
},
{
"p":"du-7294",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-7298",
"vital_status":"dead",
"days_to_death":576,
"gender":"female"
},
{
"p":"du-7299",
"vital_status":"dead",
"days_to_death":1339,
"gender":"male"
},
{
"p":"du-7300",
"vital_status":"dead",
"days_to_death":1886,
"gender":"female"
},
{
"p":"du-7301",
"vital_status":"dead",
"days_to_death":788,
"gender":"male"
},
{
"p":"du-7302",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-7304",
"vital_status":"dead",
"days_to_death":709,
"gender":"male"
},
{
"p":"du-7306",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-7309",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-8158",
"vital_status":"dead",
"days_to_death":155,
"gender":"female"
},
{
"p":"du-8161",
"vital_status":"dead",
"days_to_death":722,
"gender":"female"
},
{
"p":"du-8162",
"vital_status":"dead",
"days_to_death":444,
"gender":"female"
},
{
"p":"du-8163",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-8164",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-8165",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-8166",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-8167",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-8168",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-a5tp",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-a5tr",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-a5ts",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-a5tt",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-a5tu",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-a5tw",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-a5ty",
"vital_status":"alive",
"days_to_death":1033,
"gender":"female"
},
{
"p":"du-a6s2",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-a6s3",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-a6s6",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-a6s7",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-a6s8",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"du-a76k",
"vital_status":"dead",
"days_to_death":347,
"gender":"male"
},
{
"p":"du-a76l",
"vital_status":"dead",
"days_to_death":814,
"gender":"male"
},
{
"p":"du-a76o",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-a76r",
"vital_status":"dead",
"days_to_death":648,
"gender":"male"
},
{
"p":"du-a7t6",
"vital_status":"dead",
"days_to_death":547,
"gender":"female"
},
{
"p":"du-a7t8",
"vital_status":"alive",
"days_to_death":4229,
"gender":"male"
},
{
"p":"du-a7ta",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-a7tb",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-a7tc",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"du-a7td",
"vital_status":"dead",
"days_to_death":228,
"gender":"male"
},
{
"p":"du-a7tg",
"vital_status":"dead",
"days_to_death":1351,
"gender":"male"
},
{
"p":"du-a7ti",
"vital_status":"notreported",
"days_to_death":1183,
"gender":"male"
},
{
"p":"du-a7tj",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"e1-5302",
"vital_status":"dead",
"days_to_death":1525,
"gender":"male"
},
{
"p":"e1-5303",
"vital_status":"dead",
"days_to_death":2052,
"gender":"male"
},
{
"p":"e1-5304",
"vital_status":"dead",
"days_to_death":1251,
"gender":"male"
},
{
"p":"e1-5305",
"vital_status":"dead",
"days_to_death":2433,
"gender":"male"
},
{
"p":"e1-5307",
"vital_status":"dead",
"days_to_death":1762,
"gender":"female"
},
{
"p":"e1-5311",
"vital_status":"dead",
"days_to_death":4084,
"gender":"male"
},
{
"p":"e1-5318",
"vital_status":"dead",
"days_to_death":2379,
"gender":"female"
},
{
"p":"e1-5319",
"vital_status":"dead",
"days_to_death":2907,
"gender":"female"
},
{
"p":"e1-5322",
"vital_status":"dead",
"days_to_death":3978,
"gender":"female"
},
{
"p":"e1-a7yd",
"vital_status":"notreported",
"days_to_death":435,
"gender":"male"
},
{
"p":"e1-a7ye",
"vital_status":"notreported",
"days_to_death":886,
"gender":"female"
},
{
"p":"e1-a7yh",
"vital_status":"notreported",
"days_to_death":2835,
"gender":"female"
},
{
"p":"e1-a7yi",
"vital_status":"notreported",
"days_to_death":111,
"gender":"female"
},
{
"p":"e1-a7yj",
"vital_status":"notreported",
"days_to_death":592,
"gender":"male"
},
{
"p":"e1-a7yk",
"vital_status":"notreported",
"days_to_death":378,
"gender":"male"
},
{
"p":"e1-a7yl",
"vital_status":"notreported",
"days_to_death":492,
"gender":"male"
},
{
"p":"e1-a7ym",
"vital_status":"notreported",
"days_to_death":648,
"gender":"male"
},
{
"p":"e1-a7yn",
"vital_status":"notreported",
"days_to_death":727,
"gender":"female"
},
{
"p":"e1-a7yo",
"vital_status":"dead",
"days_to_death":2282,
"gender":"male"
},
{
"p":"e1-a7yq",
"vital_status":"notreported",
"days_to_death":1578,
"gender":"female"
},
{
"p":"e1-a7ys",
"vital_status":"notreported",
"days_to_death":466,
"gender":"male"
},
{
"p":"e1-a7yu",
"vital_status":"notreported",
"days_to_death":23,
"gender":"male"
},
{
"p":"e1-a7yv",
"vital_status":"dead",
"days_to_death":987,
"gender":"female"
},
{
"p":"e1-a7yw",
"vital_status":"dead",
"days_to_death":1120,
"gender":"male"
},
{
"p":"e1-a7yy",
"vital_status":"notreported",
"days_to_death":4445,
"gender":"female"
},
{
"p":"e1-a7z2",
"vital_status":"notreported",
"days_to_death":398,
"gender":"female"
},
{
"p":"e1-a7z3",
"vital_status":"notreported",
"days_to_death":2235,
"gender":"female"
},
{
"p":"e1-a7z4",
"vital_status":"notreported",
"days_to_death":4412,
"gender":"male"
},
{
"p":"e1-a7z6",
"vital_status":"dead",
"days_to_death":984,
"gender":"female"
},
{
"p":"ez-7264",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"f6-a8o3",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"f6-a8o4",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-5962",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-5963",
"vital_status":"dead",
"days_to_death":775,
"gender":"male"
},
{
"p":"fg-5964",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-5965",
"vital_status":"dead",
"days_to_death":1120,
"gender":"female"
},
{
"p":"fg-6688",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-6689",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-6690",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-6691",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-6692",
"vital_status":"dead",
"days_to_death":561,
"gender":"male"
},
{
"p":"fg-7634",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-7636",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-7637",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-7638",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-7641",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-7643",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-8181",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-8182",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-8185",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-8186",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-8187",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-8188",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-8189",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-8191",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-a4mt",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-a4mu",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-a4mw",
"vital_status":"alive",
"days_to_death":559,
"gender":"male"
},
{
"p":"fg-a4mx",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-a4my",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-a60j",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-a60k",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-a60l",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-a6iz",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"fg-a6j1",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-a6j3",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-a70y",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-a70z",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-a710",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-a711",
"vital_status":"alive",
"days_to_death":1481,
"gender":"female"
},
{
"p":"fg-a713",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-a87n",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fg-a87q",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"fn-7833",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7467",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7468",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7469",
"vital_status":"dead",
"days_to_death":351,
"gender":"male"
},
{
"p":"ht-7470",
"vital_status":"alive",
"days_to_death":1220,
"gender":"male"
},
{
"p":"ht-7471",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-7472",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7473",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7474",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7475",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7476",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7477",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7478",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7479",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7480",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7481",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7482",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-7483",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7485",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7601",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-7602",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7603",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7604",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7605",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7606",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-7607",
"vital_status":"dead",
"days_to_death":96,
"gender":"female"
},
{
"p":"ht-7608",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7609",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7610",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-7611",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7616",
"vital_status":"dead",
"days_to_death":7,
"gender":"male"
},
{
"p":"ht-7620",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7676",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7677",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7680",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-7681",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-7684",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7686",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-7687",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7688",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7689",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-7690",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7691",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-7692",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7693",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-7694",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7695",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-7854",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7855",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7856",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7857",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-7858",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7860",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-7873",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7874",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-7875",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7877",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-7879",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7880",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7881",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-7882",
"vital_status":"dead",
"days_to_death":113,
"gender":"male"
},
{
"p":"ht-7884",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-7902",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-8010",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-8011",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-8012",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-8013",
"vital_status":"dead",
"days_to_death":1933,
"gender":"female"
},
{
"p":"ht-8015",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-8018",
"vital_status":"alive",
"days_to_death":1152,
"gender":"female"
},
{
"p":"ht-8019",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-8104",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-8105",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-8106",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-8107",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-8108",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-8109",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-8110",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-8111",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-8113",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-8114",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-8558",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-8563",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-8564",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-a4ds",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-a4dv",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-a5r5",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-a5r7",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-a5r9",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-a5ra",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-a5rb",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-a5rc",
"vital_status":"dead",
"days_to_death":162,
"gender":"female"
},
{
"p":"ht-a614",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-a615",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-a616",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-a617",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-a618",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-a619",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-a61a",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-a61b",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-a61c",
"vital_status":"alive",
"days_to_death":537,
"gender":"male"
},
{
"p":"ht-a74h",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-a74j",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ht-a74k",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-a74l",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"ht-a74o",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"hw-7486",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"hw-7487",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"hw-7489",
"vital_status":"alive",
"days_to_death":1262,
"gender":"male"
},
{
"p":"hw-7490",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"hw-7491",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"hw-7493",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"hw-7495",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"hw-8319",
"vital_status":"alive",
"days_to_death":1209,
"gender":"female"
},
{
"p":"hw-8320",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"hw-8321",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"hw-8322",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"hw-a5kj",
"vital_status":"alive",
"days_to_death":962,
"gender":"male"
},
{
"p":"hw-a5kk",
"vital_status":"dead",
"days_to_death":388,
"gender":"male"
},
{
"p":"hw-a5kl",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"hw-a5km",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"ik-7675",
"vital_status":"dead",
"days_to_death":578,
"gender":"male"
},
{
"p":"ik-8125",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"kt-a74x",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"kt-a7w1",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"ox-a56r",
"vital_status":"dead",
"days_to_death":180,
"gender":"male"
},
{
"p":"p5-a5et",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"p5-a5eu",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"p5-a5ev",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"p5-a5ew",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"p5-a5ex",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"p5-a5ey",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"p5-a5ez",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"p5-a5f0",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"p5-a5f1",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"p5-a5f2",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"p5-a5f4",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"p5-a5f6",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"p5-a72u",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"p5-a72w",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"p5-a72x",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"p5-a72z",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"p5-a730",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"p5-a731",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"p5-a733",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"p5-a735",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"p5-a736",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"p5-a737",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"p5-a77w",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"p5-a77x",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"p5-a780",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"p5-a781",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"qh-a65r",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"qh-a65s",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"qh-a65v",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"qh-a65x",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"qh-a65z",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"qh-a6cs",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"qh-a6cu",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"qh-a6cv",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"qh-a6cw",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"qh-a6cx",
"vital_status":"alive",
"days_to_death":372,
"gender":"male"
},
{
"p":"qh-a6cy",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"qh-a6cz",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"qh-a6x3",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"qh-a6x4",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"qh-a6x5",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"qh-a6x8",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"qh-a6x9",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"qh-a6xa",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"qh-a6xc",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"qh-a86x",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"qh-a870",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"r8-a6mk",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"r8-a6ml",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"r8-a6mo",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"r8-a73m",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"rr-a6ka",
"vital_status":"dead",
"days_to_death":191,
"gender":"female"
},
{
"p":"rr-a6kb",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"rr-a6kc",
"vital_status":"dead",
"days_to_death":625,
"gender":"male"
},
{
"p":"ry-a83x",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"ry-a83y",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"ry-a83z",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"ry-a840",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"ry-a843",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"ry-a845",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"ry-a847",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a6ts",
"vital_status":"dead",
"days_to_death":1891,
"gender":"female"
},
{
"p":"s9-a6tu",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a6tv",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a6tw",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a6tx",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a6ty",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a6tz",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"s9-a6u0",
"vital_status":"alive",
"days_to_death":742,
"gender":"male"
},
{
"p":"s9-a6u1",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"s9-a6u2",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"s9-a6u5",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a6u6",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a6u8",
"vital_status":"alive",
"days_to_death":2988,
"gender":"male"
},
{
"p":"s9-a6u9",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a6ua",
"vital_status":"dead",
"days_to_death":178,
"gender":"male"
},
{
"p":"s9-a6ub",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a6wd",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a6we",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a6wg",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a6wh",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"s9-a6wi",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"s9-a6wl",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a6wm",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"s9-a6wn",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"s9-a6wo",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a6wp",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a6wq",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"s9-a7iq",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"s9-a7is",
"vital_status":"dead",
"days_to_death":241,
"gender":"female"
},
{
"p":"s9-a7ix",
"vital_status":"alive",
"days_to_death":819,
"gender":"male"
},
{
"p":"s9-a7iy",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a7iz",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"s9-a7j0",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"s9-a7j1",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a7j2",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a7j3",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"s9-a7qw",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"s9-a7qx",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"s9-a7qy",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"s9-a7qz",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a7r1",
"vital_status":"alive",
"days_to_death":5166,
"gender":"male"
},
{
"p":"s9-a7r2",
"vital_status":"dead",
"days_to_death":316,
"gender":"male"
},
{
"p":"s9-a7r3",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"s9-a7r4",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a7r7",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a7r8",
"vital_status":"dead",
"days_to_death":961,
"gender":"female"
},
{
"p":"s9-a89v",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"s9-a89z",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"tm-a7c3",
"vital_status":"alive",
"days_to_death":1666,
"gender":"female"
},
{
"p":"tm-a7c4",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"tm-a7c5",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"tm-a7ca",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"tm-a7cf",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"tm-a84b",
"vital_status":"alive",
"days_to_death":758,
"gender":"male"
},
{
"p":"tm-a84c",
"vital_status":"alive",
"days_to_death":492,
"gender":"male"
},
{
"p":"tm-a84f",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"tm-a84g",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"tm-a84h",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"tm-a84i",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"tm-a84j",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"tm-a84l",
"vital_status":"dead",
"days_to_death":1242,
"gender":"male"
},
{
"p":"tm-a84m",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"tm-a84o",
"vital_status":"alive",
"days_to_death":1011,
"gender":"female"
},
{
"p":"tm-a84q",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"tm-a84r",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"tm-a84s",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"tm-a84t",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"tq-a7rf",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"tq-a7rg",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"tq-a7rh",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"tq-a7ri",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"tq-a7rj",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"tq-a7rk",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"tq-a7rm",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"tq-a7rn",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"tq-a7ro",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"tq-a7rp",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"tq-a7rq",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"tq-a7rr",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"tq-a7rs",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"tq-a7ru",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"tq-a7rv",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"tq-a7rw",
"vital_status":"notreported",
"days_to_death":821,
"gender":"male"
},
{
"p":"tq-a8xe",
"vital_status":"notreported",
"days_to_death":954,
"gender":"female"
},
{
"p":"vm-a8c8",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"vm-a8c9",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"vm-a8ca",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"vm-a8cb",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"vm-a8cd",
"vital_status":"dead",
"days_to_death":240,
"gender":"male"
},
{
"p":"vm-a8ce",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"vm-a8cf",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"vm-a8ch",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"vv-a829",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"vv-a86m",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"vw-a7qs",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"vw-a8fi",
"vital_status":"dead",
"days_to_death":245,
"gender":"male"
},
{
"p":"w9-a837",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"wh-a86k",
"vital_status":"alive",
"days_to_death":null,
"gender":"male"
},
{
"p":"wy-a858",
"vital_status":"alive",
"days_to_death":null,
"gender":"female"
},
{
"p":"wy-a859",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
},
{
"p":"wy-a85a",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"wy-a85b",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"wy-a85c",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"wy-a85d",
"vital_status":"notreported",
"days_to_death":null,
"gender":"male"
},
{
"p":"wy-a85e",
"vital_status":"notreported",
"days_to_death":null,
"gender":"female"
}
]
`
)}

function _tinyEventData(){return(
`{
  "minMax": {
    "min": -325,
    "max": 1561 
  },
  "patients": [
    [
      {
        "p": "06-0876",
        "start": 98,
        "end": 271,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": "350 mg",
          "prescribed dose": " mg",
          "notes": "the quick brown fox jumps overthe lazy dog. the quick brown fox jumps overthe lazy dog. the quick brown fox jumps overthe lazy dog. the quick brown fox jumps overthe lazy dog. the quick brown fox jumps overthe lazy dog. the quick brown fox jumps overthe lazy dog. the quick brown fox jumps overthe lazy dog. "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 98,
        "originalEnd": 271,
        "originalIndex": 0,
        "color": 0
      },

      {
        "p": "06-0876",
        "start": 112,
        "end": 416,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 112,
        "originalEnd": 416,
        "originalIndex": 2,
        "color": 3697840
      },
      {
        "p": "06-0876",
        "start": 462,
        "end": 1146,
        "data": {
          "response": "",
          "type": "Targeted Molecular therapy",
          "drug": "Bevacizumab",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 462,
        "originalEnd": 1146,
        "originalIndex": 3,
        "color": 3697840
      },
      {
        "p": "06-0876",
        "start": 462,
        "end": 560,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Irintocean",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 462,
        "originalEnd": 560,
        "originalIndex": 4,
        "color": 3697840
      },
      {
        "p": "06-0876",
        "start": 271,
        "end": 271,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Alive",
          "performance  scale timing": "Preoperative"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 271,
        "originalEnd": 271,
        "originalIndex": 1505,
        "color": 8374655
      },
      {
        "p": "06-0876",
        "start": 1405,
        "end": 1405,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Alive",
          "performance  scale timing": "Post-Adjuvant Therapy"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 1405,
        "originalEnd": 1405,
        "originalIndex": 1506,
        "color": 8374655
      },
      {
        "p": "06-0876",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2160,
        "color": 12496596
      },
      {
        "p": "06-0876",
        "start": 17,
        "end": 60,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 17,
        "originalEnd": 60,
        "originalIndex": 4358,
        "color": 15729279
      },
      {
        "p": "06-0876",
        "start": 446,
        "end": 446,
        "data": {
          "type": "OTHER",
          "dose": "2000",
          "course": "2"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 446,
        "originalEnd": 446,
        "originalIndex": 4359,
        "color": 15729279
      }
    ],
    [
      {
        "p": "06-0167",
        "start": 24,
        "end": 68,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 24,
        "originalEnd": 68,
        "originalIndex": 5,
        "color": 3697840
      },
      {
        "p": "06-0167",
        "start": 77,
        "end": 197,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 77,
        "originalEnd": 197,
        "originalIndex": 6,
        "color": 3697840
      },
      {
        "p": "06-0167",
        "start": 258,
        "end": 289,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "PS341",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 258,
        "originalEnd": 289,
        "originalIndex": 7,
        "color": 3697840
      },
      {
        "p": "06-0167",
        "start": 347,
        "end": 367,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 347,
        "originalEnd": 347,
        "originalIndex": 2162,
        "color": 16629894
      },
      {
        "p": "06-0167",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2163,
        "color": 12496596
      },
      {
        "p": "06-0167",
        "start": 24,
        "end": 68,
        "data": {
          "type": "External",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 24,
        "originalEnd": 68,
        "originalIndex": 4360,
        "color": 15729279
      }
    ],
    [
      {
        "p": "02-0085",
        "start": 740,
        "end": 786,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": "75 mg/m2/day",
          "prescribed dose": " mg/m2/day"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 740,
        "originalEnd": 786,
        "originalIndex": 8,
        "color": 3697840
      },
      {
        "p": "02-0085",
        "start": 1561,
        "end": 1561,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": ""
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 1561,
        "originalEnd": 1561,
        "originalIndex": 1507,
        "color": 8374655
      },
      {
        "p": "02-0085",
        "start": 1561,
        "end": 1561,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 1561,
        "originalEnd": 1561,
        "originalIndex": 2166,
        "color": 16629894
      },
      {
        "p": "02-0085",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2167,
        "color": 12496596
      },
      {
        "p": "02-0085",
        "start": 740,
        "end": 786,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 740,
        "originalEnd": 786,
        "originalIndex": 4361,
        "color": 15729279
      }
    ],
    [
      {
        "p": "26-6174",
        "start": 29,
        "end": 66,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": "2850 mg/m2",
          "prescribed dose": "75 mg/m2"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 29,
        "originalEnd": 66,
        "originalIndex": 9,
        "color": 3697840
      },
      {
        "p": "26-6174",
        "start": 71,
        "end": 71,
        "data": {
          "person neoplasm cancer": "",
          "vital": "Alive",
          "performance  scale timing": "Post-Adjuvant Therapy"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 71,
        "originalEnd": 71,
        "originalIndex": 1508,
        "color": 8374655
      },
      {
        "p": "26-6174",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2170,
        "color": 12496596
      },
      {
        "p": "26-6174",
        "start": 29,
        "end": 70,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "60",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 29,
        "originalEnd": 70,
        "originalIndex": 4362,
        "color": 15729279
      }
    ],
    [
      {
        "p": "06-2563",
        "start": 27,
        "end": 57,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": "120 mg",
          "prescribed dose": "75 mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 27,
        "originalEnd": 57,
        "originalIndex": 10,
        "color": 3697840
      },
      {
        "p": "06-2563",
        "start": 934,
        "end": null,
        "data": {
          "response": "",
          "type": "Targeted Molecular therapy",
          "drug": "Bevacizumab",
          "total dose": "549 mg",
          "prescribed dose": "10 mg/kg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 934,
        "originalEnd": null,
        "originalIndex": 11,
        "color": 3697840
      },
      {
        "p": "06-2563",
        "start": 885,
        "end": 931,
        "data": {
          "response": "",
          "type": "Targeted Molecular therapy",
          "drug": "R04929097",
          "total dose": "20 mg/day",
          "prescribed dose": "20 mg/day"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 885,
        "originalEnd": 931,
        "originalIndex": 12,
        "color": 3697840
      },
      {
        "p": "06-2563",
        "start": 259,
        "end": 259,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Alive",
          "performance  scale timing": "Preoperative"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 259,
        "originalEnd": 259,
        "originalIndex": 1510,
        "color": 8374655
      },
      {
        "p": "06-2563",
        "start": 932,
        "end": 932,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Alive",
          "performance  scale timing": "Post-Adjuvant Therapy"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 932,
        "originalEnd": 932,
        "originalIndex": 1511,
        "color": 8374655
      },
      {
        "p": "06-2563",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2177,
        "color": 12496596
      },
      {
        "p": "06-2563",
        "start": 27,
        "end": 57,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "46",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 27,
        "originalEnd": 57,
        "originalIndex": 4363,
        "color": 15729279
      },
      {
        "p": "06-2563",
        "start": 566,
        "end": 576,
        "data": {
          "type": "OTHER",
          "dose": "3200",
          "course": "2"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 566,
        "originalEnd": 576,
        "originalIndex": 4364,
        "color": 15729279
      }
    ],
    [
      {
        "p": "12-1096",
        "start": 202,
        "end": 277,
        "data": {
          "response": "",
          "type": "Targeted Molecular therapy",
          "drug": "Avastin",
          "total dose": " mg/m2",
          "prescribed dose": " mg/m2"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 202,
        "originalEnd": 277,
        "originalIndex": 13,
        "color": 3697840
      },
      {
        "p": "12-1096",
        "start": 63,
        "end": 101,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodor",
          "total dose": "75 mg/m2",
          "prescribed dose": " mg/m2"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 63,
        "originalEnd": 101,
        "originalIndex": 14,
        "color": 3697840
      },
      {
        "p": "12-1096",
        "start": 130,
        "end": 201,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodor",
          "total dose": "300 mg/m2",
          "prescribed dose": " mg/m2"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 130,
        "originalEnd": 201,
        "originalIndex": 15,
        "color": 3697840
      },
      {
        "p": "12-1096",
        "start": 202,
        "end": 277,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "CPT-11",
          "total dose": "250 mg/m2",
          "prescribed dose": " mg/m2"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 202,
        "originalEnd": 277,
        "originalIndex": 16,
        "color": 3697840
      },
      {
        "p": "12-1096",
        "start": null,
        "end": null,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": "Pre-Adjuvant Therapy"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": null,
        "originalEnd": null,
        "originalIndex": 1512,
        "color": 8374655
      },
      {
        "p": "12-1096",
        "start": 277,
        "end": 277,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 277,
        "originalEnd": 277,
        "originalIndex": 2179,
        "color": 16629894
      },
      {
        "p": "12-1096",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2180,
        "color": 12496596
      },
      {
        "p": "12-1096",
        "start": 63,
        "end": 104,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 63,
        "originalEnd": 104,
        "originalIndex": 4365,
        "color": 15729279
      }
    ],
    [
      {
        "p": "19-2629",
        "start": 148,
        "end": 198,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Avastin",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 148,
        "originalEnd": 198,
        "originalIndex": 17,
        "color": 3697840
      },
      {
        "p": "19-2629",
        "start": 10,
        "end": 69,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": "7560 mg",
          "prescribed dose": "180 mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 10,
        "originalEnd": 69,
        "originalIndex": 18,
        "color": 3697840
      },
      {
        "p": "19-2629",
        "start": 104,
        "end": 135,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": "3500 mg",
          "prescribed dose": "350 mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 104,
        "originalEnd": 135,
        "originalIndex": 19,
        "color": 3697840
      },
      {
        "p": "19-2629",
        "start": 501,
        "end": 501,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": ""
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 501,
        "originalEnd": 501,
        "originalIndex": 1513,
        "color": 8374655
      },
      {
        "p": "19-2629",
        "start": 737,
        "end": 737,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 737,
        "originalEnd": 737,
        "originalIndex": 2182,
        "color": 16629894
      },
      {
        "p": "19-2629",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2183,
        "color": 12496596
      },
      {
        "p": "19-2629",
        "start": 10,
        "end": 69,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 10,
        "originalEnd": 69,
        "originalIndex": 4366,
        "color": 15729279
      }
    ],
    [
      {
        "p": "02-0010",
        "start": 509,
        "end": 569,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": "200 mg/m2",
          "prescribed dose": " mg/m2"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 509,
        "originalEnd": 569,
        "originalIndex": 20,
        "color": 3697840
      },
      {
        "p": "02-0010",
        "start": null,
        "end": null,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Thalidomide",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": null,
        "originalEnd": null,
        "originalIndex": 21,
        "color": 3697840
      },
      {
        "p": "02-0010",
        "start": null,
        "end": null,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "CPT 11",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": null,
        "originalEnd": null,
        "originalIndex": 22,
        "color": 3697840
      },
      {
        "p": "02-0010",
        "start": 1077,
        "end": 1077,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": ""
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 1077,
        "originalEnd": 1077,
        "originalIndex": 1515,
        "color": 8374655
      },
      {
        "p": "02-0010",
        "start": 1077,
        "end": 1077,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 1077,
        "originalEnd": 1077,
        "originalIndex": 2190,
        "color": 16629894
      },
      {
        "p": "02-0010",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2191,
        "color": 12496596
      },
      {
        "p": "02-0010",
        "start": 139,
        "end": 182,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 139,
        "originalEnd": 182,
        "originalIndex": 4367,
        "color": 15729279
      }
    ],
    [
      {
        "p": "02-0432",
        "start": 1,
        "end": 1,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "CCNU",
          "total dose": "100 mg/m2",
          "prescribed dose": " mg/m2"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 1,
        "originalEnd": 1,
        "originalIndex": 23,
        "color": 3697840
      },
      {
        "p": "02-0432",
        "start": 1433,
        "end": 1433,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": ""
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 1433,
        "originalEnd": 1433,
        "originalIndex": 1518,
        "color": 8374655
      },
      {
        "p": "02-0432",
        "start": 1433,
        "end": 1433,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 1433,
        "originalEnd": 1433,
        "originalIndex": 2202,
        "color": 16629894
      },
      {
        "p": "02-0432",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2203,
        "color": 12496596
      },
      {
        "p": "02-0432",
        "start": 18,
        "end": 56,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 18,
        "originalEnd": 56,
        "originalIndex": 4368,
        "color": 15729279
      }
    ],
    [
      {
        "p": "32-1970",
        "start": 28,
        "end": 67,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": "6800 mg",
          "prescribed dose": "170 mg",
         "notes": "the quick brown fox jumps overthe lazy dog. the quick brown fox jumps overthe lazy dog. the quick brown fox jumps overthe lazy dog. the quick brown fox jumps overthe lazy dog. the quick brown fox jumps overthe lazy dog. the quick brown fox jumps overthe lazy dog. the quick brown fox jumps overthe lazy dog. "

        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 28,
        "originalEnd": 67,
        "originalIndex": 24,
        "color": 222220
      },
      {
        "p": "32-1970",
        "start": null,
        "end": null,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": " mg",
          "prescribed dose": "200 mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": null,
        "originalEnd": null,
        "originalIndex": 25,
        "color": 3697840
      },
      {
        "p": "32-1970",
        "start": 468,
        "end": 468,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": "Pre-Adjuvant Therapy"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 468,
        "originalEnd": 468,
        "originalIndex": 1519,
        "color": 8374655
      },
      {
        "p": "32-1970",
        "start": 468,
        "end": 468,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 468,
        "originalEnd": 468,
        "originalIndex": 2206,
        "color": 16629894
      },
      {
        "p": "32-1970",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2207,
        "color": 12496596
      },
      {
        "p": "32-1970",
        "start": 28,
        "end": 67,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "600",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 28,
        "originalEnd": 67,
        "originalIndex": 4369,
        "color": 15729279
      }
    ],
    [
      {
        "p": "02-0111",
        "start": 28,
        "end": 74,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": "75 ug/m2",
          "prescribed dose": " ug/m2"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 28,
        "originalEnd": 74,
        "originalIndex": 26,
        "color": 3697840
      },
      {
        "p": "02-0111",
        "start": 705,
        "end": 705,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": ""
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 705,
        "originalEnd": 705,
        "originalIndex": 1520,
        "color": 8374655
      },
      {
        "p": "02-0111",
        "start": 705,
        "end": 705,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 705,
        "originalEnd": 705,
        "originalIndex": 2210,
        "color": 16629894
      },
      {
        "p": "02-0111",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2211,
        "color": 12496596
      },
      {
        "p": "02-0111",
        "start": 28,
        "end": 74,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 28,
        "originalEnd": 74,
        "originalIndex": 4370,
        "color": 15729279
      }
    ],
    [
      {
        "p": "28-1756",
        "start": 21,
        "end": 69,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": " mg",
          "prescribed dose": "160 mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 21,
        "originalEnd": 69,
        "originalIndex": 27,
        "color": 3697840
      },
      {
        "p": "28-1756",
        "start": 86,
        "end": 86,
        "data": {
          "person neoplasm cancer": "TUMOR FREE",
          "vital": "Alive",
          "performance  scale timing": "Other"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 86,
        "originalEnd": 86,
        "originalIndex": 1521,
        "color": 8374655
      },
      {
        "p": "28-1756",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2214,
        "color": 12496596
      },
      {
        "p": "28-1756",
        "start": 25,
        "end": 69,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "NA",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 25,
        "originalEnd": 69,
        "originalIndex": 4371,
        "color": 15729279
      },
      {
        "p": "28-1756",
        "start": 10,
        "end": 10,
        "data": {
          "type": "OTHER",
          "dose": "1500",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 10,
        "originalEnd": 10,
        "originalIndex": 4372,
        "color": 15729279
      }
    ],
    [
      {
        "p": "14-1037",
        "start": 25,
        "end": 95,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Oxaliplatin",
          "total dose": " mg",
          "prescribed dose": " mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 25,
        "originalEnd": 95,
        "originalIndex": 28,
        "color": 3697840
      },
      {
        "p": "14-1037",
        "start": 326,
        "end": null,
        "data": {
          "response": "",
          "type": "Hormone Therapy",
          "drug": "Dexamethasone",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 326,
        "originalEnd": null,
        "originalIndex": 29,
        "color": 3697840
      },
      {
        "p": "14-1037",
        "start": 346,
        "end": 433,
        "data": {
          "response": "",
          "type": "Targeted Molecular therapy",
          "drug": "PS 341",
          "total dose": "36.8 mg",
          "prescribed dose": " mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 346,
        "originalEnd": 433,
        "originalIndex": 30,
        "color": 3697840
      },
      {
        "p": "14-1037",
        "start": 439,
        "end": 538,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": "6000 mg",
          "prescribed dose": " mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 439,
        "originalEnd": 538,
        "originalIndex": 31,
        "color": 3697840
      },
      {
        "p": "14-1037",
        "start": 310,
        "end": 322,
        "data": {
          "response": "",
          "type": "Hormone Therapy",
          "drug": "Dexamethasome",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 0,
        "originalEnd": null,
        "originalIndex": 32,
        "color": 3697840
      },
      {
        "p": "14-1037",
        "start": 587,
        "end": 587,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": "Pre-Adjuvant Therapy"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 587,
        "originalEnd": 587,
        "originalIndex": 1522,
        "color": 8374655
      },
      {
        "p": "14-1037",
        "start": 587,
        "end": 587,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 587,
        "originalEnd": 587,
        "originalIndex": 2217,
        "color": 16629894
      },
      {
        "p": "14-1037",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2218,
        "color": 12496596
      },
      {
        "p": "14-1037",
        "start": 118,
        "end": 165,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 118,
        "originalEnd": 165,
        "originalIndex": 4373,
        "color": 15729279
      }
    ],
    [
      {
        "p": "12-1600",
        "start": 106,
        "end": 218,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": "12000 mg",
          "prescribed dose": " mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 106,
        "originalEnd": 218,
        "originalIndex": 33,
        "color": 3697840
      },
      {
        "p": "12-1600",
        "start": 43,
        "end": 84,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temodar",
          "total dose": "5880 mg",
          "prescribed dose": " mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 43,
        "originalEnd": 84,
        "originalIndex": 34,
        "color": 3697840
      },
      {
        "p": "12-1600",
        "start": 414,
        "end": 414,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": "Post-Adjuvant Therapy"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 414,
        "originalEnd": 414,
        "originalIndex": 1523,
        "color": 8374655
      },
      {
        "p": "12-1600",
        "start": 448,
        "end": 448,
        "data": {
          "event": "Death"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 448,
        "originalEnd": 448,
        "originalIndex": 2221,
        "color": 16629894
      },
      {
        "p": "12-1600",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2222,
        "color": 12496596
      },
      {
        "p": "12-1600",
        "start": 43,
        "end": 84,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 43,
        "originalEnd": 84,
        "originalIndex": 4374,
        "color": 15729279
      }
    ],
    [
      {
        "p": "06-0879",
        "start": 67,
        "end": null,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": "200 mg",
          "prescribed dose": " mg"
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 67,
        "originalEnd": null,
        "originalIndex": 35,
        "color": 3697840
      },
      {
        "p": "06-0879",
        "start": 84,
        "end": null,
        "data": {
          "response": "",
          "type": "Targeted Molecular therapy",
          "drug": "dcVax",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 84,
        "originalEnd": null,
        "originalIndex": 36,
        "color": 3697840
      },
      {
        "p": "06-0879",
        "start": 19,
        "end": 60,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 19,
        "originalEnd": 60,
        "originalIndex": 37,
        "color": 3697840
      },
      {
        "p": "06-0879",
        "start": 117,
        "end": 435,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 117,
        "originalEnd": 435,
        "originalIndex": 38,
        "color": 3697840
      },
      {
        "p": "06-0879",
        "start": 84,
        "end": 580,
        "data": {
          "response": "",
          "type": "Targeted Molecular therapy",
          "drug": "dc Vax (Dendritic Cell Vaccine)",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 84,
        "originalEnd": 580,
        "originalIndex": 39,
        "color": 3697840
      },
      {
        "p": "06-0879",
        "start": 718,
        "end": 960,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Temozolomide",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 718,
        "originalEnd": 960,
        "originalIndex": 40,
        "color": 3697840
      },
      {
        "p": "06-0879",
        "start": 708,
        "end": 942,
        "data": {
          "response": "",
          "type": "Targeted Molecular therapy",
          "drug": "Dendritic Cell Vaccine (dcvax)",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 708,
        "originalEnd": 942,
        "originalIndex": 41,
        "color": 3697840
      },
      {
        "p": "06-0879",
        "start": 998,
        "end": 1025,
        "data": {
          "response": "",
          "type": "Targeted Molecular therapy",
          "drug": "Cedicanib",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 998,
        "originalEnd": 1025,
        "originalIndex": 42,
        "color": 3697840
      },
      {
        "p": "06-0879",
        "start": 998,
        "end": 1025,
        "data": {
          "response": "",
          "type": "Targeted Molecular therapy",
          "drug": "Cilengitide",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 998,
        "originalEnd": 1025,
        "originalIndex": 43,
        "color": 3697840
      },
      {
        "p": "06-0879",
        "start": 1029,
        "end": 1029,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Lomustine CCNU",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 1029,
        "originalEnd": 1029,
        "originalIndex": 44,
        "color": 3697840
      },
      {
        "p": "06-0879",
        "start": 1029,
        "end": 1205,
        "data": {
          "response": "",
          "type": "Targeted Molecular therapy",
          "drug": "Bevacizumab",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 1029,
        "originalEnd": 1205,
        "originalIndex": 45,
        "color": 3697840
      },
      {
        "p": "06-0879",
        "start": 1085,
        "end": 1085,
        "data": {
          "response": "",
          "type": "Chemotherapy",
          "drug": "Carboplatin",
          "total dose": " ",
          "prescribed dose": " "
        },
        "type": "Treatment",
        "subtype": "Drug",
        "originalStart": 1085,
        "originalEnd": 1085,
        "originalIndex": 46,
        "color": 3697840
      },
      {
        "p": "06-0879",
        "start": 699,
        "end": 699,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Alive",
          "performance  scale timing": ""
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": 699,
        "originalEnd": 699,
        "originalIndex": 1524,
        "color": 8374655
      },
      {
        "p": "06-0879",
        "start": null,
        "end": null,
        "data": {
          "person neoplasm cancer": "WITH TUMOR",
          "vital": "Dead",
          "performance  scale timing": "Post-Adjuvant Therapy"
        },
        "type": "Status",
        "subtype": "Follow Up",
        "originalStart": null,
        "originalEnd": null,
        "originalIndex": 1525,
        "color": 8374655
      },
      {
        "p": "06-0879",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 2225,
        "color": 12496596
      },
      {
        "p": "06-0879",
        "start": 19,
        "end": 60,
        "data": {
          "type": "EXTERNAL BEAM",
          "dose": "6000",
          "course": "NA"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 19,
        "originalEnd": 60,
        "originalIndex": 4375,
        "color": 15729279
      },
      {
        "p": "06-0879",
        "start": 1091,
        "end": 1098,
        "data": {
          "type": "OTHER",
          "dose": "3200",
          "course": "2"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 1091,
        "originalEnd": 1098,
        "originalIndex": 4376,
        "color": 15729279
      }
    ],
    [
      {
        "p": "r8-a6mo",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 7177,
        "color": 12496596
      }
    ],
    [
      {
        "p": "dh-a669",
        "start": 919,
        "end": 919,
        "data": {
          "event": "Death"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 919,
        "originalEnd": 919,
        "originalIndex": 7342,
        "color": 15729279
      },
      {
        "p": "dh-a669",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 7343,
        "color": 12496596
      }
    ],
    [
      {
        "p": "ht-8015",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 7353,
        "color": 12496596
      }
    ],
    [
      {
        "p": "wy-a85a",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 7448,
        "color": 12496596
      },
      {
        "p": "wy-a85a",
        "start": 718,
        "end": 718,
        "data": {
          "event": "Status Assessment"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": 718,
        "originalEnd": 718,
        "originalIndex": 7449,
        "color": 16629894
      }
    ],
    [
      {
        "p": "s9-a7r2",
        "start": 316,
        "end": 316,
        "data": {
          "event": "Death"
        },
        "type": "Treatment",
        "subtype": "Radiation",
        "originalStart": 316,
        "originalEnd": 316,
        "originalIndex": 7626,
        "color": 15729279
      },
      {
        "p": "s9-a7r2",
        "start": 0,
        "end": 0,
        "data": {
          "event": "Diagnosis"
        },
        "type": "Status",
        "subtype": "Diagnosis",
        "originalStart": 0,
        "originalEnd": 0,
        "originalIndex": 7627,
        "color": 12496596
      },
      {
        "p": "s9-a7r2",
        "start": -2,
        "end": -2,
        "data": {
          "event": "Status Assessment"
        },
        "type": "Status",
        "subtype": "Death",
        "originalStart": -2,
        "originalEnd": -2,
        "originalIndex": 7628,
        "color": 16629894
      }
    ]
  ],
  "attrs": {
    "pids": [
      "02-0001",
      "02-0003",
      "02-0004",
      "02-0006",
      "02-0007",
      "02-0009",
      "02-0010",
      "02-0011",
      "02-0014",
      "02-0015",
      "02-0016",
      "02-0021",
      "02-0023",
      "02-0024",
      "02-0025",
      "02-0026",
      "02-0027",
      "02-0028",
      "02-0033",
      "02-0034",
      "02-0037",
      "02-0038",
      "02-0039",
      "02-0043",
      "02-0046",
      "02-0047",
      "02-0048",
      "02-0051",
      "02-0052",
      "02-0054",
      "02-0055",
      "02-0057",
      "02-0058",
      "02-0059",
      "02-0060",
      "02-0064",
      "02-0068",
      "02-0069",
      "02-0070",
      "02-0071",
      "02-0074",
      "02-0075",
      "02-0079",
      "02-0080",
      "02-0083",
      "02-0084",
      "02-0085",
      "02-0086",
      "02-0087",
      "02-0089",
      "02-0099",
      "02-0102",
      "02-0104",
      "02-0106",
      "02-0107",
      "02-0111",
      "02-0113",
      "02-0114",
      "02-0115",
      "02-0116",
      "02-0258",
      "02-0260",
      "02-0266",
      "02-0269",
      "02-0271",
      "02-0281",
      "02-0285",
      "02-0289",
      "02-0290",
      "02-0317",
      "02-0321",
      "02-0324",
      "02-0325",
      "02-0326",
      "02-0330",
      "02-0332",
      "02-0333",
      "02-0337",
      "02-0338",
      "02-0339",
      "02-0422",
      "02-0430",
      "02-0432",
      "02-0439",
      "02-0440",
      "02-0446",
      "02-0451",
      "02-0456",
      "02-2466",
      "02-2470",
      "02-2483",
      "02-2485",
      "02-2486",
      "06-0119",
      "06-0122",
      "06-0124",
      "06-0125",
      "06-0126",
      "06-0127",
      "06-0128",
      "06-0129",
      "06-0130",
      "06-0132",
      "06-0133",
      "06-0137",
      "06-0138",
      "06-0139",
      "06-0140",
      "06-0141",
      "06-0142",
      "06-0143",
      "06-0145",
      "06-0146",
      "06-0147",
      "06-0148",
      "06-0149",
      "06-0150",
      "06-0151",
      "06-0152",
      "06-0154",
      "06-0155",
      "06-0156",
      "06-0157",
      "06-0158",
      "06-0159",
      "06-0160",
      "06-0162",
      "06-0164",
      "06-0165",
      "06-0166",
      "06-0167",
      "06-0168",
      "06-0169",
      "06-0171",
      "06-0173",
      "06-0174",
      "06-0175",
      "06-0176",
      "06-0177",
      "06-0178",
      "06-0179",
      "06-0182",
      "06-0184",
      "06-0185",
      "06-0187",
      "06-0188",
      "06-0189",
      "06-0190",
      "06-0192",
      "06-0194",
      "06-0195",
      "06-0197",
      "06-0201",
      "06-0206",
      "06-0208",
      "06-0209",
      "06-0210",
      "06-0211",
      "06-0213",
      "06-0214",
      "06-0216",
      "06-0219",
      "06-0221",
      "06-0237",
      "06-0238",
      "06-0240",
      "06-0241",
      "06-0394",
      "06-0397",
      "06-0402",
      "06-0409",
      "06-0410",
      "06-0412",
      "06-0413",
      "06-0414",
      "06-0644",
      "06-0645",
      "06-0646",
      "06-0648",
      "06-0649",
      "06-0650",
      "06-0686",
      "06-0743",
      "06-0744",
      "06-0745",
      "06-0747",
      "06-0749",
      "06-0750",
      "06-0875",
      "06-0876",
      "06-0877",
      "06-0878",
      "06-0879",
      "06-0881",
      "06-0882",
      "06-0939",
      "06-1084",
      "06-1086",
      "06-1087",
      "06-1800",
      "06-1801",
      "06-1802",
      "06-1804",
      "06-1805",
      "06-1806",
      "06-2557",
      "06-2558",
      "06-2559",
      "06-2561",
      "06-2562",
      "06-2563",
      "06-2564",
      "06-2565",
      "06-2566",
      "06-2567",
      "06-2569",
      "06-2570",
      "06-5408",
      "06-5410",
      "06-5411",
      "06-5412",
      "06-5413",
      "06-5414",
      "06-5415",
      "06-5416",
      "06-5417",
      "06-5418",
      "06-5856",
      "06-5858",
      "06-5859",
      "06-6388",
      "06-6389",
      "06-6390",
      "06-6391",
      "06-6693",
      "06-6694",
      "06-6695",
      "06-6697",
      "06-6698",
      "06-6699",
      "06-6700",
      "06-6701",
      "06-a5u0",
      "06-a5u1",
      "06-a6s0",
      "06-a6s1",
      "06-a7tk",
      "06-a7tl",
      "08-0244",
      "08-0245",
      "08-0246",
      "08-0344",
      "08-0345",
      "08-0346",
      "08-0347",
      "08-0348",
      "08-0349",
      "08-0350",
      "08-0351",
      "08-0352",
      "08-0353",
      "08-0354",
      "08-0355",
      "08-0356",
      "08-0357",
      "08-0358",
      "08-0359",
      "08-0360",
      "08-0373",
      "08-0375",
      "08-0380",
      "08-0385",
      "08-0386",
      "08-0389",
      "08-0390",
      "08-0392",
      "08-0509",
      "08-0510",
      "08-0511",
      "08-0512",
      "08-0514",
      "08-0516",
      "08-0517",
      "08-0518",
      "08-0520",
      "08-0521",
      "08-0522",
      "08-0524",
      "08-0525",
      "08-0529",
      "08-0531",
      "12-0615",
      "12-0616",
      "12-0618",
      "12-0619",
      "12-0620",
      "12-0653",
      "12-0654",
      "12-0656",
      "12-0657",
      "12-0662",
      "12-0670",
      "12-0688",
      "12-0691",
      "12-0692",
      "12-0703",
      "12-0707",
      "12-0769",
      "12-0772",
      "12-0773",
      "12-0775",
      "12-0776",
      "12-0778",
      "12-0780",
      "12-0818",
      "12-0819",
      "12-0820",
      "12-0821",
      "12-0822",
      "12-0826",
      "12-0827",
      "12-0828",
      "12-0829",
      "12-1088",
      "12-1089",
      "12-1090",
      "12-1091",
      "12-1092",
      "12-1093",
      "12-1094",
      "12-1095",
      "12-1096",
      "12-1097",
      "12-1098",
      "12-1099",
      "12-1597",
      "12-1598",
      "12-1599",
      "12-1600",
      "12-1602",
      "12-3644",
      "12-3646",
      "12-3648",
      "12-3649",
      "12-3650",
      "12-3651",
      "12-3652",
      "12-3653",
      "12-5295",
      "12-5299",
      "12-5301",
      "14-0736",
      "14-0740",
      "14-0781",
      "14-0783",
      "14-0786",
      "14-0787",
      "14-0789",
      "14-0790",
      "14-0812",
      "14-0813",
      "14-0817",
      "14-0862",
      "14-0865",
      "14-0866",
      "14-0867",
      "14-0871",
      "14-1034",
      "14-1037",
      "14-1043",
      "14-1395",
      "14-1396",
      "14-1401",
      "14-1402",
      "14-1450",
      "14-1451",
      "14-1452",
      "14-1453",
      "14-1454",
      "14-1455",
      "14-1456",
      "14-1458",
      "14-1459",
      "14-1794",
      "14-1795",
      "14-1821",
      "14-1823",
      "14-1825",
      "14-1827",
      "14-1829",
      "14-2554",
      "14-2555",
      "14-3476",
      "14-3477",
      "14-4157",
      "15-0742",
      "15-1444",
      "15-1446",
      "15-1447",
      "15-1449",
      "16-0846",
      "16-0848",
      "16-0849",
      "16-0850",
      "16-0861",
      "16-1045",
      "16-1047",
      "16-1055",
      "16-1056",
      "16-1060",
      "16-1062",
      "16-1063",
      "16-1460",
      "19-0955",
      "19-0957",
      "19-0960",
      "19-0962",
      "19-0963",
      "19-0964",
      "19-1385",
      "19-1386",
      "19-1387",
      "19-1388",
      "19-1389",
      "19-1390",
      "19-1392",
      "19-1786",
      "19-1787",
      "19-1788",
      "19-1789",
      "19-1790",
      "19-1791",
      "19-2619",
      "19-2620",
      "19-2621",
      "19-2623",
      "19-2624",
      "19-2625",
      "19-2629",
      "19-2631",
      "19-4065",
      "19-4068",
      "19-5947",
      "19-5950",
      "19-5951",
      "19-5952",
      "19-5953",
      "19-5954",
      "19-5955",
      "19-5956",
      "19-5958",
      "19-5959",
      "19-5960",
      "19-a60i",
      "19-a6j4",
      "19-a6j5",
      "26-1438",
      "26-1439",
      "26-1440",
      "26-1442",
      "26-1443",
      "26-1799",
      "26-5132",
      "26-5133",
      "26-5134",
      "26-5135",
      "26-5136",
      "26-5139",
      "26-6173",
      "26-6174",
      "26-a7ux",
      "27-1830",
      "27-1831",
      "27-1832",
      "27-1833",
      "27-1834",
      "27-1835",
      "27-1836",
      "27-1837",
      "27-1838",
      "27-2518",
      "27-2519",
      "27-2521",
      "27-2523",
      "27-2524",
      "27-2526",
      "27-2527",
      "27-2528",
      "28-1745",
      "28-1746",
      "28-1747",
      "28-1749",
      "28-1750",
      "28-1751",
      "28-1752",
      "28-1753",
      "28-1755",
      "28-1756",
      "28-1757",
      "28-1760",
      "28-2499",
      "28-2502",
      "28-2506",
      "28-2509",
      "28-2512",
      "28-2513",
      "28-2514",
      "28-5204",
      "28-5207",
      "28-5208",
      "28-5209",
      "28-5211",
      "28-5213",
      "28-5214",
      "28-5215",
      "28-5216",
      "28-5218",
      "28-5219",
      "28-5220",
      "28-6450",
      "32-1970",
      "32-1973",
      "32-1976",
      "32-1977",
      "32-1978",
      "32-1979",
      "32-1980",
      "32-1982",
      "32-1986",
      "32-1987",
      "32-1991",
      "32-2491",
      "32-2494",
      "32-2495",
      "32-2615",
      "32-2616",
      "32-2632",
      "32-2634",
      "32-2638",
      "32-4208",
      "32-4209",
      "32-4210",
      "32-4211",
      "32-4213",
      "32-4719",
      "32-5222",
      "41-2571",
      "41-2572",
      "41-2573",
      "41-2575",
      "41-3392",
      "41-3393",
      "41-3915",
      "41-4097",
      "41-5651",
      "41-6646",
      "4w-aa9r",
      "4w-aa9s",
      "4w-aa9t",
      "74-6573",
      "74-6575",
      "74-6577",
      "74-6578",
      "74-6581",
      "74-6584",
      "76-4925",
      "76-4926",
      "76-4927",
      "76-4928",
      "76-4929",
      "76-4931",
      "76-4932",
      "76-4934",
      "76-4935",
      "76-6191",
      "76-6192",
      "76-6193",
      "76-6280",
      "76-6282",
      "76-6283",
      "76-6285",
      "76-6286",
      "76-6656",
      "76-6657",
      "76-6660",
      "76-6661",
      "76-6662",
      "76-6663",
      "76-6664",
      "81-5910",
      "81-5911",
      "87-5896",
      "cs-4938",
      "cs-4941",
      "cs-4942",
      "cs-4943",
      "cs-4944",
      "cs-5390",
      "cs-5393",
      "cs-5394",
      "cs-5395",
      "cs-5396",
      "cs-5397",
      "cs-6186",
      "cs-6188",
      "cs-6290",
      "cs-6665",
      "cs-6666",
      "cs-6667",
      "cs-6668",
      "cs-6669",
      "cs-6670",
      "db-5270",
      "db-5273",
      "db-5274",
      "db-5275",
      "db-5276",
      "db-5277",
      "db-5278",
      "db-5279",
      "db-5280",
      "db-5281",
      "db-a4x9",
      "db-a4xa",
      "db-a4xb",
      "db-a4xc",
      "db-a4xd",
      "db-a4xe",
      "db-a4xf",
      "db-a4xg",
      "db-a4xh",
      "db-a64l",
      "db-a64o",
      "db-a64p",
      "db-a64q",
      "db-a64r",
      "db-a64s",
      "db-a64u",
      "db-a64v",
      "db-a64w",
      "db-a64x",
      "db-a75k",
      "db-a75l",
      "db-a75m",
      "db-a75o",
      "db-a75p",
      "dh-5140",
      "dh-5141",
      "dh-5142",
      "dh-5143",
      "dh-5144",
      "dh-a669",
      "dh-a66b",
      "dh-a66d",
      "dh-a66f",
      "dh-a66g",
      "dh-a7ur",
      "dh-a7us",
      "dh-a7ut",
      "dh-a7uu",
      "dh-a7uv",
      "du-5847",
      "du-5849",
      "du-5851",
      "du-5852",
      "du-5853",
      "du-5854",
      "du-5855",
      "du-5870",
      "du-5871",
      "du-5872",
      "du-5874",
      "du-6392",
      "du-6393",
      "du-6394",
      "du-6395",
      "du-6396",
      "du-6397",
      "du-6399",
      "du-6400",
      "du-6401",
      "du-6402",
      "du-6403",
      "du-6404",
      "du-6405",
      "du-6406",
      "du-6407",
      "du-6408",
      "du-6410",
      "du-6542",
      "du-7006",
      "du-7007",
      "du-7008",
      "du-7009",
      "du-7010",
      "du-7011",
      "du-7012",
      "du-7013",
      "du-7014",
      "du-7015",
      "du-7018",
      "du-7019",
      "du-7290",
      "du-7292",
      "du-7294",
      "du-7298",
      "du-7299",
      "du-7300",
      "du-7301",
      "du-7302",
      "du-7304",
      "du-7306",
      "du-7309",
      "du-8158",
      "du-8161",
      "du-8162",
      "du-8163",
      "du-8164",
      "du-8165",
      "du-8166",
      "du-8167",
      "du-8168",
      "du-a5tp",
      "du-a5tr",
      "du-a5ts",
      "du-a5tt",
      "du-a5tu",
      "du-a5tw",
      "du-a5ty",
      "du-a6s2",
      "du-a6s3",
      "du-a6s6",
      "du-a6s7",
      "du-a6s8",
      "du-a76k",
      "du-a76l",
      "du-a76o",
      "du-a76r",
      "du-a7t6",
      "du-a7t8",
      "du-a7ta",
      "du-a7tb",
      "du-a7tc",
      "du-a7td",
      "du-a7tg",
      "du-a7ti",
      "du-a7tj",
      "e1-5302",
      "e1-5303",
      "e1-5304",
      "e1-5305",
      "e1-5307",
      "e1-5311",
      "e1-5318",
      "e1-5319",
      "e1-5322",
      "e1-a7yd",
      "e1-a7ye",
      "e1-a7yh",
      "e1-a7yi",
      "e1-a7yj",
      "e1-a7yk",
      "e1-a7yl",
      "e1-a7ym",
      "e1-a7yn",
      "e1-a7yo",
      "e1-a7yq",
      "e1-a7ys",
      "e1-a7yu",
      "e1-a7yv",
      "e1-a7yw",
      "e1-a7yy",
      "e1-a7z2",
      "e1-a7z3",
      "e1-a7z4",
      "e1-a7z6",
      "ez-7264",
      "f6-a8o3",
      "f6-a8o4",
      "fg-5962",
      "fg-5963",
      "fg-5964",
      "fg-5965",
      "fg-6688",
      "fg-6689",
      "fg-6690",
      "fg-6691",
      "fg-6692",
      "fg-7634",
      "fg-7636",
      "fg-7637",
      "fg-7638",
      "fg-7641",
      "fg-7643",
      "fg-8181",
      "fg-8182",
      "fg-8185",
      "fg-8186",
      "fg-8187",
      "fg-8188",
      "fg-8189",
      "fg-8191",
      "fg-a4mt",
      "fg-a4mu",
      "fg-a4mw",
      "fg-a4mx",
      "fg-a4my",
      "fg-a60j",
      "fg-a60k",
      "fg-a60l",
      "fg-a6iz",
      "fg-a6j1",
      "fg-a6j3",
      "fg-a70y",
      "fg-a70z",
      "fg-a710",
      "fg-a711",
      "fg-a713",
      "fg-a87n",
      "fg-a87q",
      "fn-7833",
      "ht-7467",
      "ht-7468",
      "ht-7469",
      "ht-7470",
      "ht-7471",
      "ht-7472",
      "ht-7473",
      "ht-7474",
      "ht-7475",
      "ht-7476",
      "ht-7477",
      "ht-7478",
      "ht-7479",
      "ht-7480",
      "ht-7481",
      "ht-7482",
      "ht-7483",
      "ht-7485",
      "ht-7601",
      "ht-7602",
      "ht-7603",
      "ht-7604",
      "ht-7605",
      "ht-7606",
      "ht-7607",
      "ht-7608",
      "ht-7609",
      "ht-7610",
      "ht-7611",
      "ht-7616",
      "ht-7620",
      "ht-7676",
      "ht-7677",
      "ht-7680",
      "ht-7681",
      "ht-7684",
      "ht-7686",
      "ht-7687",
      "ht-7688",
      "ht-7689",
      "ht-7690",
      "ht-7691",
      "ht-7692",
      "ht-7693",
      "ht-7694",
      "ht-7695",
      "ht-7854",
      "ht-7855",
      "ht-7856",
      "ht-7857",
      "ht-7858",
      "ht-7860",
      "ht-7873",
      "ht-7874",
      "ht-7875",
      "ht-7877",
      "ht-7879",
      "ht-7880",
      "ht-7881",
      "ht-7882",
      "ht-7884",
      "ht-7902",
      "ht-8010",
      "ht-8011",
      "ht-8012",
      "ht-8013",
      "ht-8015",
      "ht-8018",
      "ht-8019",
      "ht-8104",
      "ht-8105",
      "ht-8106",
      "ht-8107",
      "ht-8108",
      "ht-8109",
      "ht-8110",
      "ht-8111",
      "ht-8113",
      "ht-8114",
      "ht-8558",
      "ht-8563",
      "ht-8564",
      "ht-a4ds",
      "ht-a4dv",
      "ht-a5r5",
      "ht-a5r7",
      "ht-a5r9",
      "ht-a5ra",
      "ht-a5rb",
      "ht-a5rc",
      "ht-a614",
      "ht-a615",
      "ht-a616",
      "ht-a617",
      "ht-a618",
      "ht-a619",
      "ht-a61a",
      "ht-a61b",
      "ht-a61c",
      "ht-a74h",
      "ht-a74j",
      "ht-a74k",
      "ht-a74l",
      "ht-a74o",
      "hw-7486",
      "hw-7487",
      "hw-7489",
      "hw-7490",
      "hw-7491",
      "hw-7493",
      "hw-7495",
      "hw-8319",
      "hw-8320",
      "hw-8321",
      "hw-8322",
      "hw-a5kj",
      "hw-a5kk",
      "hw-a5kl",
      "hw-a5km",
      "ik-7675",
      "ik-8125",
      "kt-a74x",
      "kt-a7w1",
      "ox-a56r",
      "p5-a5et",
      "p5-a5eu",
      "p5-a5ev",
      "p5-a5ew",
      "p5-a5ex",
      "p5-a5ey",
      "p5-a5ez",
      "p5-a5f0",
      "p5-a5f1",
      "p5-a5f2",
      "p5-a5f4",
      "p5-a5f6",
      "p5-a72u",
      "p5-a72w",
      "p5-a72x",
      "p5-a72z",
      "p5-a730",
      "p5-a731",
      "p5-a733",
      "p5-a735",
      "p5-a736",
      "p5-a737",
      "p5-a77w",
      "p5-a77x",
      "p5-a780",
      "p5-a781",
      "qh-a65r",
      "qh-a65s",
      "qh-a65v",
      "qh-a65x",
      "qh-a65z",
      "qh-a6cs",
      "qh-a6cu",
      "qh-a6cv",
      "qh-a6cw",
      "qh-a6cx",
      "qh-a6cy",
      "qh-a6cz",
      "qh-a6x3",
      "qh-a6x4",
      "qh-a6x5",
      "qh-a6x8",
      "qh-a6x9",
      "qh-a6xa",
      "qh-a6xc",
      "qh-a86x",
      "qh-a870",
      "r8-a6mk",
      "r8-a6ml",
      "r8-a6mo",
      "r8-a73m",
      "rr-a6ka",
      "rr-a6kb",
      "rr-a6kc",
      "ry-a83x",
      "ry-a83y",
      "ry-a83z",
      "ry-a840",
      "ry-a843",
      "ry-a845",
      "ry-a847",
      "s9-a6ts",
      "s9-a6tu",
      "s9-a6tv",
      "s9-a6tw",
      "s9-a6tx",
      "s9-a6ty",
      "s9-a6tz",
      "s9-a6u0",
      "s9-a6u1",
      "s9-a6u2",
      "s9-a6u5",
      "s9-a6u6",
      "s9-a6u8",
      "s9-a6u9",
      "s9-a6ua",
      "s9-a6ub",
      "s9-a6wd",
      "s9-a6we",
      "s9-a6wg",
      "s9-a6wh",
      "s9-a6wi",
      "s9-a6wl",
      "s9-a6wm",
      "s9-a6wn",
      "s9-a6wo",
      "s9-a6wp",
      "s9-a6wq",
      "s9-a7iq",
      "s9-a7is",
      "s9-a7ix",
      "s9-a7iy",
      "s9-a7iz",
      "s9-a7j0",
      "s9-a7j1",
      "s9-a7j2",
      "s9-a7j3",
      "s9-a7qw",
      "s9-a7qx",
      "s9-a7qy",
      "s9-a7qz",
      "s9-a7r1",
      "s9-a7r2",
      "s9-a7r3",
      "s9-a7r4",
      "s9-a7r7",
      "s9-a7r8",
      "s9-a89v",
      "s9-a89z",
      "tm-a7c3",
      "tm-a7c4",
      "tm-a7c5",
      "tm-a7ca",
      "tm-a7cf",
      "tm-a84b",
      "tm-a84c",
      "tm-a84f",
      "tm-a84g",
      "tm-a84h",
      "tm-a84i",
      "tm-a84j",
      "tm-a84l",
      "tm-a84m",
      "tm-a84o",
      "tm-a84q",
      "tm-a84r",
      "tm-a84s",
      "tm-a84t",
      "tq-a7rf",
      "tq-a7rg",
      "tq-a7rh",
      "tq-a7ri",
      "tq-a7rj",
      "tq-a7rk",
      "tq-a7rm",
      "tq-a7rn",
      "tq-a7ro",
      "tq-a7rp",
      "tq-a7rq",
      "tq-a7rr",
      "tq-a7rs",
      "tq-a7ru",
      "tq-a7rv",
      "tq-a7rw",
      "tq-a8xe",
      "vm-a8c8",
      "vm-a8c9",
      "vm-a8ca",
      "vm-a8cb",
      "vm-a8cd",
      "vm-a8ce",
      "vm-a8cf",
      "vm-a8ch",
      "vv-a829",
      "vv-a86m",
      "vw-a7qs",
      "vw-a8fi",
      "w9-a837",
      "wh-a86k",
      "wy-a858",
      "wy-a859",
      "wy-a85a",
      "wy-a85b",
      "wy-a85c",
      "wy-a85d",
      "wy-a85e"
    ],
    "attrs": []
  }
}`
)}

function _d3(require){return(
require("d3@6")
)}

function _leftPanelOffset(){return(
0
)}

function _barHeight(numTracks,trackHeight){return(
numTracks * trackHeight
)}

function _numTracks(tlConfig){return(
Math.max(...tlConfig.bars.map(v=> v.row))+1
)}

function _trackHeight(dynamicTrackHeight){return(
dynamicTrackHeight
)}

function _maxHeight(){return(
1200
)}

function _timelineModal()
{
  return null;
  /*
  sdfsdfs
  */
  
/*    HIDDEN MODAL BOOTSTRAP

  const elem = DOM.element('div');
  elem.id = "chart-container";  
  

  
  // setup the modal
  let divModal = html`<div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLongTitle">Modal title</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p>...</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>`;
  
  //let tbl = document.get timelineSvgMasterTable
  document.body.appendChild(divModal);
//  elem.appendChild(divModal);
  return divModal;
  
  */
  
}


function _137(html){return(
html`<!--<code>css</code> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">-->`
)}

function _138(html){return(
html`<code>fontawesome</code> <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" crossorigin="anonymous">`
)}

function _$(require){return(
require('jquery').then(jquery => {
  window.jquery = jquery;
  return require('popper@1.0.1/index.js').catch(() => jquery);
})
)}

function _Popper(require){return(
require("https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js")
)}

function _font(html)
{ return html`
<hr>
<link rel="stylesheet">
<style>

    td.timeline-td-control {
      border: 0px solid black;
      border-collapse; collapse
    }
    .d3-tip {
      line-height: 1;
      padding: 6px;
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      border-radius: 4px;
      font-size: 12px;
    }
 
    /* Creates a small triangle extender for the tooltip */
    .d3-tip:after {
      box-sizing: border-box;
      display: inline;
      font-size: 10px;
      width: 100%;
      line-height: 1;
      color: rgba(0, 0, 0, 0.8);
      content: "\ 25 BC";
      position: absolute;
      text-align: center;
    }

     /* Style northward tooltips specifically */
    .d3-tip.n:after {
      margin: -2px 0 0 0;
      top: 100%;
      left: 0;
    }

rect.selection {
  fill: #888;
}

rect.overlay {
  fill: #F4F4F4;
}


.noselect {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.to-event-disabled {
  color: lightgray;
}


.timeline-svg {
  background-color: yellowgreen;
}

.timeline-svg-left {
  float: left;
}

.timeline-svg-right {
  float: right;
}

.timeline-svg-id-rect {
  fill: steelblue;
  cursor: pointer;
  text-anchor: start;
  alignment-baseline: central;
  font-family:sans-serif;
  font-weight: regular;
}

timeline-svg-id-attr-rect {
  stroke: white;
  stroke-width: 1;
  fill: green;
  cursor: pointer;
}

.events-group-rect {
  fill: #F4F4F4; 
}


.timeline-svg-id-rect-highlight {
  fill: lightblue;
}

.timeline-svg-id-rect-selected {
  fill: blue;
}

.timeline-svg-id-rect-sortfailure {
  fill:   #CCCCCC;
}

.timeline-svg-id-rect-selected.timeline-svg-id-rect-sortfailure {
  fill:   #273187;
}

.timeline-eventbar-hover {
  fill: #CCEEFF; 
}

.timeline-svg-event-actual {
}

.timeline-svg-event-no-highlight {
  stroke: black;
  border: black;
}

.timeline-svg-event-highlight {
  stroke: orange;
  stroke-width: 2px;
  border: orange;
}

.timeline-svg-id-text {
  fill: yellow;
  text-anchor: start;
  alignment-baseline: central;
  font-family:sans-serif;
  font-weight: regular;
}

.timeline-svg-testcircle {
  fill: yellow;
}

.timeline-patient-event-group {
}

.tooltip-nowrap {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display:block;
  width:95%;
  min-width:1px;
}
</style>StyleInfo
`
}


export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer("miniButtonStyle")).define("miniButtonStyle", ["html"], _miniButtonStyle);
  main.variable(observer()).define(["minMax"], _4);
  main.variable(observer("maxLogNegativeArea")).define("maxLogNegativeArea", ["minMax"], _maxLogNegativeArea);
  main.variable(observer("maxLogPositiveArea")).define("maxLogPositiveArea", ["minMax"], _maxLogPositiveArea);
  main.variable(observer("totalLogArea")).define("totalLogArea", ["maxLogNegativeArea","maxLogPositiveArea"], _totalLogArea);
  main.variable(observer("pixelsForLogNegativeArea")).define("pixelsForLogNegativeArea", ["rightSideWidth","maxLogNegativeArea","totalLogArea"], _pixelsForLogNegativeArea);
  main.variable(observer("logScaleFunction")).define("logScaleFunction", ["rightLogScale","pixelsForLogNegativeArea","leftLogScale"], _logScaleFunction);
  main.variable(observer("smartPixelScale")).define("smartPixelScale", ["use_logscale","logScaleFunction"], _smartPixelScale);
  main.variable(observer("rightSvgStraightScale")).define("rightSvgStraightScale", ["use_logscale","d3","minMax","pixelsForLogNegativeArea","getStretcherVal","rightSideWidth"], _rightSvgStraightScale);
  main.variable(observer("leftLogScale")).define("leftLogScale", ["d3","minMax","pixelsForLogNegativeArea"], _leftLogScale);
  main.variable(observer("rightLogScale")).define("rightLogScale", ["d3","minMax","pixelsForLogNegativeArea","rightSideWidth"], _rightLogScale);
  main.variable(observer("brushHorizontal")).define("brushHorizontal", ["d3","rightSideWidth","brushHeight","brushedHorizontal"], _brushHorizontal);
  main.variable(observer("viewof dynamicTrackHeight")).define("viewof dynamicTrackHeight", ["html"], _dynamicTrackHeight);
  main.variable(observer("dynamicTrackHeight")).define("dynamicTrackHeight", ["Generators", "viewof dynamicTrackHeight"], (G, _) => G.input(_));
  main.variable(observer()).define(["useMultipleTracks"], _16);
  main.variable(observer("viewof useMultipleTracks")).define("viewof useMultipleTracks", ["html"], _useMultipleTracks);
  main.variable(observer("useMultipleTracks")).define("useMultipleTracks", ["Generators", "viewof useMultipleTracks"], (G, _) => G.input(_));
  main.variable(observer()).define(["use_logscale"], _18);
  main.variable(observer("viewof use_logscale")).define("viewof use_logscale", ["html"], _use_logscale);
  main.variable(observer("use_logscale")).define("use_logscale", ["Generators", "viewof use_logscale"], (G, _) => G.input(_));
  main.define("initial rowSelectionChangedCounter", _rowSelectionChangedCounter);
  main.variable(observer("mutable rowSelectionChangedCounter")).define("mutable rowSelectionChangedCounter", ["Mutable", "initial rowSelectionChangedCounter"], (M, _) => new M(_));
  main.variable(observer("rowSelectionChangedCounter")).define("rowSelectionChangedCounter", ["mutable rowSelectionChangedCounter"], _ => _.generator);
  main.variable(observer("currentSelectionLinkedToCounter")).define("currentSelectionLinkedToCounter", ["d3"], _currentSelectionLinkedToCounter);
  main.variable(observer("onOncoscapeEventClicked")).define("onOncoscapeEventClicked", _onOncoscapeEventClicked);
  main.variable(observer("onOncoscapeRowSelectionChanged")).define("onOncoscapeRowSelectionChanged", _onOncoscapeRowSelectionChanged);
  main.variable(observer("onOncoscapeIdGroupClicked")).define("onOncoscapeIdGroupClicked", _onOncoscapeIdGroupClicked);
  main.variable(observer("onOncoscapeCreateCohortFromTimelineSelection")).define("onOncoscapeCreateCohortFromTimelineSelection", _onOncoscapeCreateCohortFromTimelineSelection);
  main.variable(observer("setupEventPlaceholders")).define("setupEventPlaceholders", ["onOncoscapeEventClicked","onOncoscapeRowSelectionChanged","onOncoscapeIdGroupClicked","onOncoscapeCreateCohortFromTimelineSelection"], _setupEventPlaceholders);
  main.variable(observer("viewof stretcher")).define("viewof stretcher", ["html"], _stretcher);
  main.variable(observer("stretcher")).define("stretcher", ["Generators", "viewof stretcher"], (G, _) => G.input(_));
  main.variable(observer("viewof sortTools")).define("viewof sortTools", ["eventTypes","eventTypeForDiagnosis","html","generateAlignOptions","eventTypeForDeath","d3","processSort","processAlignment","generateGroupingOptions","dlaGroupableFields","processGrouping"], _sortTools);
  main.variable(observer("sortTools")).define("sortTools", ["Generators", "viewof sortTools"], (G, _) => G.input(_));
  main.define("initial tooltip", _tooltip);
  main.variable(observer("mutable tooltip")).define("mutable tooltip", ["Mutable", "initial tooltip"], (M, _) => new M(_));
  main.variable(observer("tooltip")).define("tooltip", ["mutable tooltip"], _ => _.generator);
  main.variable(observer()).define(["transformData"], _31);
  main.variable(observer("svgTable")).define("svgTable", ["d3","html","miniBtnView","createLeftSVG","createRightSVG","createLowerRightSVG","createUpperRightSVG","createOuterSvgEventHandlers","stretcher","getData","barHeight","mousemoveEventSpaceBackground","mouseoverEventSpaceBackground","mouseoutEventSpaceBackground","clickIdGroup","smartPixelScale","numTracks","trackHeight","createEventElementGroups","addVerticalCrosshair","recalcVertScrollbarDiv","processSort","setupEventPlaceholders"], _svgTable);
  main.variable(observer("processSort")).define("processSort", ["d3","barHeight"], _processSort);
  main.variable(observer("arrayIdsToSelect")).define("arrayIdsToSelect", _arrayIdsToSelect);
  main.variable(observer("rowIdToSelect")).define("rowIdToSelect", _rowIdToSelect);
  main.define("initial currentEventMousedOver", _currentEventMousedOver);
  main.variable(observer("mutable currentEventMousedOver")).define("mutable currentEventMousedOver", ["Mutable", "initial currentEventMousedOver"], (M, _) => new M(_));
  main.variable(observer("currentEventMousedOver")).define("currentEventMousedOver", ["mutable currentEventMousedOver"], _ => _.generator);
  main.variable(observer("processAlignment")).define("processAlignment", ["d3","smartPixelScale","stretcher","barHeight","svgTable"], _processAlignment);
  main.variable(observer("miniBtnStyle")).define("miniBtnStyle", ["html"], _miniBtnStyle);
  main.variable(observer("miniBtnView")).define("miniBtnView", ["html","miniBtnCmds","d3","pbcopy","selectAllRows","updateRowSelectionChangedCounter","requestCreateCohortFromTimelineSelection"], _miniBtnView);
  main.variable(observer("miniBtnCmds")).define("miniBtnCmds", _miniBtnCmds);
  main.variable(observer("pbcopy")).define("pbcopy", _pbcopy);
  main.variable(observer("clickIdGroup")).define("clickIdGroup", ["selectAllRows","d3","findFirstSelectedIdAbove","selectRowById","updateRowSelectionChangedCounter"], _clickIdGroup);
  main.variable(observer("updateRowSelectionChangedCounter")).define("updateRowSelectionChangedCounter", ["mutable rowSelectionChangedCounter"], _updateRowSelectionChangedCounter);
  main.variable(observer("requestCreateCohortFromTimelineSelection")).define("requestCreateCohortFromTimelineSelection", _requestCreateCohortFromTimelineSelection);
  main.variable(observer("processExternalArrayIdsToSelect")).define("processExternalArrayIdsToSelect", ["arrayIdsToSelect","selectAllRows","selectRowById"], _processExternalArrayIdsToSelect);
  main.variable(observer("processExternalRowSelect")).define("processExternalRowSelect", ["rowIdToSelect","selectAllRows","selectRowById"], _processExternalRowSelect);
  main.variable(observer("selectRowById")).define("selectRowById", ["d3"], _selectRowById);
  main.variable(observer("findFirstSelectedIdAbove")).define("findFirstSelectedIdAbove", ["d3"], _findFirstSelectedIdAbove);
  main.variable(observer("selectAllRows")).define("selectAllRows", ["d3"], _selectAllRows);
  main.variable(observer("horizontalBrushScale")).define("horizontalBrushScale", ["d3","rightSideWidth","minMax"], _horizontalBrushScale);
  main.variable(observer("popupPatientData")).define("popupPatientData", _popupPatientData);
  main.variable(observer("brushedHorizontal")).define("brushedHorizontal", ["horizontalBrushScale","getStretcherVal","d3"], _brushedHorizontal);
  main.variable(observer()).define(["tlConfig"], _53);
  main.variable(observer("getEventStyle")).define("getEventStyle", ["tlConfig"], _getEventStyle);
  main.define("initial lastGroupedByField", _lastGroupedByField);
  main.variable(observer("mutable lastGroupedByField")).define("mutable lastGroupedByField", ["Mutable", "initial lastGroupedByField"], (M, _) => new M(_));
  main.variable(observer("lastGroupedByField")).define("lastGroupedByField", ["mutable lastGroupedByField"], _ => _.generator);
  main.variable(observer("processGrouping")).define("processGrouping", ["d3","mutable lastGroupedByField","dataLoadedAction","rawPatientsFromJson","updateGroupingRects","processSort"], _processGrouping);
  main.variable(observer("updateGroupingRects")).define("updateGroupingRects", ["d3","mutable lastGroupedByField","dataLoadedAction","cellGroupingColorList"], _updateGroupingRects);
  main.variable(observer("eventTypeForDeath")).define("eventTypeForDeath", ["eventTypes"], _eventTypeForDeath);
  main.variable(observer()).define(["eventTypes"], _59);
  main.variable(observer("popupEventData")).define("popupEventData", ["getData"], _popupEventData);
  main.variable(observer("setupEventContextMenu")).define("setupEventContextMenu", ["popupEventData"], _setupEventContextMenu);
  main.variable(observer("eventTypeForDiagnosis")).define("eventTypeForDiagnosis", ["eventTypes"], _eventTypeForDiagnosis);
  main.variable(observer("getStretcherVal")).define("getStretcherVal", ["stretcher"], _getStretcherVal);
  main.variable(observer("tlConfig")).define("tlConfig", ["computeTlConfig"], _tlConfig);
  main.variable(observer("computeTlConfig")).define("computeTlConfig", ["rawTlConfig","useMultipleTracks"], _computeTlConfig);
  main.variable(observer("createUpperRightSVG")).define("createUpperRightSVG", ["rightSideWidth","rightSvgStraightScale","d3","use_logscale","getStretcherVal"], _createUpperRightSVG);
  main.variable(observer("rightSideWidth")).define("rightSideWidth", _rightSideWidth);
  main.variable(observer("viewof vb3")).define("viewof vb3", ["slider","maxHeight"], _vb3);
  main.variable(observer("vb3")).define("vb3", ["Generators", "viewof vb3"], (G, _) => G.input(_));
  main.variable(observer("mouseoverEventSpaceBackground")).define("mouseoverEventSpaceBackground", ["d3"], _mouseoverEventSpaceBackground);
  main.variable(observer("mouseoutEventSpaceBackground")).define("mouseoutEventSpaceBackground", ["d3"], _mouseoutEventSpaceBackground);
  main.variable(observer("stretcherCurrentVal")).define("stretcherCurrentVal", ["stretcher"], _stretcherCurrentVal);
  main.variable(observer("eventTypes")).define("eventTypes", ["dataLoadedAction"], _eventTypes);
  main.variable(observer()).define(["dataLoadedAction"], _73);
  main.variable(observer("brushedVertical")).define("brushedVertical", ["availableVertBrushHeight","d3"], _brushedVertical);
  main.variable(observer("recalcVertScrollbarDiv")).define("recalcVertScrollbarDiv", ["barHeight"], _recalcVertScrollbarDiv);
  main.variable(observer("fontSize")).define("fontSize", ["barHeight"], _fontSize);
  main.variable(observer("mousemoveEventSpaceBackground")).define("mousemoveEventSpaceBackground", ["d3"], _mousemoveEventSpaceBackground);
  main.variable(observer("brushHeight")).define("brushHeight", _brushHeight);
  main.variable(observer("brushVertical")).define("brushVertical", ["d3","brushHeight","availableVertBrushHeight","brushedVertical"], _brushVertical);
  main.variable(observer("availableVertBrushHeight")).define("availableVertBrushHeight", _availableVertBrushHeight);
  main.variable(observer("transformData")).define("transformData", ["transformData1"], _transformData);
  main.variable(observer("verticalLine")).define("verticalLine", _verticalLine);
  main.variable(observer("createLowerRightSVG")).define("createLowerRightSVG", ["rightSideWidth","brushHeight","minMax","brushHorizontal"], _createLowerRightSVG);
  main.variable(observer("createRightBrushGroupSVG")).define("createRightBrushGroupSVG", ["brushHeight","availableVertBrushHeight","vertPercentVisibleRows","brushVertical"], _createRightBrushGroupSVG);
  main.variable(observer("vertPercentVisibleRows")).define("vertPercentVisibleRows", _vertPercentVisibleRows);
  main.variable(observer()).define(["html"], _86);
  main.variable(observer("addVerticalCrosshair")).define("addVerticalCrosshair", ["verticalLine","d3"], _addVerticalCrosshair);
  main.variable(observer("createOuterSvgEventHandlers")).define("createOuterSvgEventHandlers", ["barHeight","d3"], _createOuterSvgEventHandlers);
  main.variable(observer()).define(["tlConfig"], _89);
  main.variable(observer()).define(["getData"], _90);
  main.variable(observer("theAttrs")).define("theAttrs", ["tlConfig"], _theAttrs);
  main.variable(observer("createEventElementGroups")).define("createEventElementGroups", ["tlConfig","trackHeight","minMax","stretcher","smartPixelScale","d3","hideSvgEventTooltip","mutable currentEventMousedOver","showSvgEventTooltip","setupEventContextMenu"], _createEventElementGroups);
  main.variable(observer("clickEventSpaceBackground")).define("clickEventSpaceBackground", _clickEventSpaceBackground);
  main.variable(observer("createRightSVG")).define("createRightSVG", ["rightSideWidth","maxHeight","clickEventSpaceBackground","vb3"], _createRightSVG);
  main.variable(observer("cellGroupingColorList")).define("cellGroupingColorList", _cellGroupingColorList);
  main.variable(observer("cellAttrColorList")).define("cellAttrColorList", _cellAttrColorList);
  main.variable(observer("createLeftSVG")).define("createLeftSVG", ["vb3","getData","barHeight","d3","clickIdGroup","fontSize","tlConfig","dataLoadedAction","cellAttrColorList","rawPatientsFromJson"], _createLeftSVG);
  main.variable(observer("tool_tip")).define("tool_tip", ["d3Tip"], _tool_tip);
  main.variable(observer("margin")).define("margin", _margin);
  main.variable(observer("showSvgEventTooltip")).define("showSvgEventTooltip", ["tool_tip","mutable tooltip"], _showSvgEventTooltip);
  main.variable(observer("hideSvgEventTooltip")).define("hideSvgEventTooltip", ["mutable tooltip","tool_tip"], _hideSvgEventTooltip);
  main.variable(observer("generateAlignOptions")).define("generateAlignOptions", _generateAlignOptions);
  main.variable(observer("generateGroupingOptions")).define("generateGroupingOptions", _generateGroupingOptions);
  main.variable(observer("getData")).define("getData", ["transformData"], _getData);
  main.variable(observer()).define(["transformData1"], _105);
  main.variable(observer("transformData1")).define("transformData1", ["loadedRawData","getEventStyle"], _transformData1);
  main.variable(observer()).define(["html"], _107);
  main.variable(observer("d3Tip")).define("d3Tip", ["require"], _d3Tip);
  main.variable(observer("l")).define("l", ["loadedRawData"], _l);
  main.variable(observer("minMax")).define("minMax", ["loadedRawData"], _minMax);
  main.variable(observer("testSliceSizeForLoadedRawData")).define("testSliceSizeForLoadedRawData", _testSliceSizeForLoadedRawData);
  main.variable(observer("numShmoopLoops")).define("numShmoopLoops", _numShmoopLoops);
  main.variable(observer("shmoop2")).define("shmoop2", ["rawDataFromJson","numShmoopLoops"], _shmoop2);
  main.variable(observer("shmoopPids")).define("shmoopPids", ["rawDataFromJson","numShmoopLoops"], _shmoopPids);
  main.variable(observer()).define(["rawDataFromJson"], _115);
  main.variable(observer("loadedRawData")).define("loadedRawData", ["rawPatientsFromJson","rawDataFromJson","shmoop2","shmoopPids","testSliceSizeForLoadedRawData"], _loadedRawData);
  main.variable(observer("rawDataFromJson")).define("rawDataFromJson", ["tinyEventData"], _rawDataFromJson);
  main.variable(observer("loadedRawDataOriginalFromBrain")).define("loadedRawDataOriginalFromBrain", _loadedRawDataOriginalFromBrain);
  main.variable(observer("rawTlConfig")).define("rawTlConfig", _rawTlConfig);
  main.variable(observer("dlaGroupableFields")).define("dlaGroupableFields", ["dataLoadedAction"], _dlaGroupableFields);
  main.variable(observer()).define(["dataLoadedAction"], _121);
  main.variable(observer("dataLoadedAction")).define("dataLoadedAction", _dataLoadedAction);
  main.variable(observer("rawPatientsFromJson")).define("rawPatientsFromJson", ["reallyRawPatientsFromJson"], _rawPatientsFromJson);
  main.variable(observer("old__reallyRawPatientsFromJson")).define("old__reallyRawPatientsFromJson", _old__reallyRawPatientsFromJson);
  main.variable(observer("reallyRawPatientsFromJson")).define("reallyRawPatientsFromJson", ["reallyRawPatient1","reallyRawPatient2"], _reallyRawPatientsFromJson);
  main.variable(observer("reallyRawPatient1")).define("reallyRawPatient1", _reallyRawPatient1);
  main.variable(observer("reallyRawPatient2")).define("reallyRawPatient2", _reallyRawPatient2);
  main.variable(observer("tinyEventData")).define("tinyEventData", _tinyEventData);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer("leftPanelOffset")).define("leftPanelOffset", _leftPanelOffset);
  main.variable(observer("barHeight")).define("barHeight", ["numTracks","trackHeight"], _barHeight);
  main.variable(observer("numTracks")).define("numTracks", ["tlConfig"], _numTracks);
  main.variable(observer("trackHeight")).define("trackHeight", ["dynamicTrackHeight"], _trackHeight);
  main.variable(observer("maxHeight")).define("maxHeight", _maxHeight);
  const child1 = runtime.module(define1);
  main.import("slider", child1);
  main.variable(observer("timelineModal")).define("timelineModal", _timelineModal);
  main.variable(observer()).define(["html"], _137);
  main.variable(observer()).define(["html"], _138);
  main.variable(observer("$")).define("$", ["require"], _$);
  main.variable(observer("Popper")).define("Popper", ["require"], _Popper);
  main.variable(observer("font")).define("font", ["html"], _font);
  return main;
}

my_widget_script={damGenerationNums:[],damGenerations:{},sireGenerationNums:[],sireGenerations:{},damNums:[],
dams:{},sireNums:[],sires:{},mode:"edit",init:function(mode,json_data){
this.include("https://code.jquery.com/jquery-3.5.1.min.js","sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=","anonymous",()=>{
$(document).ready(()=>{
this.include("https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js","sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl","anonymous",()=>{
$(document).ready(()=>{
this.include("https://cdn.jsdelivr.net/npm/luxon@1.26.0/build/global/luxon.min.js","sha256-4sbTzmCCW9LGrIh5OsN8V5Pfdad1F1MwhLAOyXKnsE0=","anonymous",()=>{
$(document).ready(()=>{
this.include("https://cdnjs.cloudflare.com/ajax/libs/bootbox.js/5.5.2/bootbox.min.js","sha512-RdSPYh1WA6BF0RhpisYJVYkOyTzK4HwofJ3Q7ivt/jkpW6Vc8AurL1R+4AUcvn9IwEKAPm/fk7qFZW3OuiUDeg==","anonymous",()=>{
$(document).ready(()=>{
this.include("https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.15.0/js/selectize.js","sha512-1HjnkKhHSDunRgIHRK4gXORl/T0WxhVkiQ5gjwvrH4yQK9RqPqYnPPwJfh+6gYTc/U9Cg8n4MGRZV1CzsP0UIA==","anonymous",()=>{
this.include("https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js","sha512-SGWgwwRA8xZgEoKiex3UubkSkV1zSE1BS6O4pXcaxcNtUlQsOmOmhVnDwIvqGRfEmuz83tIGL13cXMZn6upPyg==","anonymous",()=>{
$jq351=jQuery.noConflict(true),this.myInit(mode,json_data)})})})})})})})})})})},
include:function(src,integrity,crossorigin,onload){
var head=document.getElementsByTagName("head")[0],script=document.createElement("script")
;script.setAttribute("integrity",integrity),script.setAttribute("crossorigin",crossorigin),script.src=src,
script.type="text/javascript",script.onload=script.onreadystatechange=function(){if(script.readyState){
if("complete"===script.readyState||"loaded"===script.readyState)script.onreadystatechange=null,onload()
}else onload()},head.appendChild(script)},myInit:function(mode,json_data){this.mode=mode
;var parsedJson=this.parseInitJson(json_data);this.initDynamicContent(parsedJson),
window.onresize=(()=>this.resize()),
this.addEventListeners(),this.parent_class.init(mode,()=>JSON.stringify(parsedJson.widgetData)),
this.addRequiredFieldIndicators(),this.setUpInitialState(),this.adjustForMode(mode),this.checkForNames()},
to_json:function(){
var widgetJsonString=this.parent_class.to_json(),dynamicContent=this.getDynamicContent(),output={
widgetData:JSON.parse(widgetJsonString),damGenerationNums:this.damGenerationNums,
damGenerations:this.damGenerations,sireGenerationNums:this.sireGenerationNums,
sireGenerations:this.sireGenerations,damNums:this.damNums,dams:this.dams,sireNums:this.sireNums,
sires:this.sires};return JSON.stringify(output)},from_json:function(json_data){
var parsedJson=JSON.parse(json_data);this.parent_class.from_json(JSON.stringify(parsedJson.widgetData))},
test_data:function(){var testData=JSON.parse(this.parent_class.test_data()),output={widgetData:testData}
;return JSON.stringify(output)},is_valid:function(b_suppress_message){var fail=false,fail_log="",name
;if($("#the_form").find("select, textarea, input").each((i,e)=>{
if(!$(e).prop("required"));else if(!$(e).val())fail=true,name=$(e).attr("id"),fail_log+=name+" is required \n"
}),$("input[type='date']").each((i,e)=>{var date=$(e).val();if(date){var validDate=this.isValidDate(date)
;if(!validDate)fail=true,fail_log+="Please enter valid date in form 'YYYY-MM-DD'"}}),
$("input[type='time']").each((i,e)=>{var time=$(e).val();if(time){var validtime=this.isValidTime(time)
;if(!validtime)fail=true,fail_log+="Please enter valid time in form 'hh:mm' - 24 hr time"}}),
fail)return bootbox.alert(fail_log);else{var noErrors=[];return noErrors}},is_edited:function(){
return this.parent_class.is_edited()},reset_edited:function(){return this.parent_class.reset_edited()},
parseInitJson:function(json_data){var jsonString
;if("string"===typeof json_data)jsonString=json_data;else jsonString=json_data()
;var parsedJson=JSON.parse(jsonString);return parsedJson},initDynamicContent:function(parsedJson){
if(parsedJson.damGenerations)this.damGenerations=parsedJson.damGenerations;if(parsedJson.damGenerationNums){
for(genNum of parsedJson.damGenerationNums)this.makeDamGenCard(genNum)
;this.damGenerationNums=parsedJson.damGenerationNums}
if(parsedJson.sireGenerations)this.sireGenerations=parsedJson.sireGenerations
;if(parsedJson.sireGenerationNums){for(genNum of parsedJson.sireGenerationNums)this.makeSireGenCard(genNum)
;this.sireGenerationNums=parsedJson.sireGenerationNums}if(parsedJson.sires)this.sires=parsedJson.sires
;if(parsedJson.sireNums){for(sireNum of parsedJson.sireNums)this.makeSireCard(sireNum)
;this.sireNums=parsedJson.sireNums}if(parsedJson.dams)this.dams=parsedJson.dams;if(parsedJson.damNums){
for(damNum of parsedJson.damNums){this.makeDamCard(damNum);var breedingNums=this.dams[damNum].breedingNums
;if(breedingNums)for(breedingNum of breedingNums){this.makeDamBreeding(damNum,breedingNum)
;var plugCheckNums=this.dams[damNum].breedings[breedingNum].plugCheckNums
;if(plugCheckNums)for(plugCheckNum of plugCheckNums)this.makePlugEntry(damNum,breedingNum,plugCheckNum)
;var massNums=this.dams[damNum].breedings[breedingNum].massNums
;if(massNums)for(massNum of massNums)this.makeMassEntry(damNum,breedingNum,massNum)}}
this.damNums=parsedJson.damNums}},adjustForMode:function(mode){
if("edit"!==mode&&"edit_dev"!==mode)$(".disableOnView").prop("disabled",true),
$("input[type='date']").not(".editOnView").removeClass(".hasDatePicker"),
$(".editOnView").prop("readonly","").prop("disabled",""),$(".editOnView").find("option").prop("disabled",""),
$(".hideView").hide(),$("#dueDate").datepicker({dateFormat:"yy-mm-dd"}),$("#careDate").datepicker({
dateFormat:"yy-mm-dd"});else $("input[type='date']").each((i,e)=>{this.checkDateFormat($(e))}),
$("input[type='time']").each((i,e)=>{this.checkTimeFormat($(e))})},addEventListeners:function(){},
addRequiredFieldIndicators:function(){$(".needForTableLab").each((i,e)=>{
$(e).html("<span class='hideView' style='color:blue'>#</span>"+$(e).html())}),$(".requiredLab").each((i,e)=>{
$(e).html("<span class='hideView' style='color:red'>*</span>"+$(e).html())})},
isValidTime:function(timeString){var regEx="^(((([0-1][0-9])|(2[0-3])):[0-5][0-9]))$"
;if(!timeString.match(regEx))return false;else return true},isTimeSupported:function(){
var input=document.createElement("input");input.setAttribute("type","time");var supported=true
;if("time"!==input.type)supported=false;return this.timeSupported=supported,input.remove(),supported},
timeSupported:true,checkTimeFormat:function($timeInput){if(!this.timeSupported){
$timeInput.next(".timeWarning").remove();var time=$timeInput.val(),isValid=this.isValidTime(time)
;if(!isValid)$timeInput.after('<div class="text-danger timeWarning">Enter time as "hh:mm" in 24-hr format</div>')
;this.resize()}},isValidDate:function(dateString){var regEx=/^\d{4}-\d{2}-\d{2}$/
;if(!dateString.match(regEx))return false;var d=new Date(dateString),dNum=d.getTime()
;if(!dNum&&0!==dNum)return false;return d.toISOString().slice(0,10)===dateString},isDateSupported:function(){
var input=document.createElement("input");input.setAttribute("type","date");var supported=true
;if("date"!==input.type)supported=false;return this.dateSupported=supported,input.remove(),supported},
dateSupported:true,checkDateFormat:function($dateInput){if(!this.dateSupported){
$dateInput.next(".dateWarning").remove();var date=$dateInput.val(),isValid=this.isValidDate(date)
;if(!isValid)$dateInput.after('<div class="text-danger dateWarning">Enter date as "YYYY-MM-DD"</div>')
;$dateInput.datepicker({dateFormat:"yy-mm-dd"}),this.resize()}},setUpInitialState:function(){
$(".myLeftCol").addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right"),this.isDateSupported(),
this.isTimeSupported(),$("input[type='date']").prop("placeholder","YYYY-MM-DD").on("change",e=>{
this.checkDateFormat($(e.currentTarget))
}),$("input[type='time']").prop("placeholder","hh:mm").on("change",e=>{this.checkTimeFormat($(e.target))}),
$("textarea.autoAdjust").each((i,e)=>{e.setAttribute("style","height:"+e.scrollHeight+"px;overflow-y:hidden;")
}).on("input",e=>{e.target.style.height="auto",e.target.style.height=e.target.scrollHeight+"px",this.resize()
}),$(".toggleTable").on("click",e=>{
var tableID=$(e.currentTarget).data("table"),$table=$("."+tableID).find("table"),$errorMsg=$("#errorMsg")
;this.toggleTableFuncs($table,$errorMsg)}),$(".toCSV").on("click",e=>{
var tableID=$(e.currentTarget).data("table"),dateToday=luxon.DateTime.now().toISODate(),fileName="table_"+tableID+"_"+dateToday,$errorMsg=$("#errorMsg")
;this.toCSVFuncs(fileName,tableID,$errorMsg)}),$(".copyData").on("click",e=>{
var tableID=$(e.currentTarget).data("table"),tableSearch=this.tableSearch(tableID),$copyHead=$(".copyHead"+tableSearch),$transpose=$(".transpose"+tableSearch),$tableToCopy=$("."+tableID).find("table"),$tableDiv=$tableToCopy.parent(),$errorMsg=$("#errorMsg"),$divForCopy=$("#forCopy")
;this.copyDataFuncs($copyHead,$tableToCopy,$tableDiv,$errorMsg,$divForCopy,$transpose)}),
$(".addDam").on("click",e=>{var damNum=this.getNextNum(this.damNums);this.addDam(damNum)}),
$(".addSire").on("click",e=>{var sireNum=this.getNextNum(this.sireNum);this.addSire(sireNum)}),
$(".addDamGen").on("click",e=>{var genNum=this.getNextNum(this.damGenerationNums)
;this.addDamGeneration(genNum)}),$(".addSireGen").on("click",e=>{
var genNum=this.getNextNum(this.sireGenerationNums);this.addSireGeneration(genNum)}),
$("#collapseDams").on("click",e=>{this.collapseAllDamCards()}),$("#the_form").on("input",e=>{
if($(e.target).data("watch"))this.watchValue($(e.target));else this.updateCalcFromEl(e.target)
}).on("change",e=>{this.getDamsDue($("#dueDate").val())}),$("input, select, textarea").each((i,e)=>{
if("button"!=$(e).attr("type"))if($(e).data("watch"))this.watchValue($(e));else this.updateCalcFromEl(e)})
;var dateToday=luxon.DateTime.now().toISODate();$("#dueDate").val(dateToday).each((i,e)=>{
this.getDamsDue($(e).val())}),$(".htmlCardHeader").on("click",e=>{this.toggleCard($(e.currentTarget))}),
$("#convertToTable").on("click",e=>{
var tableText=$("#pasteField").val(),makeFirstColHead=false,makeFirstRowHead=false
;if($("#makeColHead").is(":checked"))makeFirstColHead=true
;if($("#makeRowHead").is(":checked"))makeFirstRowHead=true;var $divForTable=$(".forTable")
;this.rebuildTableFromStr(tableText,makeFirstRowHead,makeFirstColHead,$divForTable)}),
$("#upload").on("click",e=>{this.upload()}),$("#preview").on("click",e=>{this.preview()}),
$(".initialMass").each((i,e)=>{var damNum=$(e).data("dam"),breedNum=$(e).data("breed")
;this.calcMassChange(damNum,breedNum)}),this.resize()},updateTextarea:function(textarea){
if(!$(textarea).is(":hidden"))textarea.setAttribute("style","height:"+textarea.scrollHeight+"px;overflow-y:hidden;")
;this.resize()},getCheckState:function($el){var checkState=false;if($el.is(":checked"))checkState=true
;return checkState},resize:function(){this.parent_class.resize_container()},checkForNames:function(){
$("input, select, textarea").each((i,e)=>{var thisName=$(e).attr("name")
;if(!thisName)console.log("There is no name attribute for: ",e.id);else{var hasUpper=/[A-Z]/.test(thisName)
;if(hasUpper)console.log("The name contains an uppercase letter for: ",e.id)}})},getDynamicContent:function(){
var dynamicContent={};return dynamicContent},data_valid_form:function($errorMsg){
var valid=true,fail_log=$("<div></div>").append("Missing values for:"),name
;if($(".needForTable").each((i,e)=>{if(!$(e).val())valid=false,name=$(e).attr("id"),
fail_log.append("<br/>"+name)
}),!valid)$errorMsg.html("<span style='color:red; font-size:36px;'>"+"Please fill out all elements marked by a"+"</span><span style='color:blue; font-size:36px;'>"+" blue #"+"</span>"),
$errorMsg.append(fail_log);else $errorMsg.html("");return this.resize(),valid},
runIfConfirmed:function(text,functionToCall,elForHeight=null){var thisMessage="Are you sure?"
;if(text)thisMessage=text;var top="auto";if(elForHeight)top=elForHeight.offsetTop+"px";bootbox.confirm({
message:thisMessage,callback:proceed=>{if(proceed)functionToCall()}}),$(".modal-dialog").css("top",top)},
dialogConfirm:function(text,functionToCall,elForHeight=null){var thisMessage="Do you want to proceed?"
;if(text)thisMessage=text;var top="auto";if(elForHeight)top=elForHeight.offsetTop+"px";bootbox.confirm({
message:thisMessage,callback:result=>{functionToCall(result)}}),$(".modal-dialog").css("top",top)},
runBasedOnInput:function(prompt,functionToCall,elForHeight=null){var thisTitle="Enter value:"
;if(prompt)thisTitle=prompt;var top="auto";if(elForHeight)top=elForHeight.offsetTop+"px";bootbox.prompt({
title:thisTitle,callback:result=>{functionToCall(result)}}),$(".modal-dialog").css("top",top)},
checkInArray:function(searchVal,array){var proceed=-1!==$.inArray(searchVal,array);return proceed},
dataSearch:function(dataName,dataValue){var dataSearch="[data-"+dataName+"='"+dataValue+"']";return dataSearch
},tableSearch:function(table){var str=this.dataSearch("table",table);return str},calcSearch:function(calc){
var str=this.dataSearch("calc",calc);return str},daySearch:function(day){var str=this.dataSearch("day",day)
;return str},mouseSearch:function(mouse){var str=this.dataSearch("mouse",mouse);return str},
damSearch:function(dam){var str=this.dataSearch("dam",dam);return str},sireSearch:function(sire){
var str=this.dataSearch("sire",sire);return str},damGenSearch:function(damGen){
var str=this.dataSearch("damgen",damGen);return str},sireGenSearch:function(sireGen){
var str=this.dataSearch("siregen",sireGen);return str},breedingSearch:function(breedingNum){
var str=this.dataSearch("breed",breedingNum);return str},plugSearch:function(plugNum){
var str=this.dataSearch("plug",plugNum);return str},massSearch:function(massNum){
var str=this.dataSearch("mass",massNum);return str},updateCalcFromEl:function(el){
var calc=el.id,val=el.value,calcSearch=this.calcSearch(calc);$(calcSearch).html(val),this.resize()},
updateCalcFromVal:function(calc,val){var calcSearch=this.calcSearch(calc);$(calcSearch).text(val),
this.resize()},watchValue:function($el){
var watch=$el.data("watch"),calcSearch=this.calcSearch(watch),damNum=$el.data("dam"),damGenNum=$el.data("damgen"),sireNum=$el.data("sire"),sireGenNum=$el.data("siregen"),val=$el.val()
;if(damNum)calcSearch+=this.damSearch(damNum);if(damGenNum)calcSearch+=this.damGenSearch(damGenNum)
;if(sireNum)calcSearch+=this.sireSearch(sireNum);if(sireGenNum)calcSearch+=this.sireGenSearch(sireGenNum)
;if("damID"==watch)if(!val)val="Dam "+damNum;$(calcSearch).text(val),this.resize()},
toggleTableFuncs:function($table,$errorMsg){this.data_valid_form($errorMsg),$table.toggle(),this.resize()},
toCSVFuncs:function(fileName,tableID,$errorMsg){var data_valid=this.data_valid_form($errorMsg)
;if(data_valid)this.exportTableToCSV(fileName,tableID),
$errorMsg.html("<span style='color:grey; font-size:24px;'>Saved successfully</span>");else $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Did not export</span>")
},downloadCSV:function(csv,filename){var csvFile,dLink;csvFile=new Blob([csv],{type:"text/csv"}),
dLink=document.createElement("a"),dLink.download=filename,dLink.href=window.URL.createObjectURL(csvFile),
dLink.style.display="none",document.body.appendChild(dLink),dLink.click()},
exportTableToCSV:function(filename,table){
var tableArray=this.getTableArray($("."+table).find("table"),copyHead=true,transpose=false),tableString=this.convertRowArrayToString(tableArray,",","\n")
;this.downloadCSV(tableString,filename)},
copyDataFuncs:function($copyHead,$tableToCopy,$tableDiv,$errorMsg,$divForCopy,$transpose){
var data_valid=this.data_valid_form($errorMsg),copyHead=false,transpose=false
;if($copyHead.is(":checked"))copyHead=true;if($transpose.is(":checked"))transpose=true
;if(data_valid)$tableDiv.show(),
this.resize(),this.copyTable($tableToCopy,copyHead,$divForCopy,$errorMsg,transpose),
$errorMsg.html("<span style='color:grey; font-size:24px;'>Copied successfully</span>");else $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>")
},copyTable:function($table,copyHead,$divForCopy,$errorMsg,transpose){
var tableArray=this.getTableArray($table,copyHead,transpose),tableString=this.convertRowArrayToString(tableArray,"\t","\n")
;this.copyStringToClipboard(tableString,$divForCopy,$errorMsg)},
getTableArray:function($table,copyHead,transpose){var rows=[],rowNum=0
;if(copyHead)$table.find("thead").children("tr").each((i,e)=>{if(transpose)rowNum=0
;if($(e).find("td, th").each((i,e)=>{if(void 0===rows[rowNum])rows[rowNum]=[]
;if(rows[rowNum].push($(e).text()),transpose)rowNum++}),!transpose)rowNum++})
;return $table.find("tbody").children("tr").each((i,e)=>{if(transpose)rowNum=0
;if($(e).find("td, th").each((i,e)=>{if(void 0===rows[rowNum])rows[rowNum]=[]
;if(rows[rowNum].push($(e).text()),transpose)rowNum++}),!transpose)rowNum++}),rows},
convertRowArrayToString:function(rowArray,cellSepString="\t",newRowString="\n"){var rowString=[]
;rowArray.forEach(row=>{if(row.length)row.forEach((cell,i)=>{
if(cell.includes(cellSepString)||cell.includes(newRowString))row[i]='"'+cell+'"'}),
rowString.push(row.join(cellSepString))});var tableString=rowString.join(newRowString);return tableString},
copyStringToClipboard:function(textStr,$divForCopy,$errorMsg){
var $temp=$("<text"+"area style='opacity:0;'></text"+"area>");if(textStr)errorStr="Copy attempted",
$errorMsg.html("<span style='color:grey; font-size:24px;'>Copy attempted</span>");else textStr=" ",
$errorMsg.html("<span style='color:red; font-size:24px;'>Nothing to copy</span>");$temp.text(textStr),
$temp.appendTo($divForCopy).select(),document.execCommand("copy"),$temp.remove(),this.resize()},
toggleCard:function($cardHead){
$cardHead.next().toggleClass("collapse"),$cardHead.next().find("textarea.autoAdjust").each((i,e)=>{
if(!$(e).is(":hidden"))e.setAttribute("style","height:"+e.scrollHeight+"px;overflow-y:hidden;")}),
this.resize()},collapseAllDamCards:function(){$(".damCard").find(".card-header").each((i,e)=>{
$(e).next().addClass("collapse")}),this.resize()},makeCard:function($div,cardHeadContent,cardBodyContent){
$div.append($("<div></div>",{class:"card"}).append($("<button></button>",{type:"button",class:"card-header"
}).on("click",e=>{this.toggleCard($(e.currentTarget))}).append(cardHeadContent)).append($("<div></div>",{
class:"card-body collapse"}).append(cardBodyContent))),this.resize()},addDam:function(damNum){
var inArray=this.checkInArray(damNum,this.damNums);if(!inArray)this.damNums.push(damNum),this.dams[damNum]={
damID:"",damGeneration:"",breedingNums:[],breedings:{}},this.makeDamCard(damNum)},
makeDamCard:function(damNum){var $div=$("#damCardDiv");if(!$div.find(".card").length)$div.html("")
;var row="row mt-2",col="col-12 col-lg-6";$div.append($("<div/>",{class:"col-12 col-lg-6 mt-2 damCard",
"data-dam":damNum}));var $damDiv=$(".damCard"+this.damSearch(damNum)),header=$("<div></div>",{
class:"damIDCalc","data-calc":"damID","data-dam":damNum
}).append("Dam "+damNum),$body=this.makeDamCardBody(damNum);this.makeCard($damDiv,header,$body),
this.makeDamGenList(damNum),$("#damSelect").append($("<option></option>",{value:damNum,class:"damIDCalc",
"data-calc":"damID","data-dam":damNum}).append("Dam "+damNum)).attr("size",Math.min(this.damNums.length,15))},
makeDamCardBody:function(damNum){var $body=$("<div></div>"),initialRows=[{label:"<h4>Dam ID:</h4>",
type:"text",className:"damID",addRowClass:"updateDamObj"},{label:"Delete:",type:"button",
className:"deleteDam",addRowClass:"hideView"},{label:"Generation:",type:"select",className:"damGeneration",
addRowClass:"updateDamObj",optionsObj:[{value:"",text:"[Select]"}]},{label:"Add breeding:",type:"button",
className:"addBreeding",addRowClass:"hideView"}]
;for(row of initialRows)$body.append(this.makeRowFromObj(row,damNum,"dam"))
;return $body.find(".deleteDam").prop("value","Delete Dam").on("click",e=>{this.deleteDam(damNum)}),
$body.find(".addBreeding").prop("value","Add Breeding").on("click",e=>{this.addDamBreeding(damNum)}),
$body.find(".updateDamObj").on("change",e=>{var $el=$(e.target);this.updateObjFromVal($el,this.dams[damNum])
}),$body},updateObjFromVal:function($el,obj){var val=$el.val();valSafe=this.encodeHTML(val)
;var thisProp=$el.data("watch");if(thisProp)obj[thisProp]=valSafe},addSire:function(sireNum){
var inArray=this.checkInArray(sireNum,this.sireNums);if(!inArray)this.sireNums.push(sireNum),
this.sires[sireNum]={sireID:"",sireGeneration:""},this.makeSireCard(sireNum)},makeSireCard:function(sireNum){
var $div=$("#sireCardDiv");if(!$div.find(".card").length)$div.html("")
;var row="row mt-2",col="col-12 col-lg-6";$div.append($("<div/>",{class:"col col-md-6 mt-2 sireCard",
"data-sire":sireNum}));var $sireDiv=$(".sireCard"+this.sireSearch(sireNum)),header=$("<div></div>",{
class:"sireIDCalc","data-calc":"sireID","data-sire":sireNum
}).append("Sire "+sireNum),$body=this.makeSireCardBody(sireNum);this.makeCard($sireDiv,header,$body),
this.makeSireGenList(sireNum),$("#sireSelect").append($("<option></option>",{value:sireNum,class:"sireIDCalc",
"data-calc":"sireID","data-sire":sireNum
}).append("Sire "+sireNum)).attr("size",Math.min(this.sireNums.length,15)),this.updateSireList(sireNum)},
makeSireList:function(damNum,breedingNum){
var sires=this.sires,sireNums=this.sireNums,damSearch=this.damSearch(damNum),breedingSearch=this.breedingSearch(breedingNum),damBreedingSearch=damSearch+breedingSearch
;for(sireNum of sireNums){var sire=sires[sireNum],sireInfo="",sireID=sire.sireID
;if(!sireID)sireID="Sire "+sireNum;$("select.sireBreeding"+damBreedingSearch).append($("<option></option>",{
value:sireNum,"data-sire":sireNum}).append(sireID))}},updateSireList:function(sireNum){
var sires=this.sires,sire=sires[sireNum],sireInfo="",sireID=sire.sireID;if(!sireID)sireID="Sire "+sireNum
;var $option=$("select.sireBreeding").find("option[value='"+sireNum+"']")
;if(0==$option.length)$("select.sireBreeding").append($("<option></option>",{value:sireNum,"data-sire":sireNum
}).append(sireID));else $option.text(sireID)},makeSireCardBody:function(sireNum){
var $body=$("<div></div>"),initialRows=[{label:"<h4>Sire ID:</h4>",type:"text",className:"sireID",
addRowClass:" updateSireObj"},{label:"Delete:",type:"button",className:"deleteSire",optionsObj:[],
addRowClass:" hideView"},{label:"Generation:",type:"select",className:"sireGeneration",
addRowClass:" updateSireObj",optionsObj:[{value:"",text:"[Select]"}]}]
;for(row of initialRows)$body.append(this.makeRowFromObj(row,sireNum,"sire"))
;return $body.find(".deleteSire").prop("value","Delete Sire").on("click",e=>{this.deleteSire(sireNum)}),
$body.find(".updateSireObj").on("change",e=>{var $el=$(e.target)
;this.updateObjFromVal($el,this.sires[sireNum]),this.updateSireList(sireNum)}),$body},
encodeHTML:function(dirtyString){
var container=document.createElement("div"),text=document.createTextNode(dirtyString)
;return container.appendChild(text),container.innerHTML},makeRow:function(label,$input,addRowClass=""){
var myLeftCol="col-12 col-lg-6";if(addRowClass)addRowClass=" "+addRowClass;var $label=$("<label></label>",{
for:$input.attr("id")}).append(label),$row=$("<div></div>",{class:"row mt-2"+addRowClass
}).append($("<div></div>",{class:myLeftCol}).append($label)).append($("<div></div>",{class:"col"
}).append($input));return $row},addDamGeneration:function(damGenerationNum){
var inArray=this.checkInArray(damGenerationNum,this.damGenerationNums)
;if(!inArray)this.damGenerationNums.push(damGenerationNum),this.damGenerations[damGenerationNum]={damGen:null,
damGenDOB:null,damGenStrain:null},this.makeDamGenCard(damGenerationNum)},
makeDamGenCard:function(damGenerationNum){var $div=$("#damGensCardDiv")
;if(!$div.find(".card").length)$div.html("");var row="row mt-2",col="col-12 col-lg-6";$div.append($("<div/>",{
class:"col col-md-6 mt-2 damGenCard","data-damgen":damGenerationNum}))
;var $damDiv=$(".damGenCard"+this.damGenSearch(damGenerationNum)),header=$("<div></div>",{class:"damGenCalc",
"data-calc":"damGen","data-damgen":damGenerationNum
}).append("Dam Generation "+damGenerationNum),$body=this.makeDamGenCardBody(damGenerationNum)
;this.makeCard($damDiv,header,$body),this.updateDamGenList(damGenerationNum)},makeDamGenList:function(damNum){
var damGenNums=this.damGenerationNums,damGens=this.damGenerations,damSearch=this.damSearch(damNum)
;for(damGenNum of damGenNums){var damGen=damGens[damGenNum],genInfo="",gen=damGen.damGen
;if(!gen)gen="Gen "+damGenNum;genInfo=gen;var dob=damGen.damGenDOB;if(dob)genInfo+="; DOB: "+dob
;var strain=damGen.damGenStrain;if(strain)genInfo+="; strain: "+strain
;$(".damGeneration"+damSearch).append($("<option></option>",{value:damGenNum,"data-damgen":damGenNum
}).append(genInfo))}},updateDamGenList:function(damGenNum){
var damGens=this.damGenerations,damGen=damGens[damGenNum],genInfo="",gen=damGen.damGen
;if(!gen)gen="Gen "+damGenNum;genInfo=gen,$(".damGenCalc"+this.damGenSearch(damGenNum)).text(genInfo)
;var dob=damGen.damGenDOB;if(dob)genInfo+="; DOB: "+dob;var strain=damGen.damGenStrain
;if(strain)genInfo+="; strain: "+strain;var $option=$(".damGeneration").find("option[value='"+damGenNum+"']")
;if(0==$option.length)$(".damGeneration").append($("<option></option>",{value:damGenNum,
"data-damgen":damGenNum}).append(genInfo));else $option.text(genInfo)},
makeDamGenCardBody:function(damGenerationNum){var $body=$("<div></div>"),initialRows=[{
label:"<h4>Generation:</h4>",type:"text",className:"damGen",addRowClass:" updateDamGenerationObj"},{
label:"Delete:",type:"button",className:"deleteDamGeneration",optionsObj:[],addRowClass:" hideView"},{
label:"DOB:",type:"date",className:"damGenDOB",addRowClass:" updateDamGenerationObj"},{label:"Strain:",
type:"text",className:"damGenStrain",addRowClass:" updateDamGenerationObj"}]
;for(row of initialRows)$body.append(this.makeRowFromObj(row,damGenerationNum,"damgen"))
;return $body.find(".deleteDamGeneration").prop("value","Delete Dam Gen").on("click",e=>{
this.deleteDamGen(damGenerationNum)}),$body.find(".updateDamGenerationObj").on("change",e=>{
var $el=$(e.target);this.updateObjFromVal($el,this.damGenerations[damGenerationNum]),
this.updateDamGenList(damGenerationNum)}),$body},addSireGeneration:function(sireGenerationNum){
var inArray=this.checkInArray(sireGenerationNum,this.sireGenerationNums)
;if(!inArray)this.sireGenerationNums.push(sireGenerationNum),this.sireGenerations[sireGenerationNum]={
sireGen:null,sireGenDOB:null,sireGenStrain:null},this.makeSireGenCard(sireGenerationNum)},
makeSireGenCard:function(sireGenerationNum){var $div=$("#sireGensCardDiv")
;if(!$div.find(".card").length)$div.html("");var row="row mt-2",col="col-12 col-lg-6";$div.append($("<div/>",{
class:"col col-md-6 mt-2 sireGenCard","data-siregen":sireGenerationNum}))
;var $sireDiv=$(".sireGenCard"+this.sireGenSearch(sireGenerationNum)),header=$("<div></div>",{
class:"sireGenCalc","data-calc":"sireGen","data-siregen":sireGenerationNum
}).append("Sire Generation "+sireGenerationNum),$body=this.makeSireGenCardBody(sireGenerationNum)
;this.makeCard($sireDiv,header,$body),this.updateSireGenList(sireGenerationNum)},
makeSireGenList:function(sireNum){
var sireGenNums=this.sireGenerationNums,sireGens=this.sireGenerations,sireSearch=this.sireSearch(sireNum)
;for(sireGenNum of sireGenNums){var sireGen=sireGens[sireGenNum],genInfo="",gen=sireGen.sireGen
;if(!gen)gen="Gen "+sireGenNum;genInfo=gen;var dob=sireGen.sireGenDOB;if(dob)genInfo+="; DOB: "+dob
;var strain=sireGen.sireGenStrain;if(strain)genInfo+="; strain: "+strain
;$(".sireGeneration"+sireSearch).append($("<option></option>",{value:sireGenNum,"data-siregen":sireGenNum
}).append(genInfo))}},updateSireGenList:function(sireGenNum){
var sireGens=this.sireGenerations,sireGen=sireGens[sireGenNum],genInfo="",gen=sireGen.sireGen
;if(!gen)gen="Gen "+sireGenNum;genInfo=gen;var dob=sireGen.sireGenDOB;if(dob)genInfo+="; DOB: "+dob
;var strain=sireGen.sireGenStrain;if(strain)genInfo+="; strain: "+strain
;var $option=$(".sireGeneration").find("option[value='"+sireGenNum+"']")
;if(0==$option.length)$(".sireGeneration").append($("<option></option>",{value:sireGenNum,
"data-siregen":sireGenNum}).append(genInfo));else $option.text(genInfo)},
makeSireGenCardBody:function(sireGenerationNum){var $body=$("<div></div>"),initialRows=[{
label:"<h4>Generation:</h4>",type:"text",className:"sireGen",addRowClass:" updateSireGenerationObj"},{
label:"Delete:",type:"button",className:"deleteSireGeneration",optionsObj:[],addRowClass:" hideView"},{
label:"DOB:",type:"date",className:"sireGenDOB",addRowClass:" updateSireGenerationObj"},{label:"Strain:",
type:"text",className:"sireGenStrain",addRowClass:" updateSireGenerationObj"}]
;for(row of initialRows)$body.append(this.makeRowFromObj(row,sireGenerationNum,"siregen"))
;return $body.find(".deleteSireGeneration").prop("value","Delete Sire Gen").on("click",e=>{
this.deleteSireGen(sireGenerationNum)}),$body.find(".updateSireGenerationObj").on("change",e=>{
var $el=$(e.target);this.updateObjFromVal($el,this.sireGenerations[sireGenerationNum]),
this.updateSireGenList(sireGenerationNum)}),$body},
makeInput:function(inputType,className,dataNum,optionsObj,dataName,addSecondData=false,secondDataNum=NaN,secondDataName=null,addThirdData=false,thirdDataNum=NaN,thirdDataName=null){
var lowerCaseName=className.toLowerCase();dataString="data-"+dataName.toLowerCase();var idNum=dataNum
;if(addSecondData)secondDataString="data-"+secondDataName.toLowerCase(),idNum="a"+dataNum+"b"+secondDataNum
;if(addThirdData)thirdDataString="data-"+thirdDataName.toLowerCase(),idNum+="c"+thirdDataNum
;if("select"===inputType){var selectObj={name:lowerCaseName+idNum,id:className+idNum,
class:className+" fullWidth watch","data-watch":className};if(selectObj[dataString]=dataNum,
addSecondData)selectObj[secondDataString]=secondDataNum
;if(addThirdData)selectObj[thirdDataString]=thirdDataNum
;for(option of($input=$("<select></select>",selectObj),optionsObj))$input.append($("<option></option>",{
value:option.value}).append(option.text))}else if("textarea"===inputType){var inputObj={
name:lowerCaseName+idNum,id:className+idNum,class:className+" fullWidth watch autoAdjust",
"data-watch":className};if(inputObj[dataString]=dataNum,addSecondData)inputObj[secondDataString]=secondDataNum
;if(addThirdData)inputObj[thirdDataString]=thirdDataNum
;$input=$("<tex"+"tarea></tex"+"tarea>",inputObj).on("input",e=>{this.updateTextarea(e.currentTarget)})}else{
var inputObj={type:inputType,name:lowerCaseName+idNum,id:className+idNum,class:className+" fullWidth watch",
"data-watch":className};if(inputObj[dataString]=dataNum,addSecondData)inputObj[secondDataString]=secondDataNum
;if(addThirdData)inputObj[thirdDataString]=thirdDataNum;var $input=$("<input></input>",inputObj)}
if("time"===inputType)$input.each((i,e)=>{this.checkTimeFormat($(e))}).on("change",e=>{
this.checkTimeFormat($(e.currentTarget))});if("date"===inputType)$input.each((i,e)=>{
this.checkDateFormat($(e))}).on("change",e=>{this.checkDateFormat($(e.currentTarget))});return $input},
makeRowFromObj:function(obj,dataNum,dataName,addSecondData=false,secondDataNum=NaN,secondDataName=null){
var $row=this.makeRow(obj.label,this.makeInput(obj.type,obj.className,dataNum,obj.optionsObj,dataName,addSecondData,secondDataNum,secondDataName),obj.addRowClass)
;return $row},deleteDam:function(damNum){
this.runIfConfirmed("Are you sure that you wish to delete this dam?",()=>{
var index=this.damNums.indexOf(damNum);if(index>-1)this.damNums.splice(index,1);delete this.dams[damNum]
;var damSearch=this.damSearch(damNum);$(damSearch).remove(),this.getDamsDue($("#dueDate").val())}),
this.resize()},deleteSire:function(sireNum){
this.runIfConfirmed("Are you sure that you wish to delete this sire?",()=>{
var index=this.sireNums.indexOf(sireNum);if(index>-1)this.sireNums.splice(index,1);delete this.sires[sireNum]
;var sireSearch=this.sireSearch(sireNum);$(sireSearch).remove(),this.getDamsDue($("#dueDate").val())}),
this.resize()},deleteBreedingFuncs:function(damNum,breedingNum){
this.runIfConfirmed("Are you sure that you wish to delete this dam breeding?",()=>{
var thisDam=this.dams[damNum],breedingNums=thisDam.breedingNums,damBreedings=thisDam.breedings,index=breedingNums.indexOf(breedingNum)
;if(index>-1)breedingNums.splice(index,1);delete damBreedings[breedingNum]
;var damSearch=this.damSearch(damNum),breedingSearch=this.breedingSearch(breedingNum)
;$(damSearch+breedingSearch).remove(),this.getDamsDue($("#dueDate").val())}),this.resize()},
deletePlugFuncs:function(damNum,breedingNum,plugCheckNum){
this.runIfConfirmed("Are you sure that you wish to delete this dam breeding?",()=>{
var thisDam=this.dams[damNum],damBreeding=thisDam.breedings[breedingNum],plugCheckNums=damBreeding.plugCheckNums,plugChecks=damBreeding.plugChecks,index=plugCheckNums.indexOf(plugCheckNum)
;if(index>-1)plugCheckNums.splice(index,1);delete plugChecks[plugCheckNum]
;var damSearch=this.damSearch(damNum),breedingSearch=this.breedingSearch(breedingNum),plugSearch=this.plugSearch(plugCheckNum)
;$(damSearch+breedingSearch+plugSearch).remove(),this.getDamsDue($("#dueDate").val())}),this.resize()},
deleteMassFuncs:function(damNum,breedingNum,massNum){
this.runIfConfirmed("Are you sure that you wish to delete this dam breeding?",()=>{
var thisDam=this.dams[damNum],damBreeding=thisDam.breedings[breedingNum],massNums=damBreeding.massNums,masses=damBreeding.masses,index=massNums.indexOf(massNum)
;if(index>-1)massNums.splice(index,1);delete masses[massNum]
;var damSearch=this.damSearch(damNum),breedingSearch=this.breedingSearch(breedingNum),massSearch=this.massSearch(massNum)
;$(damSearch+breedingSearch+massSearch).remove(),this.getDamsDue($("#dueDate").val())}),this.resize()},
deleteDamGen:function(genNum){
this.runIfConfirmed("Are you sure that you wish to delete this dam generation?",()=>{
var index=this.damGenerationNums.indexOf(genNum);if(index>-1)this.damGenerationNums.splice(index,1)
;delete this.damGenerations[genNum];var damGenSearch=this.damGenSearch(genNum)
;$(".damGenCard"+damGenSearch).remove(),$(damGenSearch).remove(),this.getDamsDue($("#dueDate").val())}),
this.resize()},deleteSireGen:function(genNum){
this.runIfConfirmed("Are you sure that you wish to delete this sire generation?",()=>{
var index=this.sireGenerationNums.indexOf(genNum);if(index>-1)this.sireGenerationNums.splice(index,1)
;delete this.sireGenerations[genNum];var sireGenSearch=this.sireGenSearch(genNum)
;$(".sireGenCard"+sireGenSearch).remove(),$(sireGenSearch).remove(),this.getDamsDue($("#dueDate").val())}),
this.resize()},getNextNum:function(nums){
if(nums.length>0)var lastNum=nums[nums.length-1],num=lastNum+1;else var num=1;return num},
addDamBreeding:function(damNum){
var breedingNums=this.dams[damNum].breedingNums,damBreedings=this.dams[damNum].breedings,breedingNum=this.getNextNum(breedingNums),inArray=this.checkInArray(breedingNum,breedingNums)
;if(!inArray)breedingNums.push(breedingNum),damBreedings[breedingNum]={sireBreeding:null,litterNum:NaN,
breedDate:NaN,breedCage:NaN,breedCageLoc:null,initialMass:NaN,massNums:[],masses:{},plugCheckNums:[],
plugChecks:{},sepFromMaleDate:NaN,sepDamCageNum:NaN,litterDOB:NaN,stopTrackingDate:NaN},
this.makeDamBreeding(damNum,breedingNum),this.getDamsDue($("#dueDate").val())},
makeDamBreeding:function(damNum,breedingNum){
var damSearch=this.damSearch(damNum),$cardBody=$(".damCard"+damSearch).find(".card-body"),initialRows=[{
label:"Copy info:",type:"button",className:"copyBreeding"},{label:"Delete:",type:"button",
className:"deleteBreeding",optionsObj:[],addRowClass:"hideView"},{label:"Sire:",type:"select",
className:"sireBreeding",addRowClass:"updateDamBreedObj",optionsObj:[{value:"",text:"[Select]"}]},{
label:"Date:",type:"date",className:"breedDate",addRowClass:"updateDamBreedObj"},{label:"Litter Number:",
type:"number",className:"litterNum",addRowClass:"updateDamBreedObj"},{label:"Cage Num:",type:"number",
className:"breedCage",addRowClass:"updateDamBreedObj"},{label:"Cage location:",type:"text",
className:"breedCageLoc",addRowClass:"updateDamBreedObj"},{label:"Initial mass:",type:"number",
className:"initialMass",addRowClass:"updateDamBreedObj"},{label:"Add plug check:",type:"button",
className:"addPlugCheck",addRowClass:"hideView"},{label:"Add mass:",type:"button",className:"addMass",
addRowClass:"hideView"},{label:"Separated from male:",type:"date",className:"sepFromMaleDate",
addRowClass:"updateDamBreedObj"},{label:"Sep cage #:",type:"number",className:"sepDamCageNum"},{
label:"Parturition date:",type:"date",className:"litterDOB",addRowClass:"updateDamBreedObj"},{
label:"Stop tracking:",type:"date",className:"stopTrackingDate",addRowClass:"updateDamBreedObj"},{
label:"Copy info:",type:"button",className:"copyBreeding"}];$cardBody.append($("<div></div>",{
class:"breedDiv","data-breed":breedingNum,"data-dam":damNum}).append($("<hr></hr>")))
;var $body=$cardBody.find(".breedDiv").last()
;for(row of initialRows)$body.append(this.makeRowFromObj(row,damNum,"dam",true,breedingNum,"breed"))
;$body.find(".addPlugCheck").prop("value","Plug check").on("click",e=>{this.addPlugCheck(damNum,breedingNum)
}).closest(".row").after($("<div></div>",{class:"plugsDiv","data-dam":damNum,"data-breed":breedingNum
}).append(this.makeTopLabelRow(this.plugLabels))),
$body.find(".addMass").prop("value","Add mass").on("click",e=>{this.addMass(damNum,breedingNum)
}).closest(".row").after($("<div></div>",{class:"massesDiv","data-dam":damNum,"data-breed":breedingNum
}).append(this.makeTopLabelRow(this.massLabels))),
$body.find(".deleteBreeding").prop("value","Delete Breeding").on("click",e=>{
this.deleteBreedingFuncs(damNum,breedingNum)
}),$body.find(".copyBreeding").prop("value","Copy Breeding").on("click",e=>{
this.copyDamBreedingToClipboard(damNum,breedingNum)}),this.makeSireList(damNum,breedingNum)
;var damBreeedingSearch=this.damSearch(damNum)+this.breedingSearch(breedingNum)
;$body.find(".updateDamBreedObj").on("change",e=>{var $el=$(e.target),val=$el.val()
;valSafe=this.encodeHTML(val);var thisProp=$el.data("watch")
;if(this.dams[damNum].breedings[breedingNum][thisProp]=valSafe,
"initialMass"===thisProp)this.calcMassChange(damNum,breedingNum)
;if("breedDate"===thisProp)this.updateBreedingWatchDates(damNum,breedingNum)}),this.resize()},
plugLabels:["Date","Plug","Comments","Delete"],massLabels:["Date","Mass","% initial mass","Delete"],
makeTopLabelRow:function(labels){var $cardDiv=$("<div></div>",{class:"card d-none d-md-flex topLabelRow"
}).append($("<div></div>",{class:"row"}).append($("<div></div>",{class:"col-12 row labelRow"
}))),numLabels=labels.length,colText="col-"+Math.floor(12/numLabels)
;for(label of labels)$cardDiv.find(".labelRow").append($("<div></div>",{class:"font-weight-bold "+colText
}).append(label));return $cardDiv},addPlugCheck:function(damNum,breedingNum){
var damInfo=this.dams[damNum],bInfo=damInfo.breedings[breedingNum],plugCheckNums=bInfo.plugCheckNums,plugChecks=bInfo.plugChecks,plugCheckNum=this.getNextNum(plugCheckNums),inArray=this.checkInArray(plugCheckNum,plugCheckNums)
;if(!inArray)plugCheckNums.push(plugCheckNum),plugChecks[plugCheckNum]={plugDate:NaN,plugCheck:null,
plugComments:null},this.makePlugEntry(damNum,breedingNum,plugCheckNum)},
makePlugEntry:function(damNum,breedingNum,plugNum){var $card=$("<div></div>",{class:"card plugCard",
"data-dam":damNum,"data-breed":breedingNum,"data-plug":plugNum}).append($("<div></div>",{class:"row"
}).append($("<div></div>",{class:"col-6 d-md-none row labelRow"})).append($("<div></div>",{
class:"col-6 col-md-12 row plugRow"})))
;for(label of this.plugLabels)$card.find(".labelRow").append($("<div></div>",{class:"col-12 font-weight-bold"
}).append(label));var inputCols=[{type:"date",className:"plugDate"},{type:"select",className:"plugCheck",
optionsObj:[{value:"neg",text:"-/-"},{value:"1",text:"?"},{value:"2",text:"+/-"},{value:"3",text:"+/+"},{
value:"red",text:"Red"},{value:"closed",text:"Closed VO"}]},{type:"textarea",className:"plugComments"},{
type:"button",className:"deletePlug"}];for(colObj of inputCols)$card.find(".plugRow").append($("<div></div>",{
class:"col-12 col-md-"+Math.floor(12/inputCols.length)
}).append(this.makeInput(colObj.type,colObj.className,damNum,colObj.optionsObj,"dam",true,breedingNum,"breed",true,plugNum,"plug")))
;$card.find(".deletePlug").prop("value","Delete").on("click",e=>{
this.deletePlugFuncs(damNum,breedingNum,plugNum)}),$card.find(".plugRow").on("change",e=>{
var $el=$(e.target),val=$el.val();valSafe=this.encodeHTML(val);var thisProp=$el.data("watch")
;this.dams[damNum].breedings[breedingNum].plugChecks[plugNum][thisProp]=valSafe,
this.updateBreedingWatchDates(damNum,breedingNum)
}),$(".plugsDiv"+this.damSearch(damNum)+this.breedingSearch(breedingNum)).append($card),this.resize()},
addMass:function(damNum,breedingNum){
var damInfo=this.dams[damNum],bInfo=damInfo.breedings[breedingNum],massNums=bInfo.massNums,masses=bInfo.masses,massNum=this.getNextNum(massNums),inArray=this.checkInArray(massNum,massNums)
;if(!inArray)massNums.push(massNum),masses[massNum]={massDate:NaN,mass:null
},this.makeMassEntry(damNum,breedingNum,massNum)},makeMassEntry:function(damNum,breedingNum,massNum){
var $card=$("<div></div>",{class:"card massCard","data-dam":damNum,"data-breed":breedingNum,
"data-mass":massNum}).append($("<div></div>",{class:"row"}).append($("<div></div>",{
class:"col-6 d-md-none row labelRow"})).append($("<div></div>",{class:"col-6 col-md-12 row massRow"})))
;for(label of this.massLabels)$card.find(".labelRow").append($("<div></div>",{class:"col-12 font-weight-bold"
}).append(label));var inputCols=[{type:"date",className:"massDate"},{type:"number",className:"mass"},{
type:"noEntry"},{type:"button",className:"deleteMass"}]
;for(colObj of inputCols)if("noEntry"===colObj.type)$card.find(".massRow").append($("<div></div>",{
class:"change col-12 col-md-"+Math.floor(12/inputCols.length),"data-dam":damNum,"data-breed":breedingNum,
"data-mass":massNum}).append("Enter new mass"));else $card.find(".massRow").append($("<div></div>",{
class:"col-12 col-md-"+Math.floor(12/inputCols.length)
}).append(this.makeInput(colObj.type,colObj.className,damNum,colObj.optionsObj,"dam",true,breedingNum,"breed",true,massNum,"mass")))
;$card.find(".deleteMass").prop("value","Delete").on("click",e=>{
this.deleteMassFuncs(damNum,breedingNum,massNum)}),$card.find(".massRow").on("change",e=>{
var $el=$(e.target),val=$el.val();valSafe=this.encodeHTML(val);var thisProp=$el.data("watch")
;this.dams[damNum].breedings[breedingNum].masses[massNum][thisProp]=valSafe})
;var damSearch=this.damSearch(damNum),breedingSearch=this.breedingSearch(breedingNum),massSearch=this.massSearch(massNum),searchString=damSearch+breedingSearch+massSearch
;$card.find(".mass").on("input",e=>{
var $el=$(e.currentTarget),newMass=$el.val(),initialMass=this.dams[damNum].breedings[breedingNum].initialMass,massText=this.calcPercMass(newMass,initialMass)
;$(".change"+searchString).text(massText)}),$(".massesDiv"+damSearch+breedingSearch).append($card),
this.resize()},calcMassChange:function(damNum,breedingNum){
var bInfo=this.dams[damNum].breedings[breedingNum],initialMass=bInfo.initialMass,damSearch=this.damSearch(damNum),breedingSearch=this.breedingSearch(breedingNum)
;for(massNum of bInfo.massNums){
var massSearch=this.massSearch(massNum),newMass=bInfo.masses[massNum].mass,massText=this.calcPercMass(newMass,initialMass)
;$(".change"+damSearch+breedingSearch+massSearch).text(massText)}},calcPercMass:function(newMass,initMass){
var newMassVal=parseFloat(newMass),initMassVal=parseFloat(initMass),text;if(newMassVal>0&&initMassVal>0){
var percChange=newMassVal/initMassVal*100;text=percChange.toFixed(1)
}else if(!newMassVal>0)text="Enter new mass";else text="Enter initial mass";return text},
makeEstDatesTable:function(){var damObjs=this.getDamsForImpDates(),labels=this.damDatesLabels
;const tableData=[labels];for(damObj of damObjs){
var damNum=damObj.damNum,breedingNum=damObj.breedingNum,datesInfo=this.getDamDates(damNum,breedingNum),row=[],val
;for(label of labels){if(val=datesInfo[label],!val)val="";row.push(val)}tableData.push(row)}
$tableDiv=$(".estExpDatesTable"),this.createTable(tableData,true,false,$tableDiv),
$tableDiv.find("tr").each((i,e)=>{$(e).find("td, th").each((i,e)=>{if(2===i){var DOBcertain=$(e).text()
;if($(e).addClass("hide"),
"true"===DOBcertain)$(e).parent().addClass("isCertain");else $(e).parent().removeClass("isCertain")}
var text=$(e).text();if(this.isValidDate(text))$(e).text(luxon.DateTime.fromISO(text).toLocaleString({
weekday:"short",month:"short",day:"2-digit"}))})})},makeDamsBreedingTable:function(){
var dams=this.dams,damNums=this.damNums,labels=this.damBreedingLabels;const tableData=[labels]
;for(damNum of damNums){var damInfo=dams[damNum],breedingNums=damInfo.breedingNums
;for(breedingNum of breedingNums){var bInfo=this.getDamBreedingInfo(damNum,breedingNum),row=[],val
;for(label of labels){if(val=bInfo[label],!val)val="";row.push(val)}tableData.push(row)}}
$tableDiv=$(".damsBreedingsInfoTable"),this.createTable(tableData,true,false,$tableDiv)},
getDamDates:function(damNum,breedingNum){
var dam=this.dams[damNum],breeding=this.dams[damNum].breedings[breedingNum],damID=dam.damID
;if(!damID)damID="d"+damNum;var litterNum=breeding.litterNum;if(!litterNum)litterNum=breedingNum
;var specDamID=damID+"-"+(""+litterNum).padStart(2,"0"),DOB,DOBcertain=false
;if(!breeding.litterDOB)if(!breeding.goodPlugDate)if(!breeding.likelyPlugDate)if(!breeding.potentialPlugDate)DOB=this.addDays(breeding.breedDate,21);else DOB=this.addDays(breeding.potentialPlugDate,20);else DOB=this.addDays(breeding.likelyPlugDate,20);else DOB=this.addDays(breeding.goodPlugDate,20);else DOB=breeding.litterDOB,
DOBcertain=true
;var P4=this.addDays(DOB,4),P11=this.addDays(DOB,11),P21=this.addDays(DOB,21),P70=this.addDays(DOB,70),P91=this.addDays(DOB,91),damObj={
damID:specDamID,DOB:DOB,DOBcertain:DOBcertain,P4:P4,P11:P11,P21:P21,P70:P70,P91:P91};return damObj},
damDatesLabels:["damID","DOB","DOBcertain","P4","P11","P21","P70","P91"],
getDamBreedingInfo:function(damNum,breedingNum){
var dam=this.dams[damNum],breeding=this.dams[damNum].breedings[breedingNum],damID=dam.damID
;if(!damID)damID="d"+damNum;var litterNum=breeding.litterNum;if(!litterNum)litterNum=breedingNum
;var specDamID=damID+"-"+(""+litterNum).padStart(2,"0"),damGenNum=dam.damGeneration,damStrain,damGeneration,damDOB
;if(damGenNum){var damGenInfo=this.damGenerations[damGenNum];damStrain=damGenInfo.damGenStrain,
damGeneration=damGenInfo.damGen,damDOB=damGenInfo.damGenDOB}
var sireNum=breeding.sireBreeding,sireID,sireStrain,sireGeneration,sireDOB;if(sireNum){
var sireInfo=this.sires[sireNum];if(sireID=sireInfo.sireID,sireGenNum=sireInfo.sireGeneration,sireGenNum){
var sireGenInfo=this.sireGenerations[sireGenNum];sireStrain=sireGenInfo.sireGenStrain,
sireGeneration=sireGenInfo.sireGen,sireDOB=sireGenInfo.sireGenDOB}}
var plugDate=breeding.potentialPlugDate,damObj={damID:specDamID,litterNum:breeding.litterNum,dam:damID,
damStrain:damStrain,damGeneration:damGeneration,damDOB:damDOB,sire:sireID,sireStrain:sireStrain,
sireGeneration:sireGeneration,sireDOB:sireDOB,breedDate:breeding.breedDate,plugDate:plugDate,
DOB:breeding.litterDOB,Sac_or_stop:breeding.stopTrackingDate};return damObj},
damBreedingLabels:["damID","litterNum","dam","damStrain","damGeneration","damDOB","sire","sireStrain","sireGeneration","sireDOB","breedDate","plugDate","DOB","Sac_or_stop"],
copyDamBreedingToClipboard:function(damNum,breedingNum,copyLabels=false){
var damObj=this.getDamBreedingInfo(damNum,breedingNum);const tableArray=[],rowArray=[]
;if(copyLabels)tableArray.push(this.damBreedingLabels);for(label of this.damBreedingLabels){
var val=damObj[label];if(!val)val="";rowArray.push(""+val)}tableArray.push(rowArray)
;var tableString=this.convertRowArrayToString(tableArray,"\t","\n"),$divForCopy=$("#forCopy"),$errorMsg=$("#errorMsg")
;this.copyStringToClipboard(tableString,$divForCopy,$errorMsg)},
getDamsDue:function(dueDate=luxon.DateTime.now().toISODate()){
var damsForPlugChecksObj=this.getDamsForPlugChecks(dueDate),damsForPlugChecks=damsForPlugChecksObj.remaining,damsForSeparationObj=this.getDamsForSeparation(dueDate),damsForSeparation=damsForSeparationObj.due,damsForBirthObj=this.getDamsForBirth(dueDate),damsForBirth=damsForBirthObj.due,namesPlugChecks=this.getDamNamesArray(damsForPlugChecks),namesSeparation=this.getDamNamesArray(damsForSeparation),namesBirth=this.getDamNamesArray(damsForBirth)
;this.printDams(namesPlugChecks,$(".plugCheckList")),this.printDams(namesSeparation,$(".sepMaleList")),
this.printDams(namesBirth,$(".checkBirthsList")),this.makeSeparationTable(damsForSeparationObj.remaining),
this.makeCheckForBirthsTable(damsForBirthObj.remaining),this.makeEstDatesTable(),this.makeDamsBreedingTable(),
this.resize()},
sepTableLabels:["damID","sepBreedingDate","sepPotentialPlugDate","sepLikelyPlugDate","sepGoodPlugDate"],
sepTableHeaders:["Dam","Breed Date + 12","Potential Plug + 11","Likely Plug + 11","Good Plug + 11"],
makeSeparationTable:function(toBeSeparated){var dams=this.dams,labels=this.sepTableLabels
;const tableData=[this.sepTableHeaders];for(damBreedingObj of toBeSeparated){
var damNum=damBreedingObj.damNum,breedingNum=damBreedingObj.breedingNum,damInfo=dams[damNum],bInfo=damInfo.breedings[breedingNum],row=[],val
;for(label of labels){if("damID"==label){if(val=damInfo[label],!val)val="Dam "+damNum
}else if(val=bInfo[label],!val)val="";row.push(val)}tableData.push(row)}$tableDiv=$(".sepDueDatesTable"),
this.createTable(tableData,true,false,$tableDiv),$tableDiv.find("td").each((i,e)=>{var text=$(e).text()
;if(this.isValidDate(text)){
if(text<=luxon.DateTime.fromISO($("#dueDate").val()).toISODate())$(e).addClass("isDue")
;$(e).text(luxon.DateTime.fromISO(text).toLocaleString({weekday:"short",month:"short",day:"2-digit"}))}})},
birthTableLabels:["damID","birthBreedingDate","birthPotentialPlugDate","birthLikelyPlugDate","birthGoodPlugDate"],
birthTableHeaders:["Dam","Breed Date + 19","Potential Plug + 18","Likely Plug + 18","Good Plug + 18"],
makeCheckForBirthsTable:function(toBeSeparated){var dams=this.dams,labels=this.birthTableLabels
;const tableData=[this.birthTableHeaders];for(damBreedingObj of toBeSeparated){
var damNum=damBreedingObj.damNum,breedingNum=damBreedingObj.breedingNum,damInfo=dams[damNum],bInfo=damInfo.breedings[breedingNum],row=[],val
;for(label of labels){if("damID"==label){if(val=damInfo[label],!val)val="Dam "+damNum
}else if(val=bInfo[label],!val)val="";row.push(val)}tableData.push(row)}$tableDiv=$(".checkForBirthsTable"),
this.createTable(tableData,true,false,$tableDiv),$tableDiv.find("td").each((i,e)=>{var text=$(e).text()
;if(this.isValidDate(text)){
if(text<=luxon.DateTime.fromISO($("#dueDate").val()).toISODate())$(e).addClass("isDue")
;$(e).text(luxon.DateTime.fromISO(text).toLocaleString({weekday:"short",month:"short",day:"2-digit"}))}})},
getDamNamesArray:function(damNumArray){var names=[];for(damNum of damNumArray){
var thisID=this.dams[damNum].damID;if(!thisID)thisID="Dam "+damNum;names.push(thisID)}return names},
printDams:function(damsArray,$div){damsArrayClean=this.encodeHTML(damsArray).split(","),
$div.html(damsArrayClean.join("<br/>"))},addDays:function($startDateVal,numDays){
var newDate=luxon.DateTime.fromISO($startDateVal).plus({days:numDays}).toISODate();return newDate},
createTable:function(tableData,makeFirstRowHead=false,makeFirstColHead=false,$tableDiv){
var table=document.createElement("table");table.classList.add("table")
;var tableBody=document.createElement("tbody");if(makeFirstRowHead)var thead=document.createElement("thead")
;if(tableData.forEach((rowData,rowNum)=>{var row=document.createElement("tr")
;if(rowData.forEach((cellData,colNum)=>{
if(makeFirstRowHead&&0==rowNum||makeFirstColHead&&0==colNum)var cell=document.createElement("th");else var cell=document.createElement("td")
;cell.appendChild(document.createTextNode(cellData)),row.appendChild(cell)
}),makeFirstRowHead&&0==rowNum)thead.appendChild(row),table.appendChild(thead);else tableBody.appendChild(row)
}),table.appendChild(tableBody),void 0===$tableDiv||!$tableDiv)console.log("appending generally"),
document.body.appendChild(table);else $tableDiv.html(""),$tableDiv.append(table);this.resize()},
getDueDatesForDam:function(damNum){
var waterDate=this.getWaterDueDate(damNum),foodDate=this.getFoodDueDate(damNum),bottomDate=this.getBottomDueDate(damNum),topDate=this.getTopDueDate(damNum)
;return this.dams[damNum].water=waterDate,this.dams[damNum].food=foodDate,this.dams[damNum].bottom=bottomDate,
this.dams[damNum].top=topDate,{water:waterDate,food:foodDate,bottom:bottomDate,top:topDate}},
allDamTableLabels:["damID","damLoc","damType","food","water","bottom","top","barcode"],
makeDueDatesTable:function(){var damNums=this.damNums,dams=this.dams,labels=this.allDamTableLabels
;const tableData=[labels];for(damNum of damNums){this.getDueDatesForDam(damNum)
;var dam=dams[damNum],endDate=dam.endDam;if(!endDate){var row=[];for(label of labels){var val=dam[label]
;if(!val)val="";row.push(val)}tableData.push(row)}}$tableDiv=$(".dueDatesTable"),
this.createTable(tableData,true,false,$tableDiv),$tableDiv.find("td").each((i,e)=>{var text=$(e).text()
;if(this.isValidDate(text)){if(text<=luxon.DateTime.now().toISODate())$(e).addClass("isDue")
;$(e).text(luxon.DateTime.fromISO(text).toLocaleString({weekday:"short",month:"short",day:"2-digit"}))}})},
rebuildTableFromStr:function(textStr,makeFirstRowHead,makeFirstColHead,$tableDiv){
var rowArray=this.makeArrayFromStr(textStr)
;if(this.addedTable=textStr,void 0===$tableDiv||!$tableDiv)this.createTable(rowArray,makeFirstRowHead,makeFirstColHead);else this.createTable(rowArray,makeFirstRowHead,makeFirstColHead,$tableDiv)
;this.resize()},makeArrayFromStr:function(textStr){var results=Papa.parse(textStr,{skipEmptyLines:true})
;return results.data},preview:function(){
var fileUpload=document.getElementById("fileUpload"),regex=/^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/
;if(regex.test(fileUpload.value.toLowerCase()))if("undefined"!=typeof FileReader){var reader=new FileReader
;reader.onload=(e=>{var csvText=e.target.result,makeFirstColHead=false,makeFirstRowHead=false
;if($("#makeColHead").is(":checked"))makeFirstColHead=true
;if($("#makeRowHead").is(":checked"))makeFirstRowHead=true;var $divForTable=$(".forTable")
;this.rebuildTableFromStr(csvText,makeFirstRowHead,makeFirstColHead,$divForTable)}),
reader.readAsText(fileUpload.files[0])
}else bootbox.alert("This browser does not support HTML5.");else bootbox.alert("Please upload a valid CSV file.")
},damGenLabels:["damGen","damGenDOB","damGenStrain"],sireGenLabels:["sireGen","sireGenDOB","sireGenStrain"],
addDamGenFromTable:function(obj){var genNum=this.getNextNum(this.damGenerationNums)
;this.addDamGeneration(genNum);var damGenerationSearch=this.damGenSearch(genNum),headers=this.damGenLabels
;for(header of headers)$("."+header+damGenerationSearch).val(obj[header]),
this.damGenerations[genNum][header]=obj[header];return this.updateDamGenList(genNum),genNum},
addSireGenFromTable:function(obj){var genNum=this.getNextNum(this.sireGenerationNums)
;this.addSireGeneration(genNum);var sireGenerationSearch=this.sireGenSearch(genNum),headers=this.sireGenLabels
;for(header of headers)$("."+header+sireGenerationSearch).val(obj[header]),
this.sireGenerations[genNum][header]=obj[header];return this.updateSireGenList(genNum),genNum},
addDamFromTable:function(obj,headers){var damNum=this.getNextNum(this.damNums);this.addDam(damNum)
;var damSearch=this.damSearch(damNum);for(header of headers){var damGen,damGenDOB,damGenStrain
;if("damID"===header)$("."+header+damSearch).val(obj[header]),
this.dams[damNum][header]=obj[header];else if("damGen"===header||header.toLowerCase().includes("generation"))damGen=obj[header];else if("damGenDOB"===header||header.toLowerCase().includes("DOB"))damGenDOB=obj[header];else if("damGenStrain"===header||header.toLowerCase().includes("strain"))damGenStrain=obj[header]
}
var matchInfo=this.getMatchingObjSubset(this.damGenerations,"damGen",damGen,"damGenDOB",damGenDOB,"damGenStrain",damGenStrain),dInfo=this.dams[damNum]
;if(matchInfo.matchingObj.length>0)$(".damGeneration"+damSearch).val(matchInfo.matchingObj[0]);else if(matchInfo.noMatches&&damGen){
var obj={damGen:damGen,damGenDOB:damGenDOB,damGenStrain:damGenStrain},genNum=this.addDamGenFromTable(obj)
;$(".damGeneration"+damSearch).val(genNum)}
this.updateObjFromVal($(".damGeneration"+damSearch),this.dams[damNum])},
addSireFromTable:function(obj,headers){var sireNum=this.getNextNum(this.sireNums);this.addSire(sireNum)
;var sireSearch=this.sireSearch(sireNum);for(header of headers){var sireGen,sireGenDOB,sireGenStrain
;if("sireID"===header)$("."+header+sireSearch).val(obj[header]),
this.sires[sireNum][header]=obj[header];else if("sireGen"===header||header.toLowerCase().includes("generation"))sireGen=obj[header];else if("sireGenDOB"===header||header.toLowerCase().includes("DOB"))sireGenDOB=obj[header];else if("sireGenStrain"===header||header.toLowerCase().includes("strain"))sireGenStrain=obj[header]
}
var matchInfo=this.getMatchingObjSubset(this.sireGenerations,"sireGen",sireGen,"sireGenDOB",sireGenDOB,"sireGenStrain",sireGenStrain)
;if(matchInfo.matchingObj.length>0)$(".sireGeneration"+sireSearch).val(matchInfo.matchingObj[0]);else if(matchInfo.noMatches&&sireGen){
var obj={sireGen:sireGen,sireGenDOB:sireGenDOB,sireGenStrain:sireGenStrain
},genNum=this.addSireGenFromTable(obj);$(".sireGeneration"+sireSearch).val(genNum)}
this.updateSireList(sireNum),this.updateObjFromVal($(".sireGeneration"+sireSearch),this.sires[sireNum])},
upload:function(){var tableStr=this.addedTable;if(tableStr){var byHeader=Papa.parse(tableStr,{
skipEmptyLines:true,header:true}),dataByHeader=byHeader.data,headers=byHeader.meta.fields
;if(headers.join("")===this.damGenLabels.join(""))for(obj of dataByHeader)this.addDamGenFromTable(obj);else if(headers.join("")===this.sireGenLabels.join(""))for(obj of dataByHeader)this.addSireGenFromTable(obj);else if("damID"===headers[0])for(obj of dataByHeader)this.addDamFromTable(obj,headers);else if("sireID"===headers[0])for(obj of dataByHeader)this.addSireFromTable(obj,headers);else bootbox.alert("Please use a table that has appropriate headers so that we know what to do with it. [damGen, damGenDOB, damGenStrain], [sireGen, sireGenDOB, sireGenStrain], [damID], or [sireID]")
}else bootbox.alert("Please either make an HTML table after pasting from Excel or preview a CSV file first")},
getMatchingObjSubset:function(obj,firstMatchKey,firstMatchVal,secondMatchKey,secondMatchVal,thirdMatchKey,thirdMatchVal){
var noMatches=false,matchingObj,objAsArray=Object.entries(obj),matchFirstKeys=objAsArray.filter(d=>d[1][firstMatchKey]===firstMatchVal),matchingObjs=matchFirstKeys
;if(matchingObjs.length>1){var matchSecondKeys=matchingObjs.filter(d=>d[1][secondMatchKey]===secondMatchVal)
;if(matchingObjs=matchSecondKeys,matchingObjs.length>1){
var matchThirdKeys=matchingObjs.filter(d=>d[1][thirdMatchKey]===thirdMatchVal);matchingObjs=matchThirdKeys}
}else if(0===matchingObjs.length)noMatches=true
;if(1!==matchingObjs.length)matchingObj={};else matchingObj=matchingObjs[0];return{matchingObj:matchingObj,
noMatches:noMatches}},updateBreedingWatchDates:function(damNum,breedingNum){
var damInfo=this.dams[damNum],bInfo=damInfo.breedings[breedingNum],plugCheckNums=bInfo.plugCheckNums,breedDate=bInfo.breedDate,earliestPotentialPlug,earliestLikelyPlug,earliestGoodPlug,sepBreeding,sepPotentialPlug,sepLikelyPlug,sepGoodPlug,birthBreeding,birthPotentialPlug,birthLikelyPlug,birthGoodPlug
;if(breedDate){for(plugCheckNum of plugCheckNums){
var plugCheckInfo=bInfo.plugChecks[plugCheckNum],plugState=plugCheckInfo.plugCheck,plugDate=plugCheckInfo.plugDate
;if(plugState>0){if(!earliestPotentialPlug||plugDate<earliestPotentialPlug)earliestPotentialPlug=plugDate
;if(plugState>1){if(!earliestLikelyPlug||plugDate<earliestLikelyPlug)earliestLikelyPlug=plugDate
;if(plugState>2)if(!earliestGoodPlug||plugDate<earliestGoodPlug)earliestGoodPlug=plugDate}}}
if(sepBreeding=this.addDays(breedDate,12),birthBreeding=this.addDays(breedDate,19),
earliestPotentialPlug)sepPotentialPlug=this.addDays(earliestPotentialPlug,11),
birthPotentialPlug=this.addDays(earliestPotentialPlug,18)
;if(earliestLikelyPlug)sepLikelyPlug=this.addDays(earliestLikelyPlug,11),
birthLikelyPlug=this.addDays(earliestLikelyPlug,18)
;if(earliestGoodPlug)sepGoodPlug=this.addDays(earliestGoodPlug,11),
birthGoodPlug=this.addDays(earliestGoodPlug,18)}bInfo["potentialPlugDate"]=earliestPotentialPlug,
bInfo["likelyPlugDate"]=earliestLikelyPlug,bInfo["goodPlugDate"]=earliestGoodPlug,
bInfo["sepBreedingDate"]=sepBreeding,bInfo["sepPotentialPlugDate"]=sepPotentialPlug,
bInfo["sepLikelyPlugDate"]=sepLikelyPlug,
bInfo["sepGoodPlugDate"]=sepGoodPlug,bInfo["birthBreedingDate"]=birthBreeding,
bInfo["birthPotentialPlugDate"]=birthPotentialPlug,bInfo["birthLikelyPlugDate"]=birthLikelyPlug,
bInfo["birthGoodPlugDate"]=birthGoodPlug},
getDamsForPlugChecks:function(dueDate=luxon.DateTime.now().toISODate()){var damNums=this.damNums
;const damsToCheck=[],damsForLikely=[];for(damNum of damNums){
var damInfo=this.dams[damNum],breedingNum=this.getDamLatestBreeding(damInfo,dueDate);if(breedingNum){
var bInfo=damInfo.breedings[breedingNum]
;if((!bInfo.sepFromMaleDate||bInfo.sepFromMaleDate>dueDate)&&(!bInfo.litterDOB||bInfo.litterDOB>dueDate)&&(!bInfo.stopTrackingDate||bInfo.stopTrackingDate>dueDate)&&(!bInfo.potentialPlugDate||bInfo.potentialPlugDate>dueDate))if(damsToCheck.push(damNum),
!bInfo.likelyPlugDate||bInfo.likelyPlugDate>dueDate)damsForLikely.push(damNum)}}return{remaining:damsToCheck,
forLikely:damsForLikely}},getDamsForSeparation:function(dueDate=luxon.DateTime.now().toISODate()){
var damNums=this.damNums;const damsToCheck=[],damsDueToCheck=[];for(damNum of damNums){
var damInfo=this.dams[damNum],breedingNum=this.getDamLatestBreeding(damInfo,dueDate);if(breedingNum){
var bInfo=damInfo.breedings[breedingNum]
;if((!bInfo.sepFromMaleDate||bInfo.sepFromMaleDate>dueDate)&&(!bInfo.litterDOB||bInfo.litterDOB>dueDate)&&(!bInfo.stopTrackingDate||bInfo.stopTrackingDate>dueDate))if(damsToCheck.push({
damNum:damNum,breedingNum:breedingNum}),bInfo.sepBreedingDate<=dueDate)damsDueToCheck.push(damNum)}}return{
remaining:damsToCheck,due:damsDueToCheck}},getDamsForBirth:function(dueDate=luxon.DateTime.now().toISODate()){
var damNums=this.damNums;const damsToCheck=[],damsDueToCheck=[];for(damNum of damNums){
var damInfo=this.dams[damNum],breedingNum=this.getDamLatestBreeding(damInfo,dueDate);if(breedingNum){
var bInfo=damInfo.breedings[breedingNum]
;if((!bInfo.litterDOB||bInfo.litterDOB>dueDate)&&(!bInfo.stopTrackingDate||bInfo.stopTrackingDate>dueDate))if(damsToCheck.push({
damNum:damNum,breedingNum:breedingNum}),bInfo.birthBreedingDate<=dueDate)damsDueToCheck.push(damNum)}}return{
remaining:damsToCheck,due:damsDueToCheck}},
getDamsForImpDates:function(dueDate=luxon.DateTime.now().toISODate()){var damNums=this.damNums
;const damsForTable=[];for(damNum of damNums){
var damInfo=this.dams[damNum],breedingNum=this.getDamLatestBreeding(damInfo);if(breedingNum){
var bInfo=damInfo.breedings[breedingNum]
;if(!bInfo.stopTrackingDate||bInfo.stopTrackingDate>dueDate)damsForTable.push({damNum:damNum,
breedingNum:breedingNum})}}return damsForTable},
getDamLatestBreeding:function(damInfo,dueDate=luxon.DateTime.now().toISODate()){
var breedingNums=damInfo.breedingNums,lastBreeding,lastBreedingNum;for(breedingNum of breedingNums){
var bInfo=damInfo.breedings[breedingNum],breedDate=bInfo.breedDate
;if((!lastBreeding||breedDate>lastBreeding)&&breedDate<dueDate)lastBreeding=breedDate,
lastBreedingNum=breedingNum}return lastBreedingNum}};
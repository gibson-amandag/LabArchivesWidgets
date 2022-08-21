my_widget_script={init:function(mode,json_data){
    this.makeHTMLforMice(5)
    ;var parsedJson=this.parseInitJson(json_data)
    ;this.initDynamicContent(parsedJson),
    window.onresize=(()=>this.resize()),this.parent_class.init(mode,()=>JSON.stringify(parsedJson.widgetData)),
    this.setUpInitialState(),
    this.adjustForMode(mode),this.checkForNames()},
    to_json:function(){
    var widgetJsonString=this.parent_class.to_json(),dynamicContent=this.getDynamicContent(),output={
    widgetData:JSON.parse(widgetJsonString),
    tailMarks:dynamicContent.tailMarks,
    addedRows_VOs:dynamicContent.addedRows_VOs,
    addedRows_1Es:dynamicContent.addedRows_1Es,
    allVO_dates:dynamicContent.allVO_dates,
    all1E_dates:dynamicContent.all1E_dates}
    ;return JSON.stringify(output)},
    from_json:function(json_data){
    var parsedJson=JSON.parse(json_data)
    ;this.parent_class.from_json(JSON.stringify(parsedJson.widgetData))
    },test_data:function(){
    var testData=JSON.parse(this.parent_class.test_data()),output={
    widgetData:testData,
    tailMarks:["<span style='color:black'>|</span>","<span style='color:green'>||</span>"],
    addedRows_VOs:[1,2],addedRows_1Es:[2,3],
    allVO_dates:[["2021-01-01"],["2021-01-01","2021-01-02"]],
    all1E_dates:[["2021-01-01","2021-01-02"],["2021-01-01","2021-01-02","2021-01-03"]]
    };return JSON.stringify(output)},
    isValidDate:function(dateString){
    var regEx=/^\d{4}-\d{2}-\d{2}$/
    ;if(!dateString.match(regEx))return false
    ;var d=new Date(dateString),dNum=d.getTime()
    ;if(!dNum&&0!==dNum)return false
    ;return d.toISOString().slice(0,10)===dateString},
    is_valid:function(b_suppress_message){
    var fail=false,fail_log="",name
    ;if($("#the_form").find("select, textarea, input").each((i,e)=>{
    if(!$(e).prop("required"));else if(!$(e).val())fail=true,
    name=$(e).attr("id"),fail_log+=name+" is required \n"
    }),$("input[type='date']").each((i,e)=>{
    var date=$(e).val();if(date){
    var validDate=this.isValidDate(date)
    ;if(!validDate)fail=true,fail_log+="Please enter valid date in form 'YYYY-MM-DD'"
    }}),$("input[type='time']").each((i,e)=>{
    var time=$(e).val();if(time){
    var validtime=this.isValidTime(time)
    ;if(!validtime)fail=true,fail_log+="Please enter valid time in form 'hh:mm' - 24 hr time"
    }}),fail)return bootbox.alert(fail_log);else{
    var noErrors=[];return noErrors}},
    is_edited:function(){
    return this.parent_class.is_edited()},
    reset_edited:function(){
    return this.parent_class.reset_edited()},
    parseInitJson:function(json_data){var jsonString
    ;if("string"===typeof json_data)jsonString=json_data;else jsonString=json_data()
    ;var parsedJson=JSON.parse(jsonString)
    ;return parsedJson},
    initDynamicContent:function(parsedJson){
    var maxOffspring=5
    ;if(parsedJson.tailMarks)for(var j=0;j<maxOffspring;j++){
    var mouseNum=j+1,dataSearch=this.numSearch(mouseNum),$tailMark=$("#tailMark"+mouseNum)
    ;$tailMark.html(parsedJson.tailMarks[j])
    ;var $tailMarkCalc=$(".tailMark"+mouseNum+"_calc")
    ;$tailMarkCalc.html(parsedJson.tailMarks[j])
    ;for(var dates_VO=parsedJson.allVO_dates[j],i=0;i<parsedJson.addedRows_VOs[j];i++)this.createMaturationRow_VO(dates_VO[i],mouseNum)
    ;for(var dates_1E=parsedJson.all1E_dates[j],i=0;i<parsedJson.addedRows_1Es[j];i++)this.createMaturationRow_1E(dates_1E[i],mouseNum)
    }},adjustForMode:function(mode){
    if("edit"!==mode&&"edit_dev"!==mode)$(".disableOnView").prop("disabled",true),
    $(".hideView").hide(),
    $(".massDiv").hide(),$("#showDates").prop("checked",true).closest(".container").hide(),
    $("#datesList").show(),
    $("#outputDiv").insertAfter($(".fullDemoDiv")),$(".entry.mat").each((i,e)=>{
    var mouseNum=parseInt($(e).data("num"))
    ;if(mouseNum<=parseInt($("#numOffspring").val()))$(e).show()
    }),this.adjustifOther(),
    $(".tableDiv").show(),$("input[type='date']").removeClass(".hasDatePicker");else{
    if($("#DOB").val())$("#entryDiv").insertAfter("#titleDiv"),
    $("#editDemo").prop("checked",false),
    $(".editDemoChecked").hide();else $("#editDemo").prop("checked",true),
    $(".editDemoChecked").show()
    ;$(".firstE_div_outer").each((i,e)=>{
    var mouseNum=$(e).data("num"),numSearch=this.numSearch(mouseNum)
    ;$(e).insertBefore($(".VO_div_outer"+numSearch))
    }),$("input[type='date']").each((i,e)=>{
    this.checkDateFormat($(e))
    }),$("input[type='time']").each((i,e)=>{
    this.checkTimeFormat($(e))
    }),this.addRequiredFieldIndicators()}},
    updateTailMarkButton:function($tailMark){
    var tailMarking=$tailMark.parent().find(".tailMark").html(),mouseNum=$tailMark.data("num"),$tailMarkCalc=$(".tailMark"+mouseNum+"_calc")
    ;$tailMarkCalc.html(tailMarking),this.resize()},
    addRequiredFieldIndicators:function(){
    $(".needForTableLab").each((i,e)=>{
    $(e).html("<span class='hideView' style='color:blue'>#</span>"+$(e).html())
    }),$(".requiredLab").each((i,e)=>{
    $(e).html("<span class='hideView' style='color:red'>*</span>"+$(e).html())
    })},switchMouseForEntry:function(){
    var selectedMouse=$("#mouseSelect :selected").data("num")
    ;if(-1!==$.inArray(selectedMouse,[1,2,3,4,5]))$(".entry[data-num='"+selectedMouse+"']").show(),
    $(".entry[data-num!='"+selectedMouse+"']").hide();else $(".entry").hide()
    ;this.resize()},
    showWithCheck:function($chbx,$toToggle){
    if($chbx.is(":checked"))$toToggle.show();else $toToggle.hide()
    ;this.resize()},
    hideWithCheck:function($chbx,$toToggle){
    if($chbx.is(":checked"))$toToggle.hide();else $toToggle.show()
    ;this.resize()},showOther:function($this){
    if("Other"===$this.val()){
    var $other=$this.next(".ifOther").show(),thisScrollHeight=$other.prop("scrollHeight")
    ;$other.css("height",thisScrollHeight).css("overflow-y","hidden")
    }else $this.next(".ifOther").hide();this.resize()
    },getLocalDateString:function(){
    var dateTodayString=luxon.DateTime.now().toISODate()
    ;return dateTodayString},adjustifOther:function(){
    $(".firstE_state").each((i,e)=>{
    this.showOther($(e))
    }),$(".VO_state").each((i,e)=>{
    this.showOther($(e))})},
    isValidTime:function(timeString){
    var regEx="^(((([0-1][0-9])|(2[0-3])):[0-5][0-9]))$"
    ;if(!timeString.match(regEx))return false;else return true
    },isTimeSupported:function(){
    var input=document.createElement("input")
    ;input.setAttribute("type","time")
    ;var supported=true
    ;if("time"!==input.type)supported=false
    ;return this.timeSupported=supported,input.remove(),
    supported},timeSupported:true,
    checkTimeFormat:function($timeInput){
    if(!this.timeSupported){
    $timeInput.next(".timeWarning").remove()
    ;var time=$timeInput.val(),isValid=this.isValidTime(time)
    ;if(!isValid)$timeInput.after('<div class="text-danger timeWarning">Enter time as "hh:mm" in 24-hr format</div>')
    ;this.resize()}},isValidDate:function(dateString){
    var regEx=/^\d{4}-\d{2}-\d{2}$/
    ;if(!dateString.match(regEx))return false
    ;var d=new Date(dateString),dNum=d.getTime()
    ;if(!dNum&&0!==dNum)return false
    ;return d.toISOString().slice(0,10)===dateString},
    isDateSupported:function(){
    var input=document.createElement("input")
    ;input.setAttribute("type","date")
    ;var supported=true
    ;if("date"!==input.type)supported=false
    ;return this.dateSupported=supported,input.remove(),
    supported},dateSupported:true,
    checkDateFormat:function($dateInput){
    if(!this.dateSupported){
    $dateInput.next(".dateWarning").remove()
    ;var date=$dateInput.val(),isValid=this.isValidDate(date)
    ;if(!isValid)$dateInput.after('<div class="text-danger dateWarning">Enter date as "YYYY-MM-DD"</div>')
    ;$dateInput.datepicker({dateFormat:"yy-mm-dd"
    }),this.resize()}},setUpInitialState:function(){
    this.isDateSupported(),this.isTimeSupported(),
    $("input[type='date']").prop("placeholder","YYYY-MM-DD").on("change",e=>{
    this.checkDateFormat($(e.currentTarget))
    }),$("input[type='time']").prop("placeholder","hh:mm").on("change",e=>{
    this.checkTimeFormat($(e.target))
    }),$("textarea.autoAdjust").each((i,e)=>{
    e.setAttribute("style","height:"+e.scrollHeight+"px;overflow-y:hidden;")
    }).on("input",e=>{
    e.target.style.height="auto",e.target.style.height=e.target.scrollHeight+"px",
    this.resize()
    }),$(".myLeftCol").addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right"),
    $(".myLeftCol2").addClass("col-6 col-md-4 col-lg-3 text-right"),
    $(".myLeftCol3").addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right font-weight-bold"),
    $(".med2").addClass("col-12 col-md-6 col-lg"),
    $(".med3").addClass("col-12 col-sm-6 col-md-4"),
    $("#editDemo").each((i,e)=>{
    this.showWithCheck($(e),$(".editDemoChecked"))
    }).on("change",e=>{
    this.showWithCheck($(e.currentTarget),$(".editDemoChecked"))
    }),$("#DOB").on("change",e=>{
    this.adjustForNumOffspring(),this.printPND_days(),this.getPND_today(),
    this.updateMatPND(),
    this.switchMouseForEntry(),this.watchForVO(),this.watchFor1E()
    }),$("#numOffspring").on("change",e=>{
    this.adjustForNumOffspring(),this.switchMouseForEntry()
    }),$(".mouseID").each((i,e)=>{
    var mouseNum=$(e).data("num")
    ;$("#mouseSelect option.mouse"+mouseNum).text($(e).val())
    }).on("input",e=>{
    var mouseNum=$(e.currentTarget).data("num")
    ;$("#mouseSelect option.mouse"+mouseNum).text($(e.currentTarget).val()),
    this.resize()}),$(".redButton").on("click",e=>{
    $(e.currentTarget).parent().find(".tailMark").append("<span style='color:red'>|</span>"),
    this.updateTailMarkButton($(e.currentTarget))
    }),$(".blackButton").on("click",e=>{
    $(e.currentTarget).parent().find(".tailMark").append("<span style='color:black'>|</span>"),
    this.updateTailMarkButton($(e.currentTarget))
    }),$(".clearButton").on("click",e=>{
    $(e.currentTarget).parent().find(".tailMark").text(""),
    this.updateTailMarkButton($(e.currentTarget))
    }),$("#showDates").each((i,e)=>{
    this.showWithCheck($(e),$("#datesList"))
    }).on("change",e=>{
    this.showWithCheck($(e.currentTarget),$("#datesList"))
    }),$(".simpleCalc").each((i,e)=>{
    var elementID=e.id,calcID="."+elementID+"_calc"
    ;this.watchValue($(e),$(calcID))}).on("input",e=>{
    var elementID=e.currentTarget.id,calcID="."+elementID+"_calc"
    ;this.watchValue($(e.currentTarget),$(calcID))
    }),$(".addMatCheck").on("click",e=>{
    var el=e.currentTarget,$dateVal=$(el).parent().next().children(".addMatDate").val(),mouseNum=$(el).data("num")
    ;if($dateVal){
    if($(el).hasClass("VO"))this.createMaturationRow_VO($dateVal,mouseNum);else if($(el).hasClass("firstE"))this.createMaturationRow_1E($dateVal,mouseNum)
    }else alert("Enter a Date")
    }),$(".addMatDate").val(this.getLocalDateString()),$(".removeMatCheck").on("click",e=>{
    var el=e.currentTarget
    ;this.runIfConfirmed("Are you sure that you want to remove the last date?",()=>{
    var mouseNum=$(el).data("num")
    ;if($(el).hasClass("VO"))this.removeMaturationRow("VO",mouseNum),
    this.watchForVO();else if($(el).hasClass("firstE"))this.removeMaturationRow("firstE",mouseNum),
    this.watchFor1E()})
    }),$("#massSelect").on("change",e=>{
    var pnd=$(e.currentTarget).val()
    ;if(pnd)this.switchMassTable(pnd);else $(".massDiv").hide()
    ;this.resize()
    }),$("#mouseSelect").on("change",e=>{
    this.switchMouseForEntry(),this.adjustifOther(),
    this.resize()}),$(".VO_mass").on("input",e=>{
    var mouseNum=$(e.currentTarget).data("num")
    ;this.watchVO_mass(mouseNum)
    }),$(".toggleTable").on("click",e=>{
    var $tableDiv,$errorMsgDiv,el=e.currentTarget
    ;if($(el).hasClass("maturation"))baseName="maturation";else if($(el).hasClass("mass"))baseName="mass";else if($(el).hasClass("demo"))baseName="demo"
    ;if(baseName)$tableDiv=$(".tableDiv."+baseName),
    $errorMsgDiv=$(".errorMsg."+baseName),
    this.toggleTableFuncs($tableDiv,$errorMsgDiv)
    }),$(".toCSV").on("click",e=>{
    var fileName,tableID,$errorMsg,baseName,el=e.currentTarget
    ;if($(el).hasClass("maturation"))baseName="maturation";else if($(el).hasClass("mass"))baseName="mass";else if($(el).hasClass("demo"))baseName="demo"
    ;if(baseName)fileName=baseName+"_"+$("#damID").val()+"_females",
    tableID=baseName+"Table",
    $errorMsg=$(".errorMsg."+baseName)
    ;if(fileName&&tableID&&$errorMsg)this.toCSVFuncs(fileName,tableID,$errorMsg)
    }),$(".copyDataButton").on("click",e=>{
    var $copyHead,$tableToCopy,$tableDiv,$errorMsg,$divForCopy,el=e.currentTarget
    ;if($(el).hasClass("maturation"))baseName="maturation";else if($(el).hasClass("mass"))baseName="mass";else if($(el).hasClass("demo"))baseName="demo"
    ;if(baseName)$copyHead=$(".copyHead."+baseName),
    $tableToCopy=$("#"+baseName+"Table"),
    $tableDiv=$(".tableDiv."+baseName),$errorMsg=$(".errorMsg."+baseName),
    $divForCopy=$(".forCopy."+baseName),
    this.copyDataFuncs($copyHead,$tableToCopy,$tableDiv,$errorMsg,$divForCopy)
    }),this.adjustForNumOffspring(),
    this.switchMouseForEntry(),this.printPND_days(),
    this.getPND_today(),this.updateMatPND(),
    this.watchForVO(),this.watchFor1E(),this.calcValues(),
    this.adjustifOther(),this.resize()},
    resize:function(){
    this.parent_class.resize_container()},
    checkForNames:function(){
    $("input, select, textarea").each((i,e)=>{
    var thisName=$(e).attr("name")
    ;if(!thisName)console.log("There is no name attribute for: ",e.id);else{
    var hasUpper=/[A-Z]/.test(thisName)
    ;if(hasUpper)console.log("The name contains an uppercase letter for: ",e.id)
    }})},getDynamicContent:function(){
    var tailMarks,addedRows_VOs,addedRows_1Es,allVO_dates,all1E_dates,maxOffspring=5
    ;tailMarks=[],
    addedRows_VOs=[],addedRows_1Es=[],allVO_dates=[],all1E_dates=[]
    ;for(var j=0;j<maxOffspring;j++){
    for(var mouseNum=j+1,dataSearch=this.numSearch(mouseNum),tailMark=$("#tailMark"+mouseNum).html(),addedRows_VO=$(".VO_div"+dataSearch).find(".addedRow").length,addedRows_1E=$(".firstE_div"+dataSearch).find(".addedRow").length,dates_VO=[],i=0;i<addedRows_VO;i++){
    var rowNum=i+1,rowClassName=".Row_"+rowNum,thisDate=$(".VO_div"+dataSearch).find(rowClassName).find(".mat_date").html()
    ;dates_VO[i]=thisDate}
    for(var dates_1E=[],i=0;i<addedRows_1E;i++){
    var rowNum=i+1,rowClassName=".Row_"+rowNum,thisDate=$(".firstE_div"+dataSearch).find(rowClassName).find(".mat_date").html()
    ;dates_1E[i]=thisDate}
    if(tailMark)tailMarks[j]=tailMark;else tailMarks[j]=""
    ;if(addedRows_VOs[j]=addedRows_VO,
    addedRows_1Es[j]=addedRows_1E,dates_VO)allVO_dates[j]=dates_VO;else allVO_dates[j]=[""]
    ;if(dates_1E)all1E_dates[j]=dates_1E;else all1E_dates[j]=[""]
    }var dynamicContent={tailMarks:tailMarks,
    addedRows_VOs:addedRows_VOs,
    allVO_dates:allVO_dates,
    addedRows_1Es:addedRows_1Es,
    all1E_dates:all1E_dates};return dynamicContent},
    runIfConfirmed:function(text,functionToCall){
    var thisMessage="Are you sure?"
    ;if(text)thisMessage=text;bootbox.confirm({
    message:thisMessage,callback:proceed=>{
    if(proceed)functionToCall()}})},
    dialogConfirm:function(text,functionToCall){
    var thisMessage="Do you want to proceed?"
    ;if(text)thisMessage=text;bootbox.confirm({
    message:thisMessage,callback:result=>{
    functionToCall(result)}})},
    runBasedOnInput:function(prompt,functionToCall){
    var thisTitle="Enter value:"
    ;if(prompt)thisTitle=prompt;bootbox.prompt({
    title:thisTitle,callback:result=>{
    functionToCall(result)}})},
    dataSearch:function(dataName,dataValue){
    var dataSearch="[data-"+dataName+"='"+dataValue+"']"
    ;return dataSearch},numSearch:function(num){
    var numSearch=this.dataSearch("num",num)
    ;return numSearch},
    checkInArray:function(searchVal,array){
    var proceed=-1!==$.inArray(searchVal,array)
    ;return proceed},
    data_valid_form:function($errorMsg){
    var valid=true,fail_log=$("<div></div>").append("Missing values for:"),name
    ;if($(".needForTable").each((i,e)=>{
    if(!$(e).val())valid=false,name=$(e).attr("id"),
    fail_log.append("<br></br>"+name)
    }),!valid)$errorMsg.html("<span style='color:red; font-size:36px;'>"+"Please fill out all elements marked by a"+"</span><span style='color:blue; font-size:36px;'>"+" blue #"+"</span>"),
    $errorMsg.append(fail_log);else $errorMsg.html("")
    ;return this.resize(),valid},
    watchValue:function($elToWatch,$elToUpdate){
    var value=$elToWatch.val()
    ;$elToUpdate.text(value),this.resize()},
    getPND_today:function(){
    var $DOBVal=$("#DOB").val();if($DOBVal){
    var startDate=luxon.DateTime.fromISO($DOBVal).startOf("day"),todayDate=luxon.DateTime.now().startOf("day"),dateDiff_days=todayDate.diff(startDate,"days").as("day"),pndTodayString=".pnd.pnd"+dateDiff_days,pndNotTodayString=".pnd:not(.pnd"+dateDiff_days+")"
    ;return $(pndTodayString).css("color","red"),
    $(pndNotTodayString).css("color","black"),
    $(".pndToday").text(dateDiff_days),this.updateToDoStatus(dateDiff_days),
    this.updateCycleStatus(dateDiff_days),
    dateDiff_days
    }else this.switchMassTable($("#massSelect").val())
    },getPND:function(dateInputVal){
    var DOBisDay=0,textOutput
    ;if($("#DOB").val())if(dateInputVal){
    var compDate=luxon.DateTime.fromISO(dateInputVal).startOf("day"),DOB=luxon.DateTime.fromISO($("#DOB").val()).startOf("day").minus({
    days:DOBisDay
    }),pnd=compDate.diff(DOB,"days").as("day")
    ;textOutput=pnd
    }else textOutput="[Enter Date of VO Check]";else textOutput="[Enter DOB]"
    ;return textOutput},updateMatPND:function(){
    $(".mat_pnd").each((i,e)=>{
    var dateVal=$(e).prev(".mat_date").text(),pnd=this.getPND(dateVal)
    ;$(e).text(pnd)})},
    updateToDoStatus:function(PND_today){
    var $toDoStatus=$(".toDo_status")
    ;if(-1!==$.inArray(PND_today,[28,35,42,49,56,63]))$toDoStatus.html("<span style='color:blue'>Take mass today</span>"),
    $("#massSelect").val("pnd"+PND_today),
    this.switchMassTable("pnd"+PND_today);else if(-1!==$.inArray(PND_today,[22,23,24,70,71,72]))$toDoStatus.html("<span style='color:blue'>Take mass and AGD today</span>"),
    $("#massSelect").val("pnd"+PND_today),
    this.switchMassTable("pnd"+PND_today);else if(21===PND_today)$toDoStatus.html("<span style='color:blue'>Wean and take mass today - enter in litter widget</span>"),
    $("#massSelect").val(""),
    this.switchMassTable("");else $toDoStatus.html("<em>No mass or AGD today</em>"),
    $("#massSelect").val(""),
    this.switchMassTable($("#massSelect").val())},
    updateCycleStatus:function(PND_today){
    var $cycling_status=$(".cycling_status")
    ;if(PND_today>=70&&PND_today<=91)$cycling_status.css("background-color","yellow");else $cycling_status.css("background-color","none")
    },
    addDays:function($startDateVal,$newDateClass,numDays){
    var newDate=luxon.DateTime.fromISO($startDateVal).plus({
    days:numDays}).toLocaleString({weekday:"short",
    month:"short",day:"numeric",year:"numeric"})
    ;$newDateClass.text(newDate)},
    pndDays:[21,22,23,24,28,35,42,49,56,63,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91],
    massDays:[22,23,24,28,35,42,49,56,63,70,71,72],
    agdDays:[22,23,24,70,71,72],
    datesList:[21,22,23,24,28,35,42,49,56,63,70,71,72,91],
    printPND_days:function(){if($("#DOB").val()){
    var pndDays=this.pndDays
    ;for(i=0;i<pndDays.length;i++){var pnd=pndDays[i]
    ;this.addDays($("#DOB").val(),$(".pnd"+pnd),pnd)}}
    this.resize()},adjustForNumOffspring:function(){
    var numOffspring=parseInt($("#numOffspring").val())
    ;if($(".mouse1").hide(),$(".mouse2").hide(),
    $(".mouse3").hide(),$(".mouse4").hide(),
    $(".mouse5").hide(),$(".invalid").hide(),
    numOffspring>=1&&numOffspring<=5){
    for(i=0;i<numOffspring;i++)$(".mouse"+(i+1)).show()
    ;$("#mouseSelect").val("mouse1")
    }else $(".invalid").show(),$("#mouseSelect").val(""),
    $(".numOffspring_calc").html("<span style='color:red'>Enter a number from 1-5</span>")
    ;this.resize()},watchForVO:function(){
    for(var anyHasReachedVO=false,hasReachedVO=false,thisPndAtVO,thisVODate,pndAtVO,dateAtVO,totalMice=parseInt($("#numOffspring").val()),i=0;i<totalMice;i++){
    hasReachedVO=false,pndAtVO=null,dateAtVO=null
    ;var mouseNum=i+1,dataSearch=this.numSearch(mouseNum)
    ;if(0===$(".VO_state"+dataSearch).length)$(".ifVO"+dataSearch).hide(),
    $(".VO_status"+dataSearch).removeClass("reached").addClass("notReached").text("has NOT yet"),
    $(".VO_PND"+mouseNum+"_calc").text("NA"),
    $(".VO_mass"+mouseNum+"_calc").text("NA"),
    $(".VO_date"+mouseNum+"_calc").text("NA");else $(".VO_state"+dataSearch).each((i,e)=>{
    var $this=$(e);if("VO"===$this.val()){
    if($(".ifVO"+dataSearch).show(),anyHasReachedVO=true,
    hasReachedVO=true,thisPndAtVO=$this.closest(".addedRow").find(".mat_pnd").text(),
    thisVODate=$this.closest(".addedRow").find(".mat_date").text(),
    dateAtVO){
    if(new Date(thisVODate).getTime()<new Date(dateAtVO).getTime())dateAtVO=thisVODate,
    pndAtVO=thisPndAtVO
    }else dateAtVO=thisVODate,pndAtVO=thisPndAtVO
    ;$this.closest(".row").addClass("yellowRow")
    }else $this.closest(".row").removeClass("yellowRow")
    ;if(hasReachedVO)$(".VO_status"+dataSearch).removeClass("notReached").addClass("reached").text("has"),
    $(".VO_PND"+mouseNum+"_calc").text(pndAtVO),
    $(".VO_date"+mouseNum+"_calc").text(dateAtVO),
    this.watchVO_mass(mouseNum,true);else $(".ifVO"+dataSearch).hide(),
    $(".VO_status"+dataSearch).removeClass("reached").addClass("notReached").text("has NOT yet"),
    $(".VO_PND"+mouseNum+"_calc").text("NA"),
    $(".VO_mass"+mouseNum+"_calc").text("NA"),
    $(".VO_date"+mouseNum+"_calc").text("NA")})}
    if(anyHasReachedVO)$(".ifVO.msg").show(),
    this.watchFor1E(),this.adjustifOther();else $(".ifVO.msg").hide()
    ;this.resize()},
    watchVO_mass:function(mouseNum,knownStatus){
    var hasReachedVO=false,dataSearch=this.numSearch(mouseNum)
    ;if(true===knownStatus)hasReachedVO=true;else $(".VO_state"+dataSearch).each((i,e)=>{
    if($this=$(e),
    "VO"===$this.val())return hasReachedVO=true,false
    });if(hasReachedVO){
    var $VO_massVal=$("#VO_mass"+mouseNum).val()
    ;if($VO_massVal)$(".VO_mass"+mouseNum+"_calc").text($VO_massVal);else $(".VO_mass"+mouseNum+"_calc").text("[Enter VO Mass]")
    }else $(".VO_mass"+mouseNum+"_calc").text("NA")},
    watchFor1E:function(){
    for(var anyHasReached1E=false,hasReached1E=false,thisPndAt1E,this1EDate,this1EMass,pndAt1E,dateAt1E,massAt1E,totalMice=parseInt($("#numOffspring").val()),i=0;i<totalMice;i++){
    hasReached1E=false,
    pndAt1E=null,dateAt1E=null,massAt1E=null
    ;var mouseNum=i+1,dataSearch=this.numSearch(mouseNum)
    ;if($(".firstE_state"+dataSearch).each((i,e)=>{
    var $this=$(e);if("E"===$this.val()){
    if($(".if1E"+dataSearch).show(),anyHasReached1E=true,
    hasReached1E=true,thisPndAt1E=$this.closest(".addedRow").find(".mat_pnd").text(),
    this1EDate=$this.closest(".addedRow").find(".mat_date").text(),
    this1EMass=$this.closest(".addedRow").find(".firstE_mass").val(),
    dateAt1E){
    if(new Date(this1EDate).getTime()<new Date(dateAt1E).getTime())dateAt1E=this1EDate,
    pndAt1E=thisPndAt1E,massAt1E=this1EMass
    }else dateAt1E=this1EDate,pndAt1E=thisPndAt1E,
    massAt1E=this1EMass
    ;$this.closest(".row").addClass("yellowRow")
    }else $this.closest(".row").removeClass("yellowRow")
    }),hasReached1E)$(".firstE_status"+dataSearch).removeClass("notReached").addClass("reached").text("has"),
    $(".firstE_PND"+mouseNum+"_calc").text(pndAt1E),
    $(".firstE_date"+mouseNum+"_calc").text(dateAt1E),
    $(".firstE_mass"+mouseNum+"_calc").text(massAt1E);else $(".if1E"+dataSearch).hide(),
    $(".firstE_status"+dataSearch).removeClass("reached").addClass("notReached").text("has NOT yet"),
    $(".firstE_PND"+mouseNum+"_calc").text("NA"),
    $(".firstE_mass"+mouseNum+"_calc").text("NA"),
    $(".firstE_date"+mouseNum+"_calc").text("NA")}
    this.resize()},switchMassTable:function(pnd){
    if(pnd){var $massDiv=$("._"+pnd)
    ;$massDiv.show(),$(".massDiv:not(._"+pnd).hide(),
    this.resize()}else $(".massDiv").hide()
    ;this.resize()},
    createMaturationRow_VO:function(dateInputVal,mouseNum){
    var $div,selectBaseName,textareaBaseName,rowCount,selectName,textareaName,pndValue,dataSearch=this.numSearch(mouseNum)
    ;$div=$(".VO_div"+dataSearch),
    selectBaseName="vocheck"+mouseNum+"_",textareaBaseName="vocheck_other"+mouseNum+"_",
    rowCount=$div.find(".addedRow").length+1,
    rowClassName="Row_"+rowCount,selectName=selectBaseName+rowCount,
    textareaName=textareaBaseName+rowCount,
    pndValue=this.getPND(dateInputVal),$div.prepend($("<div></div>",{
    class:"row mt-2 addedRow "+rowClassName
    }).append($("<div></div>",{class:"col"
    }).append($("<select></select>",{name:selectName,
    id:selectName,class:"VO_state fullWidth VO",
    "data-num":mouseNum
    }).append('<option value="Closed">Closed</option>','<option value="|">Line |</option>','<option value="T">⊥</option>','<option value="Almost">Almost</option>','<option value="VO">Open</option>','<option value="Other">Other</option>').on("change",e=>{
    this.watchForVO(),
    this.showOther($(e.currentTarget))
    })).append($("<text"+"area></text"+"area>",{
    name:textareaName,id:textareaName,rows:1,
    class:"VO fullWidth ifOther autoAdjust",
    "data-num":mouseNum}).on("input",e=>{
    var el=e.currentTarget
    ;el.style.height="auto",el.style.height=el.scrollHeight+"px",
    this.resize()}))).append($("<div></div>",{
    class:"col mat_date","data-num":mouseNum
    }).append(dateInputVal)).append($("<div></div>",{
    class:"col mat_pnd","data-num":mouseNum
    }).append(pndValue))),this.resize()},
    createMaturationRow_1E:function(dateInputVal,mouseNum){
    var $div,selectBaseName,textareaBaseName,massBaseName,rowCount,selectName,textareaName,massName,pndValue,dataSearch=this.numSearch(mouseNum)
    ;$div=$(".firstE_div"+dataSearch),
    selectBaseName="firstecheck"+mouseNum+"_",textareaBaseName="firstecheck"+mouseNum+"_other_",
    massBaseName="firstemass"+mouseNum+"_",
    slideLocBaseName="slidelocation"+mouseNum+"_",
    rowCount=$div.find(".addedRow").length+1,
    rowClassName="Row_"+rowCount,selectName=selectBaseName+rowCount,
    textareaName=textareaBaseName+rowCount,
    massName=massBaseName+rowCount,slideLocName=slideLocBaseName+rowCount,
    pndValue=this.getPND(dateInputVal),
    $div.prepend($("<div></div>",{
    class:"row mt-2 addedRow "+rowClassName
    }).append($("<div></div>",{class:"col"
    }).append($("<select></select>",{name:selectName,
    id:selectName,
    class:"firstE_state fullWidth firstE",
    "data-num":mouseNum
    }).append('<option value="">[Select]</option>','<option value="D">Diestrus</option>','<option value="P">Proestrus</option>','<option value="E">Estrus</option>','<option value="Other">Other</option>').on("change",e=>{
    this.watchFor1E(),
    this.showOther($(e.currentTarget))
    })).append($("<text"+"area></text"+"area>",{
    name:textareaName,id:textareaName,rows:1,
    class:"firstE fullWidth ifOther autoAdjust",
    "data-num":mouseNum}).on("input",e=>{
    var el=e.currentTarget
    ;el.style.height="auto",el.style.height=el.scrollHeight+"px",
    this.resize()}))).append($("<div></div>",{
    class:"col"}).append($("<input></input>",{
    name:massName,id:massName,type:"number",
    class:"firstE fullWidth firstE_mass",
    "data-num":mouseNum}).on("input",()=>{
    this.watchFor1E()}))).append($("<div></div>",{
    class:"col"}).append($("<input></input>",{
    name:slideLocName,id:slideLocName,
    class:"firstE fullWidth sliceLoc",
    "data-num":mouseNum}))).append($("<div></div>",{
    class:"col mat_date","data-num":mouseNum
    }).append(dateInputVal)).append($("<div></div>",{
    class:"col mat_pnd","data-num":mouseNum
    }).append(pndValue))),this.resize()},
    removeMaturationRow:function(whichPheno,mouseNum){
    var dataSearch=this.numSearch(mouseNum)
    ;if("VO"===whichPheno)var $div=$(".VO_div"+dataSearch);else if("firstE"===whichPheno)var $div=$(".firstE_div"+dataSearch)
    ;$div.find(".addedRow").last().remove(),
    this.resize()},calcValues:function(){
    $(".tableDiv").find("tr").each((i,e)=>{
    $("td",e).each((i,e)=>{var value=$(e).text()
    ;if(""===value||"NaN"===value)$(e).text("NA")})
    }),this.resize()},
    downloadCSV:function(csv,filename){
    var csvFile,downloadLink;csvFile=new Blob([csv],{
    type:"text/csv"
    }),downloadLink=document.createElement("a"),downloadLink.download=filename,
    downloadLink.href=window.URL.createObjectURL(csvFile),
    downloadLink.style.display="none",
    document.body.appendChild(downloadLink),downloadLink.click()
    },exportTableToCSV:function(filename,table){
    for(var csv=[],datatable=document.getElementById(table),rows=datatable.querySelectorAll("tr"),i=0;i<=$("#numOffspring").val()&&i<rows.length;i++){
    for(var row=[],cols=rows[i].querySelectorAll("td, th"),j=0;j<cols.length;j++){
    var cellText='"'+cols[j].innerText+'"'
    ;row.push(cellText)}csv.push(row.join(","))}
    this.downloadCSV(csv.join("\n"),filename)},
    copyTable:function($table,copyHead,$divForCopy,transpose=false){
    var $temp=$("<text"+"area style='opacity:0;'></text"+"area>"),rows=[],rowNum=0
    ;if(copyHead)$table.find("thead").children("tr").each((i,e)=>{
    if(transpose)rowNum=0
    ;if($(e).find("td, th").each((i,e)=>{
    if(void 0===rows[rowNum])rows[rowNum]=[]
    ;if(rows[rowNum].push($(e).text()),transpose)rowNum++
    }),!transpose)rowNum++})
    ;$table.find("tbody").children("tr").slice(0,parseInt($("#numOffspring").val())).each((i,e)=>{
    if(transpose)rowNum=0
    ;if($(e).find("td, th").each((i,e)=>{
    if(void 0===rows[rowNum])rows[rowNum]=[]
    ;if($(e).text())var addText=$(e).text();else var addText="NA"
    ;if(console.log(addText),
    rows[rowNum].push(addText),transpose)rowNum++
    }),!transpose)rowNum++})
    ;for(var i=0;i<rows.length;i++)rows[i]=rows[i].join("\t")
    ;$divForCopy.show(),$temp.append(rows.join("\n")),
    $temp.appendTo($divForCopy).select(),
    document.execCommand("copy"),$divForCopy.hide(),
    $temp.remove()},
    toggleTableFuncs:function($tableDiv,$errorMsgDiv){
    this.resize(),this.data_valid_form($errorMsgDiv),
    this.calcValues(),$tableDiv.toggle(),
    this.parent_class.resize_container()},
    toCSVFuncs:function(fileName,tableID,$errorMsg){
    var data_valid=this.data_valid_form($errorMsg)
    ;if(data_valid)this.calcValues(),this.exportTableToCSV(fileName,tableID),
    $errorMsg.html("<span style='color:grey; font-size:24px;'>Saved successfully</span>");else $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Did not export</span>")
    ;this.resize()},
    copyDataFuncs:function($copyHead,$tableToCopy,$tableDiv,$errorMsg,$divForCopy){
    var data_valid=this.data_valid_form($errorMsg),copyHead
    ;if($copyHead.is(":checked"))copyHead=true;else copyHead=false
    ;if(this.calcValues(),
    data_valid)$tableDiv.show(),this.resize(),this.copyTable($tableToCopy,copyHead,$divForCopy),
    $errorMsg.html("<span style='color:grey; font-size:24px;'>Copied attempted</span>");else $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>")
    ;this.resize()},makeHTMLforMice:function(numMice){
    $(".VO_div").html(""),$(".fistE_div").html(""),
    this.makeMassSelect(),this.makeMassEntry(numMice),
    this.makeDatesList(),this.makeVOStatusMsg(numMice),
    this.make1EStatusMsg(numMice),
    this.makeDemoEntries(numMice),this.makeMassRows(numMice),
    this.makeDemoRows(numMice)},
    makeVOStatusMsg:function(numMice){
    var $VOmsgDiv=$("#VOmsgDiv")
    ;for($VOmsgDiv.html(""),i=0;i<numMice;i++){
    var mouseNum=i+1
    ;$VOmsgDiv.append($("<div></div>",{
    class:"mouse"+mouseNum
    }).append('Mouse <span class="mouseID'+mouseNum+'_calc">__</span> '+'<span class="tailMark'+mouseNum+'_calc"> </span> <span class="VO_status notReached" data-num="'+mouseNum+'">has NOT yet</span> had vaginal opening '+'<span class="ifVO" data-num="'+mouseNum+'">on PND <span class="VO_PND'+mouseNum+'_calc"> </span> with a mass of <span class="VO_mass'+mouseNum+'_calc"> </span> g</span>'))
    }},make1EStatusMsg:function(numMice){
    var $firstEmsgDiv=$("#firstEmsgDiv")
    ;for($firstEmsgDiv.html(""),i=0;i<numMice;i++){
    var mouseNum=i+1
    ;$firstEmsgDiv.append($("<div></div>",{
    class:"mouse"+mouseNum+" ifVO","data-num":mouseNum
    }).append('Mouse <span class="mouseID'+mouseNum+'_calc">__</span> '+'<span class="tailMark'+mouseNum+'_calc"> </span> <span class="firstE_status notReached" data-num="'+mouseNum+'">has NOT yet</span> had first estrus '+'<span class="if1E" data-num="'+mouseNum+'">on PND <span class="firstE_PND'+mouseNum+'_calc"> </span> with a mass of <span class="firstE_mass'+mouseNum+'_calc"> </span> g</span>'))
    }},makeDemoEntries:function(numMice){
    var $demoEntryDiv=$("#demoEntryDiv")
    ;$demoEntryDiv.html("")
    ;var showChecked="col-12 hideView editDemoChecked"
    ;for(i=0;i<numMice;i++){var mouseNum=i+1
    ;$demoEntryDiv.append($("<div></div>",{
    class:"mouse"+mouseNum+" row mt-2"
    }).append($("<div></div>",{
    class:"col-6 col-md-3 container"
    }).append($("<div></div>",{class:"row"
    }).append($("<div></div>",{class:"col-12"
    }).append("<h4 class='needForTableLab'>Mouse "+mouseNum+" ID</h4")).append($("<div></div>",{
    class:showChecked+" mouse"+mouseNum
    }).append('<input type="text" class="simpleCalc mouseID" id="mouseID'+mouseNum+'" name="mouseid'+mouseNum+'" data-num="'+mouseNum+'"/>')).append($("<div></div>",{
    class:"col-12 mouseID"+mouseNum+"_calc mouse"+mouseNum
    })))).append($("<div></div>",{
    class:"col-6 col-md-3 container"
    }).append($("<div></div>",{class:"row"
    }).append($("<div></div>",{class:"col-12"
    }).append("<h4 class='needForTableLab'>Full ID "+mouseNum+"</h4")).append($("<div></div>",{
    class:showChecked+" mouse"+mouseNum
    }).append('<input type="text" class="simpleCalc mouseID_spec" id="mouseID_spec'+mouseNum+'" name="mouseidspec'+mouseNum+'" data-num="'+mouseNum+'"/>')).append($("<div></div>",{
    class:"col-12 mouseID_spec"+mouseNum+"_calc mouse"+mouseNum
    })))).append($("<div></div>",{
    class:"col-6 col-md-3 container"
    }).append($("<div></div>",{class:"row"
    }).append($("<div></div>",{class:"col-12"
    }).append("<h4>Ear Tag "+mouseNum+"</h4")).append($("<div></div>",{
    class:showChecked+" mouse"+mouseNum
    }).append($("<input></input>",{
    name:"eartag"+mouseNum,id:"earTag"+mouseNum,
    type:"number",class:"simpleCalc"
    }))).append($("<div></div>",{
    class:"col-12 earTag"+mouseNum+"_calc mouse"+mouseNum
    })))).append($("<div></div>",{
    class:"col-6 col-md-3 container"
    }).append($("<div></div>",{class:"row"
    }).append($("<div></div>",{class:"col-12"
    }).append("<h4>Tail Mark "+mouseNum+"</h4")).append($("<div></div>",{
    class:showChecked
    }).append('<input type="button" value="Red |" id="redButton'+mouseNum+'" name="redbutton'+mouseNum+'" class="redButton mouse'+mouseNum+'" data-num="'+mouseNum+'"/> '+'<input type="button" value="Black |" id="blackButton'+mouseNum+'" name="blackbutton'+mouseNum+'" class="blackButton mouse'+mouseNum+'" data-num="'+mouseNum+'"/> '+'<input type="button" value="Clear" id="clearButton'+mouseNum+'" name="clearbutton'+mouseNum+'" class="clearButton mouse'+mouseNum+'" data-num="'+mouseNum+'"/> '+'<span class="tailMark" id="tailMark'+mouseNum+'" data-num="'+mouseNum+'"> </span>')).append($("<div></div>",{
    class:"col-12 tailMark"+mouseNum+"_calc mouse"+mouseNum
    })))))}},makeMassRows:function(numMice){
    var $massTable=$("#massTable"),pnds=this.massDays
    ;for(i=0;i<numMice;i++){
    var mouseNum=i+1,$tr=$massTable.find("tr.mouse"+mouseNum).html("")
    ;for($tr.append('<td class="mouseID'+mouseNum+'_calc"> </td>'),
    j=0;j<pnds.length;j++){var pnd=pnds[j]
    ;$tr.append($("<td></td>",{
    class:"mass_pnd"+pnd+"_"+mouseNum+"_calc"}))}}},
    makeMassSelect:function(){
    var $select=$("#massSelect"),pnds=this.massDays
    ;for(i=0;i<pnds.length;i++){var pnd=pnds[i]
    ;$select.append('<option value="pnd'+pnd+'">PND '+pnd+"</option>")
    }},makeDatesList:function(){
    var $list=$("#datesList"),pnds=this.datesList
    ;$list.html(""),$list.append('<div class="row"></div>')
    ;var $row=$list.find(".row")
    ;for(i=0;i<pnds.length;i++){var pnd=pnds[i]
    ;$row.append($("<div></div>",{class:"med3"
    }).append($("<strong></strong>").append("PND "+pnd+": ")).append($("<span></span>",{
    class:"pnd pnd"+pnd})))}},
    makeMassEntry:function(numMice=5){
    var $entryDiv=$("#forMassEntry"),pnds=this.massDays
    ;for(i=0;i<pnds.length;i++){var pnd=pnds[i]
    ;for($entryDiv.append($("<div></div>",{
    class:"container mt-2 _pnd"+pnd+" massDiv"
    }).append($("<div></div>",{
    class:"row align-items-end mt-2 blackBackground"
    }).append($("<div></div>",{class:"myLeftCol2"
    }).append("PND "+pnd+":")).append($("<div></div>",{
    class:"col pnd"+pnd
    })))),j=0;j<numMice;j++)if(mouseNum=j+1,$entryDiv.find(".massDiv").last().append($("<div></div>",{
    class:"entry","data-num":mouseNum
    })),this.addMassAGDRow($entryDiv.find(".entry").last(),"mass",pnd,mouseNum),
    this.checkInArray(pnd,this.agdDays))this.addMassAGDRow($entryDiv.find(".entry").last(),"agd",pnd,mouseNum)
    }},addMassAGDRow:function($div,type,pnd,mouseNum){
    var text
    ;if("mass"===type)text="Mass (g):",idText="mass";else if("agd"==type)text="AGD:",
    idText="AGD";$div.append($("<div></div>",{
    class:"row mt-2"}).append($("<div></div>",{
    class:"myLeftCol3"
    }).append(text)).append($("<div></div>",{
    class:"col"}).append($("<input></input>",{
    type:"number",class:"simpleCalc",
    name:type+"_pnd"+pnd+"_"+mouseNum,
    id:idText+"_pnd"+pnd+"_"+mouseNum,
    "data-num":mouseNum}))))},
    makeDemoRows:function(numMice){
    var $demoTable=$("#demoTable")
    ;for(i=0;i<numMice;i++){
    var mouseNum=i+1,$tr=$demoTable.find("tr.mouse"+mouseNum).html("")
    ;$tr.append('<td class="mouseID_spec'+mouseNum+'_calc"></td>'+'<td class="mouseID'+mouseNum+'_calc"></td>'+'<td class="earTag'+mouseNum+'_calc"></td>'+"<td>F</td>"+'<td class="damID_calc"></td>'+'<td class="cageNum_calc"></td>')
    }}};
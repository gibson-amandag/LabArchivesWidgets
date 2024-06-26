my_widget_script={mouseNums:[],sampleNums:[],
    startTime:"",init:function(mode,json_data){
    var parsedJson=this.parseInitJson(json_data)
    ;if(this.makeVehCard(),this.initDynamicContent(parsedJson),
    $(".mouseDose").each((i,e)=>{
    console.log("dosages before parent init",$(e).val())
    }),window.onresize=(()=>this.resize()),
    this.addEventListeners(),this.parent_class.init(mode,()=>JSON.stringify(parsedJson.widgetData)),
    $(".mouseDose").each((i,e)=>{
    console.log("dosages after parent init",$(e).val())
    }),parsedJson.sampleNums)$("#numSamples").val(parsedJson.sampleNums.length)
    ;this.addRequiredFieldIndicators(),
    this.setUpInitialState(),this.adjustForMode(mode)
    },to_json:function(){
    var widgetJsonString=this.parent_class.to_json(),dynamicContent=this.getDynamicContent(),output={
    widgetData:JSON.parse(widgetJsonString),
    mouseNums:dynamicContent.mouseNums,
    sampleNums:dynamicContent.sampleNums,
    doseNums:dynamicContent.doseNums,
    doses:dynamicContent.doses}
    ;return console.log(output.widgetData[9]),JSON.stringify(output)
    },from_json:function(json_data){
    var parsedJson=JSON.parse(json_data)
    ;this.parent_class.from_json(JSON.stringify(parsedJson.widgetData))
    },test_data:function(){
    var testData=JSON.parse(this.parent_class.test_data()),output={
    widgetData:testData,mouseNums:[2,4],
    sampleNums:[1,2,3],doseNums:[1,2],doses:{1:{
    id:"10"},2:{id:"3"}}}
    ;return JSON.stringify(output)},
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
    }}),fail)return alert(fail_log);else{
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
    if(parsedJson.mouseNums)for(var i=0;i<parsedJson.mouseNums.length;i++){
    var mouse=parsedJson.mouseNums[i]
    ;this.makeMouseCard(mouse)}
    if(parsedJson.sampleNums)this.makeSampleContent(parsedJson.sampleNums.length)
    ;if(parsedJson.doses)this.doses=parsedJson.doses;else this.doses={}
    ;if(parsedJson.doseNums)for(var i=0;i<parsedJson.doseNums.length;i++)dose=parsedJson.doseNums[i],
    this.doseNums.push(dose),
    this.makeDoseCard(dose);else this.doseNums=[]},
    adjustForMode:function(mode){
    if("edit"!==mode&&"edit_dev"!==mode)$(".disableOnView").prop("disabled",true),
    $(".hideView").hide(),
    $("input[type='date']").removeClass(".hasDatePicker");else if($("input[type='date']").each((i,e)=>{
    this.checkDateFormat($(e))
    }),$("input[type='time']").each((i,e)=>{
    this.checkTimeFormat($(e))
    }),$(".table").hide(),$("#expDate").val()&&$("#numSamples").val()>1)$(".samplesDiv").insertBefore(".info")
    },addEventListeners:function(){
    $(".toggleTable").on("click",e=>{
    var tableID=$(e.currentTarget).data("table"),$table=$("#"+tableID)
    ;this.toggleTableFuncs($table)
    }),$(".toCSV").on("click",e=>{
    var tableID=$(e.currentTarget).data("table"),dateToday=luxon.DateTime.now().toISODate(),fileName="stress_"+tableID+"_"+dateToday,$errorMsg=$("#errorMsg")
    ;this.toCSVFuncs(fileName,tableID,$errorMsg)
    }),$(".copyData").on("click",e=>{
    var tableID=$(e.currentTarget).data("table"),tableSearch=this.tableSearch(tableID),$copyHead=$(".copyHead"+tableSearch),$tableToCopy=$("#"+tableID),$tableDiv=$tableToCopy.parent(),$errorMsg=$("#errorMsg"),$divForCopy=$("#forCopy")
    ;this.copyDataFuncs($copyHead,$tableToCopy,$tableDiv,$errorMsg,$divForCopy)
    })},isValidTime:function(timeString){
    var regEx="^(((([0-1][0-9])|(2[0-3])):[0-5][0-9]))$"
    ;if(!timeString.match(regEx))return false;else return true
    },isTimeSupported:function(){
    var input=document.createElement("input")
    ;input.setAttribute("type","time"),input.setAttribute("name","testTime")
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
    ;input.setAttribute("type","date"),input.setAttribute("name","testdate")
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
    }),this.resize()}},
    addRequiredFieldIndicators:function(){
    $(".needForTableLab").each((i,e)=>{
    $(e).html("<span style='color:blue'>#</span>"+$(e).html())
    }),$(".requiredLab").each((i,e)=>{
    $(e).html("<span style='color:red'>*</span>"+$(e).html())
    })},setUpInitialState:function(){
    this.isDateSupported(),this.isTimeSupported(),$("input[type='date']").prop("placeholder","YYYY-MM-DD").on("change",e=>{
    this.checkDateFormat($(e.currentTarget))
    }),$("input[type='time']").prop("placeholder","hh:mm").on("change",e=>{
    this.checkTimeFormat($(e.currentTarget))
    }),$(".myLeftCol").addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right"),
    $("textarea.autoAdjust").each((i,e)=>{
    var height=e.scrollHeight;if(0==height){
    text=$(e).val(),$(".forTextBox").show(),
    $("#forSizing").val(text)
    ;var forSizing=document.getElementById("forSizing")
    ;height=forSizing.scrollHeight,
    $(".forTextBox").hide()}
    e.setAttribute("style","height:"+height+"px;overflow-y:hidden;")
    }).on("input",e=>{
    e.currentTarget.style.height="auto",e.currentTarget.style.height=e.currentTarget.scrollHeight+"px",
    this.resize()}),$("#numSamples").on("input",e=>{
    var totalNumSamples=$(e.currentTarget).val()
    ;if(totalNumSamples)totalNumSamples=parseInt(totalNumSamples);else totalNumSamples=0
    ;this.makeSampleContent(totalNumSamples)
    }),$(".otherSample").each((i,e)=>{
    this.showIfOtherCheck($(e))}).on("change",e=>{
    this.showIfOtherCheck($(e.currentTarget))
    }),$("#timeZone").each((i,e)=>{
    if("est"==$(e).val())startHour=9;else startHour=10
    ;this.startTime=luxon.DateTime.fromObject({
    hour:startHour,minute:30
    }),this.printExpTimes(),this.watchSampleLabel()
    }).on("change",e=>{
    if("est"==$(e.currentTarget).val())startHour=9;else startHour=10
    ;this.startTime=luxon.DateTime.fromObject({
    hour:startHour,minute:30
    }),this.printExpTimes(),this.watchSampleLabel()
    }),$("#addMouse").on("click",e=>{
    if(this.mouseNums.length>0)var lastMouse=this.mouseNums[this.mouseNums.length-1],mouseNum=lastMouse+1;else var mouseNum=1
    ;this.makeMouseCard(mouseNum)
    ;var totalNumSamples=$("#numSamples").val()
    ;if(totalNumSamples)totalNumSamples=parseInt(totalNumSamples);else totalNumSamples=0
    ;this.makeSampleContent(totalNumSamples)
    }),$.each(my_widget_script.mouseNums,function(){
    my_widget_script.watchMouseID(this)
    }),$.each(my_widget_script.sampleNums,function(){
    my_widget_script.watchSampleLabel(this)
    }),$(".treatment").each((i,e)=>{
    if("control"==$(e).val())$(e).val("CON");else if("stress"==$(e).val())$(e).val("ALPS")
    }),$(".watch").each((i,e)=>{this.watchValue($(e))
    }),$(".calcNutella").on("change",e=>{
    var mouseNum=$(e.currentTarget).data("mouse")
    ;this.calcNutella(mouseNum)
    }),$(".calcAllNutella").on("change",e=>{
    this.calcAllNutella()
    }),this.calcAllNutella(),$("#drugName").each((i,e)=>{
    this.showOther($(e))}).on("input",e=>{
    this.showOther($(e.currentTarget)),this.changeStockConc($(e.currentTarget))
    }),$("#addDose").on("click",e=>{
    if(this.doseNums.length>0)var lastDose=this.doseNums[this.doseNums.length-1],doseNum=lastDose+1;else var doseNum=1
    ;var inArray=this.checkInArray(doseNum,this.doseNums)
    ;if(!inArray)this.doseNums.push(doseNum),
    this.doses[doseNum]={},this.makeDoseCard(doseNum)
    }),$("#stockConc").on("change",e=>{
    this.calcAllStock()
    }),this.calcAllStock(),this.calcVehicle(),this.resize()
    },makeVehCard:function(){var $div=$("#vehCards")
    ;$div.html("")
    ;var row="row mt-2",col="col-12 col-lg-6"
    ;$div.append($("<div></div>",{
    class:"col col-md-6 mt-2 vehCard"
    }).append($("<div></div>",{class:"card"
    }).append($("<button></button>",{
    class:"card-header vehHeader",type:"button"
    }).on("click",e=>{
    this.toggleCard($(e.currentTarget))
    }).append("Vehicle")).append($("<div></div>",{
    class:"card-body collapse"
    }).append($("<div></div>",{class:row
    }).append($("<div></div>",{class:col
    }).append("<h4>Volume (µL/Nutella dose):</h4>")).append($("<div></div>",{
    class:"col"}).append($("<input></input>",{
    type:"number",id:"vehVol",name:"vehvol",
    class:"vehVol fullWidth watch vehCalc",
    "data-watch":"veh"})))).append($("<div></div>",{
    class:row}).append($("<div></div>",{class:col
    }).append("Amount Nutella/mouse:")).append($("<div></div>",{
    class:"col"}).append($("<input></input>",{
    type:"number",val:60,id:"nutellaPerMouseVeh",
    name:"nutellapermouseveh",
    class:"nutellaPerMouseVeh fullWidth watch vehCalc",
    "data-watch":"nutellaPerMouseVeh"
    })))).append($("<div></div>",{class:row
    }).append($("<div></div>",{class:col
    }).append("Measured Nutella (mg):")).append($("<div></div>",{
    class:"col"}).append($("<input></input>",{
    type:"number",id:"amntNutellaVeh",
    name:"amntnutellaveh",
    class:"amntNutellaVeh fullWidth watch vehCalc",
    "data-watch":"amntNutellaVeh"
    })))).append($("<div></div>",{class:row
    }).append($("<div></div>",{class:col
    }).append("# of Nutella doses:")).append($("<div></div>",{
    class:"col numMiceDosesVeh"
    }))).append($("<div></div>",{class:row
    }).append($("<div></div>",{class:col
    }).append("Vehicle to add:")).append($("<div></div>",{
    class:"col calcedVehicle"
    })))))),$(".watch").on("input",e=>{
    this.watchValue($(e.currentTarget))
    }),$(".vehCalc").on("change",e=>{
    this.calcVehicle()}),this.resize()},
    getCurrentDoseChoices:function(){
    for(var mice=this.mouseNums,currentSels={},i=0;i<mice.length;i++){
    var mouse=mice[i],mouseSearch=this.mouseSearch(mouse),mouseSel=$(".mouseDose"+mouseSearch).val()
    ;currentSels[mouse]={},
    currentSels[mouse].search=mouseSearch,currentSels[mouse].sel=mouseSel
    }return currentSels},updateDoseChoices:function(){
    var mice=this.mouseNums,currentSels=this.getCurrentDoseChoices(),$doseSelects=$(".mouseDose")
    ;$doseSelects.html(""),
    $doseSelects.append($("<option></option>",{value:0
    }).append("Vehicle"));var doses=this.doses
    ;for(var doseNum in doses){console.log(doseNum)
    ;var dosage=doses[doseNum].id
    ;if(!dosage>0)dosage=doseNum,doseText="Dose #"+doseNum;else doseText=dosage+"mg/kg"
    ;$doseSelects.append($("<option></option>",{
    value:dosage}).append(doseText))}
    for(var i=0;i<mice.length;i++){
    var mouse=mice[i],mouseSearch=currentSels[mouse].search,prevSel=currentSels[mouse].sel
    ;$(".mouseDose"+mouseSearch).val(prevSel)}},
    deleteDoseFuncs:function(el){
    var doseNum=$(el).data("dose")
    ;console.log($(el),doseNum),this.runIfConfirmed("Are you sure that you wish to delete this dose?",()=>{
    var index=this.doseNums.indexOf(doseNum)
    ;if(index>-1)this.doseNums.splice(index,1)
    ;delete this.doses[doseNum]
    ;var doseSearch=this.doseSearch(doseNum)
    ;$(doseSearch).remove(),this.updateDoseChoices()
    },el),this.resize()},
    makeDoseCard:function(doseNum){
    this.updateDoseChoices();var $div=$("#doseCards")
    ;if(!$div.find(".card").length)$div.html("")
    ;var row="row mt-2",col="col-12 col-lg-6"
    ;$div.append($("<div></div>",{
    class:"col col-md-6 mt-2 doseCard",
    "data-dose":doseNum}).append($("<div></div>",{
    class:"card"}).append($("<button></button>",{
    class:"card-header doseHeader",type:"button",
    "data-calc":"dose","data-dose":doseNum
    }).on("click",e=>{
    this.toggleCard($(e.currentTarget))
    }).append("Dose "+doseNum)).append($("<div></div>",{
    class:"card-body collapse"
    }).append($("<div></div>",{class:row
    }).append($("<div></div>",{class:col
    }).append("<h4>Dosage (mg/kg):</h4>")).append($("<div></div>",{
    class:"col"}).append($("<input></input>",{
    type:"number","data-dose":doseNum,
    id:"dosage"+doseNum,name:"dosage"+doseNum,
    class:"dosage fullWidth watch stockCalc",
    "data-watch":"dose"}).on("change",e=>{
    this.doses[doseNum]["id"]=$(e.currentTarget).val(),
    this.updateDoseChoices()
    })))).append($("<div></div>",{
    class:row+" hideView"}).append($("<div></div>",{
    class:col
    }).append("Delete:")).append($("<div></div>",{
    class:"col"}).append($("<input></input>",{
    type:"button",value:"Delete Dose",
    "data-dose":doseNum,id:"deleteDose"+doseNum,
    name:"deletedose"+doseNum,
    class:"deleteDose fullWidth"}).on("click",e=>{
    this.deleteDoseFuncs(e.currentTarget)
    })))).append($("<div></div>",{class:row
    }).append($("<div></div>",{class:col
    }).append("Avg mouse mass (g):")).append($("<div></div>",{
    class:"col"}).append($("<input></input>",{
    type:"number",val:25,"data-dose":doseNum,
    id:"avgMouseMass"+doseNum,
    name:"avgmousemass"+doseNum,
    class:"avgMouseMass fullWidth watch stockCalc",
    "data-watch":"avgMouseMass"
    })))).append($("<div></div>",{class:row
    }).append($("<div></div>",{class:col
    }).append("Amount Nutella/mouse:")).append($("<div></div>",{
    class:"col"}).append($("<input></input>",{
    type:"number",val:60,"data-dose":doseNum,
    id:"nutellaPerMouse"+doseNum,
    name:"nutellapermouse"+doseNum,
    class:"nutellaPerMouse fullWidth watch stockCalc",
    "data-watch":"nutellaPerMouse"
    })))).append($("<div></div>",{class:row
    }).append($("<div></div>",{class:col
    }).append("Measured Nutella (mg):")).append($("<div></div>",{
    class:"col"}).append($("<input></input>",{
    type:"number","data-dose":doseNum,
    id:"amntNutella"+doseNum,
    name:"amntnutella"+doseNum,
    class:"amntNutella fullWidth watch stockCalc",
    "data-watch":"amntNutella"
    })))).append($("<div></div>",{class:row
    }).append($("<div></div>",{class:col
    }).append("Stock per mouse:")).append($("<div></div>",{
    class:"col stockPerMouse","data-dose":doseNum
    }))).append($("<div></div>",{class:row
    }).append($("<div></div>",{class:col
    }).append("# of Nutella doses:")).append($("<div></div>",{
    class:"col numMiceDoses","data-dose":doseNum
    }))).append($("<div></div>",{class:row
    }).append($("<div></div>",{class:col
    }).append("Stock to add:")).append($("<div></div>",{
    class:"col calcedStock","data-dose":doseNum
    })))))),$(".watch").on("input",e=>{
    this.watchValue($(e.currentTarget))
    }),$(".stockCalc").on("change",e=>{
    this.calcStock($(e.currentTarget).data("dose"))
    }),this.resize()},toggleCard:function($cardHead){
    $cardHead.next().toggleClass("collapse"),
    $cardHead.next().find("textarea.autoAdjust").each((i,e)=>{
    if(!$(e).is(":hidden"))e.setAttribute("style","height:"+e.scrollHeight+"px;overflow-y:hidden;")
    }),this.resize()},
    addToStartTime:function(hoursToAdd){
    var newTime=this.startTime.plus({hours:hoursToAdd
    }),newTimeString=newTime.toLocaleString(luxon.DateTime.TIME_24_SIMPLE)
    ;return newTimeString},printExpTimes:function(){
    $(".expStartTime").text(this.addToStartTime(0)),
    $(".expRestraintTime").text(this.addToStartTime(1)),
    $(".expScentTime").text(this.addToStartTime(3)),
    $(".expEndTime").text(this.addToStartTime(5))},
    calcAllStock:function(){
    if(this.doseNums.length>0)for(doseNum in this.doses)this.calcStock(doseNum)
    },doseNums:[],doses:{},stockConcs:{cort:25},
    changeStockConc:function($drugNameEl){
    var drug=$drugNameEl.val(),conc=this.stockConcs[drug]
    ;if(conc)$("#stockConc").val(conc);else $("#stockConc").val("")
    },calcStock:function(doseNum){
    var doseSearch=this.doseSearch(doseNum),stockConc=$("#stockConc").val(),stockAmnt,stockAmntPerMouse,nutellaForMouse
    ;if(stockConc>0){
    var dosage=$(".dosage"+doseSearch).val()
    ;if(dosage>0){
    var avgMouse=$(".avgMouseMass"+doseSearch).val()
    ;if(avgMouse>0){
    var nutellaPerMouse=$(".nutellaPerMouse"+doseSearch).val()
    ;if(nutellaPerMouse>0){
    var mouseMass=$(".mouseMass"+doseSearch).val()
    ;if(mouseMass>0)nutellaForMouse=mouseMass/avgMouse*nutellaPerMouse
    ;var amntNutella=$(".amntNutella"+doseSearch).val()
    ;if(amntNutella>0)stockAmntPerMouse=avgMouse*(1/1e3)*dosage*(1/stockConc)*1e3,
    numMiceDoses=amntNutella/nutellaPerMouse,
    stockAmnt=numMiceDoses*stockAmntPerMouse;else stockAmnt="{Enter measured Nutella}"
    }else stockAmnt="{Enter Nutella/mouse}"
    }else stockAmnt="{Enter avg mouse mass}"
    }else stockAmnt="{Enter dosage}"
    }else stockAmnt="{Enter stock conc}"
    ;if(isNaN(stockAmnt))stockAmntPerMouse=stockAmnt,
    numMiceDoses=stockAmnt,nutellaForMouse=stockAmnt;else{
    if(stockAmnt>0)stockAmnt=+stockAmnt.toFixed(2)+"µL";else stockAmnt="{double check entries}"
    ;if(stockAmntPerMouse>0)stockAmntPerMouse=+stockAmntPerMouse.toFixed(2)+"µL";else stockAmntPerMouse="{double check entries}"
    ;if(numMiceDoses>0)numMiceDoses=+numMiceDoses.toFixed(2);else numMiceDoses="{double check entries}"
    ;if(nutellaForMouse>0)nutellaForMouse=+nutellaForMouse.toFixed(2)+"mg";else nutellaForMouse="{double check entries}"
    }
    $(".stockPerMouse"+doseSearch).html(stockAmntPerMouse),$(".numMiceDoses"+doseSearch).html(numMiceDoses),
    $(".calcedStock"+doseSearch).html(stockAmnt),
    $(".adjNutellaForMouse"+doseSearch).html(nutellaForMouse)
    },calcVehicle:function(){
    var vehAmnt,vehVol=$(".vehVol").val()
    ;if(vehVol>0){
    var nutellaPerMouse=$(".nutellaPerMouseVeh").val()
    ;if(nutellaPerMouse>0){
    var amntNutella=$(".amntNutellaVeh").val()
    ;if(amntNutella>0)numMiceDoses=amntNutella/nutellaPerMouse,
    vehAmnt=numMiceDoses*vehVol;else vehAmnt="{Enter measured Nutella}"
    }else vehAmnt="{Enter Nutella/mouse}"
    }else vehAmnt="{Enter dosage}"
    ;if(isNaN(vehAmnt))numMiceDoses=vehAmnt;else{
    if(vehAmnt>0)vehAmnt=+vehAmnt.toFixed(2)+"µL";else vehAmnt="{double check entries}"
    ;if(numMiceDoses>0)numMiceDoses=+numMiceDoses.toFixed(2);else numMiceDoses="{double check entries}"
    }
    $(".numMiceDosesVeh").html(numMiceDoses),$(".calcedVehicle").html(vehAmnt)
    },showOther:function($el){if("other"===$el.val()){
    var $other=$el.next(".ifOther").show(),thisScrollHeight=$other.prop("scrollHeight")
    ;$other.css("height",thisScrollHeight).css("overflow-y","hidden")
    }else $el.next(".ifOther").hide();this.resize()},
    resize:function(){
    this.parent_class.resize_container()},
    getDynamicContent:function(){var dynamicContent={
    mouseNums:this.mouseNums,
    sampleNums:this.sampleNums,doseNums:this.doseNums,
    doses:this.doses};return dynamicContent},
    data_valid_form:function(){var valid=true
    ;if($(".needForTable").each((i,e)=>{
    if(!$(e).val())valid=false
    }),!valid)$("#errorMsg").html("<span style='color:red; font-size:36px;'>Please fill out all elements marked by a</span><span style='color:blue; font-size:36px;'> blue #</span>");else $("#errorMsg").html("")
    ;return valid},
    checkInArray:function(searchVal,array){
    var proceed=-1!==$.inArray(searchVal,array)
    ;return proceed},watchMouseID:function(mouseNum){
    var mouseSearch=this.mouseSearch(mouseNum),mouseID=$(".mouseID"+mouseSearch).val(),shortID=$(".shortID"+mouseSearch).val()
    ;if(!mouseID)mouseID="[Enter Mouse "+mouseNum+" ID]"
    ;if($(".mouseIDCalc"+mouseSearch).html(mouseID),
    mouseID==shortID||!shortID)shortID="";else shortID=" - "+shortID
    ;$(".shortIDCalc"+mouseSearch).html(shortID)},
    watchSampleLabel:function(sampleNum){
    var sampleSearch=this.sampleSearch(sampleNum),sampleID=$(".sampleLabel"+sampleSearch).val(),sampleTime=$(".sampleTime"+sampleSearch).val()
    ;if(!sampleID)sampleID="Sample "+sampleNum
    ;if(sampleTime)sampleTime="Hr "+sampleTime+" - "+this.addToStartTime(parseFloat(sampleTime)),
    sampleID=sampleTime+" - "+sampleID
    ;$(".sampleLabelCalc"+sampleSearch).html(sampleID)
    },watchValue:function($el){
    var watch=$el.data("watch"),calcSearch=this.calcSearch(watch),sampleNum=$el.data("sample"),mouseNum=$el.data("mouse"),doseNum=$el.data("dose"),val=$el.val()
    ;if(doseNum)calcSearch+=this.doseSearch(doseNum)
    ;if(sampleNum)calcSearch+=this.sampleSearch(sampleNum)
    ;if(mouseNum)calcSearch+=this.mouseSearch(mouseNum)
    ;if("on"==val)if("checkbox"==$el.prop("type"))if($el.is(":checked"))val="Yes";else val="No"
    ;if("dose"==watch)if(!val||isNaN(val))val="Dose "+doseNum;else val+=" mg/kg"
    ;$(calcSearch).html(val)},
    makeMouseCard:function(mouseNum){
    var inArray=this.checkInArray(mouseNum,this.mouseNums)
    ;if(!inArray){this.mouseNums.push(mouseNum)
    ;var $div=$(".mouseInfo")
    ;if(!$div.find(".card").length)$div.html("")
    ;var row="row mt-2",col="col-12 col-lg-6"
    ;$div.append($("<div></div>",{
    class:"col col-md-6 mt-2 mouseCard",
    "data-mouse":mouseNum}).append($("<div></div>",{
    class:"card"}).append($("<button></button>",{
    type:"button",class:"card-header mouseIDCalc",
    "data-mouse":mouseNum}).on("click",e=>{
    this.toggleCard($(e.currentTarget))
    }).append("[Enter Mouse ID]")).append($("<div></div>",{
    class:"card-body collapse"}).append($("<div></div>",{
    class:row}).append($("<div></div>",{class:col
    }).append("<h4>Mouse ID:</h4>")).append($("<div></div>",{
    class:"col"}).append($("<input/>",{type:"text",
    "data-mouse":mouseNum,id:"mouseID"+mouseNum,
    name:"mouseid"+mouseNum,
    class:"mouseID fullWidth watch",
    "data-watch":"mouseID"}).on("input",e=>{
    this.watchMouseID($(e.currentTarget).data("mouse"))
    })))).append($("<div></div>",{class:row
    }).append($("<div></div>",{class:col
    }).append("Short ID (for labels):")).append($("<div></div>",{
    class:"col"}).append($("<input/>",{type:"text",
    "data-mouse":mouseNum,id:"shortID"+mouseNum,
    name:"shortid"+mouseNum,
    class:"shortID fullWidth watch",
    "data-watch":"shortID"}).on("input",e=>{
    this.watchMouseID($(e.currentTarget).data("mouse"))
    })))).append($("<div></div>",{class:row
    }).append($("<div></div>",{class:col
    }).append("Stress Treatment:")).append($("<div></div>",{
    class:"col"}).append($("<select></select>",{
    "data-mouse":mouseNum,id:"treatment"+mouseNum,
    name:"treatment"+mouseNum,
    class:"treatment fullWidth watch",
    "data-watch":"treatment"
    }).append('<option value="CON">Control</option><option value="ALPS">Stress</option>')))).append($("<div></div>",{
    class:row}).append($("<div></div>",{class:col
    }).append("Drug Treatment:")).append($("<div></div>",{
    class:"col"}).append($("<select></select>",{
    "data-mouse":mouseNum,id:"mouseDose"+mouseNum,
    name:"mousedose"+mouseNum,
    class:"mouseDose fullWidth watch",
    "data-watch":"mouseDose"
    }).append()))).append($("<div></div>",{
    class:row+" hideView"}).append($("<div></div>",{
    class:col}).append("Delete:")).append($("<div></div>",{
    class:"col"}).append($("<input/>",{type:"button",
    value:"Delete Mouse","data-mouse":mouseNum,
    id:"deleteMouse"+mouseNum,
    name:"deletemouse"+mouseNum,
    class:"deleteMouse fullWidth"}).on("click",e=>{
    this.deleteMouseFuncs($(e.currentTarget).data("mouse"))
    })))).append($("<div></div>",{class:row
    }).append($("<div></div>",{class:col
    }).append("Sex:")).append($("<div></div>",{class:"col"
    }).append($("<select></select>",{"data-mouse":mouseNum,
    id:"sex"+mouseNum,name:"sex"+mouseNum,
    class:"sex fullWidth watch","data-watch":"sex"
    }).append('<option value="">[Select]</option><option value="male">Male</option><option value="female">Female</option>').on("input",e=>{
    var sex=$(e.currentTarget).val()
    ;if("female"==sex)$(e.currentTarget).parents(".row").next(".ifFemale").show();else $(e.currentTarget).parents(".row").next(".ifFemale").hide().find(".stage").val("")
    })))).append($("<div></div>",{class:row+" ifFemale"
    }).append($("<div></div>",{class:col
    }).append("Estrous Stage:")).append($("<div></div>",{
    class:"col"}).append($("<select></select>",{
    "data-mouse":mouseNum,id:"stage"+mouseNum,
    name:"stage"+mouseNum,
    class:"stage fullWidth watch","data-watch":"stage"
    }).append('<option value="">Select</option><option value="diestrus">Diestrus</option><option value="proestrus">Proestrus</option><option value="estrus">Estrus</option>')))).append($("<div></div>",{
    class:row}).append($("<div></div>",{class:col
    }).append("Body Mass (g):")).append($("<div></div>",{
    class:"col"}).append($("<input/>",{type:"number",
    "data-mouse":mouseNum,id:"mass"+mouseNum,
    name:"mass"+mouseNum,
    class:"mass fullWidth watch calcNutella",
    "data-watch":"mass"}).on("input",e=>{
    this.calcNutella(mouseNum)
    })))).append($("<div></div>",{class:row
    }).append($("<div></div>",{class:col
    }).append("Nutella for mouse:")).append($("<div></div>",{
    class:"col adjNutellaForMouse",
    "data-mouse":mouseNum}))).append($("<div></div>",{
    class:row}).append($("<div></div>",{class:col
    }).append("Uterine/Seminal Vesicle Mass (mg):")).append($("<div></div>",{
    class:"col"}).append($("<input/>",{type:"text",
    "data-mouse":mouseNum,id:"reproMass"+mouseNum,
    name:"repromass"+mouseNum,
    class:"reproMass fullWidth watch",
    "data-watch":"reproMass"})))).append($("<div></div>",{
    class:row}).append($("<div></div>",{class:col
    }).append("Ovarian/Testicular Mass (mg):")).append($("<div></div>",{
    class:"col"}).append($("<input/>",{type:"text",
    "data-mouse":mouseNum,id:"gonadMass"+mouseNum,
    name:"gonadmass"+mouseNum,
    class:"gonadMass fullWidth watch",
    "data-watch":"gonadMass"})))))))
    ;var $mouseTable=$("#mouseTable")
    ;$mouseTable.find("tbody").append($("<tr></tr>",{
    "data-mouse":mouseNum}))
    ;var $mouseTable2=$("#mouseTable2")
    ;$mouseTable2.find("tbody").append($("<tr></tr>",{
    "data-mouse":mouseNum}))
    ;for(var calcs=["mouseID","sex","stage","treatment","mouseDose","mass","reproMass","gonadMass"],calcs2=["mouseID","date","stage","treatment","mouseDose","mass","reproMass","gonadMass"],mouseSearch=this.mouseSearch(mouseNum),i=0;i<calcs.length;i++){
    var calc=calcs[i]
    ;$mouseTable.find("tbody").find("tr"+mouseSearch).append($("<td></td>",{
    "data-calc":calc,"data-mouse":mouseNum}))}
    for(var i=0;i<calcs2.length;i++){
    var calc=calcs2[i]
    ;if("date"!==calc)console.log(calc),$mouseTable2.find("tbody").find("tr"+mouseSearch).append($("<td></td>",{
    "data-calc":calc,"data-mouse":mouseNum
    }));else $mouseTable2.find("tbody").find("tr"+mouseSearch).append($("<td></td>",{
    "data-calc":calc}))}
    this.calcNutella(mouseNum),this.updateDoseChoices(),this.resize()
    }},deleteMouseFuncs:function(mouseNum){
    var proceed=confirm("Are you sure that you wish to delete this mouse?")
    ;if(proceed){
    var index=this.mouseNums.indexOf(mouseNum)
    ;if(index>-1)this.mouseNums.splice(index,1)
    ;if(this.sampleNums)for(var numSamples=this.sampleNums.length,i=0;i<numSamples;i++){
    var sample=this.sampleNums[i],index=this.miceInSamples[sample].indexOf(mouseNum)
    ;if(index>-1)this.miceInSamples[sample].splice(index,1)
    }var mouseSearch=this.mouseSearch(mouseNum)
    ;$(".mouseCard"+mouseSearch).remove(),
    $(".mouseSampleCard"+mouseSearch).remove(),
    $("tr"+mouseSearch).remove()}this.resize()},
    calcAllNutella:function(){var mice=this.mouseNums
    ;if(mice)var numMice=mice.length;else var numMice=0
    ;for(var i=0;i<numMice;i++){var mouseNum=mice[i]
    ;this.calcNutella(mouseNum)}},
    calcNutella:function(mouseNum){
    var mouseSearch=this.mouseSearch(mouseNum),nutellaPerAvgMouse=$("#nutellaPerMouse").val(),avgMouse=$("#avgMouseMass").val()
    ;if(nutellaPerAvgMouse>0)if(avgMouse>0){
    var mouseMass=$(".mass"+mouseSearch).val()
    ;if(mouseMass>0)nutellaForMouse=mouseMass/avgMouse*nutellaPerAvgMouse;else nutellaForMouse="{Enter mouse mass}"
    }else nutellaForMouse="{Enter avg mouse mass}";else nutellaForMouse="{Enter Nutella/mouse}"
    ;if(!isNaN(nutellaForMouse))if(nutellaForMouse>0)nutellaForMouse=+nutellaForMouse.toFixed(2)+"mg";else nutellaForMouse="{double check entries}"
    ;$(".adjNutellaForMouse"+mouseSearch).html(nutellaForMouse)
    },makeSampleContent:function(totalNumSamples){
    var sampleNum,mice=this.mouseNums
    ;if(mice)var numMice=mice.length;else var numMice=0
    ;for(var i=0;i<totalNumSamples;i++){
    if(sampleNum=i+1,!this.checkInArray(sampleNum,this.sampleNums)){
    if(1==sampleNum)$("#samplesAccordion").html(""),
    $(".sampleInfoDiv").html("")
    ;this.sampleNums.push(sampleNum),this.miceInSamples[sampleNum]=[],
    this.makeSampleInfo(sampleNum),
    this.makeSamplingCard(sampleNum),this.makeSampleForTables(sampleNum)
    }for(var j=0;j<numMice;j++){
    var mouse=mice[j],inSample=this.checkMiceInSamples(sampleNum,mouse)
    ;if(!inSample)this.miceInSamples[sampleNum].push(mouse),
    this.makeSampleForMouse(sampleNum,mouse)
    ;this.watchMouseID(mouse)}}
    if(this.sampleNums)for(var proceed=true,i=this.sampleNums.length;i>-1;i--)if(proceed){
    var sampleNum=this.sampleNums[i]
    ;if(sampleNum>totalNumSamples)if(proceed=confirm("Are sure that you want to remove a sampling time?"),
    proceed)$(this.sampleSearch(sampleNum)).remove(),
    this.sampleNums.splice(i,1),console.log(this.sampleNums);else $("#numSamples").val(this.sampleNums.length)
    }$(".watch").each((i,e)=>{this.watchValue($(e))
    }).on("input",e=>{
    this.watchValue($(e.currentTarget))
    }),this.resize()},miceInSamples:{},
    makeSampleForTables:function(sampleNum){
    var $sample=$("#sampleTable"),calcs=["sampleLabel","sampleTime","cort","LH","otherName"]
    ;$sample.find("tbody").append($("<tr></tr>",{
    "data-sample":sampleNum}))
    ;for(var sampleSearch=this.sampleSearch(sampleNum),i=0;i<calcs.length;i++){
    var calc=calcs[i]
    ;$sample.find("tr"+sampleSearch).append($("<td></calcs>",{
    "data-calc":calc,"data-sample":sampleNum}))}
    var $mouse=$("#mouseTable")
    ;$mouse.find("thead").find("tr").append($("<th></th>",{
    "data-sample":sampleNum
    }).append("Sample"+sampleNum+"Start")).append($("<th></th>",{
    "data-sample":sampleNum
    }).append("Sample"+sampleNum+"End")).append($("<th></th>",{
    "data-sample":sampleNum
    }).append("Nutella"+sampleNum+"Start")).append($("<th></th>",{
    "data-sample":sampleNum
    }).append("Nutella"+sampleNum+"End")).append($("<th></th>",{
    "data-sample":sampleNum
    }).append("Nutella"+sampleNum+"Consumption"))},
    makeSampleInfo:function(sampleNum){
    var $div=$(".sampleInfoDiv"),labelClass="col-12 col-lg-6 font-weight-bold mt-2",inputClass="col-12 col-lg-6 mt-lg-2"
    ;$div.append($("<div></div>",{
    class:"col-12 col-md-6 mt-2",
    "data-sample":sampleNum}).append($("<div></div>",{
    class:"card sampleInfo","data-sample":sampleNum
    }).append($("<button></button>",{type:"button",
    class:"card-header"}).on("click",e=>{
    this.toggleCard($(e.currentTarget))
    }).append("Sample "+sampleNum)).append($("<div></div>",{
    class:"card-body row collapse"
    }).append($("<div></div>",{class:labelClass
    }).append("Exp Hour:")).append($("<div></div>",{
    class:inputClass}).append($("<input/>",{
    type:"number",name:"sampletime"+sampleNum,
    id:"sampleTime"+sampleNum,
    class:"sampleTime fullWidth watch",
    "data-sample":sampleNum,"data-watch":"sampleTime"
    }).on("input",e=>{
    this.watchSampleLabel($(e.currentTarget).data("sample"))
    }))).append($("<div></div>",{class:labelClass
    }).append("Sample Label:")).append($("<div></div>",{
    class:inputClass}).append($("<input/>",{
    type:"text",name:"samplelabel"+sampleNum,
    id:"sampleLabel"+sampleNum,
    class:"sampleLabel fullWidth watch",
    "data-sample":sampleNum,"data-watch":"sampleLabel"
    }).on("input",e=>{
    this.watchSampleLabel($(e.currentTarget).data("sample"))
    }))).append($("<div></div>",{class:labelClass
    }).append("Sample for:")).append($("<div></div>",{
    class:inputClass}).append($("<div></div>",{class:"row"
    }).append($("<div></div>",{class:"col"
    }).append("Cort: ").append($("<input/>",{
    type:"checkbox",name:"cort"+sampleNum,
    id:"cort"+sampleNum,"data-sample":sampleNum,
    class:"cort watch","data-watch":"cort"
    }).on("change",e=>{}))).append($("<div></div>",{
    class:"col"}).append("LH: ").append($("<input/>",{
    type:"checkbox",name:"lh"+sampleNum,
    id:"LH"+sampleNum,"data-sample":sampleNum,
    class:"LH watch","data-watch":"LH"
    })))).append($("<div></div>",{class:"row"
    }).append($("<div></div>",{class:"col"
    }).append("Other: ").append($("<input/>",{
    type:"checkbox",name:"othersample"+sampleNum,
    id:"otherSample"+sampleNum,
    "data-sample":sampleNum,class:"otherSample"
    }).on("change",e=>{
    this.showIfOtherCheck($(e.currentTarget))
    })).append($("<input/>",{type:"text",
    name:"othername"+sampleNum,
    id:"otherName"+sampleNum,"data-sample":sampleNum,
    class:"otherName ifOther fullWidth watch",
    "data-watch":"otherName"}))))))))},
    makeSamplingCard:function(sampleNum){
    var $div=$("#samplesAccordion")
    ;$div.append($("<div></div>",{
    class:"card samplingCard","data-sample":sampleNum
    }).append($("<button></button>",{type:"button",
    class:"card-header samplingHead",
    id:"samplingHead"+sampleNum}).on("click",e=>{
    this.toggleCard($(e.currentTarget))
    }).append($("<h4></h4>",{class:"mb-0"
    }).append($("<div></div>",{class:"sampleLabelCalc",
    "data-sample":sampleNum
    }).append("Sample "+sampleNum)))).append($("<div></div>",{
    class:"samplingBody collapse",
    id:"samplingBody"+sampleNum,
    "data-sample":sampleNum}).append($("<div></div>",{
    class:"card-body divForMouseSampling",
    "data-sample":sampleNum}))))},
    makeSampleForMouse:function(sampleNum,mouseNum){
    var sampleSearch=this.sampleSearch(sampleNum),$div=$(".divForMouseSampling"+sampleSearch),sampMouseID=sampleNum+"_"+mouseNum
    ;$div.append($("<div></div>",{
    class:"card mouseSampleCard",
    "data-sample":sampleNum,"data-mouse":mouseNum
    }).append($("<button></button>",{type:"button",
    class:"card-header",id:"heading"+sampMouseID
    }).on("click",e=>{
    this.toggleCard($(e.currentTarget))
    }).append($("<h4></h4>",{class:"mb-0"
    }).append($("<div></div>",{}).append($("<span></span>",{
    class:"mouseIDCalc","data-mouse":mouseNum
    }).append("[Enter Mouse ID]")).append($("<span></span>",{
    class:"shortIDCalc","data-mouse":mouseNum
    }).append("[Enter Short ID]"))))).append($("<div></div>",{
    id:"body"+sampMouseID,class:"collapse"
    }).append($("<div></div>",{class:"card-body container",
    "data-mouse":mouseNum,"data-sample":sampleNum
    }).append(this.makeTimeButtonRow(sampMouseID,mouseNum,sampleNum,"Time")).append($("<div></div>",{
    class:"row mt-2"}).append($("<div></div>",{
    class:"col-12 col-md-6"}).append($("<select></select>",{
    id:"behaviorNotes"+sampMouseID,
    name:"behaviornotes"+sampMouseID,
    class:"behaviorNotes fullWidth",
    "data-mouse":mouseNum,"data-sample":sampleNum
    }).append('<option value="">[Select]</option><option value="calm">Calm</option><option value="jumpy">Jumpy</option><option value="exploring">Exploring</option><option value="hunched">Hunched</option>')).append($("<input/>",{
    type:"button",value:"Add notes",
    id:"addNotes"+sampMouseID,
    name:"addnotes"+sampMouseID,
    class:"addNotes fullWidth disableOnView",
    "data-sample":sampleNum,"data-mouse":mouseNum
    }).on("click",e=>{
    var thisMouseNum=$(e.currentTarget).data("mouse"),thisSampleNum=$(e.currentTarget).data("sample"),mouseSearch=this.mouseSearch(mouseNum),sampleSearch=this.sampleSearch(sampleNum),selectedBehavior=$(".behaviorNotes"+mouseSearch+sampleSearch).find("option:selected").text()
    ;if("[Select]"==selectedBehavior)selectedBehavior=""
    ;var currentVal=$(".notes"+mouseSearch+sampleSearch).val()
    ;if(currentVal)currentVal+="\n"
    ;$(".notes"+mouseSearch+sampleSearch).val(currentVal+selectedBehavior)
    ;var notesTxtbox=document.getElementById("notes"+thisSampleNum+"_"+thisMouseNum)
    ;notesTxtbox.style.height="auto",
    notesTxtbox.style.height=notesTxtbox.scrollHeight+"px",
    this.resize()}))).append($("<div></div>",{
    class:"col-12 col-md-6 mt-2 mt-md-0"
    }).append($("<text"+"area></text"+"area>",{
    id:"notes"+sampMouseID,name:"notes"+sampMouseID,
    class:"notes fullWidth autoAdjust",
    placeholder:"Notes","data-mouse":mouseNum,
    "data-sample":sampleNum}).on("input",e=>{
    e.currentTarget.style.height="auto",e.currentTarget.style.height=e.currentTarget.scrollHeight+"px",
    this.resize()})))).append($("<div></div>",{
    class:"row mt-2"}).append($("<div></div>",{
    class:"col-12 col-md-6"
    }).append("LH Sample ID")).append($("<div></div>",{
    class:"col-12 col-md-6 mt-2 mt-md-0"
    }).append($("<input></input>",{type:"number",
    id:"lhnum"+sampMouseID,name:"lhnum"+sampMouseID,
    class:"lhnum fullWidth","data-mouse":mouseNum,
    "data-sample":sampleNum
    })))).append(this.makeTimeButtonRow(sampMouseID,mouseNum,sampleNum,"Nutella")).append($("<div></div>",{
    class:"row mt-2"}).append($("<div></div>",{
    class:"col-12 col-md-6"
    }).append("Nutella consumption:")).append($("<div></div>",{
    class:"col-12 col-md-6 mt-2 mt-md-0"
    }).append($("<select></select>",{
    id:"nutellaConsumption"+sampMouseID,
    name:"nutellaconsumption"+sampMouseID,
    class:"nutellaConsumption fullWidth watch",
    "data-mouse":mouseNum,"data-sample":sampleNum,
    "data-watch":"nutellaConsumption"
    }).append($("<option></option>",{value:""
    }).append("[select]")).append($("<option></option>",{
    value:"none"
    }).append("None")).append($("<option></option>",{
    value:"some"
    }).append("Some")).append($("<option></option>",{
    value:"all"}).append("All"))))))))
    ;var $mouseTable=$("#mouseTable"),mouseSearch=this.mouseSearch(mouseNum)
    ;$mouseTable.find("tr"+mouseSearch).append($("<td></td>",{
    "data-calc":"startTime","data-mouse":mouseNum,
    "data-sample":sampleNum})).append($("<td></td>",{
    "data-calc":"endTime","data-mouse":mouseNum,
    "data-sample":sampleNum})).append($("<td></td>",{
    "data-calc":"startNutella","data-mouse":mouseNum,
    "data-sample":sampleNum})).append($("<td></td>",{
    "data-calc":"endNutella","data-mouse":mouseNum,
    "data-sample":sampleNum})).append($("<td></td>",{
    "data-calc":"nutellaConsumption",
    "data-mouse":mouseNum,"data-sample":sampleNum}))},
    makeOneTimeEntry:function(sampMouseID,mouseNum,sampleNum,className,timing){
    var lowerCaseName=className.toLowerCase(),lowerCaseTime=timing.toLowerCase(),$timeDiv=$("<div></div>",{
    class:"col-12 col-md-6"
    }).append($("<input></input>",{type:"button",
    value:timing+" "+className,
    id:lowerCaseTime+className+"Button"+sampMouseID,
    name:lowerCaseTime+lowerCaseName+"button"+sampMouseID,
    class:lowerCaseTime+className+"Button fullWidth disableOnView",
    "data-mouse":mouseNum,"data-sample":sampleNum
    }).on("click",e=>{
    this.updateTimeButton($(e.currentTarget),lowerCaseTime+className)
    })).append($("<input></input>",{type:"time",
    id:lowerCaseTime+className+sampMouseID,
    name:lowerCaseTime+lowerCaseName+sampMouseID,
    class:lowerCaseTime+className+" fullWidth watch",
    "data-mouse":mouseNum,"data-sample":sampleNum,
    placeholder:"hh:mm",
    "data-watch":lowerCaseTime+className
    }).each((i,e)=>{this.checkTimeFormat($(e))
    }).on("change",e=>{
    this.checkTimeFormat($(e.currentTarget))}))
    ;return $timeDiv},
    makeTimeButtonRow:function(sampMouseID,mouseNum,sampleNum,className){
    var $div=$("<div></div>",{class:"row mt-2"
    }).append(this.makeOneTimeEntry(sampMouseID,mouseNum,sampleNum,className,"Start")).append(this.makeOneTimeEntry(sampMouseID,mouseNum,sampleNum,className,"End"))
    ;return $div},
    updateTimeButton:function($el,updateClass){
    var thisMouseNum=$el.data("mouse"),thisSampleNum=$el.data("sample"),mouseSearch=this.mouseSearch(thisMouseNum),sampleSearch=this.sampleSearch(thisSampleNum),currentTime=luxon.DateTime.now(),timeString=currentTime.toLocaleString({
    ...luxon.DateTime.TIME_24_SIMPLE,locale:"en-GB"
    }),proceed=true,$updateEl=$("."+updateClass+mouseSearch+sampleSearch)
    ;if($updateEl.val())proceed=confirm("Are you sure that you want to replace the time?")
    ;if(proceed)$updateEl.val(timeString),
    this.watchValue($updateEl),this.checkTimeFormat($updateEl)
    ;this.resize()},
    checkMiceInSamples:function(sampleNum,mouseNum){
    var sampleNumArray=this.miceInSamples[sampleNum],inSample=this.checkInArray(mouseNum,sampleNumArray)
    ;return inSample},
    dataSearch:function(dataName,dataValue){
    var dataSearch="[data-"+dataName+"='"+dataValue+"']"
    ;return dataSearch},
    mouseSearch:function(mouseNum){
    var mouseSearch=this.dataSearch("mouse",mouseNum)
    ;return mouseSearch},
    sampleSearch:function(sampleNum){
    var sampleSearch=this.dataSearch("sample",sampleNum)
    ;return sampleSearch},tableSearch:function(table){
    var tableSearch=this.dataSearch("table",table)
    ;return tableSearch},calcSearch:function(calc){
    var calcSearch=this.dataSearch("calc",calc)
    ;return calcSearch},doseSearch:function(dose){
    var doseSearch=this.dataSearch("dose",dose)
    ;return doseSearch},
    showWithCheck:function($chbx,$toToggle){
    if($chbx.is(":checked"))$toToggle.show();else $toToggle.hide().html("")
    ;this.resize()},showIfOtherCheck:function($chbx){
    var $ifOther=$chbx.next(".ifOther")
    ;this.showWithCheck($chbx,$ifOther)},
    downloadCSV:function(csv,filename){
    var csvFile,downloadLink;csvFile=new Blob([csv],{
    type:"text/csv"
    }),downloadLink=document.createElement("a"),downloadLink.download=filename,
    downloadLink.href=window.URL.createObjectURL(csvFile),
    downloadLink.style.display="none",
    document.body.appendChild(downloadLink),downloadLink.click()
    },exportTableToCSV:function(filename,table){
    for(var csv=[],datatable=document.getElementById(table),rows=datatable.querySelectorAll("tr"),i=0;i<rows.length;i++){
    for(var row=[],cols=rows[i].querySelectorAll("td, th"),j=0;j<cols.length;j++){
    var cellText='"'+cols[j].innerText+'"'
    ;row.push(cellText)}csv.push(row.join(","))}
    this.downloadCSV(csv.join("\n"),filename)},
    copyTable:function($table,copyHead,$divForCopy){
    var $temp=$("<text"+"area style='opacity:0;'></text"+"area>"),addLine=""
    ;if(copyHead)$table.find("thead").children("tr").each((i,e)=>{
    var addTab=""
    ;$(e.currentTarget).children().each((i,e)=>{
    $temp.text($temp.text()+addTab+$(e.currentTarget).text()),
    addTab="\t"})}),addLine="\n"
    ;$table.find("tbody").children("tr").each((i,e)=>{
    $temp.text($temp.text()+addLine);var addTab=""
    ;$(e).find("td").each((i,e)=>{
    if($(e).text())var addText=$(e).text();else var addText="NA"
    ;$temp.text($temp.text()+addTab+addText),
    addTab="\t",addLine="\n"})
    }),$temp.appendTo($divForCopy).select(),document.execCommand("copy"),
    $temp.remove()},toggleTableFuncs:function($table){
    this.resize(),this.data_valid_form(),
    $table.toggle(),this.parent_class.resize_container()
    },toCSVFuncs:function(fileName,tableID,$errorMsg){
    var data_valid=this.data_valid_form()
    ;if(data_valid)this.exportTableToCSV(fileName,tableID),
    $errorMsg.html("<span style='color:grey; font-size:24px;'>Saved successfully</span>");else $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Did not export</span>")
    },
    copyDataFuncs:function($copyHead,$tableToCopy,$tableDiv,$errorMsg,$divForCopy){
    var data_valid=this.data_valid_form(),copyHead
    ;if($copyHead.is(":checked"))copyHead=true;else copyHead=false
    ;if(data_valid)$tableDiv.show(),
    this.resize(),this.copyTable($tableToCopy,copyHead,$divForCopy),
    $errorMsg.html("<span style='color:grey; font-size:24px;'>Copied successfully</span>");else $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>")
    },getOffsetTop:function(element){
    var offsetTop=0,lastElement=0
    ;while(element&&!lastElement){
    var formChild=$(element).children("#the_form")
    ;if(formChild.length>0)lastElement=1
    ;offsetTop+=element.offsetTop,element=element.offsetParent
    }return offsetTop},
    runIfConfirmed:function(text,functionToCall,elForHeight=null){
    var thisMessage="Are you sure?"
    ;if(text)thisMessage=text;var top="auto"
    ;if(elForHeight)top=this.getOffsetTop(elForHeight)+"px"
    ;bootbox.confirm({message:thisMessage,
    callback:proceed=>{if(proceed)functionToCall()}
    }),console.log(top),$(".modal-dialog").css("top",top)
    },
    dialogConfirm:function(text,functionToCall,elForHeight=null){
    var thisMessage="Do you want to proceed?"
    ;if(text)thisMessage=text;var top="auto"
    ;if(elForHeight)top=this.getOffsetTop(elForHeight)+"px"
    ;bootbox.confirm({message:thisMessage,
    callback:result=>{functionToCall(result)}
    }),$(".modal-dialog").css("top",top)},
    runBasedOnInput:function(prompt,functionToCall,elForHeight=null){
    var thisTitle="Enter value:"
    ;if(prompt)thisTitle=prompt;var top="auto"
    ;if(elForHeight)top=this.getOffsetTop(elForHeight)+"px"
    ;bootbox.prompt({title:thisTitle,
    callback:result=>{functionToCall(result)}
    }),$(".modal-dialog").css("top",top)}};
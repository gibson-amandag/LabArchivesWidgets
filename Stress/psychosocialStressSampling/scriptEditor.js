my_widget_script =
{
    mouseNums: [],
    sampleNums: [],
    startTime: "",

    init: function (mode, json_data) {
        // jQuery for bootstrap
        this.include(
            "https://code.jquery.com/jquery-3.5.1.min.js",
            "sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=",
            "anonymous",
            ()=>{
                $(document).ready(
                    ()=>{
                        // console.log("After load", $.fn.jquery);
                        
                        // Load bootstrap
                        this.include(
                            "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js",
                            "sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl",
                            "anonymous",
                            ()=>{
                                $(document).ready(
                                    ()=>{
                                        // Load Luxon
                                        this.include(
                                            "https://cdn.jsdelivr.net/npm/luxon@1.26.0/build/global/luxon.min.js",
                                            "sha256-4sbTzmCCW9LGrIh5OsN8V5Pfdad1F1MwhLAOyXKnsE0=",
                                            "anonymous",
                                            ()=>{
                                                $(document).ready(
                                                    ()=>{
                                                        // Load bootbox - need the bootstrap JS to be here first, with appropriate jQuery
                                                        this.include(
                                                            "https://cdnjs.cloudflare.com/ajax/libs/bootbox.js/5.5.2/bootbox.min.js",
                                                            "sha512-RdSPYh1WA6BF0RhpisYJVYkOyTzK4HwofJ3Q7ivt/jkpW6Vc8AurL1R+4AUcvn9IwEKAPm/fk7qFZW3OuiUDeg==",
                                                            "anonymous",
                                                            // referrerpolicy="no-referrer"
                                                            ()=>{
                                                                $(document).ready(
                                                                    ()=>{
                                                                        // selectize
                                                                        this.include(
                                                                            "https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.15.0/js/selectize.js", 
                                                                            "sha512-1HjnkKhHSDunRgIHRK4gXORl/T0WxhVkiQ5gjwvrH4yQK9RqPqYnPPwJfh+6gYTc/U9Cg8n4MGRZV1CzsP0UIA==",
                                                                            "anonymous",
                                                                            // "https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.15.0/js/selectize.min.js",
                                                                            // "sha512-yPolz8xdNko3x+XY5yvuS5Inib7HXh7xD269BZOgyfv2GrNPisWLelUblxN5CdOoBAO0Siwfg4+QsAOVfUryCg==",
                                                                            // "anonymous",
                                                                            () =>{
                                                                                this.include(
                                                                                    // Papa Parse for CSVs
                                                                                    "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js",
                                                                                    "sha512-SGWgwwRA8xZgEoKiex3UubkSkV1zSE1BS6O4pXcaxcNtUlQsOmOmhVnDwIvqGRfEmuz83tIGL13cXMZn6upPyg==",
                                                                                    "anonymous",
                                                                                    ()=>{
                                                                                        $jq351 = jQuery.noConflict(true);
                                                                                        // console.log("After no conflict", $.fn.jquery);
                                                                                        // console.log("bootstrap jquery", $jq351.fn.jquery);
                                                                                        this.myInit(mode, json_data);
                                                                                    }
                                                                                )
                                                                            }
                                                                        )
                                                                    }
                                                                )
                                                            }
                                                        );
                                                    }
                                                )
                                            }
                                        );
                                    }
                                )
                            }
                        )
                    }
                )
            }
        )
    },

    //https://stackoverflow.com/questions/8139794/load-jquery-in-another-js-file
    include: function(src, integrity, crossorigin, onload) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.setAttribute("integrity", integrity);
        script.setAttribute("crossorigin", crossorigin);
        script.src = src;
        script.type = 'text/javascript';
        script.onload = script.onreadystatechange = function() {
            if (script.readyState) {
                if (script.readyState === 'complete' || script.readyState === 'loaded') {
                    script.onreadystatechange = null;                                                  
                    onload();
                }
            } 
            else {
                onload();          
            }
        };
        head.appendChild(script);
    },

    myInit: function (mode, json_data) {
        var parsedJson = this.parseInitJson(json_data);
        this.initDynamicContent(parsedJson);
        
        //resize the content box when the window size changes
        window.onresize = ()=> this.resize(); // need the arrow func, or "this" within resize becomes associated with event
        this.addEventListeners();
        this.parent_class.init(mode, () => JSON.stringify(parsedJson.widgetData));
        
        if(parsedJson.sampleNums){
            $("#numSamples").val(parsedJson.sampleNums.length);
        }

        this.addRequiredFieldIndicators();
        this.setUpInitialState();
        this.adjustForMode(mode);
    },
    
    to_json: function () {
        // debugger;
        var widgetJsonString = this.parent_class.to_json();
        var dynamicContent = this.getDynamicContent();
        
        var output = { 
            widgetData: JSON.parse(widgetJsonString),
            mouseNums: dynamicContent.mouseNums,
            sampleNums: dynamicContent.sampleNums
        };

        // console.log(output.widgetData[9])

        //uncomment to check stringified output
        //console.log("to JSON", JSON.stringify(output));

        return JSON.stringify(output);
    },

    from_json: function (json_data) {
        //populates the form with json_data

        // all data in string format within json_data is parsed into an object parsedJson
        var parsedJson = JSON.parse(json_data);
        // debugger;

        //use parsedJson to get widgetData and turn into a string
        //parent class uses the widget data to fill in inputs
        this.parent_class.from_json(JSON.stringify(parsedJson.widgetData));
    },

    test_data: function () {
        //store the outcome of the the test data within the testData variable
        var testData = JSON.parse(this.parent_class.test_data());

        //If no additional dynamic content 
        var output = { 
            widgetData: testData,
            mouseNums: [2, 4],
            sampleNums: [1, 2, 3]
        };
        
        //return the stringified output for use by the init function
        return JSON.stringify(output);
    },

    is_valid: function (b_suppress_message) {
        var fail = false; 
        var fail_log = '';
        var name; 

        //search the_form for all elements that are of type select, textarea, or input
        $('#the_form').find('select, textarea, input').each((i,e)=> {
            if (!$(e).prop('required')) { 
                //don't change anything 
            } else { 
                if (!$(e).val()) { 
                    fail = true;
                    name = $(e).attr('id');
                    fail_log += name + " is required \n";
                }

            }
        });

        $("input[type='date']").each((i,e)=> {
            var date = $(e).val();
            if(date){
                var validDate = this.isValidDate(date);
                if(!validDate){
                    fail = true;
                    fail_log += "Please enter valid date in form 'YYYY-MM-DD'";
                }
            }
        });

        $("input[type='time']").each((i,e)=> {
            var time = $(e).val();
            if(time){
                var validtime = this.isValidTime(time);
                if(!validtime){
                    fail = true;
                    fail_log += "Please enter valid time in form 'hh:mm' - 24 hr time";
                }
            }
        });

        if (fail) { 
            return alert(fail_log);
        } else {
            var noErrors = [];
            return noErrors;
        }
    },

    is_edited: function () {
        //should return true if the form has been edited since it was loaded or since reset_edited was called
        return this.parent_class.is_edited();
    },

    reset_edited: function () {
        //typically called have a save
        return this.parent_class.reset_edited();
    },

    // ********************** CUSTOM METHODS USED BY INIT METHOD **********************
    parseInitJson: function (json_data) {
        var jsonString;
        //check if string or function because preview test is function and page is string
        if (typeof json_data === "string") {
            jsonString = json_data;
        } else {
            jsonString = json_data();
        }
        //Take input string into js object to be able to use elsewhere
        var parsedJson = JSON.parse(jsonString);
        return (parsedJson);
    },

    initDynamicContent: function (parsedJson) {
        if(parsedJson.mouseNums){
            for(var i = 0; i < parsedJson.mouseNums.length; i++){
                var mouse = parsedJson.mouseNums[i];
                this.makeMouseCard(mouse);
            }
        }
        if(parsedJson.sampleNums){
            this.makeSampleContent(parsedJson.sampleNums.length);
        }
    },

    adjustForMode: function (mode) {
        if (mode !== "edit" && mode !== "edit_dev") {
            //disable when not editing
            $(".disableOnView").prop("disabled", true);
            $(".hideView").hide();
            $("input[type='date']").removeClass(".hasDatePicker");
            $(".ifView").show();
        } else {
            $(".ifView").hide();
            $("input[type='date']").each((i,e)=> {
                this.checkDateFormat($(e));
            });
            
            $("input[type='time']").each((i,e)=> {
                this.checkTimeFormat($(e));
            });

            $(".table").hide();

            if($("#expDate").val() && $("#numSamples").val()>0){
                $(".samplesDiv").insertBefore(".info");
            }
        }
    },

    addEventListeners: function () {
        $(".toggleTable").on("click", (e)=> {
            var tableID = $(e.currentTarget).data("table");
            var $table = $("#"+tableID);
            var $errorMsg = $(".errorMsg");
            this.toggleTableFuncs($table, $errorMsg);
        });

        $('.toCSV').on("click", (e)=> {
            var tableID = $(e.currentTarget).data("table");
            var dateToday = luxon.DateTime.now().toISODate();
            var fileName = "stress_"+tableID+"_"+dateToday;
            var $errorMsg = $(".errorMsg");
            
            this.toCSVFuncs(fileName, tableID, $errorMsg);
        });

       $(".copyData").on("click", (e)=> {
            var tableID = $(e.currentTarget).data("table");
            var tableSearch = this.tableSearch(tableID);
            var $copyHead = $(".copyHead"+tableSearch);
            var $tableToCopy = $("#"+tableID);
            var $tableDiv = $tableToCopy.parent();
            var $errorMsg = $(".errorMsg");
            var $divForCopy = $("#forCopy");
            
            this.copyDataFuncs($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy)
        });

       $(".copyOvulation").on("click", (e)=> {
            var tableID = $(e.currentTarget).data("table");
            var tableSearch = this.tableSearch(tableID);
            var $copyHead = $(".copyHead"+tableSearch);
            var $tableToCopy = $("#"+tableID);
            var $tableDiv = $tableToCopy.parent();
            var $errorMsg = $(".errorMsg");
            var $divForCopy = $("#forCopy");
            var ovulation = true;
            
            this.copyDataFuncs($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy, ovulation = ovulation)
        });

       $(".copyLH").on("click", (e)=> {
            var $errorMsg = $(".errorMsg");
            var $divForCopy = $("#forCopy");

            this.copyLHSampleNums($divForCopy, $errorMsg);
        });
    },

    isValidTime: function (timeString) {
        var regEx = "^(((([0-1][0-9])|(2[0-3])):[0-5][0-9]))$";
        if(!timeString.match(regEx)){
            return false;
        } else {
            return true;
        }
    },

    isTimeSupported: function () {
        var input = document.createElement('input');
        input.setAttribute('type', 'time');
        input.setAttribute("name", "testTime");
        var supported = true;
        if(input.type !== "time"){
            supported = false;
        }
        this.timeSupported = supported;
        input.remove();
        return (supported);
    },

    timeSupported: true,

    checkTimeFormat: function ($timeInput) {
        if(!this.timeSupported){ // if not supported
            $timeInput.next(".timeWarning").remove();
            var time = $timeInput.val();
            var isValid = this.isValidTime(time);
            if(!isValid){
                $timeInput.after('<div class="text-danger timeWarning">Enter time as "hh:mm" in 24-hr format</div>');
            }
            this.resize();
        }
    },

    isValidDate: function (dateString) {
        // https://stackoverflow.com/questions/18758772/how-do-i-validate-a-date-in-this-format-yyyy-mm-dd-using-jquery/18759013
        var regEx = /^\d{4}-\d{2}-\d{2}$/;
        if(!dateString.match(regEx)) return false;  // Invalid format
        var d = new Date(dateString);
        var dNum = d.getTime();
        if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
        return d.toISOString().slice(0,10) === dateString;
    },

    isDateSupported: function () {
        // https://gomakethings.com/how-to-check-if-a-browser-supports-native-input-date-pickers/
        // Check if browser has support for input type=date
        var input = document.createElement('input');
        // var value = 'a';
        input.setAttribute('type', 'date');
        input.setAttribute('name', 'testdate');
        var supported = true;
        if(input.type !== "date"){
            supported = false;
        }
        this.dateSupported = supported;
        input.remove();
        return (supported);
    },

    dateSupported: true,

    checkDateFormat: function ($dateInput) {
        if(!this.dateSupported){ // if not supported
            $dateInput.next(".dateWarning").remove();
            var date = $dateInput.val();
            var isValid = this.isValidDate(date);
            if(!isValid){
                $dateInput.after('<div class="text-danger dateWarning">Enter date as "YYYY-MM-DD"</div>');
            }
            $dateInput.datepicker({dateFormat: "yy-mm-dd"})
            this.resize();
        }
    },

    addRequiredFieldIndicators: function () {
        $('.needForTableLab').each((i,e)=> { //find element with class "needForFormLab"
            $(e).html("<span style='color:blue'>#</span>" + $(e).html()); //add # before
        });

        $('.requiredLab').each((i,e)=> { //find element with class "requiredLab"
            $(e).html("<span style='color:red'>*</span>" + $(e).html()); //add # before
        });
    },

    updateTextareas: function () {
        $('textarea.autoAdjust').each((i,e)=> {
            if(! $(e).is(":hidden")) {
                e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;');
            } 
        });
        this.resize();
    },

    updateTextarea: function(textarea) {
        if(! $(textarea).is(":hidden")) {
            textarea.setAttribute('style', 'height:' + (textarea.scrollHeight) + 'px;overflow-y:hidden;');
        } 
        this.resize();
    },

    setUpInitialState: function () {
        this.isDateSupported();
        this.isTimeSupported();

        $("input[type='date']").prop("placeholder", "YYYY-MM-DD").on("change", (e)=> {
            this.checkDateFormat($(e.currentTarget));
        });
        
        $("input[type='time']").prop("placeholder", "hh:mm").on("change", (e)=> {
            this.checkTimeFormat($(e.currentTarget));
        });
        
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right");

        $('textarea.autoAdjust').each((i,e)=> {
            var height = e.scrollHeight;
            if(height == 0){ // when hidden to begin with, the height is 0; this won't make everything visible, though if more than two lines at start
                // height = 48;
                text = $(e).val();
                $(".forTextBox").show();
                $("#forSizing").val(text);
                var forSizing = document.getElementById("forSizing");
                height = forSizing.scrollHeight;
                $(".forTextBox").hide();
            }
            // console.log(height);
            e.setAttribute('style', 'height:' + height + 'px;overflow-y:hidden;');
        }).on('input', (e)=> {
            e.currentTarget.style.height = 'auto';
            e.currentTarget.style.height = (e.currentTarget.scrollHeight) + 'px';
            this.resize();
        });

        $("#numSamples").on("input", (e)=> {
            var totalNumSamples = $(e.currentTarget).val();
            if(totalNumSamples){
                totalNumSamples = parseInt(totalNumSamples);
            } else {
                totalNumSamples = 0;
            }
            this.makeSampleContent(totalNumSamples);
        });

        $(".otherSample").each((i,e)=> {
            this.showIfOtherCheck($(e));
        }).on("change", (e)=> {
            this.showIfOtherCheck($(e.currentTarget));
        });

        $("#timeZone").each((i,e)=> {
            if($(e).val() == "est"){
                startHour = 09;
            } else {
                startHour = 10;
            }
            this.startTime = luxon.DateTime.fromObject({
                hour: startHour,
                minute: 30
            });
            this.printExpTimes();
            this.watchSampleLabel();
        }).on("change", (e)=> {
            if($(e.currentTarget).val() == "est"){
                startHour = 09;
            } else {
                startHour = 10;
            }
            this.startTime = luxon.DateTime.fromObject({
                hour: startHour,
                minute: 30
            });
            this.printExpTimes();
            this.watchSampleLabel();
        });

        $("#addMouse").on("click", (e)=> {
            if(this.mouseNums.length > 0){
                var lastMouse = this.mouseNums[this.mouseNums.length - 1];
                var mouseNum = lastMouse + 1;
            } else {
                var mouseNum = 1;
            }
            this.makeMouseCard(mouseNum);

            var totalNumSamples = $("#numSamples").val();
            if(totalNumSamples){
                totalNumSamples = parseInt(totalNumSamples);
            } else {
                totalNumSamples = 0;
            }
            this.makeSampleContent(totalNumSamples);
        });

        this.mouseNums.forEach((mouseNum)=>{
            this.watchMouseID(mouseNum);
            this.changeViewForSex(mouseNum);
            var mouseSearch = this.mouseSearch(mouseNum);
            $(".checkSacrifice"+mouseSearch).each((i, e)=>{
                if($(e).is(":checked")){
                    $(".ifSacrifice"+mouseSearch).show();
                } else {
                    $(".ifSacrifice"+mouseSearch).hide();
                }
            });
            $(".checkOvulation"+mouseSearch).each((i, e)=>{
                if($(e).is(":checked")){
                    $(".ifOvulation"+mouseSearch).show();
                } else {
                    $(".ifOvulation"+mouseSearch).hide();
                }
            });
        });

        $.each(my_widget_script.sampleNums, function () {
            my_widget_script.watchSampleLabel(this);
        });

        $(".treatment").each((i,e)=>{
            if($(e).val() == "control"){
                $(e).val("CON")
            }else if($(e).val()=="stress"){
                $(e).val("ALPS")
            }
        });

        $(".watch").each((i,e)=> {
            this.watchValue($(e));
        });

        $(".sex").each((i,e)=>{
            var sex = $(e).val();
            var mouseNum = $(e).data("mouse");
            var mouseSearch = this.mouseSearch(mouseNum);
            if(sex == "female"){
                $(".ifFemale"+mouseSearch).show();
                if($(".checkOvulation"+mouseSearch).is(":checked")){
                    $(".ifOvulation"+mouseSearch).show();
                }
            }else {
                $(".ifFemale"+mouseSearch).hide().find(".stage").val("");
                $(".ifFemale"+mouseSearch).find(".checkOvulation").prop("checked", false);
                $(".ifOvulation"+mouseSearch).hide();
            }
        });

        $(".LH").each((i,e)=>{
            var sampleNum = $(e).data("sample");
            var sampleSearch = this.sampleSearch(sampleNum);
            if($(e).is(":checked")){
                $(".ifLH"+sampleSearch).show();
            } else {
                $(".ifLH"+sampleSearch).hide();
            }
        });

        for(var sampleNum of this.sampleNums){
            this.adjustForSampling(sampleNum);
        }

        this.resize();

    },

    adjustForSampling: function(sampleNum){
        var sampleSearch = this.sampleSearch(sampleNum);
        if($(".cort"+sampleSearch).is(":checked") || $(".LH"+sampleSearch).is(":checked") || $(".otherSample"+sampleSearch).is(":checked")){
            $(".ifSampling"+sampleSearch).show();
        } else {
            $(".ifSampling"+sampleSearch).hide();
        }
    },

    toggleCard: function ($cardHead) {
        // console.log($cardHead.next());
        $cardHead.next().toggleClass("collapse");
        $cardHead.next().find("textarea.autoAdjust").each((i,e)=> {
            if(! $(e).is(":hidden")) {
                e.setAttribute('style', 'height:' + (e.scrollHeight) + 'px;overflow-y:hidden;');
            } 
        });
        this.resize();
    },

    addToStartTime: function (hoursToAdd) {
        var newTime = this.startTime.plus({hours: hoursToAdd});
        var newTimeString = newTime.toLocaleString(luxon.DateTime.TIME_24_SIMPLE);
        return newTimeString
    },

    printExpTimes: function (){
        $(".expStartTime").text(this.addToStartTime(0));
        $(".expRestraintTime").text(this.addToStartTime(1));
        $(".expScentTime").text(this.addToStartTime(3));
        $(".expEndTime").text(this.addToStartTime(5));
    },

    showOther: function ($el) {
        if($el.val() === "other") {
            // console.log("showing other");
            var $other = $el.next(".ifOther").show();
            // Adjust height
            var thisScrollHeight = $other.prop("scrollHeight");
            $other.css("height", thisScrollHeight).css("overflow-y", "hidden");
        } else {
            $el.next(".ifOther").hide();
        }
        this.resize();
    },

    resize: function () {
        //resize the container
        this.parent_class.resize_container();
    },
    
    getDynamicContent: function () {
        var dynamicContent = {
            mouseNums: this.mouseNums,
            sampleNums: this.sampleNums
        };
        return dynamicContent;
    },
    
   /** -----------------------------------------------------------------------------
     * VALIDATE FORM ENTRY BEFORE COPYING OR SAVING TABLE TO CSV
     *
     * This function will check that elements with a class "needForTable"
     * are not blank. If there are blank elements, it will return false
     * and will post an error message "Please fill out all elements marked by a blue #"
     *
     * source: https://stackoverflow.com/questions/18495310/checking-if-an-input-field-is-required-using-jquery
     * -----------------------------------------------------------------------------
     */
     data_valid_form: function ($errorMsg) {
        var valid = true; //begin with a valid value of true
        var fail_log = $("<div></div>").append("Missing values for:");
        var name; //create a name variable

        //search the_form for all elements that are of class "needForForm"
        $('.needForTable').each((i, e)=> {
            if (!$(e).val()) { //if there is not a value for this input
                valid = false; //change valid to false
                name = $(e).attr('id'); //replace the name variable with the id attribute of this element
                fail_log.append("<br/>"+name)
                // fail_log += name + " is required \n"; //add to the fail log that this name is required
            }
        });

        if (!valid) {
            $errorMsg.html(
                "<span style='color:red; font-size:36px;'>" +
                    "Please fill out all elements marked by a"+
                    "</span><span style='color:blue; font-size:36px;'>" +
                    " blue #"+
                "</span>"
            );
            $errorMsg.append(fail_log);
            // console.log("fail log\n", fail_log)    
        } else {
            $errorMsg.html("");
        }

        this.resize();
        return valid;
    },

    checkInArray: function (searchVal, array){
        var proceed = $.inArray(searchVal, array) !== -1;
        return proceed
    },

    watchMouseID: function (mouseNum) {
        var mouseSearch = this.mouseSearch(mouseNum);
        var mouseID = $(".mouseID"+mouseSearch).val();
        var shortID = $(".shortID"+mouseSearch).val();
        if(!mouseID){
            mouseID = "[Enter Mouse " + mouseNum + " ID]";
        }
        $(".mouseIDCalc"+mouseSearch).html(mouseID);
        if(mouseID == shortID || !shortID){
            shortID = "";
        } else {
            shortID = " - " + shortID
        }
        $('.shortIDCalc'+mouseSearch).html(shortID);
    },

    watchSampleLabel: function (sampleNum){
        var sampleSearch = this.sampleSearch(sampleNum);
        var sampleID = $(".sampleLabel"+sampleSearch).val();
        var sampleTime = $(".sampleTime"+sampleSearch).val();
        if(!sampleID){
            sampleID = "Sample " + sampleNum;
        }
        if(sampleTime){
            sampleTime = "Hr " + sampleTime + " - " + this.addToStartTime(parseFloat(sampleTime));
            sampleID = sampleTime + " - " + sampleID;
        }
        $(".sampleLabelCalc"+sampleSearch).html(sampleID);
    },

    watchValue: function ($el) {
        var watch = $el.data("watch");
        var calcSearch = this.calcSearch(watch);
        var sampleNum = $el.data("sample");
        var mouseNum = $el.data("mouse");
        var val = $el.val();
        if(sampleNum){
            calcSearch += this.sampleSearch(sampleNum);
        }
        if(mouseNum){
            calcSearch += this.mouseSearch(mouseNum);
        }
        if(val == "on"){ //likely checkbox
            if($el.prop("type") == "checkbox"){
                if($el.is(":checked")){val = "Yes"} else {val = "No"}
            }
        }
        $(calcSearch).html(val);
    },

    makeRow: function(label, $input, addRowClass = ""){
        var myLeftCol = "col-12 col-lg-6";
        if(addRowClass){
            addRowClass = " " + addRowClass
        }

        var $label = $("<label></label>", {
            "for": $input.attr("id")
        }).append(label);

        var $row = $("<div></div>", {
            "class": "row mt-2" + addRowClass
        }).append(
            $("<div></div>", {
                "class": myLeftCol
            }).append(
                $label
            )
        ).append(
            $("<div></div>", {
                "class": "col"
            }).append(
                $input
            )
        )
        return $row
    },

    makeInput: function(inputType, className, mouseNum, optionsObj){
        var lowerCaseName = className.toLowerCase();
        if(inputType === "select"){
            $input = $("<select></select>", {
                "name": lowerCaseName+mouseNum,
                "id": className+mouseNum,
                "class": className + " fullWidth watch",
                "data-watch": className,
                "data-mouse": mouseNum
            })
            for(option of optionsObj){
                $input.append(
                    $("<option></option>", {
                        "value": option.value
                    }).append(
                        option.text
                    )
                )
            }
        } else if(inputType === "textarea"){
            $input = $("<tex" + "tarea></tex" +"tarea>", {
                "name": lowerCaseName+mouseNum,
                "id": className+mouseNum,
                "class": className + " fullWidth watch autoAdjust",
                "data-watch": className,
                "data-mouse": mouseNum,
            }).on("input", (e)=>{
                this.updateTextarea(e.currentTarget);
            })
        } else {
            var $input = $("<input></input>", {
                type: inputType,
                "name": lowerCaseName+mouseNum,
                "id": className+mouseNum,
                "class": className + " fullWidth watch",
                "data-watch": className,
                "data-mouse": mouseNum
            })
        }

        if(inputType === "time"){
            $input.each((i,e)=> {
                this.checkTimeFormat($(e));
            }).on("change", (e)=> {
                this.checkTimeFormat($(e.currentTarget));
            })
        }
        if(inputType === "date"){
            $input.each((i,e)=> {
                this.checkDateFormat($(e));
            }).on("change", (e)=> {
                this.checkDateFormat($(e.currentTarget));
            })
        }
        return($input)
    },

    changeViewForSex: function(mouseNum){
        var mouseSearch = this.mouseSearch(mouseNum);
        var sex = $(".sex"+mouseSearch).val();
        if(sex == "female"){
            $(".ifFemale"+mouseSearch).show();
            if($(".checkOvulation"+mouseSearch).is(":checked")){
                $(".ifOvulation"+mouseSearch).show();
            }
        }else {
            $(".ifFemale"+mouseSearch).hide().find(".stage").val("");
            $(".ifFemale"+mouseSearch).find(".checkOvulation").prop("checked", false);
            $(".ifOvulation"+mouseSearch).hide();
        }
    },

    makeRowFromObj: function(obj, mouseNum){
        var $row = this.makeRow(
            obj.label,
            this.makeInput(
                obj.type,
                obj.className,
                mouseNum,
                obj.optionsObj
            ),
            obj.addRowClass
        );
        return($row);
    },

    makeMouseCard: function (mouseNum) {
        var inArray = this.checkInArray(mouseNum, this.mouseNums);
        if(! inArray){
            // debugger;
            this.mouseNums.push(mouseNum);

            var $div = $(".mouseInfo");

            if(! $div.find(".card").length){
                $div.html("");
            }

            var row = "row mt-2";
            var col = "col-12 col-lg-6";

            $div.append(
                $("<div/>", {
                    "class": "col col-md-6 mt-2 mouseCard",
                    "data-mouse": mouseNum
                }).append(
                    $("<div/>", {
                        "class": "card"
                    }).append(
                        $("<button></button>", {
                            type: "button",
                            "class": "card-header mouseIDCalc",
                            "data-mouse": mouseNum
                        }).on("click", (e)=> {
                            // console.log($(e));
                            this.toggleCard($(e.currentTarget));
                        }).append("[Enter Mouse ID]")
                    ).append(
                        $("<div/>", {
                            "class": "card-body collapse"
                        })
                    )
                )
            );

            var $body = $div.find(".card-body").last();

            var initialRows = [
                {
                    label: "<h4>Mouse ID:</h4>",
                    type: "text",
                    className: "mouseID"
                },
                {
                    label: "Short ID (for labels):",
                    type: "text",
                    className: "shortID"
                },
                {
                    label: "Stress Treatment:",
                    type: "select",
                    className: "treatment",
                    optionsObj: [
                        {
                            value: "CON",
                            text: "Control"
                        },
                        {
                            value: "ALPS",
                            text: "Stress"
                        }
                    ]
                }, {
                    label: "Delete:",
                    type: "button",
                    className: "deleteMouse",
                    optionsObj: [],
                    addRowClass: " hideView"
                }, {
                    label: "Sex:",
                    type: "select",
                    className: "sex",
                    optionsObj: [
                        {
                            value: "",
                            text: "[Select]"
                        }, {
                            value: "male",
                            text: "Male"
                        }, {
                            value: "female",
                            text: "Female"
                        }
                    ]
                }
            ]
            
            for(row of initialRows){
                $body.append(
                    this.makeRowFromObj(row, mouseNum)
                )
            }

            $body.find(".mouseID").on("input", (e)=>{
                this.watchMouseID(mouseNum);
            });
            $body.find(".shortID").on("input", (e)=>{
                this.watchMouseID(mouseNum);
            });
            $body.find(".deleteMouse").on("click", (e)=>{
                this.deleteMouseFuncs(mouseNum);
            });
            $body.find(".sex").on("click", (e)=>{
                this.changeViewForSex(mouseNum);
            }).each((i,e)=>{
                this.changeViewForSex(mouseNum);
            });

            $body.find(".deleteMouse").prop("value", "Delete Mouse");

            $body.append(
                $("<div></div>", {
                    "class": "ifFemale",
                    "data-mouse": mouseNum
                }).append(
                    this.makeRowFromObj(
                        {
                            label: "Estrous Stage:",
                            type: "select",
                            className: "stage",
                            optionsObj: [
                                {
                                    value: "",
                                    text: "Select"
                                }, {
                                    value: "diestrus",
                                    text: "Diestrus"
                                }, {
                                    value: "proestrus",
                                    text: "Proestrus"
                                }, {
                                    value: "estrus",
                                    text: "Estrus"
                                }
                            ]
                        },
                        mouseNum
                    )
                )
            );

            var secondSetRows = [
                {
                    label: "Start Body Mass (g):",
                    type: "number",
                    className: "mass"
                }, {
                    label: "Post Body Mass (g):",
                    type: "number",
                    className: "postBodyMass"
                }, {
                    label: "Was mouse sacrificed?",
                    type: "checkbox",
                    className: "checkSacrifice"
                }
            ]

            for(row of secondSetRows){
                $body.append(
                    this.makeRowFromObj(row, mouseNum)
                )
            }

            $body.find(".checkSacrifice").on("change", (e)=>{
                var mouseSearch = this.mouseSearch(mouseNum);
                if($(e.currentTarget).is(":checked")){
                    $(".ifSacrifice"+mouseSearch).show();
                } else {
                    $(".ifSacrifice"+mouseSearch).hide();
                }
            });
                    
            $body.append(
                $("<div></div>", {
                    "class": "ifSacrifice",
                    "data-mouse": mouseNum
                })
            );

            var $ifSacrifice = $body.find(".ifSacrifice");

            var sacRows = [
                {
                    label: "Sac date:",
                    type: "date",
                    className: "sacDate",
                }, {
                    label: "Sac time:",
                    type: "time",
                    className: "sacTime",
                }, {
                    label: "Uterine/Seminal Vesicle Mass (mg):",
                    type: "number",
                    className: "reproMass",
                }, {
                    label: "Uterine/Seminal Vesicle Description",
                    type: "textarea",
                    className: "reproDescription",
                }, {
                    label: "Ovarian/Testicular Mass (mg):",
                    type: "number",
                    className: "gonadMass",
                }, {
                    label: "Adrenal Mass (mg):",
                    type: "number",
                    className: "adrenalMass"
                }
            ]

            for(row of sacRows){
                $ifSacrifice.append(
                    this.makeRowFromObj(row, mouseNum)
                );
            }
            
            $ifSacrifice.append(
                $("<div></div>", {
                    "class": "ifFemale",
                    "data-mouse": mouseNum
                }).append(
                    this.makeRowFromObj(
                        {
                            label:"Check for ovulation?",
                            type: "checkbox",
                            className: "checkOvulation"
                        },
                        mouseNum
                    )
                ).append(
                    $("<div></div>", {
                        "class": "ifOvulation",
                        "data-mouse": mouseNum
                    })
                )
            );

            $ifSacrifice.find(".checkOvulation").on("change", (e)=>{
                var mouseSearch = this.mouseSearch(mouseNum);
                if($(e.currentTarget).is(":checked")){
                    $(".ifOvulation"+mouseSearch).show();
                } else {
                    $(".ifOvulation"+mouseSearch).hide();
                }
            })

            var $ifOvulation = $ifSacrifice.find(".ifOvulation");

            var ifOvulationRows = [
                {
                    label: "Estrous Stage:",
                    type: "text",
                    className: "nextStage"
                }, {
                    label: "# Oocytes - oviduct 1:",
                    type: "number",
                    className: "oocytes1"
                }, {
                    label: "# Oocytes - oviduct 2:",
                    type: "number",
                    className: "oocytes2"
                }
            ]

            for(row of ifOvulationRows){
                $ifOvulation.append(
                    this.makeRowFromObj(row, mouseNum)
                );
            }

            $body.append(
                this.makeRowFromObj(
                    {
                        label: "Notes:",
                        type: "textarea",
                        className: "notes"
                    },
                    mouseNum
                )
            )                    
            
            var $mouseTable = $("#mouseTable");

            $mouseTable.find("tbody").append(
                $("<tr/>", {
                    "data-mouse": mouseNum
                })
            );

            var $mouseTable2 = $("#mouseTable2");
            $mouseTable2.find("tbody").append(
                $("<tr/>", {
                    "data-mouse": mouseNum
                })
            );
            var $mouseTable3 = $("#mouseTable3");
            $mouseTable3.find("tbody").append(
                $("<tr/>", {
                    "data-mouse": mouseNum
                })
            );

            var calcs = ["mouseID", "sex", "stage", "treatment", "mass", "reproMass", "gonadMass", "adrenalMass", "postBodyMass"];
            var calcs2 = ["mouseID", "date", "stage", "treatment", "mass", "reproMass", "gonadMass", "adrenalMass", "postBodyMass"];
            var calcs3 = ["mouseID", "date", "stage", "treatment", "mass", "reproMass", "gonadMass", "adrenalMass", "postBodyMass", "sacDate", "sacTime", "nextStage", "reproDescription", "oocytes1", "oocytes2", "notes"];

            var mouseSearch = this.mouseSearch(mouseNum);

            for(var i = 0; i < calcs.length; i++){
                var calc = calcs[i];
                $mouseTable.find("tbody").find("tr"+mouseSearch).append(
                    $("<td></td>", {
                        "data-calc": calc,
                        "data-mouse": mouseNum
                    })
                );
            }
            for(var i = 0; i < calcs2.length; i++){
                var calc = calcs2[i];
                if(calc !== "date"){
                    // console.log(calc)
                    $mouseTable2.find("tbody").find("tr"+mouseSearch).append(
                        $("<td></td>", {
                            "data-calc": calc,
                            "data-mouse": mouseNum
                        })
                    );
                } else{
                    $mouseTable2.find("tbody").find("tr"+mouseSearch).append(
                        $("<td></td>", {
                            "data-calc": calc
                        })
                    );
                }
            }
            for(var i = 0; i < calcs3.length; i++){
                var calc = calcs3[i];
                $mouseTable3.find("tbody").find("tr"+mouseSearch).append(
                    $("<td></td>", {
                        "data-calc": calc,
                        "data-mouse": mouseNum
                    })
                );
            }
            
            this.updateTextareas();
            this.resize();
        }
    },

    deleteMouseFuncs: function (mouseNum) {
        var proceed = confirm("Are you sure that you wish to delete this mouse?");
        if(proceed){
            // Remove it from the mouseNums
            var index = this.mouseNums.indexOf(mouseNum);
            if(index > -1){
                this.mouseNums.splice(index, 1);
            }
    
            if(this.sampleNums){
                var numSamples = this.sampleNums.length;
                for(var i = 0; i < numSamples; i++){
                    var sample = this.sampleNums[i];
                    var index = this.miceInSamples[sample].indexOf(mouseNum);
                    if(index > -1){
                        this.miceInSamples[sample].splice(index, 1);
                    }
                }
            }
    
            // console.log(this.mouseNums);
    
            var mouseSearch = this.mouseSearch(mouseNum);
            $(".mouseCard"+mouseSearch).remove();
            $(".mouseSampleCard"+mouseSearch).remove();
            $("tr"+mouseSearch).remove();
        }

        this.resize();
    },

    makeSampleContent: function (totalNumSamples) {
        var sampleNum;
        var mice = this.mouseNums;
        if(mice){
            var numMice = mice.length;
        }else {
            var numMice = 0;
        }
        for(var i = 0; i < totalNumSamples; i++){
            sampleNum = i + 1;
            if(! this.checkInArray(sampleNum, this.sampleNums)){
                if(sampleNum == 1){
                    $("#samplesAccordion").html("");
                    $(".sampleInfoDiv").html("");
                }
                this.sampleNums.push(sampleNum);
                this.miceInSamples[sampleNum] = [];
                this.makeSampleInfo(sampleNum);
                this.makeSamplingCard(sampleNum);
                this.makeSampleForTables(sampleNum);
            }
            for (var j = 0; j < numMice; j++){
                var mouse = mice[j];
                // console.log(mouse);
                var inSample = this.checkMiceInSamples(sampleNum, mouse);
                if(!inSample){
                    this.miceInSamples[sampleNum].push(mouse);
                    this.makeSampleForMouse(sampleNum, mouse);
                }
                this.watchMouseID(mouse);
            }
        }
        if(this.sampleNums){
            var proceed = true;
            for(var i = this.sampleNums.length; i > -1; i--){
                if(proceed){
                    var sampleNum = this.sampleNums[i];
                    if(sampleNum>totalNumSamples){
                        proceed = confirm("Are sure that you want to remove a sampling time?");
                        if(proceed){
                            $(this.sampleSearch(sampleNum)).remove();
                            this.sampleNums.splice(i, 1);
                            // Need to remove it from this.SampleNums
                            // console.log(this.sampleNums)
                        } else {
                            $("#numSamples").val(this.sampleNums.length);
                        }
                    }
                }
            }
        }
        $(".watch").each((i,e)=> {
            this.watchValue($(e));
        }).on("input", (e)=> {
            this.watchValue($(e.currentTarget));
        });

        this.resize();
    },

    miceInSamples: {},

    makeSampleForTables: function (sampleNum) {
        var $sample = $("#sampleTable");
        var calcs = ["sampleLabel", "sampleTime", "cort", "LH", "otherName"];
        $sample.find("tbody").append(
            $("<tr/>", {
                "data-sample": sampleNum
            })
        );
        var sampleSearch = this.sampleSearch(sampleNum);
        for( var i = 0; i < calcs.length; i++){
            var calc = calcs[i];
            $sample.find("tr"+sampleSearch).append(
                $("<td/>", {
                    "data-calc": calc,
                    "data-sample": sampleNum
                })
            )
        }

        var $mouse = $("#mouseTable");
        $mouse.find("thead").find("tr").append(
            $("<th/>", {
                "data-sample": sampleNum
            }).append("Sample"+sampleNum+"Start")
        ).append(
            $("<th/>", {
                "data-sample": sampleNum
            }).append("Sample"+sampleNum+"End")
        );
    },

    makeSampleInfo: function (sampleNum) {
        var $div = $(".sampleInfoDiv");

        var labelClass = "col-12 col-lg-6 font-weight-bold mt-2";
        var inputClass = "col-12 col-lg-6 mt-lg-2";

        $div.append(
            $("<div/>", {
                "class": "col-12 col-md-6 mt-2",
                "data-sample": sampleNum
            }).append(
                $("<div/>", {
                    "class": "card sampleInfo",
                    "data-sample": sampleNum
                }).append(
                    $("<button></button>", {
                        type: "button",
                        "class": "card-header"
                    }).on("click", (e)=> {this.toggleCard($(e.currentTarget))}).append("Sample " + sampleNum)
                ).append(
                    $("<div/>", {
                        "class": "card-body row collapse"
                    }).append(
                        $("<div/>", {
                            "class": labelClass
                        }).append($("<label></label>", {
                            "for": "sampleTime" + sampleNum
                        }).append("Exp Hour:"))
                    ).append(
                        $("<div/>", {
                            "class": inputClass
                        }).append(
                            $("<input/>", {
                                type: "number",
                                name: "sampletime"+sampleNum,
                                id: "sampleTime"+sampleNum,
                                "class": "sampleTime fullWidth watch",
                                "data-sample": sampleNum,
                                "data-watch": "sampleTime"
                            }).on("input", (e)=> {
                                this.watchSampleLabel($(e.currentTarget).data("sample"));
                            })
                        )
                    ).append(
                        $("<div/>", {
                            "class": labelClass
                        }).append($("<label></label>", {
                            "for": "sampleLabel" + sampleNum
                        }).append("Sample Label:"))
                    ).append(
                        $("<div/>", {
                            "class": inputClass
                        }).append(
                            $("<input/>", {
                                type: "text",
                                name: "samplelabel"+sampleNum,
                                id: "sampleLabel"+sampleNum,
                                "class": "sampleLabel fullWidth watch",
                                "data-sample": sampleNum,
                                "data-watch": "sampleLabel"
                            }).on("input", (e)=> {
                                this.watchSampleLabel($(e.currentTarget).data("sample"));
                            })
                        )
                    ).append(
                        $("<div/>", {
                            "class": labelClass
                        }).append("Sample for:")
                    ).append(
                        $("<div/>", {
                            "class": inputClass
                        }).append(
                            $("<div/>", {
                                "class": "row"
                            }).append(
                                $("<div/>", {
                                    "class": "col"
                                }).append(
                                    $("<label></label>", {
                                        "for": "cort"+sampleNum
                                    }).append("Cort: ")
                                ).append(
                                    $("<input/>", {
                                        type: "checkbox",
                                        name: "cort"+sampleNum,
                                        id: "cort"+sampleNum,
                                        "data-sample": sampleNum,
                                        "class": "cort watch",
                                        "data-watch": "cort"
                                    }).on("change", (e)=> {
                                        this.adjustForSampling(sampleNum);
                                    })
                                )
                            ).append(
                                $("<div/>", {
                                    "class": "col"
                                }).append(
                                    $("<label></label>", {
                                        "for": "LH"+sampleNum
                                    }).append("LH: ")
                                ).append(
                                    $("<input/>", {
                                        type: "checkbox",
                                        name: "lh"+sampleNum,
                                        id: "LH"+sampleNum,
                                        "data-sample": sampleNum,
                                        "class": "LH watch",
                                        "data-watch": "LH"
                                    }).on("change", (e)=> {
                                        this.adjustForSampling(sampleNum);
                                        var sampleSearch = this.sampleSearch(sampleNum);
                                        if($(e.currentTarget).is(":checked")){
                                            $(".ifLH"+sampleSearch).show();
                                        } else {
                                            $(".ifLH"+sampleSearch).hide();
                                        }
                                    })
                                )
                            )
                        ).append(
                            $("<div/>", {
                                "class": "row"
                            }).append(
                                $("<div/>", {
                                    "class": "col"
                                }).append(
                                    $("<label></label>", {
                                        "for": "otherSample"+sampleNum
                                    }).append("Other: ")
                                ).append(
                                    $("<input/>", {
                                        type: "checkbox",
                                        name: "othersample"+sampleNum,
                                        id: "otherSample"+sampleNum,
                                        "data-sample": sampleNum,
                                        "class": "otherSample"
                                    }).on("change", (e)=> {
                                        this.showIfOtherCheck($(e.currentTarget));
                                        this.adjustForSampling(sampleNum);
                                    })
                                ).append(
                                    $("<input/>", {
                                        type: "text",
                                        name: "othername"+sampleNum,
                                        id: "otherName"+sampleNum,
                                        "data-sample": sampleNum,
                                        "class": "otherName ifOther fullWidth watch",
                                        "data-watch": "otherName"
                                    })
                                )
                            )
                        )
                    )
                )
            )
        )
    },
    
    makeSamplingCard: function (sampleNum){
        var $div = $("#samplesAccordion");

        $div.append(
            $("<div/>", {
                "class": "card samplingCard",
                "data-sample": sampleNum
            }).append(
                $("<button></button>", {
                    type: "button",
                    "class": "card-header samplingHead",
                    id: "samplingHead"+sampleNum
                }).on("click", (e)=> {this.toggleCard($(e.currentTarget))}).append(
                    $("<h4/>", {
                        "class": "mb-0"
                    }).append(
                        $("<div/>", {
                            "class": "sampleLabelCalc",
                            "data-sample": sampleNum
                        }).append("Sample " + sampleNum)
                    )
                )
            ).append(
                $("<div/>", {
                    "class": "samplingBody collapse",
                    id: "samplingBody"+sampleNum,
                    "data-sample": sampleNum
                }).append(
                    $("<div/>", {
                        "class": "card-body divForMouseSampling",
                        "data-sample": sampleNum
                    })
                )
            )
        );  
    },
    
    makeSampleForMouse: function (sampleNum, mouseNum) {
        var sampleSearch = this.sampleSearch(sampleNum);
        var $div = $(".divForMouseSampling"+sampleSearch);
        var sampMouseID = sampleNum + "_" + mouseNum;

        $div.append(
            $("<div/>", {
                "class": "card mouseSampleCard",
                "data-sample": sampleNum,
                "data-mouse": mouseNum
            }).append(
                $("<button></button>", {
                    type: "button",
                    "class": "card-header",
                    id: "heading"+sampMouseID
                }).on("click", (e)=> {this.toggleCard($(e.currentTarget))}).append(
                    $("<h4/>", {
                        "class": "mb-0"
                    }).append(
                        $("<div/>", {
                        }).append(
                            $("<span/>", {
                                "class": "mouseIDCalc",
                                "data-mouse": mouseNum,
                            }).append("[Enter Mouse ID]")
                        ).append(
                            $("<span/>", {
                                "class": "shortIDCalc",
                                "data-mouse": mouseNum
                            }).append("[Enter Short ID]")
                        )
                    )
                )
            ).append(
                $("<div/>", {
                    id: "body"+sampMouseID,
                    "class": "collapse"
                }).append(
                    $("<div/>", {
                        "class": "card-body container",
                        "data-mouse": mouseNum,
                        "data-sample": sampleNum
                    }).append(
                        $("<div></div>", {
                            "class": "ifSampling",
                            "data-sample": sampleNum
                        }).append(
                            this.makeTimeButtonRow(sampMouseID, mouseNum, sampleNum, "Time")
                        )
                    ).append(
                        $("<div/>", {
                            "class": "row mt-2"
                        }).append(
                            $("<div/>", {
                                "class": "col-12 col-md-6"
                            }).append(
                                $("<select/>", {
                                    id: "behaviorNotes"+sampMouseID,
                                    name: "behaviornotes"+sampMouseID,
                                    "class": "behaviorNotes fullWidth",
                                    "data-mouse": mouseNum,
                                    "data-sample": sampleNum
                                }).append(
                                    '<option value="">[Select]</option><option value="calm">Calm</option><option value="jumpy">Jumpy</option><option value="exploring">Exploring</option><option value="hunched">Hunched</option>'
                                )
                            ).append(
                                $("<input/>", {
                                    type: "button", 
                                    value: "Add notes",
                                    id: "addNotes"+sampMouseID,
                                    name: "addnotes"+sampMouseID,
                                    "class": "addNotes fullWidth disableOnView",
                                    "data-sample": sampleNum,
                                    "data-mouse": mouseNum,
                                }).on("click", (e)=> {
                                    var thisMouseNum = $(e.currentTarget).data("mouse");
                                    var thisSampleNum = $(e.currentTarget).data("sample");
                                    var mouseSearch = this.mouseSearch(mouseNum);
                                    var sampleSearch = this.sampleSearch(sampleNum);
                                    var selectedBehavior = $(".behaviorNotes"+mouseSearch+sampleSearch).find("option:selected").text();
                                    if(selectedBehavior == "[Select]"){
                                        selectedBehavior = "";
                                    }
                                    var currentVal = $(".notes"+mouseSearch+sampleSearch).val();
                                    if(currentVal){
                                        currentVal = currentVal + "\n";
                                    }
                                    $(".notes"+mouseSearch+sampleSearch).val(currentVal+selectedBehavior);
                                    // Resize
                                    var notesTxtbox = document.getElementById("notes"+thisSampleNum+"_"+thisMouseNum);
                                    notesTxtbox.style.height = 'auto';
                                    notesTxtbox.style.height = (notesTxtbox.scrollHeight) + 'px';
                                    this.resize();
                                })
                            )
                        ).append(
                            $("<div/>", {
                                "class": "col-12 col-md-6 mt-2 mt-md-0"
                            }).append(
                                $('<text' + 'area></text' + 'area>', {
                                    id: "notes"+sampMouseID,
                                    name: "notes"+sampMouseID,
                                    "class": "notes fullWidth autoAdjust",
                                    "placeholder": "Notes",
                                    "data-mouse": mouseNum,
                                    "data-sample": sampleNum
                                }).on("input", (e)=> {
                                    e.currentTarget.style.height = 'auto';
                                    e.currentTarget.style.height = (e.currentTarget.scrollHeight) + 'px';
                                    this.resize();
                                })
                            )
                        )
                    ).append(
                        $("<div></div>", {
                            "class": "ifLH",
                            "data-sample": sampleNum
                        }).append(
                            $("<div/>", {
                                "class": "row mt-2"
                            }).append(
                                $("<div/>", {
                                    "class": "col-12 col-md-6"
                                }).append(
                                    $("<label></label>", {
                                        "for": "lhnum"+sampMouseID
                                    }).append("LH Sample ID")
                                )
                            ).append(
                                $("<div/>", {
                                    "class": "col-12 col-md-6 mt-2 mt-md-0"
                                }).append(
                                    $('<input></input>', {
                                        "type": "number",
                                        id: "lhnum"+sampMouseID,
                                        name: "lhnum"+sampMouseID,
                                        "class": "lhnum fullWidth",
                                        "data-mouse": mouseNum,
                                        "data-sample": sampleNum
                                    })
                                )
                            )
                        )
                    )
                )
            )
        )

        var $mouseTable = $("#mouseTable");

        var mouseSearch = this.mouseSearch(mouseNum);
        $mouseTable.find("tr"+mouseSearch).append(
            $("<td/>", {
                "data-calc": "startTime",
                "data-mouse": mouseNum,
                "data-sample": sampleNum
            })
        ).append(
            $("<td/>", {
                "data-calc": "endTime",
                "data-mouse": mouseNum,
                "data-sample": sampleNum
            })
        );
    },

    makeOneTimeEntry: function(sampMouseID, mouseNum, sampleNum, className, timing){
        var lowerCaseName = className.toLowerCase();
        var lowerCaseTime = timing.toLowerCase();

        var $timeDiv = $("<div/>", {
            "class": "col-12 col-md-6"
        }).append(
            $("<input></input>", {
                type: "button",
                value: timing + " " + className, 
                id: lowerCaseTime +className + "Button"+sampMouseID,
                name: lowerCaseTime+lowerCaseName+"button"+sampMouseID,
                "class": lowerCaseTime+className+"Button fullWidth disableOnView",
                "data-mouse": mouseNum,
                "data-sample": sampleNum,
            }).on("click", (e)=> {
                this.updateTimeButton($(e.currentTarget), lowerCaseTime+className);
            })
        ).append(
            $("<input></input>", {
                type: "time",
                // value: "Start", 
                id: lowerCaseTime+className+sampMouseID,
                name: lowerCaseTime+lowerCaseName+sampMouseID,
                "class": lowerCaseTime+className+" fullWidth watch",
                "data-mouse": mouseNum,
                "data-sample": sampleNum,
                "placeholder": "hh:mm",
                "data-watch": lowerCaseTime +className
            }).each((i,e)=> {
                this.checkTimeFormat($(e));
            }).on("change", (e)=> {
                this.checkTimeFormat($(e.currentTarget));
            })
        )
        return $timeDiv
    },

    makeTimeButtonRow: function (sampMouseID, mouseNum, sampleNum, className){
        var $div = $("<div></div>", {
            "class": "row mt-2"
        }).append(
            this.makeOneTimeEntry(sampMouseID, mouseNum, sampleNum, className, "Start")
        ).append(
            this.makeOneTimeEntry(sampMouseID, mouseNum, sampleNum, className, "End")
        )
        return $div
    },

    updateTimeButton: function($el, updateClass){
        var thisMouseNum = $el.data("mouse");
        var thisSampleNum = $el.data("sample");
        var mouseSearch = this.mouseSearch(thisMouseNum);
        var sampleSearch = this.sampleSearch(thisSampleNum);
        var currentTime = luxon.DateTime.now();
        // en-GB makes it so that midnight is 00:xx instead of 24:xx
        var timeString = currentTime.toLocaleString({...luxon.DateTime.TIME_24_SIMPLE, locale: "en-GB"});
        var proceed = true;
        var $updateEl = $("."+updateClass+mouseSearch+sampleSearch);
        if($updateEl.val()){
            proceed = confirm("Are you sure that you want to replace the time?");
        }
        if(proceed){
            $updateEl.val(timeString);
            this.watchValue($updateEl);
            this.checkTimeFormat($updateEl);
        }
        this.resize();
    },

    checkMiceInSamples: function (sampleNum, mouseNum){
        var sampleNumArray = this.miceInSamples[sampleNum];
        var inSample = this.checkInArray(mouseNum, sampleNumArray);
        return inSample;
    },

    dataSearch: function (dataName, dataValue) {
        var dataSearch = "[data-" + dataName + "='" + dataValue + "']";
        return dataSearch;
    },

    mouseSearch: function (mouseNum){
        var mouseSearch = this.dataSearch("mouse", mouseNum);
        return mouseSearch;
    },

    sampleSearch: function (sampleNum){
        var sampleSearch = this.dataSearch("sample", sampleNum);
        return sampleSearch;
    },

    tableSearch: function (table){
        var tableSearch = this.dataSearch("table", table);
        return tableSearch;
    },

    calcSearch: function (calc) {
        var calcSearch = this.dataSearch("calc", calc);
        return calcSearch;
    },

    showWithCheck: function ($chbx, $toToggle) {
        if($chbx.is(":checked")){
            $toToggle.show();
        } else {
            $toToggle.hide().html("");
        }
        this.resize();
    },

    showIfOtherCheck: function ($chbx) {
        var $ifOther = $chbx.next(".ifOther");
        this.showWithCheck($chbx, $ifOther);
    },

    //#region copy tables
    /**
     * This either shows or hides (toggles) the table provided as a parameter. 
     * It checks if the data is valid, but this doesn't stop it from running.
     * It resizes the widget in the process.
     * 
     * @param {*} $table - jQuery object for table
    **/
    toggleTableFuncs: function ($table, $errorMsg) {
        this.data_valid_form($errorMsg);
        $table.toggle();
        this.resize();
    },

    /**
     * Set of functions when toCSVButton clicked
     * 
     * Checked if data is valid, exports the table to a CSV
     * Updates the error message accordingly
     * 
     * @param {string} fileName - fileName for the CSV that will be produced
     * @param {string} tableID - tableID as a string for the table that will be copied
     * @param $errorMsg - error message div as jQuery object
    **/
    toCSVFuncs: function (fileName, tableID, $errorMsg) {
        var data_valid = this.data_valid_form($errorMsg); // update data_valid_form to print to specific error field

        if (data_valid) {
            this.exportTableToCSV(fileName, tableID);
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Saved successfully</span>");
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Did not export</span>");
        }
    },

    /**
     * This function takes a csv element and filename that are passed from the
     * exportTableToCSV function.
     * 
     * This creates a csvFile and builds a download link that references this file.
     * The download link is "clicked" by the function to prompt the browser to 
     * download this file
     * 
     * source: https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
     * 
     * @param {*} csv - This is the csv passed from the exportToCSV function
     * @param {*} filename - This is the name of the file passed from exportToCSV function
     */
    downloadCSV: function (csv, filename) {
        var csvFile;
        var downloadLink;

        // CSV file
        csvFile = new Blob([csv], { type: "text/csv" });

        // Download link
        downloadLink = document.createElement("a");

        // File name
        downloadLink.download = filename;

        // Create a link to the file
        downloadLink.href = window.URL.createObjectURL(csvFile);

        // Hide download link
        downloadLink.style.display = "none";

        // Add the link to DOM
        document.body.appendChild(downloadLink);

        // Click download link
        downloadLink.click();
    },
    
    /**
     * This function takes a filename and table name (both strings) as input
     * It then creates a csv element from the table
     * This csv element is passed to the downloadCSV function along with the filename
     * 
     * source: https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
     * @param {string} filename the name of the CSV file that will be downloaded
     * @param {string} table the id of the table that will be exported
     */
    exportTableToCSV: function (filename, table) {
        var tableArray = this.getTableArray($("#"+ table), copyHead = true, transpose = false);
        var tableString = this.convertRowArrayToString(tableArray, ",", "\n");


        // One option that works with Excel, but may not be universal to protect against commas in the fields
        // var tableString = this.convertRowArrayToString(tableArray, "\t", "\n");
        // tableString = "sep=\t\n" + tableString;

        // Download CSV file
        this.downloadCSV(tableString, filename);
    },

    /**
     * The steps that should be taken when the copy data button is pressed
     * Checks if the $copyHead is checked, and then
     * checks if the data is valid. If it is, it shows the table, resizes, and then
     * copies the table (via a temporary textarea that is then removed). 
     * 
     * @param $copyHead - checkbox for whether or not to copy the table head as jQuery object
     * @param $tableToCopy - table to copy as jQuery object
     * @param $tableDiv - div containing table to copy
     * @param $errorMsg - error message div as jQuery object
     * @param $divForCopy - div where the output should copy to
     * @param $transpose - checkbox for whether or not to transpose the table head as jQuery object
     */
     copyDataFuncs: function ($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy, $transpose){
        var data_valid = this.data_valid_form($errorMsg); // update data_valid_form to print to specific error field
        var copyHead = false, transpose = false;

        //only copy the heading when the input box is checked
        if ($copyHead.is(":checked")) {
            copyHead = true;
        }

        // if ($transpose.is(":checked")) {
        //     transpose = true;
        // }

        if (data_valid) { //if data is valid
            $tableDiv.show(); //show the table
            this.resize(); //resize
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Copied successfully</span>") //update error message
            this.copyTable($tableToCopy, copyHead, $divForCopy, $errorMsg, transpose); //copy table
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>"); //add to error message
        }
    },

    /**
     * This function creates a temporary textarea and then appends the contents of the
     * specified table body to this textarea, separating each cell with a tab (\t).
     * Because the script editor in LA is within a <textarea> the script cannot contain
     * the verbatim string "textarea" so this must be separated as "text" + "area"
     * to avoid errors.
     * 
     * If copying a table that has form inputs, you
     * 
     * If copying a table that could have multiple table rows (<tr>), the use the 
     * \n new line separator
     * 
     * @param {*} $table - jQuery object for the table that will be copied
     * @param {*} copyHead - true/false for whether or not the table head should be copied
     * @param {*} $divForCopy - where the temp textarea should be added
     * @param {*} $errorMsg - where to update the user
     * @param {*} transpose - true if table should be transposed
     */
     copyTable: function ($table, copyHead, $divForCopy, $errorMsg, transpose) {
        var tableArray = this.getTableArray($table, copyHead, transpose);
        var tableString = this.convertRowArrayToString(tableArray, "\t", "\n");
        this.copyStringToClipboard(tableString, $divForCopy, $errorMsg);
    },

    /**
     * Get the items from an HTML table into an array
     * 
     * If the table has form inputs, then you would need to adjust the $(e).text() to reflect .val() instead
     * 
     * @param {*} $table The table element that is to be read
     * @param {*} copyHead Whether or not to include the head of the table
     * @param {*} transpose Whether or not to tanspose the table
     * @returns the table as an array, with the each row being and element, and each row as an array where each cell is an element
     */
    getTableArray: function ($table, copyHead, transpose) {
        var rows = [];
        var rowNum = 0;
        // If you copying the head of the table
        if (copyHead) {
            // Find thead and then all children rows
            $table.find("thead").children("tr").each((i,e)=> {
                // If the table is being transposed, start the row number at 0 for each new row
                if(transpose){rowNum = 0;}
                // For each row, find each td or th element (table cell)
                $(e).find("td, th").each((i,e)=> {
                    // If there's not yet an array for this row, make an empty one
                    if(rows[rowNum]===undefined){rows[rowNum] = []}
                    // Add the text of each cell to the row's array
                    rows[rowNum].push($(e).text());
                    // If table is being transposed, add one to the row number for each cell
                    if(transpose){rowNum++;}
                });
                // If table is not being transposed, add one to the row number for each row
                if(!transpose){rowNum++;}
            });
        }

        // Find each row in the table body
        $table.find("tbody").children("tr").each((i,e)=> {
            // If transposing, start the row number at 0 for each new row
            if(transpose){rowNum = 0;}
            // Find each cell within the row
            $(e).find("td, th").each((i,e)=> {
                // If there's not yet an array for this row, make an empty one
                if(rows[rowNum]===undefined){rows[rowNum] = []}
                // Add the text of each cell to the row's array
                rows[rowNum].push($(e).text());
                // If the table is being transposed, add one to the row number for each cell
                if(transpose){rowNum++;}
            });
            // If table is not being transposed, add one to the row number for each row
            if(!transpose){rowNum++;}
        });
        return(rows);
    },

    /**
     * Take an array from a table and convert it to a string for export to clipboard or saving to csv
     * @param {*} rowArray An array where each row is an element, and each row is also an array containing each cell as an element
     * @param {*} cellSepString The string that should be used to separate each cell (column)
     * @param {*} newRowString The string that should be used to separate each row
     * @returns A single string of the table
     */
    convertRowArrayToString: function(rowArray, cellSepString = "\t", newRowString = "\n"){
        var rowString = [];
        rowArray.forEach((row)=>{
            if(row.length){
                row.forEach((cell, i)=>{
                    if(cell.includes(cellSepString) || cell.includes(newRowString)){
                        row[i] = '"' + cell + '"'; // protect if includes separator
                    }
                });
                rowString.push(row.join(cellSepString));
            }
        });
        var tableString = rowString.join(newRowString);
        return(tableString)
    },

    /**
     * This function will copy a string to the clipboard. If the string is blank, changes it to a single space
     * otherwise nothing is copied
     * 
     * The temporary <textarea> is appended to the HTML form and selected.
     * After the <textarea> is copied, it is then removed from the page.
     * 
     * @param {*} textStr The string that is to be copied to the clipboard
     * @param {*} $divForCopy The div on the page that should be used to create the temporary textarea
     * @param {*} $errorMsg Where messages to the user should be printed regarding status of the copy
     */
    copyStringToClipboard: function(textStr, $divForCopy, $errorMsg){
        var $temp = $("<text" + "area style='opacity:0;'></text" + "area>");

        if(textStr){
            errorStr = "Copy attempted";
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Copy attempted</span>");
        } else {
            textStr = " ";
            $errorMsg.html("<span style='color:red; font-size:24px;'>Nothing to copy</span>");
        }
        $temp.text(textStr);

        $temp.appendTo($divForCopy).select();
        document.execCommand("copy");
        $temp.remove();
        this.resize();
        
        // Doesn't work within LA b/c of permissions, but would be easier way to copy w/o appending to page
        // navigator.clipboard.writeText(rows.join("\n")); 
    },
    // #endregion copy tables

    copyLHSampleNums: function($divForCopy, $errorMsg){
        var table = this.getLHSampleNums();
        this.copyStringToClipboard(table, $divForCopy, $errorMsg);
    },

    getLHSampleNums: function(){
        var mice = [];
        var times = [];
        var LHIDs = [];
        for(var mouseNum of this.mouseNums){
            var mouseSearch = this.mouseSearch(mouseNum);
            var mouseID = $(".mouseID"+mouseSearch).val();
            if(!mouseID){
                mouseID = ""
            }
            for(var sampleNum of this.sampleNums){
                var sampleSearch = this.sampleSearch(sampleNum);
                var time = $(".sampleTime"+sampleSearch).val();
                if(time){
                    time = parseFloat(time);
                } else {
                    time = "";
                }
                if($(".LH"+sampleSearch).is(":checked")){
                    var LHID = $(".lhnum"+sampleSearch+mouseSearch).val();
                    mice.push(mouseID);
                    times.push(time);
                    LHIDs.push(LHID);
                }
            }
        }

        var table = [];
        var columnJoin = "\t";

        table = this.zip(mice, times, LHIDs);

        for(var row = 0; row < table.length; row++){
            table[row] = table[row].join(columnJoin); // add the separator between columns
        }

        return(table.join("\n"));
    },

    zip: function(...args){
        var len = 0;
        var array
        for(array of args){
            var arrLen = array.length;
            // console.log("array length", arrLen);
            if(arrLen>len){
                len = arrLen
            }
        }
        var numArrays = args.length;
    
        var arr = new Array(len);
    
        for(var i = 0; i < len; i += 1){
            arr[i] = [];
            for(array of args){
                arr[i].push(array[i]);
            }
        }
        // console.log("array", arr);
        return arr;
    },

        //#region dialog boxes
    // Need this because there is positioning for some elements within the form, and it gives the offset relative to that
    // parent element with positioning, rather than to the top of the form
    getOffsetTop: function(element){
        var offsetTop = 0;
        var lastElement = 0;
        while(element && !lastElement){
            // console.log("the element", element);
            var formChild = $(element).children("#the_form");
            if(formChild.length>0){
                // console.log("found the child");
                lastElement = 1;
            }
            offsetTop += element.offsetTop;
            element = element.offsetParent;
            // console.log("offsetTop", offsetTop)
        }
        return offsetTop
    },

    /**
     * Run the supplied function if user presses OK
     * 
     * @param text The message to be displayed to the user. 
     * @param functionToCall Function to run if user pressed OK
     * @param elForHeight Element to based the height of the dialog box on
     * 
     * If no text is provided, "Are you sure?" is used
     * Can supply a function with no parameters and no () after the name,
     * or an anonymous function using function(){} or ()=>{}
     * 
     * Nothing happens if cancel or "X" is pressed
     * 
     * If elForHeight is left blank, height is auto
     * 
     * Example:
     * this.runIfConfirmed(
            "Do you want to run the function?", 
            ()=>{
                console.log("pretend delete function");
            }
            (optional)
            , e.currentTarget
        );
    */
    runIfConfirmed: function(text, functionToCall, elForHeight = null){
        var thisMessage = "Are you sure?";
        if(text){
            thisMessage = text;
        }
        var top = "auto";
        if(elForHeight){
            // Used to change the position of the modal dialog box
            // top = elForHeight.offsetTop + "px";
            top = this.getOffsetTop(elForHeight) + "px";
        }
        bootbox.confirm({
            message: thisMessage,
            callback: (proceed)=>{
                if(proceed){
                    functionToCall()
                }
            }
        });
        // console.log(top)
        $(".modal-dialog").css("top", top);
    },

    /**
     * Confirm with user
     * 
     * @param text The message to display to user
     * @param functionToCall Function to run, with the result (true/false) as a parameter
     * @param elForHeight Element to based the height of the dialog box on
     * 
     * If no text is provided, "Do you wish to proceed?" is the default
     * Use an anonymous function, function(result){} or (result)=>{}. Then the function can use the result to decide what to do
     * 
     * If elForHeight is left blank, height is auto
     * 
     * Example:
     * this.dialogConfirm(
            "Make a choice:", 
            (result)=>{ // arrow function, "this" still in context of button
                if(result){
                    console.log("You chose OK");
                } else {
                    console.log("You canceled or closed the dialog");
                }
            }
        );
        */
    dialogConfirm: function(text, functionToCall, elForHeight = null){
        var thisMessage = "Do you want to proceed?";
        if(text){
            thisMessage = text;
        }
        var top = "auto";
        if(elForHeight){
            // Used to change the position of the modal dialog box
            top = this.getOffsetTop(elForHeight) + "px";
        }
        bootbox.confirm({
            message: thisMessage,
            callback: (result)=>{
                functionToCall(result);
            }
        });
        $(".modal-dialog").css("top", top);
    },

    /**
     * Get user input for a function
     * 
     * @param prompt Text to provide to the user
     * @param functionToCall Function to run, with the user input as a parameter
     * @param elForHeight Element to based the height of the dialog box on
     * 
     * If no text is provided, "Enter value:" is used as default
     * Use an anonymous function, function(result){} or (result)=>{}. Then the function can use the result to decide what to do
     * 
     * If elForHeight is left blank, height is auto
     *  
     * Example:
     * this.runBasedOnInput(
            "Enter a number from 0-10", (result)=>{
                if(result <= 10 && result >= 0){
                    console.log("You entered: " + result);
                } else {
                    console.log("You did not enter an appropriate value");
                }
            }
        );
        */ 
    runBasedOnInput: function(prompt, functionToCall, elForHeight = null){
        var thisTitle = "Enter value:"
        if(prompt){
            thisTitle = prompt;
        }
        var top = "auto";
        if(elForHeight){
            // Used to change the position of the modal dialog box
            top = this.getOffsetTop(elForHeight) + "px";
        }
        bootbox.prompt({
            title: thisTitle,
            callback: (result)=>{
                functionToCall(result);
            }
        });
        $(".modal-dialog").css("top", top);
    },
    //#endregion dialog boxes
};
my_widget_script =
{
    mouseNums: [],
    sampleNums: [],
    startTime: "",

    init: function (mode, json_data) {
        var parsedJson = this.parseInitJson(json_data);
        this.makeVehCard();
        this.initDynamicContent(parsedJson);
        // this.updateDoseChoices();
        // $(".mouseDose").each((i,e)=>{
        //     console.log("dosages before parent init", $(e).val());
        // })
        //resize the content box when the window size changes
        window.onresize = ()=> this.resize(); // need the arrow func, or "this" within resize becomes associated with event
        this.addEventListeners();
        this.parent_class.init(mode, () => JSON.stringify(parsedJson.widgetData));
        // $(".mouseDose").each((i,e)=>{
        //     console.log("dosages after parent init", $(e).val());
        // })

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
            sampleNums: dynamicContent.sampleNums,
            doseNums: dynamicContent.doseNums,
            doses: dynamicContent.doses,
            // miceDoses: dynamicContent.miceDoses
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
            sampleNums: [1, 2, 3],
            doseNums: [1, 2],
            doses: {
                1: {id: "10"},
                2: {id: "3"}
            }
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

        if(parsedJson.doses){
            this.doses = parsedJson.doses;
        } else {
            this.doses = {}
        }

        if(parsedJson.doseNums){
            for (var i = 0; i < parsedJson.doseNums.length; i++){
                dose = parsedJson.doseNums[i];
                this.doseNums.push(dose);
                this.makeDoseCard(dose);
            }
        } else {
            this.doseNums = [];
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

            if($("#expDate").val() && $("#numSamples").val()>1){
                $(".samplesDiv").insertBefore(".info");
            }
        }
    },

    addEventListeners: function () {
        $(".toggleTable").on("click", (e)=> {
            var tableID = $(e.currentTarget).data("table");
            var $table = $("#"+tableID);
            this.toggleTableFuncs($table);
        });

        $('.toCSV').on("click", (e)=> {
            var tableID = $(e.currentTarget).data("table");
            var dateToday = luxon.DateTime.now().toISODate();
            var fileName = "stress_"+tableID+"_"+dateToday;
            var $errorMsg = $("#errorMsg");
            
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

       $(".copyNutella").on("click", (e)=> {
            var $errorMsg = $(".errorMsg");
            var $divForCopy = $("#forCopy");

            this.copyNutellaEating($divForCopy, $errorMsg);
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

        $.each(my_widget_script.mouseNums, function () {
            // console.log(this);
            my_widget_script.watchMouseID(this);
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

        $(".calcNutella").on("change", (e)=>{
            var mouseNum = $(e.currentTarget).data("mouse");
            this.calcNutella(mouseNum);
        });

        $(".calcAllNutella").on("change", (e)=>{
            this.calcAllNutella();
        });

        this.calcAllNutella();

        $("#drugName").each((i,e)=>{
            this.showOther($(e));
        }).on("input", (e)=>{
            this.showOther($(e.currentTarget));
            this.changeStockConc($(e.currentTarget));
        });

        $("#addDose").on("click", (e)=>{
            if(this.doseNums.length > 0){
                var lastDose = this.doseNums[this.doseNums.length - 1];
                var doseNum = lastDose + 1;
            } else {
                var doseNum = 1;
            }

            var inArray = this.checkInArray(doseNum, this.doseNums);
            if(! inArray){
                this.doseNums.push(doseNum);
                this.doses[doseNum] = {}
                this.makeDoseCard(doseNum);
            }
        });

        $("#stockConc").on("change", (e)=>{
            this.calcAllStock();
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

        $(".nutellaAtTime").each((i,e)=>{
            var sampleNum = $(e).data("sample");
            var sampleSearch = this.sampleSearch(sampleNum);
            if($(e).is(":checked")){
                $(".ifNutella"+sampleSearch).show();
            } else {
                $(".ifNutella"+sampleSearch).hide();
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

        this.calcAllStock();

        this.calcVehicle();

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

    makeVehCard: function () {
        var $div = $("#vehCards");

        // if(! $div.find(".card").length){
            $div.html(""); // always start over. One vehicle
        // }

        var row = "row mt-2";
        var col = "col-12 col-lg-6";
        $div.append(
            $("<div></div>", {
                "class": "col col-md-6 mt-2 vehCard"
            }).append(
                $("<div></div>", {
                    "class": "card"
                }).append(
                    $("<button></button>", {
                        "class": "card-header vehHeader",
                        "type": "button"
                    }).on("click", (e)=> {
                        this.toggleCard($(e.currentTarget));
                    }).append("Vehicle")
                ).append(
                    $("<div></div>", {
                        "class": "card-body collapse"
                    }).append(
                        $("<div></div>", {
                            "class": row
                        }).append(
                            $("<div></div>", {
                                "class": col
                            }).append("<h4>Volume (&micro;L/Nutella dose):</h4>")
                        ).append(
                            $("<div></div>", {
                                "class": "col"
                            }).append(
                                $("<input></input>", {
                                    type: "number",
                                    id: "vehVol",
                                    name: "vehvol",
                                    "class": "vehVol fullWidth watch vehCalc",
                                    "data-watch": "veh"
                                })
                            )
                        )
                    ).append(
                        $("<div></div>", {
                            "class": row
                        }).append(
                            $("<div></div>", {
                                "class": col
                            }).append("Amount Nutella/mouse:")
                        ).append(
                            $("<div></div>", {
                                "class": "col"
                            }).append(
                                $("<input></input>", {
                                    type: "number", 
                                    val: 60,
                                    id: "nutellaPerMouseVeh",
                                    name: "nutellapermouseveh",
                                    "class": "nutellaPerMouseVeh fullWidth watch vehCalc",
                                    "data-watch": "nutellaPerMouseVeh"
                                })
                            )
                        )
                    ).append(
                        $("<div></div>", {
                            "class": row
                        }).append(
                            $("<div></div>", {
                                "class": col
                            }).append("Measured Nutella (mg):")
                        ).append(
                            $("<div></div>", {
                                "class": "col"
                            }).append(
                                $("<input></input>", {
                                    type: "number",
                                    id: "amntNutellaVeh",
                                    name: "amntnutellaveh",
                                    "class": "amntNutellaVeh fullWidth watch vehCalc",
                                    "data-watch": "amntNutellaVeh"
                                })
                            )
                        )
                    ).append(
                        $("<div></div>", {
                            "class": row
                        }).append(
                            $("<div></div>", {
                                "class": col
                            }).append("# of Nutella doses:")
                        ).append(
                            $("<div></div>", {
                                "class": "col numMiceDosesVeh"
                            })
                        )
                    ).append(
                        $("<div></div>", {
                            "class": row
                        }).append(
                            $("<div></div>", {
                                "class": col
                            }).append("Vehicle to add:")
                        ).append(
                            $("<div></div>", {
                                "class": "col calcedVehicle"
                            })
                        )
                    )
                )
            )
        )

        $(".watch").on("input", (e)=> {
            this.watchValue($(e.currentTarget));
        });

        $(".vehCalc").on("change", (e)=>{
            this.calcVehicle();
        });

        this.resize();
    },

    getCurrentDoseChoices: function(){
        var mice = this.mouseNums
        var currentSels = {};
        for(var i = 0; i < mice.length; i++){
            var mouse = mice[i];
            var mouseSearch = this.mouseSearch(mouse);
            var mouseSel = $(".mouseDose"+mouseSearch).val();
            currentSels[mouse] = {};
            currentSels[mouse].search = mouseSearch;
            currentSels[mouse].sel= mouseSel;
        }
        return currentSels
    },

    updateDoseChoices: function(){
        // Get the current selections for each mouse
        var mice = this.mouseNums;
        var currentSels = this.getCurrentDoseChoices();

        var $doseSelects = $(".mouseDose");
        $doseSelects.html("");
        $doseSelects.append(
            $("<option></option>", {
                value: 0
            }).append(
                "Vehicle"
            )
        );
        // $doseSelects.html("<option value='0'>Vehicle</option>");
        var doses = this.doses;
        for(var doseNum in doses){
            // console.log(doseNum);
            var dosage = doses[doseNum].id
            if(!dosage>0){
                dosage = doseNum
                doseText = "Dose #" + doseNum
            } else {
                doseText = dosage + "mg/kg"
            }
            // $doseSelects.append(
            //     "<option value='" + dosage + "'>"+doseText+"</option>"
            // );
            $doseSelects.append(
                $("<option></option>", {
                    value: dosage
                }).append(
                    doseText
                )
            );
        }

        // Reset based on the current selections
        // If selected an undefined dose and that dose is updated, defaults to vehicle
        for(var i = 0; i < mice.length; i++){
            var mouse = mice[i];
            var mouseSearch = currentSels[mouse].search;
            var prevSel = currentSels[mouse].sel;
            $(".mouseDose"+mouseSearch).val(prevSel);
        }
    },
    
    deleteDoseFuncs: function (el) {
        var doseNum = $(el).data("dose");
        // console.log($(el), doseNum)
        this.runIfConfirmed(
            "Are you sure that you wish to delete this dose?", 
            ()=>{
                // Remove it from the doseNums
                var index = this.doseNums.indexOf(doseNum);
                if(index > -1){
                    this.doseNums.splice(index, 1);
                }

                //Remove it from doses
                delete this.doses[doseNum];
        
                var doseSearch = this.doseSearch(doseNum);
                $(doseSearch).remove();
                this.updateDoseChoices();
            },
            el
        );

        this.resize();
    },
    makeDoseCard: function (doseNum) {
        this.updateDoseChoices();
        var $div = $("#doseCards");

        if(! $div.find(".card").length){
            $div.html("");
        }

        var row = "row mt-2";
        var col = "col-12 col-lg-6";
        $div.append(
            $("<div></div>", {
                "class": "col col-md-6 mt-2 doseCard",
                "data-dose": doseNum
            }).append(
                $("<div></div>", {
                    "class": "card"
                }).append(
                    $("<button></button>", {
                        "class": "card-header doseHeader",
                        "type": "button",
                        "data-calc": "dose",
                        "data-dose": doseNum
                    }).on("click", (e)=> {
                        this.toggleCard($(e.currentTarget));
                    }).append("Dose " + doseNum)
                ).append(
                    $("<div></div>", {
                        "class": "card-body collapse"
                    }).append(
                        $("<div></div>", {
                            "class": row
                        }).append(
                            $("<div></div>", {
                                "class": col
                            }).append("<h4>Dosage (mg/kg):</h4>")
                        ).append(
                            $("<div></div>", {
                                "class": "col"
                            }).append(
                                $("<input></input>", {
                                    type: "number", 
                                    "data-dose": doseNum,
                                    id: "dosage"+doseNum,
                                    name: "dosage"+doseNum,
                                    "class": "dosage fullWidth watch stockCalc",
                                    "data-watch": "dose"
                                }).on("change", (e)=> {
                                    this.doses[doseNum]["id"] = $(e.currentTarget).val();
                                    this.updateDoseChoices();
                                })
                            )
                        )
                    ).append(
                        $("<div></div>", {
                            "class": row + " hideView"
                        }).append(
                            $("<div></div>", {
                                "class": col
                            }).append("Delete:")
                        ).append(
                            $("<div></div>", {
                                "class": "col"
                            }).append(
                                $("<input></input>", {
                                    type: "button", 
                                    value: "Delete Dose",
                                    "data-dose": doseNum,
                                    id: "deleteDose"+doseNum,
                                    name: "deletedose"+doseNum,
                                    "class": "deleteDose fullWidth",
                                }).on("click", (e)=> {
                                    this.deleteDoseFuncs(e.currentTarget);
                                })
                            )
                        )
                    ).append(
                        $("<div></div>", {
                            "class": row
                        }).append(
                            $("<div></div>", {
                                "class": col
                            }).append("Avg mouse mass (g):")
                        ).append(
                            $("<div></div>", {
                                "class": "col"
                            }).append(
                                $("<input></input>", {
                                    type: "number",
                                    val: 25,
                                    "data-dose": doseNum,
                                    id: "avgMouseMass"+doseNum,
                                    name: "avgmousemass"+doseNum,
                                    "class": "avgMouseMass fullWidth watch stockCalc",
                                    "data-watch": "avgMouseMass"
                                })
                            )
                        )
                    ).append(
                        $("<div></div>", {
                            "class": row
                        }).append(
                            $("<div></div>", {
                                "class": col
                            }).append("Amount Nutella/mouse:")
                        ).append(
                            $("<div></div>", {
                                "class": "col"
                            }).append(
                                $("<input></input>", {
                                    type: "number", 
                                    val: 60,
                                    "data-dose": doseNum,
                                    id: "nutellaPerMouse"+doseNum,
                                    name: "nutellapermouse"+doseNum,
                                    "class": "nutellaPerMouse fullWidth watch stockCalc",
                                    "data-watch": "nutellaPerMouse"
                                })
                            )
                        )
                    ).append(
                        $("<div></div>", {
                            "class": row
                        }).append(
                            $("<div></div>", {
                                "class": col
                            }).append("Measured Nutella (mg):")
                        ).append(
                            $("<div></div>", {
                                "class": "col"
                            }).append(
                                $("<input></input>", {
                                    type: "number",
                                    "data-dose": doseNum,
                                    id: "amntNutella"+doseNum,
                                    name: "amntnutella"+doseNum,
                                    "class": "amntNutella fullWidth watch stockCalc",
                                    "data-watch": "amntNutella"
                                })
                            )
                        )
                    ).append(
                        $("<div></div>", {
                            "class": row
                        }).append(
                            $("<div></div>", {
                                "class": col
                            }).append("Stock per mouse:")
                        ).append(
                            $("<div></div>", {
                                "class": "col stockPerMouse",
                                "data-dose": doseNum
                            })
                        )
                    ).append(
                        $("<div></div>", {
                            "class": row
                        }).append(
                            $("<div></div>", {
                                "class": col
                            }).append("# of Nutella doses:")
                        ).append(
                            $("<div></div>", {
                                "class": "col numMiceDoses",
                                "data-dose": doseNum
                            })
                        )
                    ).append(
                        $("<div></div>", {
                            "class": row
                        }).append(
                            $("<div></div>", {
                                "class": col
                            }).append("Stock to add:")
                        ).append(
                            $("<div></div>", {
                                "class": "col calcedStock",
                                "data-dose": doseNum
                            })
                        )
                    )
                )
            )
        )

        $(".watch").on("input", (e)=> {
            this.watchValue($(e.currentTarget));
        });

        $(".stockCalc").on("change", (e)=>{
            this.calcStock($(e.currentTarget).data("dose"));
        });

        this.resize();
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

    calcAllStock: function(){
        if(this.doseNums.length > 0){
            for(doseNum in this.doses){
                // console.log(doseNum);
                this.calcStock(doseNum);
            }
        }
    },

    doseNums: [],
    doses: {},

    stockConcs: {
        "cort": 25
    },

    changeStockConc: function($drugNameEl){
        var drug = $drugNameEl.val();
        var conc = this.stockConcs[drug];
        if(conc){
            $("#stockConc").val(conc);
        } else {
            $("#stockConc").val("");
        }
    },

    calcStock: function(doseNum){
        // var doseNum = $el.data("doseNum");
        var doseSearch = this.doseSearch(doseNum);
        var stockConc = $("#stockConc").val();
        // console.log("stockConc", stockConc);
        var stockAmnt, stockAmntPerMouse, nutellaForMouse;
        if(stockConc>0){
            var dosage = $(".dosage"+doseSearch).val();
            // console.log("dosage", dosage);
            if(dosage>0){
                var avgMouse = $(".avgMouseMass"+doseSearch).val();
                // console.log("avgMouse", avgMouse);
                if(avgMouse>0){
                    var nutellaPerMouse = $(".nutellaPerMouse"+doseSearch).val();
                    // console.log("nutellaPerMouse", nutellaPerMouse);
                    if(nutellaPerMouse>0){
                        var mouseMass = $(".mouseMass"+doseSearch).val();
                        if(mouseMass>0){
                            nutellaForMouse = mouseMass / avgMouse * nutellaPerMouse;
                        }
                        var amntNutella = $(".amntNutella"+doseSearch).val();
                        // console.log("amntNutella", amntNutella);
                        if(amntNutella>0){
                            stockAmntPerMouse = avgMouse * (1/1000) * dosage * (1/stockConc) * 1000; // mouse mass (g) / 1000 kg * dosage (mg/kg) * 1 mL stock / x mg stock * 1000 uL / 1 mL
                            numMiceDoses = amntNutella / nutellaPerMouse;
                            stockAmnt = numMiceDoses * stockAmntPerMouse;
                        } else {
                            stockAmnt = "{Enter measured Nutella}"
                        }
                    } else {
                        stockAmnt = "{Enter Nutella/mouse}"
                    }
                } else{
                    stockAmnt = "{Enter avg mouse mass}"
                }
            } else{
                stockAmnt = "{Enter dosage}"
            }
        } else {
            stockAmnt = "{Enter stock conc}"
        }
        if(isNaN(stockAmnt)){
            stockAmntPerMouse = stockAmnt
            numMiceDoses = stockAmnt
            nutellaForMouse = stockAmnt
        } else{
            if(stockAmnt>0){
                stockAmnt = +stockAmnt.toFixed(2) + "&micro;L";
            } else{
                stockAmnt = "{double check entries}";
            }
            if(stockAmntPerMouse>0){
                stockAmntPerMouse = +stockAmntPerMouse.toFixed(2) + "&micro;L";
            } else{
                stockAmntPerMouse = "{double check entries}";
            }
            if(numMiceDoses>0){
                numMiceDoses = +numMiceDoses.toFixed(2);
            } else{
                numMiceDoses = "{double check entries}";
            }
            if(nutellaForMouse>0){
                nutellaForMouse = +nutellaForMouse.toFixed(2) + "mg";
            } else {
                nutellaForMouse = "{double check entries}"
            }
        }
        $(".stockPerMouse"+doseSearch).html(stockAmntPerMouse);
        $(".numMiceDoses"+doseSearch).html(numMiceDoses);
        $(".calcedStock"+doseSearch).html(stockAmnt);
        $(".adjNutellaForMouse"+doseSearch).html(nutellaForMouse);
    },

    calcVehicle: function(){
        var vehAmnt;
        var vehVol = $(".vehVol").val();
        // console.log("vehVol", dosage);
        if(vehVol>0){
            var nutellaPerMouse = $(".nutellaPerMouseVeh").val();
            // console.log("nutellaPerMouse", nutellaPerMouse);
            if(nutellaPerMouse>0){
                var amntNutella = $(".amntNutellaVeh").val();
                // console.log("amntNutella", amntNutella);
                if(amntNutella>0){
                    numMiceDoses = amntNutella / nutellaPerMouse;
                    vehAmnt = numMiceDoses * vehVol;
                } else {
                    vehAmnt = "{Enter measured Nutella}"
                }
            } else {
                vehAmnt = "{Enter Nutella/mouse}"
            }
        } else{
            vehAmnt = "{Enter dosage}"
        }

        if(isNaN(vehAmnt)){
            numMiceDoses = vehAmnt;
        } else {
            if(vehAmnt>0){
                vehAmnt = +vehAmnt.toFixed(2) + "&micro;L";
            } else{
                vehAmnt = "{double check entries}";
            }
            if(numMiceDoses>0){
                numMiceDoses = +numMiceDoses.toFixed(2);
            } else {
                numMiceDoses= "{double check entries}";
            }
        }
        $(".numMiceDosesVeh").html(numMiceDoses)
        $(".calcedVehicle").html(vehAmnt);
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
        // var currentDoses = this.getCurrentDoseChoices();
        var dynamicContent = {
            mouseNums: this.mouseNums,
            sampleNums: this.sampleNums,
            doseNums: this.doseNums,
            doses: this.doses//,
            // miceDoses: currentDoses
        };
        return dynamicContent;
    },
    
    //source: https://stackoverflow.com/questions/18495310/checking-if-an-input-field-is-required-using-jquery
     data_valid_form: function () {
        var valid = true; 
        $('.needForTable').each((i,e)=> {
            if (!$(e).val()) { //if there is not a value for this input
                valid = false; //change valid to false
            }
        });

        if (!valid) {
            $(".errorMsg").html("<span style='color:red; font-size:36px;'>Please fill out all elements marked by a</span><span style='color:blue; font-size:36px;'> blue #</span>");
        } else {
            $(".errorMsg").html("");
        }

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
        var doseNum = $el.data("dose");
        var val = $el.val();
        if(doseNum){
            calcSearch += this.doseSearch(doseNum);
        }
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
        if(watch == "dose"){
            if(!val || isNaN(val)){
                val = "Dose " + doseNum;
            }else {
                val = val + " mg/kg";
            }
        }
        $(calcSearch).html(val);
    },

    makeMouseCard: function (mouseNum) {
        var inArray = this.checkInArray(mouseNum, this.mouseNums);
        if(! inArray){
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
                        }).append(
                            $("<div/>", {
                                "class": row
                            }).append(
                                $("<div/>", {
                                    "class": col
                                }).append("<h4>Mouse ID:</h4>")
                            ).append(
                                $("<div/>", {
                                    "class": "col"
                                }).append(
                                    $("<input/>", {
                                        type: "text", 
                                        "data-mouse": mouseNum,
                                        id: "mouseID"+mouseNum,
                                        name: "mouseid"+mouseNum,
                                        "class": "mouseID fullWidth watch",
                                        "data-watch": "mouseID"
                                    }).on("input", (e)=> {
                                        this.watchMouseID($(e.currentTarget).data("mouse"));
                                    })
                                )
                            )
                        ).append(
                            $("<div/>", {
                                "class": row
                            }).append(
                                $("<div/>", {
                                    "class": col
                                }).append("Short ID (for labels):")
                            ).append(
                                $("<div/>", {
                                    "class": "col"
                                }).append(
                                    $("<input/>", {
                                        type: "text", 
                                        "data-mouse": mouseNum,
                                        id: "shortID"+mouseNum,
                                        name: "shortid"+mouseNum,
                                        "class": "shortID fullWidth watch",
                                        "data-watch": "shortID"
                                    }).on("input", (e)=> {
                                        this.watchMouseID($(e.currentTarget).data("mouse"));
                                    })
                                )
                            )
                        ).append(
                            $("<div/>", {
                                "class": row
                            }).append(
                                $("<div/>", {
                                    "class": col
                                }).append("Stress Treatment:")
                            ).append(
                                $("<div/>", {
                                    "class": "col"
                                }).append(
                                    $("<select/>", {
                                        "data-mouse": mouseNum,
                                        id: "treatment"+mouseNum,
                                        name: "treatment"+mouseNum,
                                        "class": "treatment fullWidth watch",
                                        "data-watch": "treatment"
                                    }).append('<option value="CON">Control</option><option value="ALPS">Stress</option>')
                                )
                            )
                        ).append(
                            $("<div/>", {
                                "class": row
                            }).append(
                                $("<div/>", {
                                    "class": col
                                }).append("Drug Treatment:")
                            ).append(
                                $("<div/>", {
                                    "class": "col"
                                }).append(
                                    $("<select/>", {
                                        "data-mouse": mouseNum,
                                        id: "mouseDose"+mouseNum,
                                        name: "mousedose"+mouseNum,
                                        "class": "mouseDose fullWidth watch",
                                        "data-watch": "mouseDose"
                                    }).append(
                                        // '<option value="0">Vehicle</option><option value="3">3mg/kg</option>'
                                    )
                                )
                            )
                        ).append(
                            $("<div/>", {
                                "class": row + " hideView"
                            }).append(
                                $("<div/>", {
                                    "class": col
                                }).append("Delete:")
                            ).append(
                                $("<div/>", {
                                    "class": "col"
                                }).append(
                                    $("<input/>", {
                                        type: "button", 
                                        value: "Delete Mouse",
                                        "data-mouse": mouseNum,
                                        id: "deleteMouse"+mouseNum,
                                        name: "deletemouse"+mouseNum,
                                        "class": "deleteMouse fullWidth",
                                    }).on("click", (e)=> {
                                        this.deleteMouseFuncs($(e.currentTarget).data("mouse"));
                                    })
                                )
                            )
                        ).append(
                            $("<div/>", {
                                "class": row
                            }).append(
                                $("<div/>", {
                                    "class": col
                                }).append("Sex:")
                            ).append(
                                $("<div/>", {
                                    "class": "col"
                                }).append(
                                    $("<select/>", {
                                        "data-mouse": mouseNum,
                                        id: "sex"+mouseNum,
                                        name: "sex"+mouseNum,
                                        "class": "sex fullWidth watch",
                                        "data-watch": "sex"
                                    }).append(
                                        '<option value="">[Select]</option><option value="male">Male</option><option value="female">Female</option>'
                                    ).on("input", (e)=> {
                                        var sex = $(e.currentTarget).val();
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
                                    }).each((i,e)=>{
                                        var sex = $(e).val();
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
                                    })
                                )
                            )
                        ).append(
                            $("<div></div>", {
                                "class": "ifFemale",
                                "data-mouse": mouseNum
                            }).append(
                                $("<div/>", {
                                    "class": row
                                }).append(
                                    $("<div/>", {
                                        "class": col
                                    }).append("Estrous Stage:")
                                ).append(
                                    $("<div/>", {
                                        "class": "col"
                                    }).append(
                                        $("<select/>", {
                                            "data-mouse": mouseNum,
                                            id: "stage"+mouseNum,
                                            name: "stage"+mouseNum,
                                            "class": "stage fullWidth watch",
                                            "data-watch": "stage"
                                        }).append('<option value="">Select</option><option value="diestrus">Diestrus</option><option value="proestrus">Proestrus</option><option value="estrus">Estrus</option>')
                                    )
                                )
                            )
                        ).append(
                            $("<div/>", {
                                "class": row
                            }).append(
                                $("<div/>", {
                                    "class": col
                                }).append("Start Body Mass (g):")
                            ).append(
                                $("<div/>", {
                                    "class": "col"
                                }).append(
                                    $("<input/>", {
                                        type: "number", 
                                        "data-mouse": mouseNum,
                                        id: "mass"+mouseNum,
                                        name: "mass"+mouseNum,
                                        "class": "mass fullWidth watch calcNutella",
                                        "data-watch": "mass"
                                    }).on("input", (e)=>{
                                        this.calcNutella(mouseNum);
                                    })
                                )
                            )
                        ).append(
                            $("<div></div>", {
                                "class": row
                            }).append(
                                $("<div></div>", {
                                    "class": col
                                }).append("Nutella for mouse:")
                            ).append(
                                $("<div></div>", {
                                    "class": "col adjNutellaForMouse",
                                    "data-mouse": mouseNum
                                })
                            )
                        ).append(
                            $("<div/>", {
                                "class": row
                            }).append(
                                $("<div/>", {
                                    "class": col
                                }).append("Uterine/Seminal Vesicle Mass (mg):")
                            ).append(
                                $("<div/>", {
                                    "class": "col"
                                }).append(
                                    $("<input/>", {
                                        type: "text", 
                                        "data-mouse": mouseNum,
                                        id: "reproMass"+mouseNum,
                                        name: "repromass"+mouseNum,
                                        "class": "reproMass fullWidth watch",
                                        "data-watch": "reproMass"
                                    })
                                )
                            )
                        ).append(
                            $("<div/>", {
                                "class": row
                            }).append(
                                $("<div/>", {
                                    "class": col
                                }).append("Ovarian/Testicular Mass (mg):")
                            ).append(
                                $("<div/>", {
                                    "class": "col"
                                }).append(
                                    $("<input/>", {
                                        type: "text", 
                                        "data-mouse": mouseNum,
                                        id: "gonadMass"+mouseNum,
                                        name: "gonadmass"+mouseNum,
                                        "class": "gonadMass fullWidth watch",
                                        "data-watch": "gonadMass"
                                    })
                                )
                            )
                        ).append(
                            $("<div/>", {
                                "class": row
                            }).append(
                                $("<div/>", {
                                    "class": col
                                }).append("Adrenal Mass (mg):")
                            ).append(
                                $("<div/>", {
                                    "class": "col"
                                }).append(
                                    $("<input/>", {
                                        type: "text", 
                                        "data-mouse": mouseNum,
                                        id: "adrenalMass"+mouseNum,
                                        name: "adrenalmass"+mouseNum,
                                        "class": "adrenalMass fullWidth watch",
                                        "data-watch": "adrenalMass"
                                    })
                                )
                            )
                        ).append(
                            $("<div/>", {
                                "class": row
                            }).append(
                                $("<div/>", {
                                    "class": col
                                }).append("Post body mass (g):")
                            ).append(
                                $("<div/>", {
                                    "class": "col"
                                }).append(
                                    $("<input/>", {
                                        type: "text", 
                                        "data-mouse": mouseNum,
                                        id: "postBodyMass"+mouseNum,
                                        name: "postbodymass"+mouseNum,
                                        "class": "postBodyMass fullWidth watch",
                                        "data-watch": "postBodyMass"
                                    })
                                )
                            )
                        ).append(
                            $("<div></div>", {
                                "class": "ifFemale",
                                "data-mouse": mouseNum
                            }).append(
                                $("<div/>", {
                                    "class": row
                                }).append(
                                    $("<div/>", {
                                        "class": col
                                    }).append("Check for ovulation?")
                                ).append(
                                    $("<div/>", {
                                        "class": "col"
                                    }).append(
                                        $("<input/>", {
                                            type: "checkbox", 
                                            "data-mouse": mouseNum,
                                            id: "checkOvulation"+mouseNum,
                                            name: "checkovulation"+mouseNum,
                                            "class": "checkOvulation fullWidth watch",
                                            "data-watch": "checkOvulation"
                                        }).on("change", (e)=>{
                                            var mouseSearch = this.mouseSearch(mouseNum);
                                            if($(e.currentTarget).is(":checked")){
                                                $(".ifOvulation"+mouseSearch).show();
                                            } else {
                                                $(".ifOvulation"+mouseSearch).hide();
                                            }
                                            })
                                    )
                                )
                            )
                        ).append(
                            $("<div></div>", {
                                "class": "ifOvulation",
                                "data-mouse": mouseNum
                            }).append(
                                $("<div/>", {
                                    "class": row
                                }).append(
                                    $("<div/>", {
                                        "class": col
                                    }).append("Sac date:")
                                ).append(
                                    $("<div/>", {
                                        "class": "col"
                                    }).append(
                                        $("<input/>", {
                                            type: "date", 
                                            "data-mouse": mouseNum,
                                            id: "sacDate"+mouseNum,
                                            name: "sacdate"+mouseNum,
                                            "class": "sacDate fullWidth watch",
                                            "data-watch": "sacDate"
                                        }).each((i,e)=> {
                                            this.checkDateFormat($(e));
                                        }).on("change", (e)=> {
                                            this.checkDateFormat($(e.currentTarget));
                                        })
                                    )
                                )
                            ).append(
                                $("<div/>", {
                                    "class": row
                                }).append(
                                    $("<div/>", {
                                        "class": col
                                    }).append("Sac time:")
                                ).append(
                                    $("<div/>", {
                                        "class": "col"
                                    }).append(
                                        $("<input/>", {
                                            type: "time", 
                                            "data-mouse": mouseNum,
                                            id: "sacTime"+mouseNum,
                                            name: "sactime"+mouseNum,
                                            "class": "sacTime fullWidth watch",
                                            "data-watch": "sacTime"
                                        }).each((i,e)=> {
                                            this.checkTimeFormat($(e));
                                        }).on("change", (e)=> {
                                            this.checkTimeFormat($(e.currentTarget));
                                        })
                                    )
                                )
                            ).append(
                                $("<div/>", {
                                    "class": row
                                }).append(
                                    $("<div/>", {
                                        "class": col
                                    }).append("Estrous Stage:")
                                ).append(
                                    $("<div/>", {
                                        "class": "col"
                                    }).append(
                                        $("<input></input>", {
                                            "type": "text",
                                            "data-mouse": mouseNum,
                                            id: "nextStage"+mouseNum,
                                            name: "nextstage"+mouseNum,
                                            "class": "nextStage fullWidth watch",
                                            "data-watch": "nextStage"
                                        })
                                    )
                                )
                            ).append(
                                $("<div/>", {
                                    "class": row
                                }).append(
                                    $("<div/>", {
                                        "class": "col-12"
                                    }).append("Uterine Description:")
                                ).append(
                                    $("<div/>", {
                                        "class": "col-12"
                                    }).append(
                                        $("<texta"+ "rea></tex" + "tarea>", {
                                            "data-mouse": mouseNum,
                                            id: "uterus"+mouseNum,
                                            name: "uterus"+mouseNum,
                                            "class": "uterus fullWidth watch autoAdjust",
                                            "data-watch": "uterus"
                                        }).on("input", (e)=>{
                                            this.updateTextarea(e.currentTarget);
                                        })
                                    )
                                )
                            ).append(
                                $("<div/>", {
                                    "class": row
                                }).append(
                                    $("<div/>", {
                                        "class": col
                                    }).append("# Oocytes - oviduct 1:")
                                ).append(
                                    $("<div/>", {
                                        "class": "col"
                                    }).append(
                                        $("<input></input>", {
                                            "type": "number",
                                            "data-mouse": mouseNum,
                                            id: "oocytes1"+mouseNum,
                                            name: "oocytes1"+mouseNum,
                                            "class": "oocytes1 fullWidth watch",
                                            "data-watch": "oocytes1"
                                        })
                                    )
                                )
                            ).append(
                                $("<div/>", {
                                    "class": row
                                }).append(
                                    $("<div/>", {
                                        "class": col
                                    }).append("# Oocytes - oviduct 2:")
                                ).append(
                                    $("<div/>", {
                                        "class": "col"
                                    }).append(
                                        $("<input></input>", {
                                            "type": "number",
                                            "data-mouse": mouseNum,
                                            id: "oocytes2"+mouseNum,
                                            name: "oocytes2"+mouseNum,
                                            "class": "oocytes2 fullWidth watch",
                                            "data-watch": "oocytes2"
                                        })
                                    )
                                )
                            ).append(
                                $("<div/>", {
                                    "class": row
                                }).append(
                                    $("<div/>", {
                                        "class": "col-12"
                                    }).append("Notes:")
                                ).append(
                                    $("<div/>", {
                                        "class": "col-12"
                                    }).append(
                                        $("<texta"+ "rea></tex" + "tarea>", {
                                            "data-mouse": mouseNum,
                                            id: "notes"+mouseNum,
                                            name: "notes"+mouseNum,
                                            "class": "notes fullWidth watch autoAdjust",
                                            "data-watch": "notes"
                                        }).on("input", (e)=>{
                                            this.updateTextarea(e.currentTarget);
                                        })
                                    )
                                )
                            )
                        )
                    )
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

            var calcs = ["mouseID", "sex", "stage", "treatment", "mouseDose", "mass", "reproMass", "gonadMass"];
            var calcs2 = ["mouseID", "date", "stage", "treatment", "mouseDose", "mass", "reproMass", "gonadMass"];
            var calcs3 = ["mouseID", "sacDate", "sacTime", "nextStage", "uterus", "oocytes1", "oocytes2", "notes"];

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
            
            this.calcNutella(mouseNum);
            this.updateDoseChoices();
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

    calcAllNutella: function(){
        var mice = this.mouseNums;
        if(mice){
            var numMice = mice.length;
        }else {
            var numMice = 0;
        }
        for (var i = 0; i < numMice; i++){
            var mouseNum = mice[i];
            this.calcNutella(mouseNum)
        }
    },

    calcNutella: function(mouseNum){
        // var mouseNum = $el.data("mouseNum");
        var mouseSearch = this.mouseSearch(mouseNum);
        var nutellaPerAvgMouse = $("#nutellaPerMouse").val();
        var avgMouse = $("#avgMouseMass").val();
        // console.log("nutellaPerMouse", nutellaPerMouse);
        if(nutellaPerAvgMouse>0){
            if(avgMouse>0){
                var mouseMass = $(".mass"+mouseSearch).val();
                if(mouseMass>0){
                    nutellaForMouse = mouseMass / avgMouse * nutellaPerAvgMouse;
                } else {
                    nutellaForMouse = "{Enter mouse mass}"
                }
            } else {
                nutellaForMouse = "{Enter avg mouse mass}"
            }
        } else {
            nutellaForMouse = "{Enter Nutella/mouse}"
        }
        if(!isNaN(nutellaForMouse)){
            if(nutellaForMouse>0){
                nutellaForMouse = +nutellaForMouse.toFixed(2) + "mg";
            } else {
                nutellaForMouse = "{double check entries}"
            }
        }
        $(".adjNutellaForMouse"+mouseSearch).html(nutellaForMouse);
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
        ).append(
            $("<th/>", {
                "data-sample": sampleNum
            }).append("Nutella"+sampleNum+"Start")
        ).append(
            $("<th/>", {
                "data-sample": sampleNum
            }).append("Nutella"+sampleNum+"End")
        ).append(
            $("<th/>", {
                "data-sample": sampleNum
            }).append("Nutella"+sampleNum+"Consumption")
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
                        }).append("Exp Hour:")
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
                        }).append("Sample Label:")
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
                        }).append(
                            $("<label></label>", {
                                "for": "nutellaAtTime"+sampleNum,
                            }).append(
                                "Administer Nutella?"
                            )
                        )
                    ).append(
                        $("<div/>", {
                            "class": inputClass
                        }).append(
                            $("<input/>", {
                                type: "checkbox",
                                name: "nutellaattime"+sampleNum,
                                id: "nutellaAtTime"+sampleNum,
                                "data-sample": sampleNum,
                                "class": "nutellaAtTime watch",
                                "data-watch": "nutellaAtTime"
                            }).on("change", (e)=> {
                                var sampleSearch = this.sampleSearch(sampleNum);
                                if($(e.currentTarget).is(":checked")){
                                    $(".ifNutella"+sampleSearch).show();
                                } else {
                                    $(".ifNutella"+sampleSearch).hide();
                                }
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
                                    "Cort: "
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
                                    "LH: "
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
                                    "Other: "
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
                        $("<div/>", {
                            "class": "row mt-2 ifLH",
                            "data-sample": sampleNum
                        }).append(
                            $("<div/>", {
                                "class": "col-12 col-md-6"
                            }).append(
                                "LH Sample ID"
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
                    ).append(
                        $("<div></div>", {
                            "class": "ifNutella",
                            "data-sample": sampleNum
                        }).append(
                        this.makeTimeButtonRow(sampMouseID, mouseNum, sampleNum, "Nutella")
                        ).append(
                            $("<div/>", {
                                "class": "row mt-2"
                            }).append(
                                $("<div/>", {
                                    "class": "col-12 col-md-6"
                                }).append(
                                    "Nutella consumption:"
                                )
                            ).append(
                                $("<div/>", {
                                    "class": "col-12 col-md-6 mt-2 mt-md-0"
                                }).append(
                                    $('<select></select>', {
                                        id: "nutellaConsumption"+sampMouseID,
                                        name: "nutellaconsumption"+sampMouseID,
                                        "class": "nutellaConsumption fullWidth watch",
                                        "data-mouse": mouseNum,
                                        "data-sample": sampleNum,
                                        "data-watch": "nutellaConsumption"
                                    }).append(
                                        $("<option></option>",{
                                            value: ""
                                        }).append("[select]")
                                    ).append(
                                        $("<option></option>",{
                                            value: "none"
                                        }).append("None")
                                    ).append(
                                        $("<option></option>",{
                                            value: "some"
                                        }).append("Some")
                                    ).append(
                                        $("<option></option>",{
                                            value: "all"
                                        }).append("All")
                                    )
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
        ).append(
            $("<td/>", {
                "data-calc": "startNutella",
                "data-mouse": mouseNum,
                "data-sample": sampleNum
            })
        ).append(
            $("<td/>", {
                "data-calc": "endNutella",
                "data-mouse": mouseNum,
                "data-sample": sampleNum
            })
        ).append(
            $("<td/>", {
                "data-calc": "nutellaConsumption",
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

    doseSearch: function (dose) {
        var doseSearch = this.dataSearch("dose", dose);
        return doseSearch;
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

    downloadCSV: function (csv, filename) {
        var csvFile;
        var downloadLink;

        csvFile = new Blob([csv], { type: "text/csv" });

        downloadLink = document.createElement("a");

        downloadLink.download = filename;

        downloadLink.href = window.URL.createObjectURL(csvFile);

        downloadLink.style.display = "none";

        document.body.appendChild(downloadLink);

        downloadLink.click();
    },
    
    exportTableToCSV: function (filename, table) {
        var csv = [];
        var datatable = document.getElementById(table);
        var rows = datatable.querySelectorAll("tr");

        for (var i = 0; i < rows.length; i++) {
            var row = [], cols = rows[i].querySelectorAll("td, th");

            for (var j = 0; j < cols.length; j++) {
                var cellText = '"' + cols[j].innerText + '"'; //add to protect from commas within cell
                row.push(cellText);
            };

            csv.push(row.join(","));
        }

        this.downloadCSV(csv.join("\n"), filename);
    },

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
    },

    copyTable: function ($table, copyHead, $divForCopy, $errorMsg, ovulation = false) {
        var textStr = "";
        var addLine = "";
        if (copyHead) {
            $table.find("thead").children("tr").each((i,e)=> { //add each child of the row
                var addTab = "";
                $(e).children().each((i,e)=> {
                    textStr += addTab + $(e).text();
                    addTab = "\t";
                });
            });
            addLine = "\n";
        }

        $table.find("tbody").children("tr").each((i,e)=> {
            var doCopy = true;
            if(ovulation){
                var mouseNum = $(e).data("mouse");
                var mouseSearch = this.mouseSearch(mouseNum);
                if(!$(".checkOvulation"+mouseSearch).is(":checked")){
                    doCopy = false;
                }
            }
            if(doCopy){
                textStr += addLine;
                var addTab = "";
                $(e).find("td").each((i,e)=> {
                    if ($(e).text()) {
                        var addText = $(e).text();
                    } else {
                        var addText = "NA"
                    }
                    textStr += addTab + addText;
                    addTab = "\t";
                    addLine = "\n";
                });
            }
        });

        this.copyStringToClipboard(textStr, $divForCopy, $errorMsg);
    },

    toggleTableFuncs: function ($table) {
        this.resize();
        this.data_valid_form();
        $table.toggle();
        this.parent_class.resize_container();
    },

    toCSVFuncs: function (fileName, tableID, $errorMsg) {
        var data_valid = this.data_valid_form();

        if (data_valid) {
            this.exportTableToCSV(fileName, tableID);
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Saved successfully</span>");
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Did not export</span>");
        }
    },

    copyDataFuncs: function ($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy, ovulation = false){
        var data_valid = this.data_valid_form();
        var copyHead

        //only copy the heading when the input box is checked
        if ($copyHead.is(":checked")) {
            copyHead = true;
        } else {
            copyHead = false;
        }

        if (data_valid) {
            $tableDiv.show(); 
            this.resize();
            // $errorMsg.html("<span style='color:grey; font-size:24px;'>Copied successfully</span>") //update error message
            this.copyTable($tableToCopy, copyHead, $divForCopy, $errorMsg, ovulation = ovulation);
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>"); //add to error message
        }
    },

    copyLHSampleNums: function($divForCopy, $errorMsg){
        var table = this.getLHSampleNums();
        this.copyStringToClipboard(table, $divForCopy, $errorMsg);
    },

    copyNutellaEating: function($divForCopy, $errorMsg){
        var table = this.getNutellaEating();
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
                    time = parseInt(time);
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

    getNutellaEating: function(){
        var mice = [];
        var times = [];
        var nutellaNotes = [];
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
                    time = parseInt(time);
                } else {
                    time = "";
                }
                if($(".nutellaAtTime"+sampleSearch).is(":checked")){
                    var nutellaNote = $(".nutellaConsumption"+sampleSearch+mouseSearch).val();
                    mice.push(mouseID);
                    times.push(time);
                    nutellaNotes.push(nutellaNote);
                }
            }
        }

        var table = [];
        var columnJoin = "\t";

        table = this.zip(mice, times, nutellaNotes);

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
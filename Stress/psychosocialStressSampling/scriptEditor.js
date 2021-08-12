my_widget_script =
{
    mouseNums: [],
    sampleNums: [],
    startTime: "",

    init: function (mode, json_data) {
        var parsedJson = this.parseInitJson(json_data);
        this.initDynamicContent(parsedJson);
        window.onresize = this.resize;
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
        var widgetJsonString = this.parent_class.to_json();
        var dynamicContent = this.getDynamicContent();
        
        var output = { 
            widgetData: JSON.parse(widgetJsonString),
            mouseNums: dynamicContent.mouseNums,
            sampleNums: dynamicContent.sampleNums
        };

        //uncomment to check stringified output
        //console.log("to JSON", JSON.stringify(output));

        return JSON.stringify(output);
    },

    from_json: function (json_data) {
        //populates the form with json_data

        // all data in string format within json_data is parsed into an object parsedJson
        var parsedJson = JSON.parse(json_data);

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
        $('#the_form').find('select, textarea, input').each(function () {
            if (!$(this).prop('required')) { 
                //don't change anything 
            } else { 
                if (!$(this).val()) { 
                    fail = true;
                    name = $(this).attr('id');
                    fail_log += name + " is required \n";
                }

            }
        });

        $("input[type='date']").each(function () {
            var date = $(this).val();
            if(date){
                var validDate = my_widget_script.isValidDate(date);
                if(!validDate){
                    fail = true;
                    fail_log += "Please enter valid date in form 'YYYY-MM-DD'";
                }
            }
        });

        $("input[type='time']").each(function () {
            var time = $(this).val();
            if(time){
                var validtime = my_widget_script.isValidTime(time);
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
                my_widget_script.makeMouseCard(mouse);
            }
        }
        if(parsedJson.sampleNums){
            my_widget_script.makeSampleContent(parsedJson.sampleNums.length);
        }
    },

    adjustForMode: function (mode) {
        if (mode !== "edit" && mode !== "edit_dev") {
            //disable when not editing
            $(".disableOnView").prop("disabled", true);
            $(".hideView").hide();
            $("input[type='date']").removeClass(".hasDatePicker");
        } else {
            $("input[type='date']").each(function () {
                my_widget_script.checkDateFormat($(this));
            });
            
            $("input[type='time']").each(function () {
                my_widget_script.checkTimeFormat($(this));
            });

            $(".table").hide();

            if($("#expDate").val() && $("#numSamples").val()>1){
                $(".samplesDiv").insertBefore(".info");
            }
        }
    },

    addEventListeners: function () {
        $(".toggleTable").on("click", function () {
            var tableID = $(this).data("table");
            var $table = $("#"+tableID);
            my_widget_script.toggleTableFuncs($table);
        });

        $('.toCSV').on("click", function () {
            var tableID = $(this).data("table");
            var dateToday = luxon.DateTime.now().toISODate();
            var fileName = "stress_"+tableID+"_"+dateToday;
            var $errorMsg = $("#errorMsg");
            
            my_widget_script.toCSVFuncs(fileName, tableID, $errorMsg);
        });

       $(".copyData").on("click", function () {
            var tableID = $(this).data("table");
            var tableSearch = my_widget_script.tableSearch(tableID);
            var $copyHead = $(".copyHead"+tableSearch);
            var $tableToCopy = $("#"+tableID);
            var $tableDiv = $tableToCopy.parent();
            var $errorMsg = $("#errorMsg");
            var $divForCopy = $("#forCopy");
            
            my_widget_script.copyDataFuncs($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy)
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
        my_widget_script.timeSupported = supported;
        input.remove();
        return (supported);
    },

    timeSupported: true,

    checkTimeFormat: function ($timeInput) {
        if(!my_widget_script.timeSupported){ // if not supported
            $timeInput.next(".timeWarning").remove();
            var time = $timeInput.val();
            var isValid = my_widget_script.isValidTime(time);
            if(!isValid){
                $timeInput.after('<div class="text-danger timeWarning">Enter time as "hh:mm" in 24-hr format</div>');
            }
            my_widget_script.resize();
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
        my_widget_script.dateSupported = supported;
        input.remove();
        return (supported);
    },

    dateSupported: true,

    checkDateFormat: function ($dateInput) {
        if(!my_widget_script.dateSupported){ // if not supported
            $dateInput.next(".dateWarning").remove();
            var date = $dateInput.val();
            var isValid = my_widget_script.isValidDate(date);
            if(!isValid){
                $dateInput.after('<div class="text-danger dateWarning">Enter date as "YYYY-MM-DD"</div>');
            }
            $dateInput.datepicker({dateFormat: "yy-mm-dd"})
            my_widget_script.resize();
        }
    },

    addRequiredFieldIndicators: function () {
        $('.needForTableLab').each(function () { //find element with class "needForFormLab"
            $(this).html("<span style='color:blue'>#</span>" + $(this).html()); //add # before
        });

        $('.requiredLab').each(function () { //find element with class "requiredLab"
            $(this).html("<span style='color:red'>*</span>" + $(this).html()); //add # before
        });
    },

    setUpInitialState: function () {
        my_widget_script.isDateSupported();
        my_widget_script.isTimeSupported();

        $("input[type='date']").prop("placeholder", "YYYY-MM-DD").on("change", function () {
            my_widget_script.checkDateFormat($(this));
        });
        
        $("input[type='time']").prop("placeholder", "hh:mm").on("change", function () {
            my_widget_script.checkTimeFormat($(this));
        });
        
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right");

        $('textarea.autoAdjust').each(function () {
            var height = this.scrollHeight;
            if(height == 0){ // when hidden to begin with, the height is 0; this won't make everything visible, though if more than two lines at start
                // height = 48;
                text = $(this).val();
                $(".forTextBox").show();
                $("#forSizing").val(text);
                var forSizing = document.getElementById("forSizing");
                height = forSizing.scrollHeight;
                $(".forTextBox").hide();
            }
            // console.log(height);
            this.setAttribute('style', 'height:' + height + 'px;overflow-y:hidden;');
        }).on('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            my_widget_script.resize();
        });

        $("#numSamples").on("input", function () {
            var totalNumSamples = $(this).val();
            if(totalNumSamples){
                totalNumSamples = parseInt(totalNumSamples);
            } else {
                totalNumSamples = 0;
            }
            my_widget_script.makeSampleContent(totalNumSamples);
        });

        $(".otherSample").each(function () {
            my_widget_script.showIfOtherCheck($(this));
        }).on("change", function () {
            my_widget_script.showIfOtherCheck($(this));
        });

        $("#timeZone").each(function () {
            if($(this).val() == "est"){
                startHour = 09;
            } else {
                startHour = 10;
            }
            my_widget_script.startTime = luxon.DateTime.fromObject({
                hour: startHour,
                minute: 30
            });
            my_widget_script.printExpTimes();
            my_widget_script.watchSampleLabel();
        }).on("change", function () {
            if($(this).val() == "est"){
                startHour = 09;
            } else {
                startHour = 10;
            }
            my_widget_script.startTime = luxon.DateTime.fromObject({
                hour: startHour,
                minute: 30
            });
            my_widget_script.printExpTimes();
            my_widget_script.watchSampleLabel();
        });

        $("#addMouse").on("click", function () {
            if(my_widget_script.mouseNums.length > 0){
                var lastMouse = my_widget_script.mouseNums[my_widget_script.mouseNums.length - 1];
                var mouseNum = lastMouse + 1;
            } else {
                var mouseNum = 1;
            }
            my_widget_script.makeMouseCard(mouseNum);

            var totalNumSamples = $("#numSamples").val();
            if(totalNumSamples){
                totalNumSamples = parseInt(totalNumSamples);
            } else {
                totalNumSamples = 0;
            }
            my_widget_script.makeSampleContent(totalNumSamples);
        });

        $.each(my_widget_script.mouseNums, function () {
            // console.log(this);
            my_widget_script.watchMouseID(this);
        });

        $.each(my_widget_script.sampleNums, function () {
            my_widget_script.watchSampleLabel(this);
        });

        $(".treatment").each(function(){
            if($(this).val() == "control"){
                $(this).val("CON")
            }else if($(this).val()=="stress"){
                $(this).val("ALPS")
            }
        });

        $(".watch").each(function () {
            my_widget_script.watchValue($(this));
        });

        my_widget_script.resize();

    },

    toggleCard: function ($cardHead) {
        // console.log($cardHead.next());
        $cardHead.next().toggleClass("collapse");
        $cardHead.next().find("textarea.autoAdjust").each(function () {
            if(! $(this).is(":hidden")) {
                this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
            } 
        });
        my_widget_script.resize();
    },

    addToStartTime: function (hoursToAdd) {
        var newTime = my_widget_script.startTime.plus({hours: hoursToAdd});
        var newTimeString = newTime.toLocaleString(luxon.DateTime.TIME_24_SIMPLE);
        return newTimeString
    },

    printExpTimes: function (){
        $(".expStartTime").text(my_widget_script.addToStartTime(0));
        $(".expRestraintTime").text(my_widget_script.addToStartTime(1));
        $(".expScentTime").text(my_widget_script.addToStartTime(3));
        $(".expEndTime").text(my_widget_script.addToStartTime(5));
    },

    resize: function () {
        //resize the container
        my_widget_script.parent_class.resize_container();
    },
    
    getDynamicContent: function () {
        var dynamicContent = {
            mouseNums: my_widget_script.mouseNums,
            sampleNums: my_widget_script.sampleNums,
        };
        return dynamicContent;
    },
    
    //source: https://stackoverflow.com/questions/18495310/checking-if-an-input-field-is-required-using-jquery
     data_valid_form: function () {
        var valid = true; 
        $('.needForTable').each(function () {
            if (!$(this).val()) { //if there is not a value for this input
                valid = false; //change valid to false
            }
        });

        if (!valid) {
            $("#errorMsg").html("<span style='color:red; font-size:36px;'>Please fill out all elements marked by a</span><span style='color:blue; font-size:36px;'> blue #</span>");
        } else {
            $("#errorMsg").html("");
        }

        return valid;
    },

    checkInArray: function (searchVal, array){
        var proceed = $.inArray(searchVal, array) !== -1;
        return proceed
    },

    watchMouseID: function (mouseNum) {
        var mouseSearch = my_widget_script.mouseSearch(mouseNum);
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
        var sampleSearch = my_widget_script.sampleSearch(sampleNum);
        var sampleID = $(".sampleLabel"+sampleSearch).val();
        var sampleTime = $(".sampleTime"+sampleSearch).val();
        if(!sampleID){
            sampleID = "Sample " + sampleNum;
        }
        if(sampleTime){
            sampleTime = "Hr " + sampleTime + " - " + my_widget_script.addToStartTime(parseFloat(sampleTime));
            sampleID = sampleTime + " - " + sampleID;
        }
        $(".sampleLabelCalc"+sampleSearch).html(sampleID);
    },

    watchValue: function ($el) {
        var watch = $el.data("watch");
        var calcSearch = my_widget_script.calcSearch(watch);
        var sampleNum = $el.data("sample");
        var mouseNum = $el.data("mouse");
        var val = $el.val();
        if(sampleNum){
            calcSearch += my_widget_script.sampleSearch(sampleNum);
        }
        if(mouseNum){
            calcSearch += my_widget_script.mouseSearch(mouseNum);
        }
        if(val == "on"){ //likely checkbox
            if($el.prop("type") == "checkbox"){
                if($el.is(":checked")){val = "Yes"} else {val = "No"}
            }
        }
        $(calcSearch).html(val);
    },

    makeMouseCard: function (mouseNum) {
        var inArray = my_widget_script.checkInArray(mouseNum, my_widget_script.mouseNums);
        if(! inArray){
            my_widget_script.mouseNums.push(mouseNum);

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
                        }).on("click", function () {
                            // console.log($(this));
                            my_widget_script.toggleCard($(this));
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
                                    }).on("input", function () {
                                        my_widget_script.watchMouseID($(this).data("mouse"));
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
                                    }).on("input", function () {
                                        my_widget_script.watchMouseID($(this).data("mouse"));
                                    })
                                )
                            )
                        ).append(
                            $("<div/>", {
                                "class": row
                            }).append(
                                $("<div/>", {
                                    "class": col
                                }).append("Treatment:")
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
                                    }).on("click", function () {
                                        my_widget_script.deleteMouseFuncs($(this).data("mouse"));
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
                                    ).on("input", function () {
                                        var sex = $(this).val();
                                        if(sex == "female"){
                                            $(this).parents(".row").next(".ifFemale").show();
                                        }else {
                                            $(this).parents(".row").next(".ifFemale").hide().find(".stage").val("");
                                        }
                                    })
                                )
                            )
                        ).append(
                            $("<div/>", {
                                "class": row + " ifFemale"
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
                        ).append(
                            $("<div/>", {
                                "class": row
                            }).append(
                                $("<div/>", {
                                    "class": col
                                }).append("Body Mass (g):")
                            ).append(
                                $("<div/>", {
                                    "class": "col"
                                }).append(
                                    $("<input/>", {
                                        type: "number", 
                                        "data-mouse": mouseNum,
                                        id: "mass"+mouseNum,
                                        name: "mass"+mouseNum,
                                        "class": "mass fullWidth watch",
                                        "data-watch": "mass"
                                    })
                                )
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

            var calcs = ["mouseID", "sex", "stage", "treatment", "mass", "reproMass", "gonadMass"];
            var calcs2 = ["mouseID", "date", "stage", "treatment", "mass", "reproMass", "gonadMass"];
            var mouseSearch = my_widget_script.mouseSearch(mouseNum);

            for(var i = 0; i < calcs.length; i++){
                var calc = calcs[i];
                $mouseTable.find("tbody").find("tr"+mouseSearch).append(
                    $("<td/>", {
                        "data-calc": calc,
                        "data-mouse": mouseNum
                    })
                );
            }
            for(var i = 0; i < calcs2.length; i++){
                var calc = calcs2[i];
                if(calc !== "date"){
                    console.log(calc)
                    $mouseTable2.find("tbody").find("tr"+mouseSearch).append(
                        $("<td/>", {
                            "data-calc": calc,
                            "data-mouse": mouseNum
                        })
                    );
                } else{
                    $mouseTable2.find("tbody").find("tr"+mouseSearch).append(
                        $("<td/>", {
                            "data-calc": calc
                        })
                    );
                }
            }

            my_widget_script.resize();
        }
    },

    deleteMouseFuncs: function (mouseNum) {
        var proceed = confirm("Are you sure that you wish to delete this mouse?");
        if(proceed){
            // Remove it from the mouseNums
            var index = my_widget_script.mouseNums.indexOf(mouseNum);
            if(index > -1){
                my_widget_script.mouseNums.splice(index, 1);
            }
    
            if(my_widget_script.sampleNums){
                var numSamples = my_widget_script.sampleNums.length;
                for(var i = 0; i < numSamples; i++){
                    var sample = my_widget_script.sampleNums[i];
                    var index = my_widget_script.miceInSamples[sample].indexOf(mouseNum);
                    if(index > -1){
                        my_widget_script.miceInSamples[sample].splice(index, 1);
                    }
                }
            }
    
            // console.log(my_widget_script.mouseNums);
    
            var mouseSearch = my_widget_script.mouseSearch(mouseNum);
            $(".mouseCard"+mouseSearch).remove();
            $(".mouseSampleCard"+mouseSearch).remove();
            $("tr"+mouseSearch).remove();
        }

        my_widget_script.resize();
    },

    makeSampleContent: function (totalNumSamples) {
        var sampleNum;
        var mice = my_widget_script.mouseNums;
        if(mice){
            var numMice = mice.length;
        }else {
            var numMice = 0;
        }
        for(var i = 0; i < totalNumSamples; i++){
            sampleNum = i + 1;
            if(! my_widget_script.checkInArray(sampleNum, my_widget_script.sampleNums)){
                if(sampleNum == 1){
                    $("#samplesAccordion").html("");
                    $(".sampleInfoDiv").html("");
                }
                my_widget_script.sampleNums.push(sampleNum);
                my_widget_script.miceInSamples[sampleNum] = [];
                my_widget_script.makeSampleInfo(sampleNum);
                my_widget_script.makeSamplingCard(sampleNum);
                my_widget_script.makeSampleForTables(sampleNum);
            }
            for (var j = 0; j < numMice; j++){
                var mouse = mice[j];
                // console.log(mouse);
                var inSample = my_widget_script.checkMiceInSamples(sampleNum, mouse);
                if(!inSample){
                    my_widget_script.miceInSamples[sampleNum].push(mouse);
                    my_widget_script.makeSampleForMouse(sampleNum, mouse);
                }
                my_widget_script.watchMouseID(mouse);
            }
        }
        if(my_widget_script.sampleNums){
            var proceed = true;
            for(var i = my_widget_script.sampleNums.length; i > -1; i--){
                if(proceed){
                    var sampleNum = my_widget_script.sampleNums[i];
                    if(sampleNum>totalNumSamples){
                        proceed = confirm("Are sure that you want to remove a sampling time?");
                        if(proceed){
                            $(my_widget_script.sampleSearch(sampleNum)).remove();
                            my_widget_script.sampleNums.splice(i, 1);
                            // Need to remove it from my_widget_script.SampleNums
                            console.log(my_widget_script.sampleNums)
                        } else {
                            $("#numSamples").val(my_widget_script.sampleNums.length);
                        }
                    }
                }
            }
        }
        $(".watch").each(function () {
            my_widget_script.watchValue($(this));
        }).on("input", function () {
            my_widget_script.watchValue($(this));
        });

        my_widget_script.resize();
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
        var sampleSearch = my_widget_script.sampleSearch(sampleNum);
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
                    }).on("click", function () {my_widget_script.toggleCard($(this))}).append("Sample " + sampleNum)
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
                            }).on("input", function () {
                                my_widget_script.watchSampleLabel($(this).data("sample"));
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
                            }).on("input", function () {
                                my_widget_script.watchSampleLabel($(this).data("sample"));
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
                                    }).on("change", function () {

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
                                    }).on("change", function () {
                                        my_widget_script.showIfOtherCheck($(this));
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
                }).on("click", function () {my_widget_script.toggleCard($(this))}).append(
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
        var sampleSearch = my_widget_script.sampleSearch(sampleNum);
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
                }).on("click", function () {my_widget_script.toggleCard($(this))}).append(
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
                        $("<div/>", {
                            "class": "row"
                        }).append(
                            $("<div/>", {
                                "class": "col-12 col-md-6"
                            }).append(
                                $("<input/>", {
                                    type: "button",
                                    value: "Start", 
                                    id: "startButton"+sampMouseID,
                                    name: "startbutton"+sampMouseID,
                                    "class": "startButton fullWidth disableOnView",
                                    "data-mouse": mouseNum,
                                    "data-sample": sampleNum,
                                }).on("click", function () {
                                    var thisMouseNum = $(this).data("mouse");
                                    var thisSampleNum = $(this).data("sample");
                                    var mouseSearch = my_widget_script.mouseSearch(mouseNum);
                                    var sampleSearch = my_widget_script.sampleSearch(sampleNum);
                                    var currentTime = luxon.DateTime.now();
                                    // en-GB makes it so that midnight is 00:xx instead of 24:xx
                                    var timeString = currentTime.toLocaleString({...luxon.DateTime.TIME_24_SIMPLE, locale: "en-GB"});
                                    var proceed = true;
                                    if($(".startTime"+mouseSearch+sampleSearch).val()){
                                        proceed = confirm("Are you sure that you want to replace the time?");
                                    }
                                    if(proceed){
                                        $(".startTime"+mouseSearch+sampleSearch).val(timeString);
                                        my_widget_script.watchValue($(".startTime"+mouseSearch+sampleSearch));
                                        my_widget_script.checkTimeFormat($(".startTime"+mouseSearch+sampleSearch));
                                    }
                                    my_widget_script.resize();
                                })
                            ).append(
                                $("<input/>", {
                                    type: "time",
                                    value: "Start", 
                                    id: "startTime"+sampMouseID,
                                    name: "starttime"+sampMouseID,
                                    "class": "startTime fullWidth watch",
                                    "data-mouse": mouseNum,
                                    "data-sample": sampleNum,
                                    "placeholder": "hh:mm",
                                    "data-watch": "startTime"
                                }).each(function () {
                                    my_widget_script.checkTimeFormat($(this));
                                }).on("change", function () {
                                    my_widget_script.checkTimeFormat($(this));
                                })
                            )
                        ).append(
                            $("<div/>", {
                                "class": "col-12 col-md-6 mt-2 mt-md-0"
                            }).append(
                                $("<input/>", {
                                    type: "button",
                                    value: "End", 
                                    id: "endButton"+sampMouseID,
                                    name: "endbutton"+sampMouseID,
                                    "class": "endButton fullWidth disableOnView",
                                    "data-mouse": mouseNum,
                                    "data-sample": sampleNum
                                }).on("click", function () {
                                    var thisMouseNum = $(this).data("mouse");
                                    var thisSampleNum = $(this).data("sample");
                                    var mouseSearch = my_widget_script.mouseSearch(mouseNum);
                                    var sampleSearch = my_widget_script.sampleSearch(sampleNum);
                                    var currentTime = luxon.DateTime.now();
                                    // en-GB makes it so that midnight is 00:xx instead of 24:xx
                                    var timeString = currentTime.toLocaleString({...luxon.DateTime.TIME_24_SIMPLE, locale: "en-GB"});
                                    var proceed = true;
                                    if($(".endTime"+mouseSearch+sampleSearch).val()){
                                        proceed = confirm("Are you sure that you want to replace the time?");
                                    }
                                    if(proceed){
                                        $(".endTime"+mouseSearch+sampleSearch).val(timeString);
                                        my_widget_script.watchValue($(".endTime"+mouseSearch+sampleSearch));
                                        my_widget_script.checkTimeFormat($(".endTime"+mouseSearch+sampleSearch));
                                    }
                                    my_widget_script.resize();
                                })
                            ).append(
                                $("<input/>", {
                                    type: "time",
                                    value: "End", 
                                    id: "endTime"+sampMouseID,
                                    name: "endtime"+sampMouseID,
                                    "class": "endTime fullWidth watch",
                                    "data-mouse": mouseNum,
                                    "data-sample": sampleNum,
                                    "placeholder": "hh:mm",
                                    "data-watch": "endTime"
                                }).each(function () {
                                    my_widget_script.checkTimeFormat($(this));
                                }).on("change", function () {
                                    my_widget_script.checkTimeFormat($(this));
                                })
                            )
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
                                }).on("click", function () {
                                    var thisMouseNum = $(this).data("mouse");
                                    var thisSampleNum = $(this).data("sample");
                                    var mouseSearch = my_widget_script.mouseSearch(mouseNum);
                                    var sampleSearch = my_widget_script.sampleSearch(sampleNum);
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
                                    my_widget_script.resize();
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
                                }).on("input", function () {
                                    this.style.height = 'auto';
                                    this.style.height = (this.scrollHeight) + 'px';
                                    my_widget_script.resize();
                                })
                            )
                        )
                    ).append(
                        $("<div/>", {
                            "class": "row mt-2"
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
                    )
                )
            )
        )

        var $mouseTable = $("#mouseTable");

        var mouseSearch = my_widget_script.mouseSearch(mouseNum);
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

    checkMiceInSamples: function (sampleNum, mouseNum){
        var sampleNumArray = my_widget_script.miceInSamples[sampleNum];
        var inSample = my_widget_script.checkInArray(mouseNum, sampleNumArray);
        return inSample;
    },

    dataSearch: function (dataName, dataValue) {
        var dataSearch = "[data-" + dataName + "='" + dataValue + "']";
        return dataSearch;
    },

    mouseSearch: function (mouseNum){
        var mouseSearch = my_widget_script.dataSearch("mouse", mouseNum);
        return mouseSearch;
    },

    sampleSearch: function (sampleNum){
        var sampleSearch = my_widget_script.dataSearch("sample", sampleNum);
        return sampleSearch;
    },

    tableSearch: function (table){
        var tableSearch = my_widget_script.dataSearch("table", table);
        return tableSearch;
    },

    calcSearch: function (calc) {
        var calcSearch = my_widget_script.dataSearch("calc", calc);
        return calcSearch;
    },

    showWithCheck: function ($chbx, $toToggle) {
        if($chbx.is(":checked")){
            $toToggle.show();
        } else {
            $toToggle.hide().html("");
        }
        my_widget_script.resize();
    },

    showIfOtherCheck: function ($chbx) {
        var $ifOther = $chbx.next(".ifOther");
        my_widget_script.showWithCheck($chbx, $ifOther);
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

    copyTable: function ($table, copyHead, $divForCopy) {
        var $temp = $("<text" + "area style='opacity:0;'></text" + "area>");
        var addLine = "";
        if (copyHead) {
            $table.find("thead").children("tr").each(function () { //add each child of the row
                var addTab = "";
                $(this).children().each(function () {
                    $temp.text($temp.text() + addTab + $(this).text());
                    addTab = "\t";
                });
            });
            addLine = "\n";
        }

        $table.find("tbody").children("tr").each(function () {
            $temp.text($temp.text() + addLine);
            var addTab = "";
            $(this).find("td").each(function () {
                if ($(this).text()) {
                    var addText = $(this).text();
                } else {
                    var addText = "NA"
                }
                $temp.text($temp.text() + addTab + addText);
                addTab = "\t";
                addLine = "\n";
            });
        });

        $temp.appendTo($divForCopy).select();
        document.execCommand("copy");
        $temp.remove();
    },

    toggleTableFuncs: function ($table) {
        my_widget_script.resize();
        my_widget_script.data_valid_form();
        $table.toggle();
        my_widget_script.parent_class.resize_container();
    },

    toCSVFuncs: function (fileName, tableID, $errorMsg) {
        var data_valid = my_widget_script.data_valid_form();

        if (data_valid) {
            my_widget_script.exportTableToCSV(fileName, tableID);
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Saved successfully</span>");
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Did not export</span>");
        }
    },

    copyDataFuncs: function ($copyHead, $tableToCopy, $tableDiv, $errorMsg, $divForCopy){
        var data_valid = my_widget_script.data_valid_form();
        var copyHead

        //only copy the heading when the input box is checked
        if ($copyHead.is(":checked")) {
            copyHead = true;
        } else {
            copyHead = false;
        }

        if (data_valid) {
            $tableDiv.show(); 
            my_widget_script.resize();
            my_widget_script.copyTable($tableToCopy, copyHead, $divForCopy);
            $errorMsg.html("<span style='color:grey; font-size:24px;'>Copied successfully</span>") //update error message
        } else {
            $errorMsg.append("<br/><span style='color:grey; font-size:24px;'>Nothing was copied</span>"); //add to error message
        }
    }
};
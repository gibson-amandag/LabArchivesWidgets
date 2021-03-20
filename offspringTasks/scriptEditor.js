my_widget_script =
{
    
    init: function (mode, json_data) {
        //this method is called when the form is being constructed
        // parameters
        // mode = if it equals 'view' than it should not be editable
        //        if it equals 'edit' then it will be used for entry
        //        if it equals 'view_dev' same as view,  does some additional checks that may slow things down in production
        //        if it equals 'edit_dev' same as edit,   does some additional checks that may slow things down in production

        // json_data will contain the data to populate the form with, it will be in the form of the data
        // returned from a call to to_json or empty if this is a new form.
        //By default it calls the parent_class's init.

        //uncomment to inspect and view code while developing
        //debugger;

        // Have to un-disable this select field because when viewing, the array comes back false if it's disabled
        // TO-DO - this still doesn't completely fix the problem, as the widget doesn't reload this properly. 
        // Need to save the selections in getDynamic content and reload with initDynamic content - although may need to be after calling the widgetData stuff
        $(".tasks").prop("disabled", false);
        $(".tasks option").prop("disabled", false);

        //Get the parsed JSON data
        var parsedJson = this.parseInitJson(json_data);

        //Uncomment to print parsedJson to consol
        //console.log("init", parsedJson);

        //check parsedJson for info not contained in form inputs and reinitialize
        this.initDynamicContent(parsedJson);

        //resize the content box when the window size changes
        window.onresize = this.resize;
        
        // Initialize the form with the stored widgetData using the parent_class.init() function
        this.parent_class.init(mode, () => JSON.stringify(parsedJson.widgetData));

        this.initSelectedTasks(parsedJson);

        // Add * and # to mark required field indicators
        this.addRequiredFieldIndicators();

        // Set up the form based on previously entered form input
        this.setUpInitialState();

        //adjust form design and buttons based on mode
        this.adjustForMode(mode);
    },
    
    to_json: function () {
        //should return a json string containing the data entered into the form by the user
        //whatever is return from the method is persisted in LabArchives.  must not be binary data.
        //called when the user hits the save button, when adding or editing an entry

        //Acquire input data from the form using the parent_class.to_json() function
        var widgetJsonString = this.parent_class.to_json();

        //Get information about any dynamic content that may have been created
        var dynamicContent = this.getDynamicContent();

        // Add widgetData and any additional dynamic content to an output object
        // Will be accessed within the init and from_json methods
        var output = { 
            widgetData: JSON.parse(widgetJsonString),
            damList: dynamicContent.damList,
            selectedTasks: dynamicContent.selectedTasks
        };

        //uncomment to check stringified output
        //console.log("to JSON", JSON.stringify(output));

        // return stringified output
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

    /**
     * In preview, the form is populated with test data when the
     * parent_class.test_data() function is called. This randomly selects options for 
     * dropdown select menus, radio buttons, and checkboxes.
     */
    test_data: function () {
        //during development this method is called to populate your form while in preview mode

        // ORIGINAL LABARCHIVES RETURN FOR TEST DATA
        //return this.parent_class.test_data();

        // CUSTOM TEST DATA

        //store the outcome of the the test data within the testData variable
        var testData = JSON.parse(this.parent_class.test_data());

        //If no additional dynamic content 
        var output = { 
            widgetData: testData,
            damList: [1, 4, 5, 7] ,
            selectedTasks: {
                1: ["p2_9", "p12_mass"],
                4: ["p11_mass", "juv_agd"],
                5: ["p15_mass", "p16_mass", "ad_agd"],
                7: ["p18_mass", "cycle"]
            }
        };

        //Add additional content to match the objects in to_json
        //var output = { widgetData: testData, addedRows: 2 }; //When in development, initialize with 2 addedRows

        //return the stringified output for use by the init function
        return JSON.stringify(output);
    },

    /**
     * This function determines whether or not the user is allowed to save the widget to the page
     * 
     * The original LabArchives function checks for fields that have _mandatory appended to the name attribute
     * 
     * The custom function checks for fields with the required attribute. If any of these fields are blank, 
     * an alert is returns that provides a fail log with the ids of the elements that are missing. If there are
     * no blank required fields, an empty array is returned.
     * 
     * source: https://stackoverflow.com/questions/18495310/checking-if-an-input-field-is-required-using-jquery
     */
    is_valid: function (b_suppress_message) {
        //called when the user hits the save button, to allow for form validation.
        //returns an array of dom elements that are not valid - default is those elements marked as mandatory
        // that have no data in them.
        //You can modify this method, to highlight bad form elements etc...
        //LA calls this method with b_suppress_message and relies on your code to communicate issues to the user
        //Returning an empty array [] or NULL equals no error
        //TO DO write code specific to your form

        //ORIGINAL LABARCHIVES IS_VALID FUNCTION
        //return this.parent_class.is_valid(b_suppress_message);

        //CUSTOM FUNCTION TO CHECK REQUIRED ITEMS
        var fail = false; //begin with a fail variable that is false
        var fail_log = ''; //begin with an empty fail log
        var name; //create a name variable

        //search the_form for all elements that are of type select, textarea, or input
        $('#the_form').find('select, textarea, input').each(function () {
            if (!$(this).prop('required')) { //if this element does not have a required attribute
                //don't change anything (fail remains false)
            } else { //if there is a required attribute
                if (!$(this).val()) { //if there is not a value for this input
                    fail = true; //change fail to true
                    name = $(this).attr('id'); //replace the name variable with the name attribute of this element
                    fail_log += name + " is required \n"; //add to the fail log that this name is required
                }

            }
        });

        if (fail) { //if fail is true (meaning a required element didn't have a value)
            return alert(fail_log); //return the fail log as an alert
        } else {
            var noErrors = [];
            return noErrors;
        } //otherwise, return empty array
    },

    is_edited: function () {
        //should return true if the form has been edited since it was loaded or since reset_edited was called
        return this.parent_class.is_edited();
    },

    reset_edited: function () {
        //typically called have a save
        //TO DO write code specific to your form
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

    /**
     * This function requires the parsedJson object.
     */
    initDynamicContent: function (parsedJson) {
        if(parsedJson.damList){
            for (var i = 0; i < parsedJson.damList.length; i++) {
                var damNum = parsedJson.damList[i];
                my_widget_script.createMouseSelect(damNum);
                my_widget_script.createMouseInfo(damNum);
                my_widget_script.createMousePrint(damNum);
            };
            my_widget_script.damList = parsedJson.damList;
        }
    },

    initSelectedTasks: function (parsedJson) {
        if(parsedJson.damList && parsedJson.selectedTasks){
            for( var i = 0; i < parsedJson.damList.length; i ++ ){
                var damNum = parsedJson.damList[i];
                var damSearch = my_widget_script.damSearch(damNum);
                var tasks = parsedJson.selectedTasks[damNum];
                // Update the selected tasks based on the parsedJson list
                $(".tasks"+damSearch).val(tasks);
            }
        }
    },

    /**
     * Here, a subset of buttons are disabled when the widget is not being edited.
     * There may be other elements that should be shown/hidden based on the mode
     */
    adjustForMode: function (mode) {
        if (mode !== "edit" && mode !== "edit_dev") {
            //disable when not editing
            $(".disableOnView").prop("disabled", true);
            $(".hideView").hide();
        }
    },

    /**
     * TO DO: edit this function to define the symbols that should be added to the HTML
     * page based on whether or not a field is required to save the widget to the page
     * 
     * Here, the function adds a blue # before fields of the class "needForFormLab" and a 
     * red * before fields with the "requiredLab" property
     */
    addRequiredFieldIndicators: function () {
        $('.needForTableLab').each(function () { //find element with class "needForFormLab"
            //alert($(this).val());
            $(this).html("<span style='color:blue'>#</span>" + $(this).html()); //add # before
        });

        $('.requiredLab').each(function () { //find element with class "requiredLab"
            //alert($(this).val());
            $(this).html("<span style='color:red'>*</span>" + $(this).html()); //add # before
        });
    },

    /**
     * TO DO: edit this function to define how the form should be initilized based 
     * on the existing form values. This is particularly important for when the 
     * widget already has data entered, such as when saved to a page.
     */
    setUpInitialState: function () {
        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right");

        $('textarea.autoAdjust').each(function () {
            this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
        }).on('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            my_widget_script.resize();
        });

        $(".damID").each(function () {
            var damSearch = my_widget_script.damSearch($(this).data("dam"));
            my_widget_script.printID(damSearch);
        }).on("input", function () {
            var damSearch = my_widget_script.damSearch($(this).data("dam"));
            my_widget_script.printID(damSearch);
            my_widget_script.resize();
        });

        $(".DOB").each(function () {
            var damSearch = my_widget_script.damSearch($(this).data("dam"));
            my_widget_script.printDOB(damSearch);
        }).on("input", function () {
            var damSearch = my_widget_script.damSearch($(this).data("dam"));
            my_widget_script.printDOB(damSearch);
            my_widget_script.resize();
        });

        $(".tasks").on("input", function () {
            var damSearch = my_widget_script.damSearch($(this).data("dam"));
            my_widget_script.printTasks_today(damSearch);
            my_widget_script.resize();
        });
        
        $(".stop").on("input", function () {
            var damSearch = my_widget_script.damSearch($(this).data("dam"));
            my_widget_script.printID(damSearch);
            my_widget_script.printDOB(damSearch);
            my_widget_script.printTasks_today(damSearch);
            my_widget_script.resize();
        });

        $("#addDam").on("click", function () {
            my_widget_script.addMouseFuncs();
        })

        // Start without a specific dam selected
        $("#selectDam").val("");
        my_widget_script.switchDam("");

        $("#selectDam").on("change", function () {
            var damNum = $(this).val();
            var damSearch = my_widget_script.damSearch(damNum);
            my_widget_script.switchDam(damSearch);
            my_widget_script.resize();
        });

        my_widget_script.resize();
    },

    /**
     * TO DO: edit this function to define which <div>s or other elements
     * should be adjusted based on the current width of the window
     */
    resize: function () {
        //resize the container
        my_widget_script.parent_class.resize_container();
    },
    // ********************** END CUSTOM INIT METHODS **********************


    // ********************** START CUSTOM TO_JSON METHODS **********************
    getDynamicContent: function () {
        // Create a selected tasks object
        var selectedTasks = {};

        var damList = my_widget_script.damList;

        for(var i = 0; i < damList.length; i++){
            var damNum = damList[i];
            var damSearch = my_widget_script.damSearch(damNum);
            var tasks = $(".tasks"+damSearch).val();
            // Create a property within the selectedTasks object for each dam 
            // Value equals the selected tasks for that dam
            selectedTasks[damNum] = tasks
        }

        var dynamicContent = {
            damList: damList,
            selectedTasks: selectedTasks
        };
        return dynamicContent;
    },
    // ********************** END CUSTOM TO_JSON METHODS **********************

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
    data_valid_form: function () {
        var valid = true; //begin with a valid value of true
        //var fail_log = ''; //begin with an empty fail log
        //var name; //create a name variable

        //search the_form for all elements that are of class "needForForm"
        $('.needForTable').each(function () {
            if (!$(this).val()) { //if there is not a value for this input
                valid = false; //change valid to false
                //name = $(this).attr('id'); //replace the name variable with the id attribute of this element
                //fail_log += name + " is required \n"; //add to the fail log that this name is required
            }
        });

        if (!valid) {
            $("#errorMsg").html("<span style='color:red; font-size:36px;'>Please fill out all elements marked by a</span><span style='color:blue; font-size:36px;'> blue #</span>");
        } else {
            $("#errorMsg").html("");
        }

        return valid;
    },

    dataSearch: function (dataName, dataValue) {
        var dataSearch = "[data-" + dataName + "='" + dataValue + "']";
        return dataSearch
    },

    damSearch: function (damNum) {
        var damSearch = my_widget_script.dataSearch("dam", damNum);
        return damSearch
    },

    checkStopStatus: function (damSearch) {
        var proceed = true;
        if($(".stop"+damSearch).is(":checked")){
            proceed = false;
        }
        return proceed
    },

    printID: function (damSearch) {
        var id = $(".damID"+damSearch).val();
        var proceed = my_widget_script.checkStopStatus(damSearch);
        if(proceed){
            $(".idPrint"+damSearch).text(id);
        } else {
            $(".idPrint"+damSearch).text("");
        }
        // Always print for select list
        $(".idList"+damSearch).text(id);
    },

    printDOB: function (damSearch) {
        var proceed = my_widget_script.checkStopStatus(damSearch);
        if(proceed){
            var dob = $(".DOB"+damSearch).val();
            var pnd, dobPrint;
            if (dob){
                var day = luxon.DateTime.fromISO(dob).toLocaleString({weekday: "long"})
                dobPrint = dob + "<br/>" + day;
                pnd = my_widget_script.getPND_today(damSearch);
            } else {
                dobPrint = "";
                pnd = "";
            }
        } else {
            dobPrint = "";
            pnd = "";
        }
        $(".DOBPrint"+damSearch).html(dobPrint);
        $(".PNDPrint"+damSearch).text(pnd);
        my_widget_script.printTasks_today(damSearch);
    },

    getPND_today: function (damSearch) {
        var $DOBVal = $(".DOB"+damSearch).val();

        if($DOBVal){
            var startDate = luxon.DateTime.fromISO($DOBVal).startOf("day");
            var todayDate = luxon.DateTime.now().startOf("day")
            var dateDiff_days = todayDate.diff(startDate, "days").as("day");
    
        } else {
            var dateDiff_days = NaN;
        }
        return(dateDiff_days);
    },

    checkInArray: function (searchVal, array){
        var proceed = $.inArray(searchVal, array) !== -1;
        return proceed
    },

    printTasks_today: function (damSearch) {
        // Have to un-disable this select field because when viewing, the array comes back false if it's disabled
        $(".tasks").prop("disabled", false);
        $(".tasks option").prop("disabled", false);

        var selectedTasks = $(".tasks"+damSearch).val();
        // console.log(selectedTasks);
        var $taskPrint = $(".taskPrint"+damSearch);
        $taskPrint.html("");
        var proceed = my_widget_script.checkStopStatus(damSearch);
        // If not marked to stop tracking dam
        if(proceed){
            // console.log("Not marked to stop checking");
            var pndToday = my_widget_script.getPND_today(damSearch);
            // If there's a pnd today
            if(pndToday){
                // console.log("We've got a pndToday");
                var proceed_p2_9 = my_widget_script.checkInArray("p2_9", selectedTasks);
                if(pndToday == 2 && proceed_p2_9){
                    $taskPrint.append("<div>Start the paradigm</div>");
                }
                var proceed_p4_11 = my_widget_script.checkInArray("p4_11", selectedTasks);
                if(pndToday == 4 && proceed_p4_11){
                    $taskPrint.append("<div>Start the paradigm</div>");
                }
                if(pndToday == 9 && proceed_p2_9){
                    $taskPrint.append("<div>End the paradigm and ear tag</div>");
                }
                var proceed_p4_11 = my_widget_script.checkInArray("p4_11", selectedTasks);
                if(pndToday == 11 && proceed_p4_11){
                    $taskPrint.append("<div>End the paradigm and ear tag</div>");
                }
                var possibleMassDays = [2, 4, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
                for (var i = 0; i<possibleMassDays.length; i++ ){
                    var day = possibleMassDays[i];
                    if(pndToday == day){
                        var checkDay = my_widget_script.checkInArray("p"+day+"_mass", selectedTasks);
                        if(checkDay){
                            $taskPrint.append("<div>Take masses</div>");
                        }
                    }
                }
                if(pndToday == 21){
                    $taskPrint.append("<div>Wean</div>");
                }
                var proceed_juv_agd = my_widget_script.checkInArray("juv_agd", selectedTasks);
                var proceed_juv_agd_dates = my_widget_script.checkInArray(pndToday, [22, 23, 24]);
                if( proceed_juv_agd && proceed_juv_agd_dates){
                    $taskPrint.append("<div>Check AGD</div>");
                }
                var proceed_ad_agd = my_widget_script.checkInArray("ad_agd", selectedTasks);
                var proceed_ad_agd_dates = my_widget_script.checkInArray(pndToday, [70, 71, 72]);
                if( proceed_ad_agd && proceed_ad_agd_dates){
                    $taskPrint.append("<div>Check AGD and take mass</div>");
                }
                var proceed_weeklyMass = my_widget_script.checkInArray("weekly_mass", selectedTasks);
                if(proceed_weeklyMass){
                    var weeklyMassDays = [28, 35, 42, 49, 56, 63, 70];
                    if(my_widget_script.checkInArray(pndToday, weeklyMassDays)){
                        $taskPrint.append("<div>Take masses</div>");
                    }
                }
                var proceed_cycle = my_widget_script.checkInArray("cycle", selectedTasks)
                if(proceed_cycle && pndToday >= 70 && pndToday <= 90 ){
                    $taskPrint.append("<div>Cycle females</div>")
                }
            }
        }
    },

    switchDam: function (damSearch) {
        $(".mouseInfo"+damSearch).show();
        $(".mouseInfo").not(damSearch).hide();
    },

    damList: [],

    addMouseFuncs: function () {
        var lastDam = my_widget_script.damList[my_widget_script.damList.length - 1];
        var thisDam;
        if(lastDam){
            thisDam = lastDam + 1;
        } else {
            thisDam = 1;
        }
        
        my_widget_script.damList[my_widget_script.damList.length] = thisDam;
        // console.log(my_widget_script.damList);

        my_widget_script.createMouseSelect(thisDam);
        my_widget_script.createMouseInfo(thisDam);
        my_widget_script.createMousePrint(thisDam);

        $("#selectDam").val(thisDam);
        my_widget_script.switchDam(my_widget_script.damSearch(thisDam));

        my_widget_script.resize();
    },

    deleteMouseFuncs: function (damNum) {
        // Remove it from the damList
        var index = my_widget_script.damList.indexOf(damNum);
        if(index > -1){
            my_widget_script.damList.splice(index, 1);
        }

        // console.log(my_widget_script.damList);

        var damSearch = my_widget_script.damSearch(damNum);
        $("option"+damSearch).remove();
        $(".mouseInfo"+damSearch).remove();
        $(".addedPrint"+damSearch).remove();

        my_widget_script.resize();
    },

    createMouseSelect: function (thisDam) {
        var $select = $("#selectDam");
        // Pass thisDam to the function to be able to use on loading
        // var lastDam = $select.find(".added").last().data("dam");
        // if(lastDam){
        //     thisDam = lastDam + 1;
        // } else {
        //     thisDam = 1;
        // }

        $select.append(
            $("<option/>", {
                value: thisDam,
                "class": "added idList",
                "data-dam": thisDam
            }).append(
                "Dam " + thisDam
            )
        );
    },

    createMouseInfo: function (thisDam) {
        var $div = $(".mouseDemoDiv");
        // var lastDam = $div.find(".mouseInfo").last().data("dam");
        // var thisDam;
        // if(lastDam){
        //     thisDam = lastDam + 1;
        // } else {
        //     thisDam = 1;
        // }
        
        var myLeftCol = "col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right"
        $div.append(
            $("<div/>", {
                "class": "mouseInfo",
                "data-dam": thisDam
            }).append(
                $("<div/>", {
                    "class": "row mt-2"
                }).append(
                    $("<div/>", {
                        "class": myLeftCol
                    }).append("Dam ID:")
                ).append(
                    $("<div/>", {
                        "class": "col"
                    }).append(
                        $( "<input/>", {
                            type: "text",
                            "class": "fullWidth damID",
                            id: "damID"+thisDam,
                            name:"damid"+thisDam,
                            "data-dam": thisDam
                        }).on("input", function () {
                            var damSearch = my_widget_script.damSearch($(this).data("dam"));
                            my_widget_script.printID(damSearch);
                            my_widget_script.resize();
                        })
                    )
                )
            ).append(
                $("<div/>", {
                    "class": "row mt-2"
                }).append(
                    $("<div/>", {
                        "class": myLeftCol
                    }).append("DOB (pups):")
                ).append(
                    $("<div/>", {
                        "class": "col"
                    }).append(
                        $( "<input/>", {
                            type: "date",
                            "class": "fullWidth DOB",
                            id: "DOB"+thisDam,
                            name:"dob"+thisDam,
                            "data-dam": thisDam
                        }).on("input", function () {
                            var damSearch = my_widget_script.damSearch($(this).data("dam"));
                            my_widget_script.printDOB(damSearch);
                            my_widget_script.resize();
                        })
                    )
                )
            ).append(
                $("<div/>", {
                    "class": "row mt-2"
                }).append(
                    $("<div/>", {
                        "class": myLeftCol
                    }).append("Select Tasks:")
                ).append(
                    $("<div/>", {
                        "class": "col"
                    }).append(
                        $( "<select/>", {
                            multiple: true,
                            "class": "fullWidth tasks",
                            id: "tasks"+thisDam,
                            name:"tasks"+thisDam,
                            "data-dam": thisDam
                        }).on("input", function () {
                            var damSearch = my_widget_script.damSearch($(this).data("dam"));
                            my_widget_script.printTasks_today(damSearch);
                            my_widget_script.resize();
                        })
                    )
                )
            ).append(
                $("<div/>", {
                    "class": "row mt-2 align-items-center"
                }).append(
                    $("<div/>", {
                        "class": myLeftCol
                    }).append("Stop Tracking:")
                ).append(
                    $("<div/>", {
                        "class": "col"
                    }).append(
                        $( "<input/>", {
                            type: "checkbox",
                            "class": "stop",
                            id: "stop"+thisDam,
                            name:"stop"+thisDam,
                            "data-dam": thisDam
                        }).on("input", function () {
                            var damSearch = my_widget_script.damSearch($(this).data("dam"));
                            my_widget_script.printID(damSearch);
                            my_widget_script.printDOB(damSearch);
                            my_widget_script.printTasks_today(damSearch);
                            my_widget_script.resize();
                        })
                    )
                )
            ).append(
                $("<div/>", {
                    "class": "row mt-2 align-items-center"
                }).append(
                    $("<div/>", {
                        "class": myLeftCol
                    }).append("Remove dam entirely:")
                ).append(
                    $("<div/>", {
                        "class": "col"
                    }).append(
                        $( "<input/>", {
                            type: "button",
                            "class": "removeDam",
                            id: "remove"+thisDam,
                            name:"remove"+thisDam,
                            "data-dam": thisDam,
                            value: "Delete this dam"
                        }).on("click", function () {
                            var proceed = confirm ("Are you sure you want to completely remove this dam?");
                            if(proceed){
                                var damNum = $(this).data("dam");
                                my_widget_script.deleteMouseFuncs(damNum);
                            }

                        })
                    )
                )
            )
        );

        var $tasksTag = $div.find(".tasks").last();

        $tasksTag.append(
            $("<option/>", {
                value: "p2_9"
            }).append(
                "P2-P9 paradigm"
            )
        ).append(
            $("<option/>", {
                value: "p4_11",
                selected: true
            }).append(
                "P4-P11 paradigm"
            )
        )

        var massDays = [2, 4, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
        var selectedKey = [false, true, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]

        for(var i = 0; i < massDays.length; i ++ ){
            var day = massDays[i];
            var selectedVal = selectedKey[i];
            $tasksTag.append(
                $("<option/>", {
                    value: "p" + day + "_mass",
                    selected: selectedVal
                }).append(
                    "P" + day + " mass"
                )
            );
        }

        $tasksTag.append(
            $("<option/>", {
                value: "juv_agd"
            }).append(
                "Juvenile AGD"
            )
        ).append(
            $("<option/>", {
                value: "ad_agd",
                selected: true
            }).append(
                "Adult AGD"
            )
        ).append(
            $("<option/>", {
                value: "weekly_mass",
                selected: true
            }).append(
                "Weekly adult mass"
            )
        ).append(
            $("<option/>", {
                value: "cycle",
                selected: true
            }).append(
                "Cycle in adulthood"
            )
        )
    },

    createMousePrint: function (thisDam) {
        var $div = $(".mousePrint");
        // var lastDam = $div.find(".added").last().data("dam");
        // var thisDam;
        // if(lastDam){
        //     thisDam = lastDam + 1;
        // } else {
        //     thisDam = 1;
        // }

        $div.append(
            $("<div/>", {
                "class": "row addedPrint mt-2",
                "data-dam": thisDam
            }).append(
                $("<div/>", {
                    "class": "col idPrint",
                    "data-dam": thisDam
                })
            ).append(
                $("<div/>", {
                    "class": "col DOBPrint",
                    "data-dam": thisDam
                })
            ).append(
                $("<div/>", {
                    "class": "col PNDPrint",
                    "data-dam": thisDam
                })
            ).append(
                $("<div/>", {
                    "class": "col taskPrint",
                    "data-dam": thisDam
                })
            )
        );
    }

};
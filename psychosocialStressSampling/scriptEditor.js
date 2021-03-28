my_widget_script =
{
    mouseNums: [],
    sampleNums: [],
    startTime: "",

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
        // debugger;

        //Get the parsed JSON data
        var parsedJson = this.parseInitJson(json_data);

        //Uncomment to print parsedJson to consol
        //console.log("init", parsedJson);

        //check parsedJson for info not contained in form inputs and reinitialize
        this.initDynamicContent(parsedJson);

        //resize the content box when the window size changes
        window.onresize = this.resize;

        //Define behavior when buttons are clicked or checkboxes/selctions change
        this.addEventListeners();

        // Initialize the form with the stored widgetData using the parent_class.init() function
        this.parent_class.init(mode, () => JSON.stringify(parsedJson.widgetData));

        if(parsedJson.sampleNums){
            $("#numSamples").val(parsedJson.sampleNums.length);
        }

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
            mouseNums: dynamicContent.mouseNums,
            sampleNums: dynamicContent.sampleNums
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
            mouseNums: [2, 4],
            sampleNums: [1, 2, 3]
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
     * TO DO: edit this function to reinitialize any dynamic content that is not explicity
     * defined within the HTML code. 
     * 
     * This function requires the parsedJson object.
     */
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

    /**
     * TO DO: edit this function to define how the HTML elements should be adjusted
     * based on the current mode.
     * 
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
     * TO DO: edit this function to define behavior when the user interacts with the form.
     * This could include when buttons are clicked or when inputs change.
     */
    addEventListeners: function () {
        
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
        // Check if browser has support for input type=time
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
        my_widget_script.isDateSupported();
        my_widget_script.isTimeSupported();
        
        $("input[type='date']").prop("placeholder", "YYYY-MM-DD").on("change", function () {
            my_widget_script.checkDateFormat($(this));
        }).each(function () {
            my_widget_script.checkDateFormat($(this));
        });
        
        $("input[type='time']").prop("placeholder", "hh:mm").on("change", function () {
            my_widget_script.checkTimeFormat($(this));
        }).each(function () {
            my_widget_script.checkTimeFormat($(this));
        });
        
        //Add classes to add bootstrap styles for left column in form
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
                my_widget_script.startTime = luxon.DateTime.fromObject({
                    hour: 09,
                    minute: 30
                })
            } else {
                my_widget_script.startTime = luxon.DateTime.fromObject({
                    hour: 10,
                    minute: 30
                })
            }
            my_widget_script.printExpTimes();
            my_widget_script.watchSampleLabel();
        }).on("change", function () {
            if($(this).val() == "est"){
                my_widget_script.startTime = luxon.DateTime.fromObject({
                    hour: 09,
                    minute: 30
                })
            } else {
                my_widget_script.startTime = luxon.DateTime.fromObject({
                    hour: 10,
                    minute: 30
                })
            }
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
            my_widget_script.watchMouseID(this);
        });

        $.each(my_widget_script.sampleNums, function () {
            my_widget_script.watchSampleLabel(this);
        });

        // $(".card-header").on("click", function () {
        //     my_widget_script.toggleCard($(this));
        // });

        my_widget_script.resize();
    },

    toggleCard: function ($cardHead) {
        console.log($cardHead.next());
        $cardHead.next().toggleClass("collapse");
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

    /**
     * TO DO: edit this function to define which <div>s or other elements
     * should be adjusted based on the current width of the window
     */
    resize: function () {
        //resize the container
        my_widget_script.parent_class.resize_container();

        // var x = window.matchMedia("(max-width: 576px)");
        // if(x.matches){
        //     $("#card td").each(function () {
        //         $(this).before(
        //             $(this).data("label")
        //         )
        //     })
        // }
    },
    // ********************** END CUSTOM INIT METHODS **********************


    // ********************** START CUSTOM TO_JSON METHODS **********************
    getDynamicContent: function () {
        var dynamicContent = {
            mouseNums: my_widget_script.mouseNums,
            sampleNums: my_widget_script.sampleNums,
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
                        $("<div/>", {
                            "class": "card-header mouseIDCalc",
                            "data-mouse": mouseNum
                        }).on("click", function () {
                            // console.log($(this));
                            my_widget_script.toggleCard($(this));
                        }).append("[Enter Mouse ID]")
                    ).append(
                        $("<div/>", {
                            "class": "card-body"
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
                                        "class": "mouseID fullWidth"
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
                                        "class": "shortID fullWidth"
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
                                        "class": "treatment fullWidth"
                                    }).append('<option value="control">Control</option><option value="stress">Stress</option>')
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
                                        "class": "deleteMouse fullWidth"
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
                                        "class": "sex fullWidth"
                                    }).append(
                                        '<option value="">[Select]</option><option value="male">Male</option><option value="female">Female</option>'
                                    ).on("input", function () {
                                        var sex = $(this).val();
                                        if(sex == "female"){
                                            $(this).parents(".row").next(".ifFemale").show();
                                        }else {
                                            $(this).parents(".row").next(".ifFemale").hide();
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
                                        "class": "stage fullWidth"
                                    }).append('<option value="">Select</option><option value="diestrus">Diestrus</option><option value="proestrus">Proestrus</option><option value="estrus">Estrus</option>')
                                )
                            )
                        ).append(
                            $("<div/>", {
                                "class": row
                            }).append(
                                $("<div/>", {
                                    "class": col
                                }).append("Body Mass:")
                            ).append(
                                $("<div/>", {
                                    "class": "col"
                                }).append(
                                    $("<input/>", {
                                        type: "number", 
                                        "data-mouse": mouseNum,
                                        id: "mass"+mouseNum,
                                        name: "mass"+mouseNum,
                                        "class": "mass fullWidth"
                                    })
                                )
                            )
                        ).append(
                            $("<div/>", {
                                "class": row
                            }).append(
                                $("<div/>", {
                                    "class": col
                                }).append("Gonad Mass:")
                            ).append(
                                $("<div/>", {
                                    "class": "col"
                                }).append(
                                    $("<input/>", {
                                        type: "text", 
                                        "data-mouse": mouseNum,
                                        id: "gonadMass"+mouseNum,
                                        name: "gonadmass"+mouseNum,
                                        "class": "gonadMass fullWidth"
                                    })
                                )
                            )
                        )
                    )
                )
            )
            my_widget_script.resize();
        }
    },

    deleteMouseFuncs: function (mouseNum) {
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
                my_widget_script.watchMouseID(mouse);
            }
        }
        if(my_widget_script.sampleNums){
            var proceed = true;
            for(var i = 0; i < my_widget_script.sampleNums.length; i++){
                if(proceed){
                    var sampleNum = my_widget_script.sampleNums[i];
                    if(sampleNum>totalNumSamples){
                        proceed = confirm("Are sure that you want to remove a sampling time?");
                        if(proceed){
                            $(my_widget_script.sampleSearch(sampleNum)).remove();
                        } else {
                            $("#numSamples").val(my_widget_script.sampleNums.length);
                        }
                    }
                }
            }
        }
        my_widget_script.resize();
    },

    miceInSamples: {},

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
                    $("<div/>", {
                        "class": "card-header"
                    }).on("click", function () {my_widget_script.toggleCard($(this))}).append("Sample " + sampleNum)
                ).append(
                    $("<div/>", {
                        "class": "card-body row"
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
                                "class": "sampleTime fullWidth",
                                "data-sample": sampleNum
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
                                "class": "sampleLabel fullWidth",
                                "data-sample": sampleNum
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
                                        "class": "cort"
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
                                        "class": "LH"
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
                                        "class": "otherName ifOther fullWidth"
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
                $("<div/>", {
                    "class": "card-header samplingHead",
                    id: "samplingHead"+sampleNum
                }).on("click", function () {my_widget_script.toggleCard($(this))}).append(
                    $("<h4/>", {
                        "class": "mb-0"
                    }).append(
                        $("<div/>", {
                            "class": "sampleLabelCalc",
                        // $("<button/>", {
                            // "class": "btn btn-link btn-block text-left sampleLabelCalc",
                            // type: "button",
                            // "data-toggle": "collapse",
                            // "data-target": "#samplingBody"+sampleNum,
                            // "aria-expanded": "false",
                            // "aria-controls": "samplingBody"+sampleNum,
                            "data-sample": sampleNum,
                            // "name": "samplingheadbutton"+sampleNum
                        }).append("Sample " + sampleNum)
                        // .on("click", function () {
                        //     my_widget_script.resize();
                        // })
                    )
                )
            ).append(
                $("<div/>", {
                    // "class": "collapse hide samplingBody",
                    "class": "samplingBody",
                    id: "samplingBody"+sampleNum,
                    // "aria-labelledby": "samplingHead"+sampleNum,
                    // "data-parent": "#samplesAccordion",
                    "data-sample": sampleNum
                }).append(
                    $("<div/>", {
                        "class": "card-body divForMouseSampling",
                        "data-sample": sampleNum
                    })
                )
            )
        )
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
                $("<div/>", {
                    "class": "card-header",
                    id: "heading"+sampMouseID
                }).on("click", function () {my_widget_script.toggleCard($(this))}).append(
                    $("<h4/>", {
                        "class": "mb-0"
                    }).append(
                        $("<div/>", {
                        // $("<button/>", {
                            // "class": "btn btn-link btn-block text-left",
                            // type: "button",
                            // "data-toggle": "collapse",
                            // "data-target": "#body"+sampMouseID,
                            // "aria-expanded": "false",
                            // "aria-controls": "body"+sampMouseID,
                            // "name": "samplemousebutton"+sampMouseID
                        // }).on("click", function () {
                        //     my_widget_script.resize();
                        }).append(
                            $("<span/>", {
                                "class": "mouseIDCalc",
                                "data-mouse": mouseNum
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
                    // "class": "collapse hide",
                    // "aria-labelledby": "heading"+sampMouseID
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
                                    $(".startTime"+mouseSearch+sampleSearch).val(timeString);
                                    my_widget_script.checkTimeFormat($(".startTime"+mouseSearch+sampleSearch));
                                })
                            ).append(
                                $("<input/>", {
                                    type: "time",
                                    value: "Start", 
                                    id: "startTime"+sampMouseID,
                                    name: "starttime"+sampMouseID,
                                    "class": "startTime fullWidth",
                                    "data-mouse": mouseNum,
                                    "data-sample": sampleNum,
                                    "placeholder": "hh:mm"
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
                                    $(".endTime"+mouseSearch+sampleSearch).val(timeString);
                                    my_widget_script.checkTimeFormat($(".endTime"+mouseSearch+sampleSearch));
                                })
                            ).append(
                                $("<input/>", {
                                    type: "time",
                                    value: "End", 
                                    id: "endTime"+sampMouseID,
                                    name: "endtime"+sampMouseID,
                                    "class": "endTime fullWidth",
                                    "data-mouse": mouseNum,
                                    "data-sample": sampleNum,
                                    "placeholder": "hh:mm"
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
                                    "class": "notes fullWidth autoAdjut",
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
                    )
                )
            )
        )
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

    showWithCheck: function ($chbx, $toToggle) {
        if($chbx.is(":checked")){
            $toToggle.show();
        } else {
            $toToggle.hide();
        }
        my_widget_script.resize();
    },

    showIfOtherCheck: function ($chbx) {
        var $ifOther = $chbx.next(".ifOther");
        my_widget_script.showWithCheck($chbx, $ifOther);
    }
};

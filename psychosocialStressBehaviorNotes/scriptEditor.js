my_widget_script =
{
    mouseNums: [],
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
        //debugger;

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
            mouseNums: my_widget_script.mouseNums
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
            mouseNums: [2,4] 
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
            $("input[type='date']").removeClass(".hasDatePicker");
            $(".card-header").each(function () {
                my_widget_script.toggleCard($(this));
            });
        } else {
            $("input[type='date']").each(function () {
                my_widget_script.checkDateFormat($(this));
            });
            
            $("input[type='time']").each(function () {
                my_widget_script.checkTimeFormat($(this));
            });
        }
    },

    /**
     * TO DO: edit this function to define behavior when the user interacts with the form.
     * This could include when buttons are clicked or when inputs change.
     */
    addEventListeners: function () {
        
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
     * TO DO: edit this function to define how the form should be initilized based 
     * on the existing form values. This is particularly important for when the 
     * widget already has data entered, such as when saved to a page.
     */
    setUpInitialState: function () {
        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-12 col-sm-6 col-md-4 col-lg-3 text-left text-sm-right");
        
        my_widget_script.isDateSupported();
        my_widget_script.isTimeSupported();

        $("input[type='date']").prop("placeholder", "YYYY-MM-DD").on("change", function () {
            my_widget_script.checkDateFormat($(this));
        });
        
        $("input[type='time']").prop("placeholder", "hh:mm").on("change", function () {
            my_widget_script.checkTimeFormat($(this));
        });

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

        $("#addMouse").on("click", function () {
            if(my_widget_script.mouseNums.length > 0){
                var lastMouse = my_widget_script.mouseNums[my_widget_script.mouseNums.length - 1];
                var mouseNum = lastMouse + 1;
            } else {
                var mouseNum = 1;
            }
            my_widget_script.makeMouseCard(mouseNum);
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
        });

        $.each(my_widget_script.mouseNums, function () {
            // console.log(this);
            my_widget_script.watchMouseID(this);
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
        var dynamicContent = {};
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
        return dataSearch;
    },

    mouseSearch: function (mouseNum){
        var mouseSearch = my_widget_script.dataSearch("mouse", mouseNum);
        return mouseSearch;
    },

    checkInArray: function (searchVal, array){
        var proceed = $.inArray(searchVal, array) !== -1;
        return proceed
    },

    toggleCard: function ($cardHead) {
        $cardHead.next().toggleClass("collapse");
        $cardHead.find("textarea.autoAdjust").each(function () {
            if(! $(this).is(":hidden")) {
                this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
            } 
        });
        my_widget_script.resize();
    },
    
    makeCard: function ($div, cardHeadContent, cardBodyContent) {
        // Add extras to header, such as classes or data attributes in calling function after making the card
        $div.append(
            $("<div/>", {
                "class": "card"
            }).append(
                $("<div/>", {
                    "class": "card-header"
                }).on("click", function () {
                    // console.log($(this));
                    my_widget_script.toggleCard($(this));
                }).append(cardHeadContent)
            ).append(
                $("<div/>", {
                    "class": "card-body collapse"
                }).append(
                    cardBodyContent
                )
            )
        )
        my_widget_script.resize();
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
                    "class": "col-12 col-lg-6 mt-2 mouseCard",
                    "data-mouse": mouseNum
                })
            );
            
            var mouseSearch = my_widget_script.mouseSearch(mouseNum);
            var $divFoCard = $div.find(".mouseCard"+mouseSearch);

            var headContent = $("<div/>", {
                "class": "mouseIDCalc",
                "data-mouse": mouseNum
            }).append("Mouse " + mouseNum);

            var bodyContent = $("<div/>").append(
                $("<div/>", {
                    "class": row + " hideView"
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
                        "class": "col-12 hideView"
                    }).append(
                        $("<select/>", {
                            id: "behaviorNotes"+mouseNum,
                            name: "behaviornotes"+mouseNum,
                            "class": "behaviorNotes fullWidth",
                            "data-mouse": mouseNum,
                            "multiple": true
                        })
                    ).append(
                        $("<input/>", {
                            type: "button", 
                            value: "Add notes",
                            id: "addNotes"+mouseNum,
                            name: "addnotes"+mouseNum,
                            "class": "addNotes fullWidth disableOnView",
                            "data-mouse": mouseNum,
                        }).on("click", function () {
                            var thisMouseNum = $(this).data("mouse");
                            var mouseSearch = my_widget_script.mouseSearch(mouseNum);

                            var notes = $(".notes"+ mouseSearch).val();
                            var addLine = "";
                            if(notes){
                                addLine = "\n"
                            }
                            notes += addLine + "------\n";

                            currentTime = luxon.DateTime.now().setLocale("en-US");
                            notes += currentTime.toLocaleString(luxon.DateTime.TIME_24_WITH_SHORT_OFFSET) + ": ";
                            var diffInHours = currentTime.diff(my_widget_script.startTime).as("hours");
                            notes += diffInHours.toFixed(1) + "h";
                            
                            var addComma = "";
                            addLine = "\n"

                            // console.log(diffInHours.toFixed(1));

                            $(".behaviorNotes"+mouseSearch).find("option:selected").each(function () {
                                notes += addLine + addComma + $(this).text();
                                addComma = ", "
                                addLine = ""
                            });

                            $(".notes"+mouseSearch).val(notes);
                            // Resize
                            var notesTxtbox = document.getElementById("notes"+thisMouseNum);
                            notesTxtbox.style.height = 'auto';
                            notesTxtbox.style.height = (notesTxtbox.scrollHeight) + 'px';
                            my_widget_script.resize();
                        })
                    )
                ).append(
                    $("<div/>", {
                        "class": "col-12 mt-2"
                    }).append(
                        $('<text' + 'area></text' + 'area>', {
                            id: "notes"+mouseNum,
                            name: "notes"+mouseNum,
                            "class": "notes fullWidth autoAdjust",
                            "placeholder": "Notes",
                            "data-mouse": mouseNum
                        }).on("input", function () {
                            this.style.height = 'auto';
                            this.style.height = (this.scrollHeight) + 'px';
                            my_widget_script.resize();
                        })
                    )
                )
            )

            my_widget_script.makeCard($divFoCard, headContent, bodyContent);
            
            var behaviorOptions = [
                {val: "moved", text: "Moved to new room"},
                {val: "restraint", text: "Placed in restraint tube"},
                {val: "scent", text: "Added 2,3-TMT scent"},
                {val: "digging", text: "Digging"},
                {val: "grooming", text: "Grooming"},
                {val: "rearing", text: "Rearing"},
                {val: "biting", text: "Biting plastic"},
                {val: "resting", text: "Resting"},
                {val: "twisting", text: "Twisting/turning"}
            ]

            for(var i = 0; i < behaviorOptions.length; i ++ ){
                var option = behaviorOptions[i];
                var val = option.val;
                var text = option.text;
                $(".behaviorNotes" + mouseSearch).append(
                    $("<option/>", {
                        "value": val
                    }).append(text)
                );
            }
        }
    },

    watchMouseID: function (mouseNum) {
        var mouseSearch = my_widget_script.mouseSearch(mouseNum);
        var mouseID = $(".mouseID"+mouseSearch).val();
        if(!mouseID){
            mouseID = "Mouse " + mouseNum;
        }
        $(".mouseIDCalc"+mouseSearch).html(mouseID);
    },

    deleteMouseFuncs: function (mouseNum) {
        // Remove it from the mouseNums
        var index = my_widget_script.mouseNums.indexOf(mouseNum);
        if(index > -1){
            my_widget_script.mouseNums.splice(index, 1);
        }

        // console.log(my_widget_script.mouseNums);

        var mouseSearch = my_widget_script.mouseSearch(mouseNum);
        $(".mouseCard"+mouseSearch).remove();

        my_widget_script.resize();
    },
};
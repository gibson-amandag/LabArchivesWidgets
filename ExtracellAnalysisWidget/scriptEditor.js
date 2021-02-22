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

        //Get the parsed JSON data
        var parsedJson = this.parseInitJson(json_data);

        //Uncomment to print parsedJson to consol
        //console.log("init", parsedJson);

        //check parsedJson for info not contained in form inputs and reinitialize
        // this.initDynamicContent(parsedJson);

        //resize the content box when the window size changes
        window.onresize = this.resize;

        //Define behavior when buttons are clicked or checkboxes/selctions change
        this.addEventListeners();

        // Initialize the form with the stored widgetData using the parent_class.init() function
        this.parent_class.init(mode, () => JSON.stringify(parsedJson.widgetData));

        // Add * and # to mark required field indicators
        // this.addRequiredFieldIndicators();

        // Set up the form based on previously entered form input
        this.setUpInitialState();

        //adjust form design and buttons based on mode
        // this.adjustForMode(mode);
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
            widgetData: JSON.parse(widgetJsonString)
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
        var output = { widgetData: testData };

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
     * Not currently using
     */
    initDynamicContent: function (parsedJson) {
        
    },

    /**
     * Not currently using
     */
    adjustForMode: function (mode) {
        if (mode !== "edit" && mode !== "edit_dev") {
            //disable when not editing
            $(".disableOnView").prop("disabled", true);
        }
    },

    addEventListeners: function () {
        //When cell changes
        $("#cellID").on("input", function () {
            $(".cell_calc").text($(this).val());
        });
        
        //When spontaneous length changes
        $("#spontLength").on("input", function () {
            if(parseFloat($("#spontLength").val()) < 60){
                $("#lengthWarning").html("<span style='color:red; font-size:18px;'>Warning: Spontaneous length is less than 60 minutes</span>");
            }else {
                $("#lengthWarning").html("");
            };
            my_widget_script.resize();
        });

        //When senktide length changes
        $("#senktideLength").on("input", function () {
            if(parseFloat($("#senktideLength").val()) !== 12){
                $("#senktideLengthWarning").html("<span style='color:red; font-size:18px;'>Warning: senktide length is not 12 minutes</span>");
            }else {
                $("#senktideLengthWarning").html("");
            };
            my_widget_script.resize();
        });

        //if senktide added
        $("#senktideAdded").on("change", function () {
            if($("#senktideAdded").is(":checked")) {
                $(".ifSenktide").show();
                $("#burstDiv").addClass("mt-md-2");
            } else {
                $(".ifSenktide").hide();
                $("#burstDiv").removeClass("mt-md-2");
            };
        });

        //if spontaneous firing analyzed
        $("#firingAnalysis").on("change", function () {
            if($("#firingAnalysis").val() === "yes_noact" || $("#firingAnalysis").val() === "yes_act") {
                $(".ifFiring").show();
            } else {
                $(".ifFiring").hide();
            };
            my_widget_script.resize();
        });
        
        //if burst firing analyzed
        $("#burstAnalysis").on("change", function () {
            if($("#burstAnalysis").val() === "yes_noact" || $("#burstAnalysis").val() === "yes_act") {
                $(".ifBursting").show();
                if($("#regionTablesProbs").val() === "yes") {
                    $(".ifProbs").show()
                } else {
                    $(".ifProbs").hide();
                }
            } else {
                $(".ifBursting").hide();
                $(".ifProbs").hide();
            };
            my_widget_script.resize();
        });

        //if region table problems
        $("#regionTablesProbs").on("change", function () {
            if($("#regionTablesProbs").val() === "yes") {
                $(".ifProbs").show();
            } else {
                $(".ifProbs").hide();
            };
            my_widget_script.resize();
        });

        //if cluster analyzed
        $("#clusterAnalysis").on("change", function () {
            if($("#clusterAnalysis").val() === "yes_noact" || $("#clusterAnalysis").val() === "yes_act") {
                $(".ifCluster").show();
            } else {
                $(".ifCluster").hide();
            };
            my_widget_script.resize();
        });

        //if senktide analyzed
        $("#senktideFiringAnalysis").on("change", function () {
            if($("#senktideFiringAnalysis").val() === "yes_noact" || $("#senktideFiringAnalysis").val() === "yes_act") {
                $(".ifSenktideAnalyzed").show();
            } else {
                $(".ifSenktideAnalyzed").hide();
            };
            my_widget_script.resize();
        })

        $(".check_no").on("change", function () {
            //alert($(this).val());
            console.log($(this).val());
            if($(this).val() === "" || $(this).val() === "no"){
                $(this).parent().css("color", "red");
            }else {
                $(this).parent().css("color", "black");
            };
        })
    },

    /**
     * Not currently using
     */
    addRequiredFieldIndicators: function () {
        // $('.needForTableLab').each(function () { //find element with class "needForFormLab"
        //     //alert($(this).val());
        //     $(this).html("<span style='color:blue'>#</span>" + $(this).html()); //add # before
        // });

        // $('.needForTable').each(function () { //find element with class "needForForm"
        //     //alert($(this).val());
        //     $(this).after("<span style='color:blue'>#</span>"); //add # after
        // });

        // $('.requiredLab').each(function () { //find element with class "requiredLab"
        //     //alert($(this).val());
        //     $(this).html("<span style='color:red'>*</span>" + $(this).html()); //add # before
        // });

        // //source: https://stackoverflow.com/questions/18495310/checking-if-an-input-field-is-required-using-jquery
        // $('#the_form').find('select, textarea, input').each(function () { //find each select field, textarea, and input
        //     if ($(this).prop('required')) { //if has the attribute "required"
        //         $(this).after("<span style='color:red'>*</span>"); //add asterisk after
        //     }
        // });
    },

    setUpInitialState: function () {
        //Add classes to add bootstrap styles for left column in form
        $('.myLeftCol').addClass("col-12 col-sm-6 col-lg-5 text-left text-sm-right");

        $(".cell_calc").text($("#cellID").val());

        //spont length
        if(parseInt($("#spontLength").val()) < 60){
            $("#lengthWarning").html("<span style='color:red; font-size:18px;'>Warning: Spontaneous length is less than 60 minutes</span>");
        }else {
            $("#lengthWarning").html("");
        };

        //senktide lengths
        if(parseInt($("#senktideLength").val()) !== 12){
            $("#senktideLengthWarning").html("<span style='color:red; font-size:18px;'>Warning: senktide length is not 12 minutes</span>");
        }else {
            $("#senktideLengthWarning").html("");
        };

        //spont analyzed
        if($("#firingAnalysis").val() === "yes_noact" || $("#firingAnalysis").val() === "yes_act") {
            $(".ifFiring").show();
        } else {
            $(".ifFiring").hide();
        };

        //burst analyzed
        if($("#burstAnalysis").val() === "yes_noact" || $("#burstAnalysis").val() === "yes_act") {
            $(".ifBursting").show();
            if($("#regionTablesProbs").val() === "yes") {
                $(".ifProbs").show()
            } else {
                $(".ifProbs").hide();
            }
        } else {
            $(".ifBursting").hide();
            $(".ifProbs").hide();
        };

        //cluster analyzed
        if($("#clusterAnalysis").val() === "yes_noact" || $("#clusterAnalysis").val() === "yes_act") {
            $(".ifCluster").show();
        } else {
            $(".ifCluster").hide();
        };

        //if senktide added
        if($("#senktideAdded").is(":checked")) {
            $(".ifSenktide").show();
            $("#burstDiv").addClass("mt-md-2");
            if($("#senktideFiringAnalysis").val() === "yes_noact" || $("#senktideFiringAnalysis").val() === "yes_act") {
                $(".ifSenktideAnalyzed").show();
            } else {
                $(".ifSenktideAnalyzed").hide();
            };
        } else {
            $(".ifSenktide").hide();
            $("#burstDiv").removeClass("mt-md-2");
        };

        //check_no
        $(".check_no").each(function () {
            //alert($(this).val());
            if($(this).val() === "" || $(this).val() === "no"){
                $(this).parent().css("color", "red");
            }else {
                $(this).parent().css("color", "black");
            };
        })

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
};
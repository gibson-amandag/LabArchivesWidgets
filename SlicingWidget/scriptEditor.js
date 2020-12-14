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


        /* -----------------------------------------------------------------------------
        ** USE DEBUGGER TO INSPECT AND VIEW CODE
        ** -----------------------------------------------------------------------------
        */

        //debugger;

        /* -----------------------------------------------------------------------------
        ** CREATE jsonString AND parsedJSON VARIABLEs FROM json_data
        ** -----------------------------------------------------------------------------
        */
        var jsonString;
        //check if string or function because preview test is function and page is string
        if (typeof json_data === "string") {
            jsonString = json_data;
        } else {
            jsonString = json_data();
        };
        //Take input string into js object to be able to use elsewhere
        var parsedJson = JSON.parse(jsonString);

        //Uncomment to print parsedJson to consol
        //console.log("init", parsedJson);

        /* -----------------------------------------------------------------------------
        ** CHECK parsedJson FOR INFORMATION NOT CONTAINED IN FORM INPUTS
        **
        ** Content that is created dynamically and therefore not contained wtihin the 
        ** HTML script cannot be passed by the default json_data behavior of LA widgets.
        ** This additional information has to be passed within to_json
            ** This could include something such as row number or the existance of a div
        ** That information that then has to be used here to re-initialize the
        ** appropriate page contents. Use parsedJson.[objectName] to get this data
        ** -----------------------------------------------------------------------------
        */


        /* -----------------------------------------------------------------------------
        ** ADJUST FORM DESIGN AND BUTTONS BASED ON MODE
        
        ** If you do not want a button to be available when not editing disable it here
        ** If you do not want certain elements to be available when not editing,
        ** hide them here
        ** -----------------------------------------------------------------------------
        */

        if (mode !== "edit" && mode !== "edit_dev") {
            //disable when not editing
            $("#calculate").prop("disabled", true)
        };

        /* -----------------------------------------------------------------------------
        ** RESIZE THE CONTENT BOX WHEN THE WINDOW SIZE CHANGES
        ** -----------------------------------------------------------------------------
        */

        window.onresize = my_widget_script.resize;

        /* -----------------------------------------------------------------------------
        ** DEFINE BEHAVIOR WHEN BUTTONS ARE CLICKED OR CHECKBOXES/SELECTIONS CHANGE
        ** -----------------------------------------------------------------------------
        */

        //Show/hide the table
        $("#toggleTable").click(function () { //when the showTable button is clicked, run this function
            //alert("button pressed");
            my_widget_script.resize();
            $("#tableDiv").toggle();
            //resize the container (need here for when toggle off)
            my_widget_script.parent_class.resize_container();
        });

        //when the calculate button is clicked, run the calcValues function
        $('#calculate').click(function () {
            var data_valid = my_widget_script.data_valid_form();
            my_widget_script.calcValues();

        });

        //when the toCSV button is clicked, run the exportTableToCSV function
        $('#toCSV').click(function () {
            var data_valid = my_widget_script.data_valid_form();
            //alert(data_valid);
            if (data_valid) {
                my_widget_script.exportTableToCSV('mouseData', 'outTable');
            };
        });

        //When the copy button is clicked, run the copyTableRow function
        $("#copyDataButton").click(function () {
            var data_valid = my_widget_script.data_valid_form();
            //alert(data_valid);
            if (data_valid) {
                //alert("I'm clicked");
                my_widget_script.copyTableRow();
            } else {
                alert("Nothing was copied");
            };
        });

        //when the showGoogleDoc button is clicked, resize the containers, and toggle visability
        $("#showGoogleDoc").click(function () {
            //alert("button pressed");
            my_widget_script.resize();
            $(".iFrameDiv").toggle();
            //resize the container (need here for when toggle off)
            my_widget_script.parent_class.resize_container();
        });

        //Show/hide elements based on sex
        $("#sex").change(function () { //when sex is changed
            if ($("#sex").val() === "female") {
                $(".female").show() //show female class elements
                $(".male").hide() //hide male class elements
                if ($("#gonadstatus").val() === "intact") {
                    $(".cycle").show() //only show cycle if intact is also true
                } else {
                    $(".cycle").hide()
                }
            } else if ($("#sex").val() === "male") { //if male
                $(".female").hide() //hide female class elements
                $(".male").show() //show male class elements
                $(".cycle").hide() //hide cycles for male
            } else { //if not selected, hide everything
                $(".female").hide() //hide female class elements
                $(".male").hide() //hide male class elements
                $(".cycle").hide() //hide cycles for male
            };

        });

        //Show/hide elements based on gonad status
        $("#gonadstatus").change(function () { //when gonad status is changed
            if ($("#gonadstatus").val() === "intact") {
                $(".intact").show() //show intact class elements
                $(".gdx").hide() //hide gdx class elements
                if ($("#sex").val() === "female") {
                    $(".cycle").show()
                } else {
                    $(".cycle").hide()
                }
            } else if ($("#gonadstatus").val() === "gdx") {
                $(".intact").hide() //hide intact class elements
                $(".gdx").show() //show gdx class elements
                $(".cycle").hide()
            } else {
                $(".intact").hide() //hide intact class elements
                $(".gdx").hide() //hide gdx class elements
                $(".cycle").hide() //hide cycle
            }
        });

        $("#implantBox").change(function () {
            if ($("#implantBox").is(":checked")) {
                $(".implant").show() //show implant class elements
            } else {
                $(".implant").hide()
            }
        });

        /* -----------------------------------------------------------------------------
        ** INITIALIZE THE FORM WITH THE STORED WIDGET DATA
        ** -----------------------------------------------------------------------------
        */

        //use the expected LabArchives data (just the stringified widgetData)
        this.parent_class.init(mode, () => JSON.stringify(parsedJson.widgetData));

        /* -----------------------------------------------------------------------------
        ** ADD RED ASTERISKS AFTER REQUIRED FIELDS
        ** -----------------------------------------------------------------------------
        */

        //source: https://stackoverflow.com/questions/18495310/checking-if-an-input-field-is-required-using-jquery

        $('.needForTable').each(function () { //find element with class "needForForm"
            //alert($(this).val());
            $(this).after("<span style='color:blue'>#</span>"); //add asterisk after
        });

        $('#the_form').find('select, textarea, input').each(function () { //find each select field, textarea, and input
            if ($(this).prop('required')) { //if has the attribute "required"
                $(this).after("<span style='color:red'>*</span>"); //add asterisk after
            }
        });

        /* -----------------------------------------------------------------------------
        ** ADD ADDITIONAL FUNCTIONS AND STEPS THAT SHOULD BE TAKEN TO INITIALIZE HTML

        ** For example, ensure that shown/hiden elements are properly displayed
        ** based on the contents of the form
        ** -----------------------------------------------------------------------------
        */
        if ($("#sex").val() === "female") {
            $(".female").show() //show female class elements
            $(".male").hide() //hide male class elements
            if ($("#gonadstatus").val() === "intact") {
                $(".cycle").show() //only show cycle if intact is also true
            } else {
                $(".cycle").hide()
            }
        } else if ($("#sex").val() === "male") { //if male
            $(".female").hide() //hide female class elements
            $(".male").show() //show male class elements
            $(".cycle").hide() //hide cycles for male
        } else { //if not selected, hide everything
            $(".female").hide() //hide female class elements
            $(".male").hide() //hide male class elements
            $(".cycle").hide() //hide cycles for male
        };

        if ($("#gonadstatus").val() === "intact") {
            $(".intact").show() //show intact class elements
            $(".gdx").hide() //hide gdx class elements
            if ($("#sex").val() === "female") {
                $(".cycle").show()
            } else {
                $(".cycle").hide()
            }
        } else if ($("#gonadstatus").val() === "gdx") {
            $(".intact").hide() //hide intact class elements
            $(".gdx").show() //show gdx class elements
            $(".cycle").hide()
        } else {
            $(".intact").hide() //hide intact class elements
            $(".gdx").hide() //hide gdx class elements
            $(".cycle").hide() //hide cycle
        }

        if ($("#implantBox").is(":checked")) {
            $(".implant").show() //show implant class elements
        } else {
            $(".implant").hide()
        };

        //Run the calculate values function to fill with the loaded data
        this.calcValues();

    },

    to_json: function () {
        //should return a json string containing the data entered into the form by the user
        //whatever is return from the method is persisted in LabArchives.  must not be binary data.
        //called when the user hits the save button, when adding or editing an entry

        /* -----------------------------------------------------------------------------
        ** ACQUIRE INPUT DATA FROM THE FORM
        **
        ** This uses LabArchives's to_json() function to get the form data as a string
        ** -----------------------------------------------------------------------------
        */

        var widgetJsonString = this.parent_class.to_json();

        /* -----------------------------------------------------------------------------
        ** DEFINE ADDITIONAL VARIABLES OR PARAMETERS TO MONITOR DYNAMIC CONTENT
        **
        ** These should be simple variables, such as true/false, a number, or a state
        ** This cannot be something complex like a full <div>
        ** -----------------------------------------------------------------------------
        */

        /* -----------------------------------------------------------------------------
        ** ADD widgetJsonString AND ADDITIONAL VARIABLES TO OUTPUT
        **
        ** This information will be accessed within the init function
        ** -----------------------------------------------------------------------------
        */

        //If you do not need to add additional dynamic content, use this line
        var output = { widgetData: JSON.parse(widgetJsonString) };

        // Define additional output components
        //var output = { widgetData: JSON.parse(widgetJsonString), existsMyContent: existsMyContent };

        //uncomment to check stringified output - note that complicated objects like divs cannot be passed this way
        //console.log("to JSON", JSON.stringify(output));

        /* -----------------------------------------------------------------------------
        ** RETURN STRINGIFIED OUTPUT
        ** -----------------------------------------------------------------------------
        */

        return JSON.stringify(output);
    },

    from_json: function (json_data) {
        //populates the form with json_data

        // all data into string format within json_data is parsed into an object parsedJson
        var parsedJson = JSON.parse(json_data);

        //use parsedJson to get widgetData and turn into a string
        //parent class uses the widget data to fill in inputs
        this.parent_class.from_json(JSON.stringify(parsedJson.widgetData));
    },

    test_data: function () {
        //during development this method is called to populate your form while in preview mode

        /* -----------------------------------------------------------------------------
        ** ORIGINAL LABARCHIVES RETURN FOR TEST DATA
        **
        ** note that this will randomly select options for dropdown menus, 
        ** radio buttons, and checkboxes
        ** -----------------------------------------------------------------------------
        */

        //return this.parent_class.test_data();

        /* -----------------------------------------------------------------------------
        ** DEFINE YOUR OWN TEST DATA
        **
        ** note that this will randomly select options for dropdown menus, 
        ** radio buttons, and checkboxes if you still use parent_class.test_data()
        **
        ** Add additional test data infromation based on dynamic content
        ** -----------------------------------------------------------------------------
        */

        //store the outcome of the the test data within the testData variable
        var testData = JSON.parse(this.parent_class.test_data());

        //If no additional dynamic content 
        var output = { widgetData: testData };

        //The additional content should match the objects in to_json
        //var output = { widgetData: testData, existsMyContent: isCheckedAddDiv};

        //return the stringified output for use by the init function
        return JSON.stringify(output);
    },

    is_valid: function (b_suppress_message) {
        //called when the user hits the save button, to allow for form validation.
        //returns an array of dom elements that are not valid - default is those elements marked as mandatory
        // that have no data in them.
        //You can modify this method, to highlight bad form elements etc...
        //LA calls this method with b_suppress_message and relies on your code to communicate issues to the user
        //Returning an empty array [] or NULL equals no error
        //TO DO write code specific to your form

        /* -----------------------------------------------------------------------------
        ** VALIDATE FORM ENTRY BEFORE SAVING
        **
        ** This function will now check that all fields with the required attribute
        ** are not blank. If there are blank elements, it will return an alert that
        ** provides a fail log with the ids of the elements that are missing
        **
        ** source: source: https://stackoverflow.com/questions/18495310/checking-if-an-input-field-is-required-using-jquery
        ** -----------------------------------------------------------------------------
        */

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
        }; //otherwise, return empty array

        /* -----------------------------------------------------------------------------
        ** ORIGINAL LABARCHIVES is_valid FUNCTION
        **
        ** This checks for fields that have _mandatory appended to the name attribute
        ** -----------------------------------------------------------------------------
        */

        //return this.parent_class.is_valid(b_suppress_message);
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

    data_valid_form: function () {
        /* -----------------------------------------------------------------------------
        ** VALIDATE FORM ENTRY BEFORE CALCULATING/WORKING WITH TABLE
        **
        ** This function will check that elements with a class "needForTable"
        ** are not blank. If there are blank elements, it will return false
        ** and will post an error message "Please fill out all elements marked by a blue #"
        **
        ** source: source: https://stackoverflow.com/questions/18495310/checking-if-an-input-field-is-required-using-jquery
        ** -----------------------------------------------------------------------------
        */

        var valid = true; //begin with a valid value of true
        //var fail_log = ''; //begin with an empty fail log
        //var name; //create a name variable

        //search the_form for all elements that are of class "needForForm"
        $('#the_form').find('.needForTable').each(function () {
            if (!$(this).val()) { //if there is not a value for this input
                valid = false; //change valid to false
                //name = $(this).attr('id'); //replace the name variable with the name attribute of this element
                //fail_log += name + " is required \n"; //add to the fail log that this name is required
            }
        });

        if (!valid) {
            $("#errorMsg").html("<span style='color:red; font-size:36px;'>Please fill out all elements marked by a</span><span style='color:blue; font-size:36px;'> blue #</span>");
        } else {
            $("#errorMsg").html("");
        };

        return valid;
    },

    resize: function () {
        /* -----------------------------------------------------------------------------
        ** resize function
        **
        ** This function can be used to ensure that if a table or other large content
        ** exists on the page or gets created, that it doesn't try to resize the 
        ** entry and push it off of the viewable page within the notebook.
        ** 
        ** This function also resizes the container using the LA parent_class script.
        ** my_widget_script.parent_class.resize_container(); should be called each time
        ** content is created, modified, or deleted within a function.
        ** -----------------------------------------------------------------------------
        */

        //gets the inner width of the window.
        var width = window.innerWidth;

        //TO DO resize any specific divs (such as those with a large table) based on the innerWidth
        $(".tableDiv").width(width * .95); //make width of table div 95% of current width
        $(".iFrameDiv").width(width * .95);

        //resize the container
        my_widget_script.parent_class.resize_container();
    },

    calcValues: function () {
        /* -----------------------------------------------------------------------------
        ** calcValues function
        **
        ** This function takes the form contents and adds them to the output table.
        ** For elements that are blank or NaN, the function provides an output of NA
        **
        ** The function does not currently require validation in order to provide a
        ** calculation, but this could be easily modified.
        **
        ** my_widget_script.parent_class.resize_container(); is called at the end
        ** -----------------------------------------------------------------------------
        */

        //Add check for validity

        //Mouse ID
        $("#MouseID_calc").text($("#MouseID").val());

        //Cage number
        $("#Cage_calc").text($("#Cage").val());

        //treatment
        //if want text from selected, instead of value $("#Treatment").children("option:selected").text())
        $("#Treatment_calc").text($("#Treatment").val());
        //generic treatment
        if ($("#Treatment_calc").text() === "CON" || //if Treatment_calc equals CON, CON_main, or VEH,
            $("#Treatment_calc").text() === "CON_main" ||
            $("#Treatment_calc").text() === "VEH") {
            $("#GenTreatment_calc").text("Control"); //GenTreatment_calc equals "Control"
        } else {
            $("#GenTreatment_calc").text("PNA") //else equals "PNA"
        }

        //Cycle stage
        if ($("#sex").val() === "female" && $("#gonadstatus").val() === "intact") { //only for intact females
            $("#CycleStage_calc").text($("#CycleStage").val());
        } else {
            $("#CycleStage_calc").text("NA");
        }

        //body mass
        $("#BodyMass_g_calc").text($("#BodyMass_g").val());

        //uterine mass
        if ($("#sex").val() === "female") {
            $("#UterineMass_calc").text($("#gonadMass").val());
        } else {
            $("#UterineMass_calc").text("NA");
        }
        //uterine mass per body mass
        if ($("#sex").val() === "female") {
            var uterine_mg_per_g = $("#gonadMass").val() / $("#BodyMass_g").val();
            $("#Uterine_mg_per_g_calc").text(uterine_mg_per_g.toFixed(4));
        } else {
            $("#Uterine_mg_per_g_calc").text("NA");
        }

        //Date of birth
        $("#Date_of_birth_calc").text($("#Date_of_birth").val());

        //Recording date
        $("#Recording_date_calc").text($("#Recording_date").val());

        //Age in days
        //https://www.geeksforgeeks.org/how-to-calculate-the-number-of-days-between-two-dates-in-javascript/
        var DOBisDay = 1; //change to 0 if want DOB to be day 0
        var Recording_date_as_ms = new Date($("#Recording_date").val()).getTime();
        var DOB_as_ms = new Date($("#Date_of_birth").val()).getTime();
        var Age_in_days = (Recording_date_as_ms - DOB_as_ms) / (1000 * 3600 * 24) + DOBisDay;
        $("#Age_in_days_calc").text(Age_in_days);

        //saved pituitary
        if ($("#Saved_pit").is(":checked")) {
            var Saved_pit = "Y";
        } else {
            var Saved_pit = "N";
        }
        $("#Saved_pit_calc").text(Saved_pit);

        //Daylight savings
        $("#Daylight_Savings_calc").text($("#Daylight_Savings").val());

        //Time of sacrifice
        $("#Time_sac_calc").text($("#Time_sac").val());

        //Hours since lights on
        //http://jsfiddle.net/44NCk/4/
        var time_sac = $("#Time_sac").val().split(":");
        if ($("#Daylight_Savings").val() === "Y") { //if daylight savings time
            var lights_on = "04:00"; //lights on at 4am
            var lights_on_split = lights_on.split(":");
        } else {
            var lights_on = "03:00" //otherwise, lights on at 3a
            var lights_on_split = lights_on.split(":");
        }
        var hours_sac = parseInt(time_sac[0], 10), //get the hours component for time sac
            hours_lights = parseInt(lights_on_split[0], 10),
            min_sac = parseInt(time_sac[1], 10), //get the min component
            min_lights = parseInt(lights_on_split[1], 10);
        var hours = hours_sac - hours_lights, mins = 0; //subtract time of sac from lights on
        if (hours < 0) hours = 24 + hours; //if a negative number, add 24
        if (min_sac >= min_lights) { //if the min time of sac is greater than min time lights on
            mins = min_sac - min_lights; //subtract as is
        } else {
            mins = (min_sac + 60) - min_lights; //otherwise add 60 min and remove an hour
            hours--;
        }

        mins = mins / 60; //divide min by 60 to get decimal
        hours += mins; //add min to hours
        hours = hours.toFixed(3); //three decimal points
        $("#Sac_hr_calc").text(hours);
        $("#Who_calc").text($("#Who").val());

        $("#outTable tr").each(function () { //for each row
            $("td", this).each(function () { //for each cell
                var value = $(this).text(); //get the value of the text
                if (value === "" || value === "NaN" || value === "___") { //if blank or NaN
                    $(this).text("NA"); //make NA
                }
            })
        });

        //resize the container
        my_widget_script.parent_class.resize_container();

    },

    downloadCSV: function (csv, filename) {
        /* -----------------------------------------------------------------------------
        ** downloadCSV function
        **
        ** This function takes a csv element and filename that are passed from the 
        ** exportTableToCSV function.
        **
        ** This creates a csvFile and builds a download link that references this file
        ** The download link is "clicked" by the function to prompt the browser to 
        ** download this file
        **
        ** source: https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
        ** -----------------------------------------------------------------------------
        */
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

    exportTableToCSV: function (filename, table) {
        /* -----------------------------------------------------------------------------
        ** exportTableToCSV function
        **
        ** This function takes a filename and table name (both strings) as input
        ** It then creates a csv element from the table
        ** This csv element is passed to the downloadCSV function along with the filename
        ** 
        ** source: https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
        ** -----------------------------------------------------------------------------
        */

        var csv = [];
        var datatable = document.getElementById(table);
        var rows = datatable.querySelectorAll("tr");

        for (var i = 0; i < rows.length; i++) {
            var row = [], cols = rows[i].querySelectorAll("td, th");

            for (var j = 0; j < cols.length; j++)
                row.push(cols[j].innerText);

            csv.push(row.join(","));
        }

        // Download CSV file
        this.downloadCSV(csv.join("\n"), filename);
    },

    copyTableRow: function () {
        //create a temporary text area
        var $temp = $("<text" + "area style='opacity:0;'></text" + "area>");
        $("#mouseDataRow").children().each(function () { //add each child of the row
            $temp.text($temp.text() + $(this).text() + "\t")
        });

        $temp.appendTo($('body')).focus().select(); //add temp to body and select
        document.execCommand("copy"); //copy the "selected" text
        $temp.remove(); //remove temp
    }
}
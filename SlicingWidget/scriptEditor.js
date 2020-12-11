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

        //Uncomment debugger to be able to inspect and view code
        //debugger;

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

        //Show/hide the table
        $("#toggleTable").click(function () { //when the showTable button is clicked. Run this function
            //alert("button pressed");
            //Get width
            var width = window.innerWidth;
            $(".tableDiv").width(width * .95); //make width 95% of current width
            $("#tableDiv").toggle();
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
            } else {
                $(".female").hide() //hide female class elements
                $(".male").show() //show male class elements
                $(".cycle").hide() //hide cycles for male
            }

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
            } else {
                $(".intact").hide() //hide intact class elements
                $(".gdx").show() //show gdx class elements
                $(".cycle").hide()
            }

        });

        //If there are buttons that you don't want to be active when not editing, disable them here
        if (mode !== "edit" && mode !== "edit_dev") {
            //disable specific buttons when not editing

        }

        //when the calculate button is clicked, run the calcValues function
        $('#calculate').click(my_widget_script.calcValues);

        //when the size of the window changes, run the resize function
        window.onresize = my_widget_script.resize;

        //load the expected lab archive data (just the stringified widgetData)
        this.parent_class.init(mode, () => JSON.stringify(parsedJson.widgetData));

        //Use values to set up what should be shown or hidden based on this initial data
        if ($("#sex").val() === "female") {
            $(".female").show() //show female class elements
            $(".male").hide() //hide male class elements
            if ($("#gonadstatus").val() === "intact") {
                $(".cycle").show() //only show cycle if intact is also true
            } else {
                $(".cycle").hide()
            }
        } else {
            $(".female").hide() //hide female class elements
            $(".male").show() //show male class elements
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
        } else {
            $(".intact").hide() //hide intact class elements
            $(".gdx").show() //show gdx class elements
            $(".cycle").hide()
        };

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

        //looks at HTML and gets input data. Gives a string
        var widgetJsonString = this.parent_class.to_json();

        //add additional information to this output variable

        //access within init function
        var output = { widgetData: JSON.parse(widgetJsonString) };

        //uncomment to check stringified output - note that complicated objects like divs cannot be passed this way
        //var stringedOutput = JSON.stringify(output);
        //console.log("to JSON", stringedOutput);

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

        var testData = JSON.parse(this.parent_class.test_data());
        //var output = { widgetData: testData, rowCount: 0 };
        var output = { widgetData: testData }
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

        return this.parent_class.is_valid(b_suppress_message);
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

    //when the implant checkbox is checked
    implantChecked: function () {
        if ($("#implantBox").is(":checked")) {
            $(".implant").show() //show implant class elements
        } else {
            $(".implant").hide()
        }
    },

    //calculate values for table
    calcValues: function () {
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

    resize: function () {
        //adding this here ensures that even if table is showing, that it doesn't try to resize with that out of view
        //gets the inner width of the window. Resets the size of the tableDiv. THEN resizes the container
        var width = window.innerWidth;
        $(".tableDiv").width(width * .95); //make width of table div 95% of current width

        //resize the container
        my_widget_script.parent_class.resize_container();
    },

    downloadCSV: function (csv, filename) {
        // source: https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
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
        // source: https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
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
    }
}
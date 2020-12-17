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

        //adds rows back to dam1PlugTable when initializing
        for (var i = 0; i < parsedJson.dam1Plug_addedRows; i++) {
            var tableName = $("#dam1PlugTable");
            var whichDam = "dam1";

            my_widget_script.createPlugCheckRow(tableName, whichDam);
        }

        for (var i = 0; i < parsedJson.dam2Plug_addedRows; i++) {
            var tableName = $("#dam2PlugTable");
            var whichDam = "dam2";

            my_widget_script.createPlugCheckRow(tableName, whichDam);
        }

        for (var i = 0; i < parsedJson.dam1Mass_addedRows; i++) {
            var tableName = $("#dam1MassTable");
            var whichDam = "dam1";

            my_widget_script.createMassRow(tableName, whichDam);
        }

        for (var i = 0; i < parsedJson.dam2Mass_addedRows; i++) {
            var tableName = $("#dam2MassTable");
            var whichDam = "dam2";

            my_widget_script.createMassRow(tableName, whichDam);
        }

        /* -----------------------------------------------------------------------------
        ** ADJUST FORM DESIGN AND BUTTONS BASED ON MODE
        
        ** If you do not want a button to be available when not editing disable it here
        ** If you do not want certain elements to be available when not editing,
        ** hide them here
        ** -----------------------------------------------------------------------------
        */

        if (mode !== "edit" && mode !== "edit_dev") {
            //disable when not editing
            addPlugCheck1.disabled = true;
            removePlugCheck1.disabled = true;
            addPlugCheck2.disabled = true;
            removePlugCheck2.disabled = true;
            addMass1.disabled = true;
            addMass2.disabled = true;
            removeMass1.disabled = true;
            removeMass2.disabled = true;
            calcMass1.disabled = true;
            calcMass2.disabled = true;
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

        /*
        //Show/hide the table
        $("#toggleTable").click(function () { //when the showTable button is clicked. Run this function
            //alert("button pressed");
            //Get width
            var width = window.innerWidth;
            $(".tableDiv").width(width * .95); //make width 95% of current width
            $("#tableDiv").toggle();
            my_widget_script.parent_class.resize_container();
        });
    
        //when the calculate button is clicked, run the calcValues function
        $('#calculate').click(my_widget_script.calcValues);
    
        //when the toCSV button is clicked, run the exportTableToCSV function
        $('#toCSV').click(function () {
            my_widget_script.exportTableToCSV('templateData', 'outTable');
        });
        */

        //When the "addDivCheck" checkbox is changed, run this function
        $('#dam2Check').change(function () { //change rather than click so that it runs only when editable
            //alert("You clicked me!");
            if ($(this).is(":checked")) {
                //alert("I'm checked");
                $(".dam2").show();
            } else {
                //alert("I'm not checked")
                $(".dam2").hide();
            };

            //resize the container
            my_widget_script.parent_class.resize_container();
        });

        //When damid_1 is changed, replace the text in the #dam1_calc span
        $("#damid_1").change(function () {
            $(".dam1_calc").text($("#damid_1").val());
        });

        //When damid_2 is changed, replace the text in the #dam2_calc span
        $("#damid_2").change(function () {
            $(".dam2_calc").text($("#damid_2").val());
        });

        $("#addPlugCheck1").click(function () {
            var tableName = $("#dam1PlugTable");
            var whichDam = "dam1";

            my_widget_script.createPlugCheckRow(tableName, whichDam);
        });

        $("#removePlugCheck1").click(function () {
            var tableName = $("#dam1PlugTable");

            my_widget_script.deleteRow(tableName);
        });

        $("#addPlugCheck2").click(function () {
            var tableName = $("#dam2PlugTable");
            var whichDam = "dam2";

            my_widget_script.createPlugCheckRow(tableName, whichDam);
        });

        $("#removePlugCheck2").click(function () {
            var tableName = $("#dam2PlugTable");
            my_widget_script.deleteRow(tableName);
        });

        $("#addMass1").click(function () {
            var tableName = $("#dam1MassTable");
            var whichDam = "dam1";

            my_widget_script.createMassRow(tableName, whichDam);
        });

        $("#removeMass1").click(function () {
            var tableName = $("#dam1MassTable");
            my_widget_script.deleteRow(tableName);
        });

        $("#addMass2").click(function () {
            var tableName = $("#dam2MassTable");
            var whichDam = "dam2";

            my_widget_script.createMassRow(tableName, whichDam);
        });

        $("#removeMass2").click(function () {
            var tableName = $("#dam2MassTable");

            my_widget_script.deleteRow(tableName);
        });

        $("#calcMass1").click(function () {
            $(".newMass_dam1").each(function () {
                my_widget_script.calcPercMass($(this), $("#dammass_1"));
            });
        });

        $("#calcMass2").click(function () {
            $(".newMass_dam2").each(function () {
                my_widget_script.calcPercMass($(this), $("#dammass_2"));
            });
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

        //Check if the dam2Check checkbox is checked and adjust visibility
        if ($('#dam2Check').is(":checked")) {
            //alert("I'm checked");
            $(".dam2").show();
        } else {
            //alert("I'm not checked")
            $(".dam2").hide();
            //resize the container
            my_widget_script.parent_class.resize_container();
        };

        $(".dam1_calc").text($("#damid_1").val());
        $(".dam2_calc").text($("#damid_2").val());

        $(".newMass_dam1").each(function () {
            my_widget_script.calcPercMass($(this), $("#dammass_1"));
        });

        $(".newMass_dam2").each(function () {
            my_widget_script.calcPercMass($(this), $("#dammass_2"));
        });

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

        var dam1Plug_addedRows = $("#dam1PlugTable").find("tbody tr").length;
        var dam2Plug_addedRows = $("#dam2PlugTable").find("tbody tr").length;

        var dam1Mass_addedRows = $("#dam1MassTable").find("tbody tr").length;
        var dam2Mass_addedRows = $("#dam2MassTable").find("tbody tr").length;
        /* -----------------------------------------------------------------------------
        ** ADD widgetJsonString AND ADDITIONAL VARIABLES TO OUTPUT
        **
        ** This information will be accessed within the init function
        ** -----------------------------------------------------------------------------
        */

        //If you do not need to add additional dynamic content, use this line
        //var output = { widgetData: JSON.parse(widgetJsonString) };

        // Define additional output components
        var output = { widgetData: JSON.parse(widgetJsonString), dam1Plug_addedRows: dam1Plug_addedRows, dam2Plug_addedRows: dam2Plug_addedRows, dam1Mass_addedRows: dam1Mass_addedRows, dam2Mass_addedRows: dam2Mass_addedRows };

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
        //var width = window.innerWidth;

        //TO DO resize any specific divs (such as those with a large table) based on the innerWidth
        //$(".tableDiv").width(width * .95); //make width of table div 95% of current width

        //resize the container
        my_widget_script.parent_class.resize_container();
    },

    createPlugCheckRow: function (tableName, whichDam) {
        var rowCount = $(tableName).find("tbody tr").length + 1;
        var rowID = whichDam + "_row_" + rowCount;

        //Still breaks if select December 1 -> November. Also, if change date after making rows -> problems
        /*var plugDate = new Date($("#breeddate").val());
        plugDate.setDate(plugDate.getUTCDate()+rowCount); //Only combo I could figure out to resolve UTC/local issues
        "<td>" + plugDate.toDateString() + "</td>"
        */

        var col1ID = whichDam + "date_" + rowCount;
        var col2ID = whichDam + "_qual_" + rowCount;
        var col3ID = whichDam + "_comment_" + rowCount;

        $(tableName).find("tbody").append(
            $('<tr></tr>', { //add a new row
                id: rowID //give this row the rowID
            }).append(
                $('<td></td>').append( //append a new td to the row
                    $('<input/>', { //append a new input to the td
                        id: col1ID,
                        name: col1ID,
                        type: "date" //make it type "date"
                    })
                )
            ).append(
                $('<td></td>').append( //append a new td to the row
                    $('<select></select>', { //append a new select to the td
                        id: col2ID,
                        name: col2ID
                    }).append( //append options to the select tag
                        "<option value='0'>-/-</option>",
                        "<option value='1'>?</option>",
                        "<option value='2'>+/-</option>",
                        "<option value='3'>+/+</option>",
                        "<option value='4'>Red</option>",
                        "<option value='5'>Closed VO</option>"
                    )
                )
            ).append(
                $('<td></td>').append( //append a new td to the row
                    $('<text' + 'area></text' + 'area>', { //append a new input to the td. For some reason, adding a textarea breaks LA
                        id: col3ID,
                        name: col3ID
                    })
                )
            )
        );

        //resize the container
        my_widget_script.parent_class.resize_container();
    },

    createMassRow: function (tableName, whichDam) {
        var rowCount = $(tableName).find("tbody tr").length + 1;
        var rowID = whichDam + "_row_" + rowCount;

        //Still breaks if select December 1 -> November. Also, if change date after making rows -> problems
        /*var plugDate = new Date($("#breeddate").val());
        plugDate.setDate(plugDate.getUTCDate()+rowCount); //Only combo I could figure out to resolve UTC/local issues
        "<td>" + plugDate.toDateString() + "</td>"
        */

        var col1ID = whichDam + "MassDate_" + rowCount;
        var col2ID = whichDam + "_mass_" + rowCount;
        //var col3ID = whichDam + "_change_" + rowCount;

        $(tableName).find("tbody").append(
            $('<tr></tr>', { //add a new row
                id: rowID //give this row the rowID
            }).append(
                $('<td></td>').append( //append a new td to the row
                    $('<input/>', { //append a new input to the td
                        id: col1ID,
                        name: col1ID,
                        type: "date" //make it type "date"
                    })
                )
            ).append(
                $('<td></td>').append( //append a new td to the row
                    $('<input/>', { //append a new select to the td
                        id: col2ID,
                        name: col2ID,
                        "class": "newMass_" + whichDam
                    })
                )
            ).append(
                $('<td></td>', {
                    "class": "change"
                })
            )
        );

        //resize the container
        my_widget_script.parent_class.resize_container();
    },

    deleteRow: function (tableName) {
        var lastRow = $(tableName).find("tbody tr").last();
        $(lastRow).remove();

        //resize the container
        my_widget_script.parent_class.resize_container();
    },

    calcPercMass: function (newMass, initMass) {
        var newMassVal = parseInt($(newMass).val());
        var initMassVal = parseInt($(initMass).val());
        var percChange = (newMassVal) / (initMassVal) * 100;
        $(newMass).parent().next(".change").text(percChange.toFixed(1));
    }

    /* NOT CURRENTLY USING, but could use to output breeding info
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
        * / (Remove space is the rest of this is uncomments)
    
        //Add check for validity
    
        //Column A
        var ColumnA = $("#ColumnA").val();
        $("#ColumnA_calc").text(ColumnA);
    
        //ColumnB
        var ColumnB = $("#ColumnB").val();
        $("#ColumnB_calc").text(ColumnB);
    
        $("#outTable tr").each(function () { //for each row
            $("td", this).each(function () { //for each cell
                var value = $(this).text(); //get the value of the text
                if ( value === "" || value === "NaN" ) { //if blank or NaN
                    $( this ).text("NA"); //make NA
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
        * / (remove space if the rest of this is uncommented)
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
        * / (remove space if the rest of this is uncommented)
    
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
    */

    /* -----------------------------------------------------------------------------
    ** DEFINE ADDITIONAL FUNCTIONS HERE
    **
    ** Be sure that there is a comma after previous function
    **
    ** my_widget_script.parent_class.resize_container(); should be called each time
    ** content is created, modified, or deleted within a function.
    ** -----------------------------------------------------------------------------
    */
}
    ;
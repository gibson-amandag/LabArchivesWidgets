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

        //TO DO write code specific to your form
        debugger;
        var jsonString;
        //check if string or function because preview test is function and page is string
        if (typeof json_data === "string") {
            jsonString = json_data;
        } else {
            jsonString = json_data();
        };
        //Take input string into js object to be able to use elsewhere
        var parsedJson = JSON.parse(jsonString);

        //console.log("init", json_data);

        //adds rows back to the page when initializing
        for (var i = 0; i < parsedJson.rowCount; i++) {
            this.addRow('dataTable');
        }

        if (mode !== "edit" && mode !== "edit_dev") {
            //disable when not editing
            var addButton = document.getElementById("addRow");
            addButton.disabled = true;
            var deleteButton = document.getElementById("deleteRow");
            deleteButton.disabled = true;
        }

        //use the expected lab archive data (just the stringified widgetData)
        this.parent_class.init(mode, () => JSON.stringify(parsedJson.widgetData));
    },

    to_json: function () {
        //should return a json string containing the data entered into the form by the user
        //whatever is return from the method is persisted in LabArchives.  must not be binary data.
        //called when the user hits the save button, when adding or editing an entry

        //looks at HTML and get input data. Gives a string
        var widgetJsonString = this.parent_class.to_json();

        //Get the rowCount when saving the output
        //added rows have the "tableRow" classname
        var rows = document.getElementsByClassName("tableRow");

        // count the number of rows from the length of the array
        var rowCount = rows.length;

        //add additional information to this output variable
        //access within init function
        var output = { widgetData: JSON.parse(widgetJsonString), rowCount: rowCount };

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
        var output = { widgetData: testData, rowCount: 0 };
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

    //addRow and deleteRow inspired from here: 
    //https://www.viralpatel.net/dynamically-add-remove-rows-in-html-table-using-javascript/#:~:text=For%20adding%20dynamic%20row%20in,created%20cells%20by%20using%20row
    addRow: function (tableID) {

        var table = document.getElementById(tableID);

            var rowCount = table.rows.length;
            //console.log("adding row " + rowCount)
            var row = table.insertRow(rowCount);
            row.id = rowCount;
            row.className = "tableRow"

            var cell1 = row.insertCell(0);
            var element1 = document.createElement("input");
            element1.type = "checkbox";
            element1.name = "select_" + rowCount;
            cell1.appendChild(element1);

            var cell2 = row.insertCell(1);
            var element2 = document.createElement("input");
            element2.type = "text";
            element2.name = "task_" + rowCount;
            cell2.appendChild(element2);

            var cell3 = row.insertCell(2);
            var element3 = document.createElement("input");
            element3.type = "date";
            element3.name = "startdate_" + rowCount;
            cell3.appendChild(element3);

            var cell4 = row.insertCell(3);
            var element4 = document.createElement("input");
            element4.type = "date";
            element4.name = "duedate_" + rowCount;
            cell4.appendChild(element4);

            var cell5 = row.insertCell(4);
            var element5 = document.createElement("textarea");
            element5.name = "description_" + rowCount;
            cell5.appendChild(element5);

            var cell6 = row.insertCell(5);
            var element6 = document.createElement("input");
            element6.type = "checkbox";
            element6.name = "completed_" + rowCount;
            cell6.style = "background-color: lightblue;";
            cell6.appendChild(element6);

            var cell7 = row.insertCell(6);
            var element7 = document.createElement("textarea");
            element7.name = "completion_" + rowCount;
            cell7.appendChild(element7);

        //resize the container as new rows are added
        my_widget_script.parent_class.resize_container();

    },
    deleteRow: function (tableID) {
        try {
            var table = document.getElementById(tableID);
            var rowCount = table.rows.length;

            for (var i = 0; i < rowCount; i++) {
                var row = table.rows[i];
                var select = row.cells[0].childNodes[0];
                if (null != select && true == select.checked) {
                    table.deleteRow(i);
                    rowCount--;
                    i--;
                }


            }
        } catch (e) {
            alert(e);
        }
        //resize the container as rows are deleted
        my_widget_script.parent_class.resize_container();
    }
}

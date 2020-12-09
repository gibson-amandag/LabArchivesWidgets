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

        //adds dam2Div back to the page when initializing if it exists
        if(parsedJson.existsDam2Div){
          //if it exists, run the addDam2 function
           this.addDam2();
        }

        if (mode !== "edit" && mode !== "edit_dev") {
            //disable when not editing
            var addButton = document.getElementById("addRow");
            add.disabled = true;
            var deleteButton = document.getElementById("deleteRow");
            remove.disabled = true;
        }

        //use the expected lab archive data (just the stringified widgetData)
        this.parent_class.init(mode, () => JSON.stringify(parsedJson.widgetData));
    },

    to_json: function () {
        //should return a json string containing the data entered into the form by the user
        //whatever is return from the method is persisted in LabArchives.  must not be binary data.
        //called when the user hits the save button, when adding or editing an entry

        //looks at HTML and gets input data. Gives a string
        var widgetJsonString = this.parent_class.to_json();

        //Get dam2Div
        var dam2Div = document.getElementById("dam2Div");
      
      	var existsDam2Div = (dam2Div !== null && dam2Div !== undefined)

        //add additional information to this output variable
        //access within init function
        var output = { widgetData: JSON.parse(widgetJsonString), existsDam2Div: existsDam2Div };
        
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

    // https://www.viralpatel.net/dynamically-add-remove-rows-in-html-table-using-javascript/#:~:text=For%20adding%20dynamic%20row%20in,created%20cells%20by%20using%20row.
    // https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement

    addDam2: function () {

        // create a new div element 
        const newDiv = document.createElement("div");
        newDiv.className = "mouseDiv";
        newDiv.id = "dam2Div";

        // create an idDiv1 and an idText
        const idDiv1 = document.createElement("div");
        const idText = document.createTextNode("Dam 2 ID:");
        idDiv1.appendChild(idText);

        // create an idDiv2 and an input
        const idDiv2 = document.createElement("div");
        const idInput = document.createElement("input");
        idInput.id = "damid_2";
        idInput.name = "damid_2";
        idDiv2.appendChild(idInput);

        // create a dobDiv1 and an dobText
        const dobDiv1 = document.createElement("div");
        const dobText = document.createTextNode("Dam 2 DOB:");
        dobDiv1.appendChild(dobText);

        // create an dobDiv2 and an input
        const dobDiv2 = document.createElement("div");
        const dobInput = document.createElement("input");
        dobInput.id = "damdob_2";
        dobInput.name = "damdob_2";
        dobInput.type = "date";
        dobDiv2.appendChild(dobInput);

        // create a strainDiv1 and a strainText
        const strainDiv1 = document.createElement("div");
        const strainText = document.createTextNode("Dam 2 Strain:");
        strainDiv1.appendChild(strainText);

        // create an strainDiv2 and an input
        const strainDiv2 = document.createElement("div");
        const strainInput = document.createElement("input");
        strainInput.id = "damstrain_2";
        strainInput.name = "damstrain_2";
        strainDiv2.appendChild(strainInput);

        // create a massDiv1 and a massText
        const massDiv1 = document.createElement("div");
        const massText = document.createTextNode("Dam 2 Mass:");
        massDiv1.appendChild(massText);

        // create an dobDiv2 and an input
        const massDiv2 = document.createElement("div");
        const massInput = document.createElement("input");
        massInput.id = "dammass_2";
        massInput.name = "dammass_2";
        massInput.type = "number";
        massInput.min = "0";
        massInput.step = "0.1"
        massDiv2.appendChild(massInput);

        // add the divs to the outer div
        newDiv.appendChild(idDiv1);
        newDiv.appendChild(idDiv2);
        newDiv.appendChild(dobDiv1);
        newDiv.appendChild(dobDiv2);
        newDiv.appendChild(strainDiv1);
        newDiv.appendChild(strainDiv2);
        newDiv.appendChild(massDiv1);
        newDiv.appendChild(massDiv2);

        // add the newly created element and its content into the DOM 
        const beforeDiv = document.getElementById("sireDiv");
        beforeDiv.before(newDiv);

        // disable button after use
        add.disabled = true;
        remove.disabled = false;

        //resize the container as rows are deleted
        my_widget_script.parent_class.resize_container();

    },
    removeDam2: function () {
        dam2Div.remove();
        add.disabled = false;
        remove.disabled = true;

        //resize the container as rows are deleted
        my_widget_script.parent_class.resize_container();
    }
}

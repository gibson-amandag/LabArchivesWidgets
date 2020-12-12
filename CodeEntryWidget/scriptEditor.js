/*BSD 3-Clause License

Copyright (c) 2020, JMante1
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */

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
        $("div,table").css({ "font-family": "Arial, Helvetica, sans-serif", "font-size": "11px", "background-color": "#eeeeee" });
        $("#doc_url").change(function () {
            if (my_widget_script.is_valid(false).length == 0) {
                my_widget_script.show_doc();
            }
        });
        // In view mode, we don't show the input box
        if (mode.indexOf('view') == 0) {
            $("#doc_input").hide();
        }

        $("#scriptType").change(function () {
            if (my_widget_script.is_valid(true).length == 0) {
                my_widget_script.show_doc();
            }
        });

        //when the size of the window changes, run the resize function
        window.onresize = my_widget_script.resize;

        this.parent_class.init(mode, json_data);
        if (my_widget_script.is_valid(true).length == 0) {
            my_widget_script.show_doc();

        }
    },

    to_json: function () {
        //should return a json string containing the data entered into the form by the user
        //whatever is return from the method is persisted in LabArchives.  must not be binary data
        //TO DO write code specific to your form
        return this.parent_class.to_json();	// default code
    },

    from_json: function (json_data) {
        //populates the form with json_data
        //TO DO write code specific to your form
        this.parent_class.from_json(json_data);
    },

    test_data: function () {
        //during development this method is called to populate your form while in preview mode
        //TO DO write code specific to your form
        return this.parent_class.test_data();
    },

    is_valid: function (b_suppress_message) {
        //called when the user hits the save button, to allow for form validation.
        //returns an array of dom elements that are not valid - default is those elements marked as mandatory
        // that have no data in them.
        //You can modify this method, to highlight bad form elements etc...
        //LA calls this method with b_suppress_message and relies on your code to communicate issues to the user
        //Returning an empty array [] or NULL equals no error
        //TO DO write code specific to your form

        // Clear any error messages
        $("#doc").html('');
        // Trim the spaces of the link
        var doc_url = $("#doc_url").val().replace(/^\s+|\s$/g, '');
        $("#doc_url").val(doc_url);

        var errors = this.parent_class.is_valid(b_suppress_message);

        if (errors.length < 1) {
            // Verify that this is a google docs
            if (doc_url.search(/^(<iframe\s+src=")?https:\/\/github\.com\//i) != -1) {
                if (!b_suppress_message) {
                    $("#doc").html('<span style="color:red">Invalid Google Docs link. Please try again.</span>');
                }
                errors.push($("#doc_url"));
            }
        }

        return errors;
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



    show_doc: function () {
        var doc_url = $("#doc_url").val();
        var html_code = doc_url;
        var scriptType = $("#scriptType").val();

        //HTML creates the form. Need to write script to replace < and & with < and &
        if (scriptType === "html") { return alert("not yet supported"); };

        //Could use the scriptType to select different css style sheets and backgrounds if desired

        //alert(scriptType);

        hljs.configure({ languages: ["python", "javascript", "r", "css", "html"] })

        // If the link is not in an iframe, put it in one
        if (doc_url.search(/<iframe/i) == -1) {
            html_code = '<div id="htmlCode" style="background-color: #282c34"><pre><code class=' + scriptType + '>' + doc_url + '</code></pre></div>'
            //html_code = '<div>'+text1+'</div>'
            //html_code = '<iframe id = "github-iframe" src="'+text1+'" style="border:0" width="800" height="600" frameborder="0" scrolling="auto"></iframe>'
            //html_code = '<div src="http://gist-it.appspot.com/https://github.com/ileathan/hubot-mubot/blob/master/src/mubot.coffee"><\div>'
        }

        $("#doc").html(html_code);
        hljs.highlightBlock(document.querySelector("#doc"));
        my_widget_script.resize();
        my_widget_script.parent_class.resize_container();
    },

    resize: function () {
        //adding this here ensures that even if a table or other large content is showing, that it doesn't try to resize with that out of view
        //gets the inner width of the window.
        var width = window.innerWidth;

        //TO DO resize any specific divs (such as those with a large table) based on the innerWidth
        $("#htmlCode").width(width * .95); //make width of doc div 95% of current width

        //Update background color to match html_code
        //$("#doc").css("background-color", $("#htmlCode").css("background-code"))

        //resize the container
        my_widget_script.parent_class.resize_container();
    },
}
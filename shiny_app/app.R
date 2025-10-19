library(shiny)
library(jsonlite)

## Use the app working directory for data storage (shiny serves files from ./www)
data_dir <- file.path(getwd(), "data")
if (!dir.exists(data_dir)) dir.create(data_dir, recursive = TRUE)

ui <- fluidPage(
  titlePanel("LabArchives Widgets - Shiny Example"),
  sidebarLayout(
    sidebarPanel(
      textInput("state_name", "Save name", value = "example_state"),
      actionButton("save_btn", "Save JSON"),
      actionButton("load_btn", "Load JSON"),
      tags$hr(),
      verbatimTextOutput("status")
    ),
    mainPanel(
      tags$h4("Embedded widget"),
  # iframe to host widget HTML (served from the app's www/ directory)
  # Note: when Shiny serves files from www/, reference them by their filename (no 'www/' prefix)
  tags$iframe(id = "widget_iframe", src = "widget.html", style = "width:100%; height:600px; border:1px solid #ccc;"),
  # load the parent-side bridge so it can forward messages between iframe and Shiny
  tags$script(src = "bridge.js"),
      # small text area showing JSON for debugging
      tags$h5("Current widget JSON (debug)"),
      verbatimTextOutput("current_json")
    )
  )
)

server <- function(input, output, session) {
  # helper: full path for a given state name
  state_path <- function(name) file.path(data_dir, paste0(name, ".json"))

  # track last-received JSON from widget
  rv <- reactiveValues(widget_json = NULL, status = "Ready")

  # Receive JSON push from the widget via Shiny.onInputChange (bridge will use input$widget_state)
  observeEvent(input$widget_state, {
    rv$widget_json <- input$widget_state
    rv$status <- paste0("Received JSON (", nchar(toJSON(rv$widget_json, auto_unbox=TRUE)), " bytes)")
  })

  # Save button: write the last-known widget JSON to file
  observeEvent(input$save_btn, {
    name <- input$state_name
    if (is.null(rv$widget_json)) {
      rv$status <- "No widget JSON to save yet"
      return()
    }
    path <- state_path(name)
    tryCatch({
      write(jsonlite::toJSON(rv$widget_json, pretty = TRUE, auto_unbox = TRUE), path)
      rv$status <- paste0("Saved to ", path)
    }, error = function(e) {
      rv$status <- paste0("Save failed: ", e$message)
    })
  })

  # Load button: read file and send to widget via session$sendCustomMessage
  observeEvent(input$load_btn, {
    name <- input$state_name
    path <- state_path(name)
    if (!file.exists(path)) {
      rv$status <- paste0("File not found: ", path)
      return()
    }
    json_txt <- readLines(path, warn = FALSE)
    # parse to ensure valid JSON
    parsed <- tryCatch(jsonlite::fromJSON(paste(json_txt, collapse = "\n")), error = function(e) NULL)
    if (is.null(parsed)) {
      rv$status <- "Invalid JSON on disk"
      return()
    }
    # send to iframe via postMessage (bridge listens)
    session$sendCustomMessage(type = 'loadWidgetState', message = list(json = parsed))
    rv$status <- paste0("Loaded from ", path)
  })

  output$status <- renderText({ rv$status })

  output$current_json <- renderText({
    if (is.null(rv$widget_json)) return("(no state received yet)")
    jsonlite::toJSON(rv$widget_json, pretty = TRUE, auto_unbox = TRUE)
  })

  # Provide a handler for the JS bridge to request the initial path (not used currently)
  session$onSessionEnded(function() {
    # no-op
  })
}

shinyApp(ui, server)

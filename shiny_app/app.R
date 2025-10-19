library(shiny)
library(jsonlite)

## Use the app working directory for data storage (shiny serves files from ./www)
data_dir <- file.path(getwd(), "data")
if (!dir.exists(data_dir)) dir.create(data_dir, recursive = TRUE)

ui <- fluidPage(
  titlePanel("LabArchives Widgets - Shiny Example"),
  sidebarLayout(
    sidebarPanel(
      selectInput('widget_choice', 'Widget', choices = c('Minimal' = 'widget.html', 'Estrous Cycle Scoring' = 'estrousCycleScoring.html'), selected = 'widget.html'),
  textInput("state_name", "Save name", value = "example_state"),
  selectInput('widget_mode', 'Mode', choices = c('Edit' = 'edit', 'View' = 'view'), selected = 'edit'),
      actionButton("save_btn", "Save JSON"),
      actionButton("load_btn", "Load JSON"),
      tags$hr(),
      selectInput('saved_file', 'Saved states', choices = list.files(data_dir, pattern = "\\.json$", full.names = FALSE), selected = NULL),
      actionButton('refresh_files', 'Refresh list'),
      actionButton('load_saved', 'Load selected'),
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

  # track last-received JSON from widget and save-request flag
  rv <- reactiveValues(widget_json = NULL, status = "Ready", save_requested = NULL)

  # Receive JSON push from the widget via Shiny.onInputChange (bridge will use input$widget_state)
  observeEvent(input$widget_state, {
    rv$widget_json <- input$widget_state
    rv$status <- paste0("Received JSON (", nchar(toJSON(rv$widget_json, auto_unbox=TRUE)), " bytes)")
    # If a save was recently requested, persist this JSON
    if (!is.null(rv$save_requested) && difftime(Sys.time(), rv$save_requested, units = 'secs') < 10) {
      name <- input$state_name
      path <- state_path(name)
      tryCatch({
        write(jsonlite::toJSON(rv$widget_json, pretty = TRUE, auto_unbox = TRUE), path)
        rv$status <- paste0("Saved to ", path)
        files <- list.files(data_dir, pattern = "\\.json$", full.names = FALSE)
        updateSelectInput(session, 'saved_file', choices = files, selected = basename(path))
      }, error = function(e) {
        rv$status <- paste0("Save failed: ", e$message)
      })
      rv$save_requested <- NULL
    }
  })

  # When Save is clicked, request the widget to post its JSON to the parent.
  observeEvent(input$save_btn, {
    rv$status <- "Requesting widget JSON from iframe..."
    session$sendCustomMessage(type = 'requestWidgetJson', message = list())
    rv$save_requested <- Sys.time()
  })

  # Refresh saved-file list
  observeEvent(input$refresh_files, {
    files <- list.files(data_dir, pattern = "\\.json$", full.names = FALSE)
    updateSelectInput(session, 'saved_file', choices = files)
    rv$status <- "Refreshed saved file list"
  })

  # Load selected saved file
  observeEvent(input$load_saved, {
    sel <- input$saved_file
    if (is.null(sel) || sel == "") { rv$status <- "No saved file selected"; return() }
    path <- file.path(data_dir, sel)
    if (!file.exists(path)) { rv$status <- paste0("File not found: ", path); return() }
    parsed <- tryCatch(jsonlite::fromJSON(paste(readLines(path), collapse = "\n")), error = function(e) NULL)
    if (is.null(parsed)) { rv$status <- "Invalid JSON on disk"; return() }
    session$sendCustomMessage(type = 'loadWidgetState', message = list(json = parsed))
    rv$status <- paste0("Loaded ", sel, " into widget")
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

  # When widget selection changes, update iframe src via JS from server
  observeEvent(input$widget_choice, {
    # send custom message to client to change iframe src
    session$sendCustomMessage(type = 'setWidgetSrc', message = list(src = input$widget_choice))
  })

  # When widget mode changes, tell the iframe to switch mode
  observeEvent(input$widget_mode, {
    session$sendCustomMessage(type = 'setWidgetMode', message = list(mode = input$widget_mode))
    rv$status <- paste0('Requested widget mode: ', input$widget_mode)
  })

  # Provide a handler for the JS bridge to request the initial path (not used currently)
  session$onSessionEnded(function() {
    # no-op
  })
}

shinyApp(ui, server)

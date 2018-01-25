$.when(
  $.getScript("scripts/KeyCodes.js"),
  $.getScript("scripts/Commands.js"),
  $.Deferred(function(deferred)
  {
    $( deferred.resolve );
  })
).done(function()
{
  const input = $("#input");
  const activeConsole = $("#activeConsole");

  setupConsole();

  function setupConsole()
  {
    // Give console input focus
    input.focus();

    input.keypress(function(event)
    {
      if(event.which === KeyCodes.Enter && event.shiftKey === false)
      {
        // Don't add the new line
        event.preventDefault();

        // Process the command
        const request = input.html().trim();
        let response = "";

        if(request.length > 0)
        {
          const consoleRequest = parseRequest(request);

          if(consoleRequest !== null)
          {
            response = processRequest(consoleRequest);
          }
        }

        displayResult(request, response);
      }
    });
  }

  /***
   * @typedef {object} ConsoleRequest
   * @desc A parsed representation of a command line request
   * @property {string} command - The name of the requested command
   * @property {array} arguments - The array of arguments passed to the command
   */

  /***
   * Parses the raw command line request
   * @param {string} request - The raw string representation of the command line request
   * @returns {(ConsoleRequest|null)} -
   *  A {@link ConsoleRequest} if the raw request was successfully parsed; null if the parsing failed
   */
  function parseRequest(request)
  {
    let consoleRequest = null;

    // TODO: parse request
    consoleRequest =
      {
        command: request,
        arguments: []
      };
    
    return consoleRequest;
  }

  /***
   * Processes a parsed command line request
   * @param {ConsoleRequest} request - The parsed command line request
   * @returns {string} -
   *  The response provided by the executed command, or an error message if unable to process the request
   */
  function processRequest(request)
  {
    let result = "";
    const command = Commands[request.command];

    if(command !== undefined)
    {
      result = command.execute();
    }
    else
    {
      result = "The requested command is unavailable. Consider using&nbsp;<strong>help</strong>";
    }

    return result;
  }

  /***
   * Displays the response of a command line request
   * @param {string} request - The original request from the command line
   * @param {string} response - The response to display from the processed request
   */
  function displayResult(request, response)
  {
    input.html("");
    $("<div>&gt;&nbsp;<div class='input'>" + request + "</div></div>").insertBefore(activeConsole);

    if(response !== null)
    {
      $("<div>" + response + "</div>").insertBefore(activeConsole);
    }
  }
});
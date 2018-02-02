$.when(
  $.getScript("scripts/KeyCodes.js"),
  $.getScript("scripts/Commands.js"),
  $.Deferred((deferred) =>
  {
    $(deferred.resolve);
  })
).done(() =>
{
  const input = $("#input");
  const activeConsole = $("#activeConsole");

  let prevCmds = [];
  let prevCmdIndex = -1;

  setupConsole();

  function setupConsole()
  {
    input.focus();
    input.keypress(commandHandler);
    input.keydown(previousCommandHandler);
  }

  /***
   * Handles the ability to enter command requests, process them, and display results
   * @param event - The event that triggered this handler
   */
  function commandHandler(event)
  {
    console.log(`keypress: ${event.which}`);
    if(event.which === KeyCodes.Enter && event.shiftKey === false)
    {
      // Don't add the new line
      event.preventDefault();

      // Process the command
      const request = input.html().trim();
      let response = "";

      if(request.length > 0)
      {
        prevCmds.unshift(request);

        const consoleRequest = parseRequest(request);

        if(consoleRequest !== null)
        {
          response = processRequest(consoleRequest);
        }
      }

      displayResult(request, response);
    }
  }

  /***
   * Handles the ability to recall previously entered commands
   * @param event - The event that triggered this handler
   */
  function previousCommandHandler(event)
  {
    console.log(`keydown: ${event.which}`);
    if(event.which === KeyCodes.UpArrow)
    {
      event.preventDefault();

      let newHtml = "";

      if(prevCmdIndex < prevCmds.length - 1)
      {
        ++prevCmdIndex;
      }

      if(prevCmdIndex > -1)
      {
        newHtml = prevCmds[prevCmdIndex];
      }

      input.html(newHtml);
    }
    else if(event.which === KeyCodes.DownArrow && prevCmdIndex > 0)
    {
      event.preventDefault();

      --prevCmdIndex;

      input.html(prevCmds[prevCmdIndex]);
    }
    else
    {
      if(prevCmdIndex > -1)
      {
        prevCmdIndex = -1;
      }
    }
  }

  /***
   * @typedef {object} ConsoleRequest
   * @desc A parsed representation of a command line request
   * @property {string} command - The name of the requested command
   * @property {string} arguments - The raw string of arguments passed to the command
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

    const firstSpaceIndex = request.indexOf(" ");
    const cmd = request.substring(0, firstSpaceIndex > -1 ? firstSpaceIndex : undefined);
    const rawArgs = request.substring(firstSpaceIndex + 1);

    if(cmd !== "")
    {
      consoleRequest =
        {
          command: cmd,
          arguments: rawArgs
        };
    }
    
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
    let response = null;
    const command = Commands[request.command];

    if(command !== undefined)
    {
      response = command.execute(request.arguments);
    }
    else
    {
      response = `<strong>${request.command}</strong>&nbsp;is not an available command. Consider using&nbsp;
        <strong>help</strong>&nbsp;to get a list of available commands.`;
    }

    return response !== null ? response : "";
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
$.when(
  $.getScript("scripts/KeyCodes.js"),
  $.Deferred((deferred) =>
  {
    $( deferred.resolve );
  })
).done(() =>
{
  const CommandParam = (
    () =>
    {
      function parseArgument(value, type)
      {
        let retVal = null;

        switch(type)
        {
          case "string":
            retVal = value;
            break;
          case "int":
            const parsedInt = Number.parseInt(value);
            if(isNaN(parsedInt) === false)
            {
              retVal = parsedInt;
            }
            break;
          case "float":
            const parsedFloat = Number.parseFloat(value);
            if(isNan(parsedFloat) === false)
            {
              retVal = parsedFloat;
            }
            break;
        }

        return retVal;
      }

      return function (name, type, defaultValue)
      {
        return {
          getName: () => name,
          getType: () => type,
          hasDefault: () => defaultValue !== undefined,
          getDefault: () => defaultValue,
          parseArgument: (argument) =>
          {
            let retVal = defaultValue;

            if(argument !== undefined)
            {
              retVal = parseArgument(argument, type);
            }

            return retVal;
          }
        };
      };
    }
  )();

  const Command = (
    () =>
    {
      function parseRequest(rawRequest)
      {
        let parsedRequest = [];

        rawRequest.replace(/-(\D+?)\s+?(".+"|\d+\.?\d+)/g, function (match, g1, g2)
        {
          parsedRequest.push({[g1]: g2});
        });

        return parsedRequest;
      }

      function getCommandArguments(parsedRequest, cmdParams)
      {
        let retVal =
          {
            cmdArgs: [],
            errors: []
          };

        cmdParams.forEach(function (value)
        {
          const rawArg = parsedRequest[value.getName()];

          if(rawArg !== undefined)
          {
            const parsedArg = value.parseArgument(rawArg);

            if(parsedArg != null)
            {
              retVal.cmdArgs.push(parsedArg);
            }
            else
            {
              retVal.errors.push(`Parameter ${value.getName()} was not of expected type ${value.getType()}`);
            }
          }
          else if(value.hasDefault())
          {
            retVal.cmdArgs.push(value.getDefault());
          }
          else
          {
            retVal.errors.push(`Required parameter ${value.getName()} was not provided`);
          }
        });

        return retVal;
      }

      return function (helpText, execute, cmdParams = [])
      {
        return {
          execute: (rawRequest) =>
          {
            const parsedRequest = parseRequest(rawRequest.trim());
            const cmdArgsResult = getCommandArguments(parsedRequest, cmdParams);

            if(cmdArgsResult.errors.length === 0)
            {
              execute(...cmdArgsResult.cmdArgs);
            }
            else
            {
              // TODO: handle incorrect argument errors
              alert(cmdArgsResult.errors);
            }
          },
          getHelp: () => helpText
        };
      };
    }
  )();

  const Commands = (
    () =>
    {
      const _helpCommand = new Command(
        "Get information about the available commands, or about a specific command",
        function (commandName)
        {
          alert(`Help: ${commandName}`);
        },
        [
          new CommandParam("command", "string")
        ]
      );

      const _clsCommand = new Command(
        "Clear the screen",
        function ()
        {
          // Set a timeout of 5ms in order to clear the screen AFTER the previous command has been added
          setTimeout(() =>
          {
            const input = $("#input");
            const activeConsole = $("#activeConsole");

            input.html("");
            activeConsole.siblings().remove();
          }, 3);

          return "";
        }
      );

      return {
        help: _helpCommand,
        "?": _helpCommand,
        cls: _clsCommand
      };
    }
  )();

  const input = $("#input");
  const activeConsole = $("#activeConsole");

  setupConsole();

  function setupConsole()
  {
    // Give console input focus
    input.focus();

    let prevCmds = [];
    let prevCmdIndex = -1;

    // Command handler
    input.keypress((event) =>
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
    });

    // Previous Command Handler
    input.keydown((event) =>
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
    });
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
    let result = "";
    const command = Commands[request.command];

    if(command !== undefined)
    {
      result = command.execute(request.arguments);
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
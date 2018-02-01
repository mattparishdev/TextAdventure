const CommandParam = (
  function ()
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
  function ()
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
        else if(rawArg.hasDefault())
        {
          retVal.cmdArgs.push(rawArg.getDefault());
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
      const _helpText = helpText;
      const _cmdParams = cmdParams;

      return {
        execute: (rawRequest) =>
        {
          const parsedRequest = parseRequest(rawRequest.trim());
          const cmdArgsResult = getCommandArguments(parsedRequest, _cmdParams);

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
        help: () => _helpText
      };
    };
  }
)();

const Commands = (
  function ()
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
        setTimeout(function ()
        {
          const input = $("#input");
          const activeConsole = $("#activeConsole");

          input.html("");
          activeConsole.siblings().remove();
        }, 5);

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
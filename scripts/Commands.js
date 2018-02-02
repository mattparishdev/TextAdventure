/***
 * Map of available console command
 * @type {Object.<string, Command>}
 */
const Commands = (
  () =>
  {
    /***
     * @type {object} CommandParam
     * @desc Object containing functionality for a console command parameter
     * @property {function} getName
     * @property {function} getType
     * @property {function} hasDefault
     * @property {function} getDefault
     * @property {function} parseArgument
     * @constructor
     */
    const CommandParam = (
      () =>
      {
        /***
         * @private
         * @desc Parses raw string arguments to the expected type
         * @param {string} value - The raw string to be parsed to the desired type
         * @param {string} type - The type to parse the string to
         * @returns {*} - The parsed type, if parsed successfully; null otherwise
         */
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

        /***
         * @private
         * @constructor
         * @param {string} name - The name of this command parameter
         * @param {string} type - The type of this command parameter
         * @param {*} [defaultValue=undefined] - The default value of this command parameter, if it is optional
         * @returns {CommandParam}
         */
        return function (name, type, defaultValue)
        {
          return {
            /***
             * Retrieve the name of this command parameter
             * @returns {string}
             */
            getName: () => name,

            /***
             * Retrieve the type of this command parameter
             * @returns {string}
             */
            getType: () => type,

            /***
             * Check if this command parameter has a default value
             * @returns {boolean}
             */
            hasDefault: () => defaultValue !== undefined,

            /***
             * Retrieve the default value of this command parameter
             * @returns {*}
             */
            getDefault: () => defaultValue,

            /***
             * Parse an argument passed for this command parameter
             * @param {string} argument - The string representation of the argument
             * @returns {*} -
             *  The type associated with this command parameter, if it was able to be parsed; null otherwise
             */
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

    /***
     * @type {object} Command
     * @desc Functionality and representation of a console command
     * @property {function} execute
     * @property {function} getHelp
     * @constructor
     */
    const Command = (
      () =>
      {
        /***
         * @private
         * @desc Parses the raw request into raw key/value pair command arguments for this command
         * @param {string} rawRequest - The string containing the command arguments
         * @returns {Object.<string, string>} -
         *  A map of the parsed command arguments, with the command name as key and the command argument as the
         *  value
         */
        function parseRequest(rawRequest)
        {
          let parsedRequest = {};

          rawRequest.replace(/-(\D+?)\s+?(".+"|\D[^\s]+|\d+\.?\d*)/g, (match, g1, g2) =>
          {
            parsedRequest[g1] = g2;
          });

          return parsedRequest;
        }

        /***
         * @private
         * @desc Retrieves the parsed command arguments
         * @param {Object.<string, string>[]} parsedRequest - The array of raw key/value pair command arguments
         * @param {CommandParam[]} cmdParams - The list of command parameters for this command
         * @returns {{cmdArgs: *[], errors: string[]}}
         */
        function getCommandArguments(parsedRequest, cmdParams)
        {
          let retVal =
            {
              cmdArgs: [],
              errors: []
            };

          cmdParams.forEach((value) =>
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

        /***
         * @private
         * @param {string} name - The name of this command
         * @param {string} helpText - The text to be displayed to the user when help is requested
         * @param {function} execute - The function to be used when the command is requested
         * @param {CommandParam[]} - The list of command parameters that this command expects
         * @constructor
         * @returns {Command}
         */
        return function Command(name, helpText, execute, cmdParams = [])
        {
          return {
            /***
             * Execute the command
             * @param {string} rawRequest - The string containing the raw command arguments and identifiers
             * @returns {string|null} - The command response, if one is necessary; null otherwise
             */
            execute: (rawRequest) =>
            {
              const parsedRequest = parseRequest(rawRequest.trim());
              const cmdArgsResult = getCommandArguments(parsedRequest, cmdParams);

              let response = null;

              if(cmdArgsResult.errors.length === 0)
              {
                response = execute(...cmdArgsResult.cmdArgs);
              }
              else
              {
                // TODO: handle formatting incorrect argument errors
                response = cmdArgsResult.errors;
              }

              return response;
            },

            /***
             * Retrieve the brief help text for this command
             * @returns {string}
             */
            getHelpBrief: () => `<strong>${name}</strong>: ${helpText}<br/>`,

            /***
             * Retrieve the expanded help text for this command, including parameter names, types, and usage example
             * @returns {string}
             */
            getHelpExpanded: function()
            {
              // TODO: implement expanded help
              return this.getHelpBrief();
            }
          };
        };
      }
    )();

    /***
     * Command to clear the console screen
     */
    const _clsCommand = new Command(
      "cls",
      "Clear the console",
      () =>
      {
        // Set a timeout of 3ms in order to clear the screen AFTER the previous command has been added
        setTimeout(() =>
        {
          const input = $("#input");
          const activeConsole = $("#activeConsole");

          input.html("");
          activeConsole.siblings().remove();
        }, 3);

        return null;
      }
    );

    /***
     * @private
     * @type {Object.<string,Command>}
     * @desc The map of all available non-help commands
     */
    const _nonHelpCommands =
      {
        cls: _clsCommand
      };

    /***
     * Command to get help and list either all commands available, or for a specific command
     */
    const _helpCommand = new Command(
      "help",
      "Get information about the available commands, or about a specific command",
      (commandName) =>
      {
        /***
         * Get a list of all commands' brief help text
         * @returns {string}
         */
        function listAllCommands()
        {
          let result = "";

          Reflect.ownKeys(_nonHelpCommands).forEach((value) =>
          {
            result += `<br/>${_nonHelpCommands[value].getHelpBrief()}`;
          });

          return result;
        }

        let response = null;

        if(commandName.length > 0)
        {
          const cmd = _nonHelpCommands[commandName];

          if(cmd !== undefined)
          {
            response = cmd.getHelpExpanded();
          }
          else
          {
            response = `<strong>${commandName}</strong>&nbsp;is not an available command<br/>${listAllCommands()}`;
          }
        }
        else
        {
          response = listAllCommands();
        }

        return response;
      },
      [
        new CommandParam("command", "string", "")
      ]
    );

    return {
      ..._nonHelpCommands,
      help: _helpCommand,
      "?": _helpCommand
    };
  }
)();
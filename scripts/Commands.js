/***
 * @typedef {function} CommandFunction
 * @desc The function that is executed when a command is invoked
 * @returns {string} A response that will be displayed to the console. This response can be formatted with HTML
 */

/***
 * @typedef {object} Command
 * @desc An object which defines a console command
 * @property {CommandFunction} execute - The function to invoke when the command is requested
 * @property {string} helpText -
 *  An explanation of the command's purpose, to be displayed to the user when help is
 * @property {array} params -
 *  An array of {@link CommandParam} objects that defines the expected arguments to the command
 */

/***
 * Map of available console commands
 * @type {Object.<string, Command>}
 */
const Commands = (function()
{
  /***
   * @typedef {object} CommandParam
   * @desc An object which defines a console command parameter
   * @property {string} name - Name of the parameter
   * @property {string} type - Expected type of the parameter
   * @property {*} defaultValue - Default value for the parameter if it is not supplied as an argument
   */

  /***
   * Helper method to create a {@link CommandParam}
   * @param {string} name
   * @param {string} type
   * @param {*} [defaultValue=undefined]
   * @returns {CommandParam}
   * @constructor
   */
  function CommandParam(name, type, defaultValue)
  {
    return {
      name: name,
      type: type,
      defaultValue: defaultValue
    };
  }

  /***
   * Helper method to create a {@link Command}
   * @param {CommandFunction} execute
   * @param {string} help
   * @param {array} [params=[]]
   * @returns {Command}
   * @constructor
   */
  function Command(execute, help, params)
  {
    return {
      execute: execute,
      helpText: help,
      params: params === undefined ? [] : params
    };
  }

  const _helpCommand = new Command(function ()
    {
      alert("Help");

      return "";
    },
    "Get information about the available commands, or about a specific command",
    [
      new CommandParam("command", "string")
    ]
  );

  const _clsCommand = new Command(function()
    {
      // Set a timeout of 5ms in order to clear the screen AFTER the previous command has been added
      setTimeout(function()
      {
        const input = $("#input");
        const activeConsole = $("#activeConsole");

        input.html("");
        activeConsole.siblings().remove();
      }, 5);

      return "";
    },
    "Clear the screen"
  );

  return {
    help: _helpCommand,
    "?": _helpCommand,
    cls: _clsCommand
  };
})();
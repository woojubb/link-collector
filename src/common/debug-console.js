import {format} from "date-fns";

export default class DebugConsole {
    _console = console;
    _getMessageWithTimeString = (...args) => {
        const timeString = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
        args.unshift(`[${timeString}]`);
        return args;
    }

    log = (...args) => {
        this._console.log(...(this._getMessageWithTimeString(...args)));
    }

    info = (...args) => {
        this._console.info(...(this._getMessageWithTimeString(...args)));
    }

    error = (...args) => {
        this._console.error(...(this._getMessageWithTimeString(...args)));
    }

    success = (...args) => {
        this._console.success(...(this._getMessageWithTimeString(...args)));
    }
}
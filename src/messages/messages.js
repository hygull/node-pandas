function showMessage(type, showMessageOnConsole, ...messages) {
    if(!showMessageOnConsole) {
        showMessageOnConsole = console.log
    }
    showMessageOnConsole(type, ...messages)
}

function success(...messages) {
    showMessage('[SUCCESS]', null, ...messages)
}

function error(...messages) {
    showMessage('[ERROR]', console.error, ...messages)
}

function warn(...messages) {
    showMessage('[WARNING]', console.warn, ...messages)
}

function info(...messages) {
    showMessage('[INFO]', null, ...messages)
}

function debug(...messages) {
    showMessage('[DEBUG]', null, ...messages)
}

module.exports = {
    error,
    debug,
    success,
    info,
    warn
}
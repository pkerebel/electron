const { createWindow } = require('./main')
const { app } = require('electron')

require('./database')

app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
        app.quit()
    }
})

app.whenReady().then(createWindow)
app.allowRendererProcessReuse = false
// Imports
const { BrowserWindow, ipcMain, Menu, app } = require('electron')
const Ville = require('../src/models/Ville')

// Variables
let onlineStatusWindow;
let mainWindow;
process.env.NODE_ENV = 'dev'

// Actions
const deleteLieux = async () => {
    await Ville.deleteMany()
        .then(() => { mainWindow.webContents.send('all-deleted') })
        .catch(err => console.log(err.message))
}

// Creation de la fenetre principale
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.loadFile('src/index.html');

    // Fermeture de l'app
    mainWindow.on('closed', () => {
        app.quit()
    })

    // Menu
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insertion menu
    Menu.setApplicationMenu(mainMenu)

}

// Fenetre nouvelle ville
const createNewVille = () => {
    newVille = new BrowserWindow({
        width: 500,
        height: 350,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true
        }
    });
    newVille.loadFile('src/new.html')

    // Fermeture popup
    newVille.on('close', () => {
        newVille = null
    })
}

// Fenetre modif ville
const createEditVille = (id) => {
    editVille = new BrowserWindow({
        width: 500,
        height: 350,
        webPreferences: {
            nodeIntegration: true,
            additionalArguments: [id]
        }
    });
    editVille.loadFile('src/edit.html')

    // Fermeture popup
    editVille.on('close', () => {
        editVille = null
    })
}

// Menu principal
const mainMenuTemplate = [
    {
        label: 'Menu',
        submenu: [
            {
                label: 'Ajouter une ville',
                click() {
                    createNewVille();
                },
                accelerator: 'CmdOrCtrl+N'
            },
            {
                label: 'Tout effacer',
                click() {
                    deleteLieux()
                },
                accelerator: 'CmdOrCtrl+Z'
            }, {
                type: 'separator'
            },
            {
                label: 'Quitter',
                click() {
                    app.quit()
                },
                accelerator: 'CmdOrCtrl+Q'
            }
        ]
    }
]

// Barre d'outil dev
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Dev',
        submenu: [
            {
                role: 'reload'
            },
            {
                label: 'Console',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools()
                },
                accelerator: 'CmdOrCtrl+I'
            }
        ]
    });
}

// Recherche des villes et renvoie vers l'app
ipcMain.on('get-villes', async (e, args) => {
    const villes = await Ville.find().sort({ nom: 1 })
        .then(data => { e.reply('get-villes', JSON.stringify(data)) })
        .catch(err => console.log('Echec lors de la recuperation des villes'))
})

// Recherche des villes et renvoie vers la carte
ipcMain.on('get-villes-for-map', async (e, args) => {
    const villes = await Ville.find()
        // .then(data => { contents.sendToFrame(e.frameId, 'get-task-for-map-back', data) })
        .then(data => { mainWindow.webContents.send('get-villes-for-map-back', JSON.stringify(data)) })
        .catch(err => console.log('Echec lors de la recuperation des villes'))
})

// Récupération de la nouvelle ville via le form, sauvegarde de la ville et renvoie vers l'app
ipcMain.on('add-ville', async (e, ville) => {
    const nouvelleVille = new Ville(ville);
    const addVille = await nouvelleVille.save()
        .then(data => { mainWindow.webContents.send('add-ville', JSON.stringify(data)) })
        // .then(data => { e.sender.send('add-ville', JSON.stringify(data)) })
        .catch(err => console.log(err.message));

    newVille.close();
})

// Suppression d'une ville, et renvoie vers l'app
ipcMain.on('delete-ville', async (e, id) => {
    const ville = await Ville.findByIdAndDelete(id)
        .then(data => { e.reply('delete-ville', JSON.stringify(data)) })
        .catch(err => console.log(err.message))
})

// Edition d'une ville
ipcMain.on('edit-ville', (e, args) => {
    createEditVille(args);
})

// Recherche de la ville pour renvoie vers edition
ipcMain.on('get-ville-for-edit', async (e, args) => {
    const ville = await Ville.findById(args)
        .then(data => { e.reply('ville-back-for-edit', JSON.stringify(data)) })
        .catch(err => console.log(err.message))
})

// Récupération de la ville éditée puie renvoie vers l'app
ipcMain.on('edited-ville', async (e, args) => {
    const editedVille = await Ville.findByIdAndUpdate(args._id, {
        nom: args.nom,
        data: {
            latitude: args.data.latitude,
            longitude: args.data.longitude
        }
    }, { new: true })
        .then(data => { mainWindow.webContents.send('edited-ville', JSON.stringify(data)) })
        .catch(err => console.log(err.message));
    editVille.close();
});

// online/Offline
app.whenReady().then(() => {
    onlineStatusWindow = new BrowserWindow({ width: 0, height: 0, show: false })
    onlineStatusWindow.loadURL(`file://${__dirname}/alert.html`)
});

module.exports = { createWindow }
const { ipcRenderer } = require('electron')

const listeVilles = document.querySelector('#listeVilles');
let villes = [];

/* Actions */

// Suppression ville
const deleteVille = (id) => {
    if (confirm('Supprimer ?')) {
        ipcRenderer.send('delete-ville', id)
    }
    return;
}
// Edition ville
const editVille = (id) => {
    ipcRenderer.send('edit-ville', id)
}


const renderVilles = (villes) => {
    listeVilles.innerHTML = ""
    villes.map(v => {
        listeVilles.innerHTML += `
        <tr>
            <td>${v.nom}</td>
            <td><button class="btn btn-danger" onClick="editVille('${v._id}')">Modifier</button></td>
            <td><button class="btn btn-danger" onClick="deleteVille('${v._id}')">Effacer</button></td>
        </tr>
        `
    });
}

// Récupération d'une nouvelle ville
ipcRenderer.on('add-ville', (e, ville) => {
    const newVille = JSON.parse(ville);
    ipcRenderer.send('get-villes');
    villes.push(newVille); // à corriger, 'villes' est vide

    renderVilles(villes);
});

// Demande de la liste des villes
ipcRenderer.send('get-villes');

// Récupération des villes et injection dans le tableau
ipcRenderer.on('get-villes', (e, args) => {
    const listeVilles = JSON.parse(args);
    renderVilles(listeVilles)
})

// Récupération de la ville supprimée et suppression dans le tableau
ipcRenderer.on('delete-ville', (e, ville) => {
    const deletedVille = JSON.parse(ville);
    ipcRenderer.send('get-villes');
    const newListe = villes.filter(v => {
        return v._id !== deletedVille._id
    })
    villes = newListe; // à corriger, 'villes' est vide

    renderVilles(villes)
})

// Récupération de la vile éditée et mise à jour du tableau
ipcRenderer.on('edited-ville', (e, args) => {
    const editedVille = JSON.parse(args);
    ipcRenderer.send('get-villes');
    villes = villes.map(v => {
        if (v._id === editedVille._id) {
            v.nom = editedVille.nom;
            v.data.latitude = editedVille.data.latitude;
            v.data.longitude = editedVille.data.longitude;
        }
        return v;
    })
    renderVilles(villes);
})

// Suppression de toutes les ville
ipcRenderer.on('all-deleted', (e, args) => {
    villes = [];
    renderVilles(villes)
})



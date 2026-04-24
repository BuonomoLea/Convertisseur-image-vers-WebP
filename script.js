const inputFile = document.getElementById('inputFile');
const buttonConvert = document.getElementById('buttonConvert');
const linkDownload = document.getElementById('linkDownload');

const customInput = document.getElementById('customInput');

const baseSize = document.getElementById('baseSize');
const finalSize = document.getElementById('finalSize');

let selectedFile = null;

// Chargement du fichier :
inputFile.addEventListener('change', function () {
    if (inputFile.files.length === 1) {
        selectedFile = inputFile.files[0];
        console.log('Fichier chargé :', selectedFile);
        customInput.textContent = "Fichier chargé";

        const sizeKB = (selectedFile.size / 1024).toFixed(2);
        const sizeMB = (selectedFile.size / (1024*1024)).toFixed(2);

        baseSize.classList.toggle('hidden');
        baseSize.textContent = `${sizeKB} KB / ${sizeMB} MB`;

        buttonConvert.classList.remove('close');
        buttonConvert.classList.add('open');
    } else {
        selectedFile = null;
        console.log('Aucun fichier ou trop de fichiers.');
        customInput.textContent = "choisir un fichier";
    }
});
// Récupération et lecture du fichier :
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            resolve(event.target.result);
        };
        reader.onerror = function () {
            reject(new Error("Erreur lors de la lecture du fichier."));
        };
        reader.readAsDataURL(file);
        console.log('Fichier lu');
    });
}
// Envois du fichier au canvas :
function createCanvasFromDataURL(dataURL) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            console.log('Image chargé dans le canvas');
            resolve(canvas);
        };
        img.onerror = function () {
            reject(new Error("Impossible de charger l’image dans le canvas."));
        };
        img.src = dataURL;
    });
}
// Convertis le canvas en webp :
function convertCanvasToWebp(canvas, originalName, quality = 0.9) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            function (blob) {
                if (!blob) {
                    reject(new Error("Impossible de générer le WEBP."));
                    return;
                }
                const webpFile = new File([blob], "image.webp", {type:"image/webp"});
                resolve(webpFile);
            },
            "image/webp",
            quality
        );
    });
}
// Etapes assemblé :
async function processImageToWebp(file) {
    try {
        const dataURL = await readFile(file);
        const canvas = await createCanvasFromDataURL(dataURL);
        const webpBlob = await convertCanvasToWebp(canvas);
        return webpBlob;
    } catch (error) {
        console.error("Erreur dans le processus :", error);
        throw error;
    }
}
// Envois du fichier au bouton download :
function prepareDownloadLink(webpFile) {
    const url = URL.createObjectURL(webpFile);
    linkDownload.href = url;
    linkDownload.download = webpFile.name;

    const sizeKB = (webpFile.size / 1024).toFixed(2);
    const sizeMB = (webpFile.size / (1024*1024)).toFixed(2);
    console.log("Taille WEBP :", sizeKB, "KB /", sizeMB, "MB");

    finalSize.classList.toggle('hidden');
    finalSize.textContent = `${sizeKB} KB / ${sizeMB} MB`;

    linkDownload.classList.remove('close');
    linkDownload.classList.add('open');
}
// Convertir Event :
buttonConvert.addEventListener('click', async function () {
    if (!selectedFile) {
        console.log("Aucun fichier sélectionné.");
        return;
    }
    const webpFile = await processImageToWebp(selectedFile);
    console.log("Fichier WEBP généré :", webpFile);
    prepareDownloadLink(webpFile);
});


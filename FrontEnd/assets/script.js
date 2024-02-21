// Fonction pour générer la galerie d'œuvres à partir d'un tableau d'objets "works"
function generateGallery(works) {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = ""; // Efface le contenu de la galerie

    for (let i = 0; i < works.length; i++) {
        const html = `
            <figure>
                <img src="${works[i].imageUrl}" alt="">
                <figcaption>${works[i].title}</figcaption>
            </figure>
        `;
        gallery.insertAdjacentHTML("beforeend", html);
        // Intégrer le code HTML en fonction de son indice
    }
}

// Fonction pour générer les œuvres en fonction de la réponse de l'API
function generateWorks(worksResponse) {
    const allBtn = document.querySelector('.btn__null');
    const btns = document.querySelectorAll('.btn');

    btns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const categoryId = btn.dataset.categoryId;
    
            if (categoryId === "0") {
                // Affiche tous les travaux si on clique sur le bouton "Tous"
                generateGallery(worksResponse);
            } else {
                // Sinon, filtre par catégorie
                const filteredWorks = filterWorksByCategory(categoryId, worksResponse);
                generateGallery(filteredWorks);
            }
    
            // Mise à jour du bouton
            btns.forEach(b => b.classList.remove('btn__null'));
            btn.classList.add('btn__null');
        });
    });

    // Tous les travaux sont affichés lors du chargement de la page
    allBtn.click();
}

// Fonction pour filtrer les travaux en fonction de la catégorie
function filterWorksByCategory(categoryId, works) {
    const filteredWorks = works.filter(work => work.categoryId === parseInt(categoryId, 10));
    return filteredWorks;
}

// Fonction pour récupérer les travaux depuis l'API
async function getWorks() {
    try {
        const worksResponse = await fetch('http://localhost:5678/api/works');
        if (worksResponse.ok) {
            const works = await worksResponse.json();
            console.log("Works:",works)
            generateWorks(works);
            return works;
        } else {
            console.log(`Erreur de requête pour les travaux: ${worksResponse.status}`);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des travaux:', error.message);
    }
}

// Fonction pour récupérer les catégories depuis l'API
async function getCategories() {
    try {
        const categoriesResponse = await fetch('http://localhost:5678/api/categories');

        if (categoriesResponse.ok) {
            const categories = await categoriesResponse.json();
            console.log('Catégories:', categories);
            return categories;
        } else {
            console.log(`Erreur de requête pour les catégories: ${categoriesResponse.status}`);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error.message);
    }
}

// Fonction principale pour récupérer les données et les afficher
async function fetchData() {
    try {
        const works = await getWorks();
        const categories = await getCategories();
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error.message);
    }
}


fetchData();

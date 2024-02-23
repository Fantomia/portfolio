document.addEventListener("DOMContentLoaded", function () {
  // Vérifie si le token est déjà présent dans le localStorage
  const storedToken = localStorage.getItem("token");
  const loginLogoutLink = document.getElementById("loginLogout");
  const filter = document.querySelector(".filter");
  const titleFilter = document.getElementById("titleFilter");

  if (storedToken) {
    // Si le token est présent, change le texte du lien à "logout"
    loginLogoutLink.textContent = "logout";

    if (filter) {
      filter.style.display = "none";
    }

    // Ajouter le bouton "Modifier" avec l'icône à côté du titre "Mes projets"
    const modifierButton = document.createElement("a");
    modifierButton.href = "#modal1";
    modifierButton.innerHTML =
      '<i class="fa-regular fa-pen-to-square fa-lg"></i> Modifier';
    titleFilter.appendChild(modifierButton);
    modifierButton.addEventListener("click", openModal);

    // Ajoute un gestionnaire d'événements pour gérer le "logout"
    loginLogoutLink.addEventListener("click", function () {
      // Supprime le token du localStorage
      localStorage.removeItem("token");
      loginLogoutLink.textContent = "login";
      alert("Vous êtes maintenant déconnecté");
    });
  }
});

let modal = null;

// Fonction pour ouvrir la modale
const openModal = async function (event) {
  event.preventDefault();
  const target = document.querySelector(event.target.getAttribute("href"));

  // Récupérer tous les travaux depuis l'API
  try {
    const worksResponse = await fetch("http://localhost:5678/api/works");
    if (worksResponse.ok) {
      const works = await worksResponse.json();

      // Générer la galerie dans la modal
      generateGalleryModal(works, target);

      // Afficher la modal
      target.style.display = null;
      target.removeAttribute("aria-hidden");
      target.setAttribute("aria-modal", "true");
      modal = target;
      modal.addEventListener("click", closeModal);
      modal
        .querySelector(".js-modal-close")
        .addEventListener("click", closeModal);
      modal
        .querySelector(".js-modal-stop")
        .addEventListener("click", stopPropagation);
    } else {
      console.log(
        `Erreur de requête pour les travaux: ${worksResponse.status}`
      );
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des travaux:", error.message);
  }
};

// Fonction pour fermer la modal
const closeModal = function (event) {
  if (modal === null) return;
  event.preventDefault();
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  modal.removeEventListener("click", closeModal);
  modal
    .querySelector(".js-modal-close")
    .removeEventListener("click", closeModal);
  modal
    .querySelector(".js-modal-stop")
    .removeEventListener("click", stopPropagation);
  modal = null;
};

const stopPropagation = function (event) {
  event.stopPropagation();
};

// Fonction pour générer la gallerie dans la modal
function generateGalleryModal(works, modal) {
  const modalGallery = modal.querySelector(".galleryModal");

  // Effacer le contenu existant de la galerie modale
  modalGallery.innerHTML = "";

  // Générer la galerie à l'intérieur de la modal
  for (let i = 0; i < works.length; i++) {
    const html = `
            <figure>
                <img src="${works[i].imageUrl}" alt="">
                <i class="fa-solid fa-trash-can" data-work-id="${works[i].id}"></i>
            </figure>
        `;
    modalGallery.insertAdjacentHTML("beforeend", html);
  }

  // Supprimer les travaux lors d'un clique sur l'icone trashcan
    modalGallery.querySelectorAll(".fa-trash-can").forEach((icon) => {
    const storedToken = localStorage.getItem("token");
    icon.addEventListener("click", (e) => deleteWork(e, storedToken));
  });
}

// Fonction pour supprimer les travaux
async function deleteWork(event, token) {
  event.preventDefault();
  const workId = event.target.dataset.workId;

  try {
    const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      // Mettez à jour la galerie après la suppression
      const updatedWorks = await getWorks();
      const modal = document.getElementById("modal1");
      generateGalleryModal(updatedWorks, modal);
    } else {
      console.log(
        `Erreur lors de la suppression du travail ${workId}: ${response.status}`
      );
    }
  } catch (error) {
    console.error(
      `Erreur lors de la suppression du travail ${workId}:`,
      error.message
    );
  }
}

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
  const allBtn = document.querySelector(".btn__null");
  const btns = document.querySelectorAll(".btn");

  btns.forEach((btn) => {
    btn.addEventListener("click", async () => {
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
      btns.forEach((b) => b.classList.remove("btn__null"));
      btn.classList.add("btn__null");
    });
  });

  // Tous les travaux sont affichés lors du chargement de la page
  allBtn.click();
}

// Fonction pour filtrer les travaux en fonction de la catégorie
function filterWorksByCategory(categoryId, works) {
  const filteredWorks = works.filter(
    (work) => work.categoryId === parseInt(categoryId, 10)
  );
  return filteredWorks;
}

// Fonction pour récupérer les travaux depuis l'API
async function getWorks() {
  try {
    const worksResponse = await fetch("http://localhost:5678/api/works");
    if (worksResponse.ok) {
      const works = await worksResponse.json();
      console.log("Works:", works);
      generateWorks(works);
    } else {
      console.log(
        `Erreur de requête pour les travaux: ${worksResponse.status}`
      );
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des travaux:", error.message);
  }
}

// Fonction pour récupérer les catégories depuis l'API
async function getCategories() {
  try {
    const categoriesResponse = await fetch(
      "http://localhost:5678/api/categories"
    );

    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log("Catégories:", categories);
      return categories;
    } else {
      console.log(
        `Erreur de requête pour les catégories: ${categoriesResponse.status}`
      );
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des catégories:",
      error.message
    );
  }
}

// Fonction principale pour récupérer les données et les afficher
async function fetchData() {
  try {
    const works = await getWorks();
    const categories = await getCategories();
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error.message);
  }
}

fetchData();

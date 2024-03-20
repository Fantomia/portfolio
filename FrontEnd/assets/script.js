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

const btnModal = document.querySelector(".btn__modal");
let modal = null;

// Fonction pour ouvrir la modale
const openModal = async function (event) {
  event.preventDefault();
  const target = event
    ? document.querySelector(event.target.getAttribute("href"))
    : null;

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
  const contentModal = modal.querySelector(".contentModal");
  contentModal.classList.remove("addWork");
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  modal.removeEventListener("click", stopPropagation);
  modal.removeEventListener("click", closeModal);
  modal = null;
};

// Empêche la propagation vers les éléments parents
const stopPropagation = function (event) {
  event.stopPropagation();
};

// Fonction pour générer la gallerie dans la modal
function generateGalleryModal(works, event) {
  const contentModal = document.querySelector(".contentModal");
  contentModal.classList.remove("addWork"); // Enlever la class qui permet de différencier les modales
  
  const titleModal = document.querySelector("#titleModal");
  titleModal.textContent = "Galerie Photo";

  const backToGalleryButton = document.querySelector(".js-modal-back");
  backToGalleryButton.style.display = "none"; // Supprimer la flèche de redirection
  
  btnModal.textContent = "Ajouter une photo";
  btnModal.classList.remove("btn__lock"); // Enlever la class btn__lock du bouton dans la modale
  
  // Effacer le contenu existant de la galerie modale
  contentModal.innerHTML = "";

  // Générer la galerie à l'intérieur de la modal
  for (let i = 0; i < works.length; i++) {
    const html = `
            <figure>
                <img src="${works[i].imageUrl}" alt="">
                <i class="fa-solid fa-trash-can" data-work-id="${works[i].id}"></i>
            </figure>
        `;
    contentModal.insertAdjacentHTML("beforeend", html);
  }

  // Supprimer les travaux lors d'un clique sur l'icone trashcan
  contentModal.querySelectorAll(".fa-trash-can").forEach((icon) => {
    const storedToken = localStorage.getItem("token");
    icon.addEventListener("click", (e) => deleteWork(e, storedToken, works));
  });

  btnModal.removeEventListener("click",addPhotoModal);
  btnModal.addEventListener("click",addPhotoModal);

}

function onAddPhotoClick (works, event) {
  addPhotoModal(works, event);
}

// Fonction pour mettre à jour la galerie dans la modale
async function updateGalleryModal(target) {
  try {
    const worksResponse = await fetch("http://localhost:5678/api/works");
    if (worksResponse.ok) {
      const works = await worksResponse.json();
      generateGallery(works);
      generateGalleryModal(works, target);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des travaux:", error.message);
  }
}

// Fonction pour afficher la modal pour ajouter une photo
async function addPhotoModal(works, event) {
  const contentModal = document.querySelector(".contentModal");
  const titleModal = document.querySelector("#titleModal");

  contentModal.innerHTML = "";
  contentModal.classList.add("addWork"); // Ajouter la class addWork pour différencier les modales
  const html = `
    <div class="inputPhoto">
      <i class="fa-regular fa-image displayPhoto"></i>
      <label for="photoInput" class="custom-file-upload displayPhoto">+ Ajouter photo</label>
      <input type="file" id="photoInput" class="displayPhoto" accept="image/*">
      <img id="previewImage" alt="Preview" style="display: none;">
      <p class="inputModalContent displayPhoto">jpg, png : 4mo max</p>
    </div>
    <label for="photoTitle">Titre</label>
    <input type="text" id="photoTitle">
    <label for="photoCategory">Catégorie</label>
    <select id="photoCategory"></select>
    `;
  contentModal.insertAdjacentHTML("afterbegin", html);

  const photoInput = document.getElementById("photoInput");
  const titleInput = document.getElementById("photoTitle");
  const categoryInput = document.getElementById("photoCategory");
  const previewImage = document.getElementById("previewImage");

  btnModal.textContent = "Valider";
  titleModal.textContent = "Ajout Photo";
  btnModal.classList.add("btn__lock");
  categoryInput.selectedIndex = -1; // Déselectionner toutes les options dans la liste

  await displayCategories(); // Afficher les catégories dans le champ d'entrée

  // Ajouter une event aux inputs
  [photoInput, titleInput, categoryInput].forEach((input) => {
    input.addEventListener("input", checkInputs);
  });

  // Ajouter un évènement pour prévisualiser l'image téléchargée
  photoInput.addEventListener("change", previewImageFile);

  // Fonction pour prévisualiser l'image téléchargée
  function previewImageFile() {
    const file = photoInput.files[0];
    const displayPhotoElements = document.querySelectorAll(".displayPhoto");

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        previewImage.src = e.target.result;
        previewImage.style.display = "block";
        displayPhotoElements.forEach((element) => {
          element.style.display = "none";
        });
      };

      reader.readAsDataURL(file);
    } else {
      previewImage.src = "";
      previewImage.style.display = "none";
      displayPhotoElements.style.display = "block";
    }
  }

  function onSubmitClick(event) {
    event.preventDefault();
    if (btnModal.classList.contains("btn__rdy")) {
      submitFormData(titleInput, categoryInput, photoInput);
    } else {
      btnModal.removeEventListener("click", onSubmitClick);
    }
  };

  btnModal.addEventListener("click", onSubmitClick);

  // Permettre le retour sur la modale précédente
  const backToGalleryButton = document.querySelector(".js-modal-back");
  backToGalleryButton.style.display = null;
  backToGalleryButton.addEventListener("click", () => {
    btnModal.removeEventListener("click", onSubmitClick);
    updateGalleryModal(works, event)
  });
}

// Fonction pour envoyer les données de la photo ajoutée 
async function submitFormData(titleInput, categoryInput, photoInput) {
  const titleValue = titleInput.value;
  const selectedCategory = categoryInput.value;
  const selectedImage = photoInput.files[0];
  const userId = localStorage.getItem("userId");
  const storedToken = localStorage.getItem("token");

  if (titleValue && selectedCategory && selectedImage) {
    const data = new FormData();
    data.append("userId", userId);
    data.append("title", titleValue);
    data.append("image", selectedImage);
    data.append("category", selectedCategory);
    
    try {
      const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
        body: data,
      });

      if (response.ok) {
        const responseData = await response.json();
        alert("Données envoyées avec succès !");
        checkInputs();
      } else {
        alert("Erreur lors de l'envoi des données. Veuillez réessayer.");
      }
    } catch (error) {
      alert(
        "Une erreur s'est produite lors de l'envoi des données. Veuillez réessayer."
      );
    }
  }
}

// Fonction qui vérifie si tous les champs sont remplis
function checkInputs() {
  const photoInput = document.getElementById("photoInput");
  const titleInput = document.getElementById("photoTitle");
  const categoryInput = document.getElementById("photoCategory");
  const isInputsValid =
    photoInput.files.length === 1 &&
    titleInput.value &&
    categoryInput.value !== "";

  if (isInputsValid) {
    btnModal.classList.remove("btn__lock"); // Déverouille le bouton 
    btnModal.classList.add("btn__rdy");
  } else {
    btnModal.classList.add("btn__lock"); // Garde le bouton vérouillé
    btnModal.classList.remove("btn__rdy");
  }
}

// Fonction pour récupérer les catégories et les afficher
async function displayCategories() {
  const categoriesInput = document.getElementById("photoCategory");
  const categories = await getCategories();

  // Efface les options existantes
  categoriesInput.innerHTML = "";

  // Ajoute une première option invisible
  const firstOption = document.createElement("option");
  firstOption.value = "";
  firstOption.text = "";
  firstOption.style.display = "none";
  categoriesInput.add(firstOption);

  // Ajoute chaque catégorie en tant qu'option
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.text = category.name;
    categoriesInput.add(option);
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
      updateGalleryModal(modal);
    }
  } catch (error) {
    console.error(
      `Erreur lors de la suppression du travail ${workId}:`,
      error.message
    );
  }
}

// Fonction pour générer la galerie à partir d'un tableau d'objets "works"
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
  }
}

// Fonction pour générer les travaux en fonction de la réponse de l'API
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
      generateWorks(works);
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
      return categories;
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
document.addEventListener("DOMContentLoaded", function () {
  // Vérifie si le token est déjà présent dans le sessionStorage
  const storedToken = sessionStorage.getItem("token");
  const loginLogoutLink = document.getElementById("loginLogout");
  const filter = document.querySelector(".filter");
  const titleFilter = document.getElementById("titleFilter");

  if (storedToken) {
    // Si le token est présent, change le texte du lien à "logout"
    loginLogoutLink.textContent = "logout";

    if (filter) {
      filter.style.display = "none";
    }

    const editionMod = document.createElement("div");
    const indexDiv = document.querySelector(".index");
    editionMod.classList.add("headerMod");
    editionMod.innerHTML = 
      '<i class="fa-regular fa-pen-to-square fa-lg"></i> Mode édition';
    indexDiv.insertBefore(editionMod, indexDiv.firstChild);
    const header = document.querySelector("header");
    header.classList.add("headerLogIn");

    // Ajouter le bouton "Modifier" avec l'icône à côté du titre "Mes projets"
    const modifierButton = document.createElement("a");
    modifierButton.href = "#modal1";
    modifierButton.innerHTML =
      '<i class="fa-regular fa-pen-to-square fa-lg"></i> Modifier';
    titleFilter.appendChild(modifierButton);
    modifierButton.addEventListener("click", openModal);


    // Ajoute un gestionnaire d'événements pour gérer le "logout"
    loginLogoutLink.addEventListener("click", function () {
      // Supprime le token du sessionStorage
      sessionStorage.removeItem("token");
      loginLogoutLink.textContent = "login";
      alert("Vous êtes maintenant déconnecté");
    });
  } else {
    header.classList.remove("headers");
  }
});

const contentUnder = document.querySelector(".contentUnderModal");
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
  const btnSubmit = document.querySelector(".btn__submit");
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
  if (btnSubmit) {
    btnSubmit.remove();
  }
  updateGalleryModal();
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
  
  // Effacer le contenu existant de la galerie modale
  contentModal.innerHTML = "";

  // Fonction pour créer un élément figure avec son contenu
  function createGalleryWorks(work) {
    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = work.imageUrl;
    img.alt = '';
    const trashIcon = document.createElement('i');
    trashIcon.classList.add('fa-solid', 'fa-trash-can');
    trashIcon.dataset.workId = work.id;
    figure.appendChild(img);
    figure.appendChild(trashIcon);
    return figure;
  }

  // Générer la galerie à l'intérieur de la modal
  for (let i = 0; i < works.length; i++) {
    const galleryWorks = createGalleryWorks(works[i]);
    contentModal.appendChild(galleryWorks);
  }

  // Supprimer les travaux lors d'un clique sur l'icone trashcan
  contentModal.querySelectorAll(".fa-trash-can").forEach((icon) => {
    const storedToken = sessionStorage.getItem("token");
    icon.addEventListener("click", (e) => deleteWork(e, storedToken, works));
  });
  let btnModal = document.querySelector(".btn__modal");

  // Vérifier si le bouton existe déjà
  if (!btnModal) {
    // Créer le bouton uniquement s'il n'existe pas déjà
    btnModal = document.createElement("button");
    btnModal.classList.add("btn__modal");
    btnModal.textContent = "Ajouter une photo";
    contentUnder.appendChild(btnModal);
  }

  btnModal.removeEventListener("click",onAddPhotoClick);
  btnModal.addEventListener("click",onAddPhotoClick);

}

function onAddPhotoClick (works, event) {
  addPhotoModal(works, event);
}

// Fonction pour mettre à jour la galerie dans la modale
async function updateGalleryModal() {
  try {
    const worksResponse = await fetch("http://localhost:5678/api/works");
    if (worksResponse.ok) {
      const works = await worksResponse.json();
      generateGallery(works);
      generateGalleryModal(works);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des travaux:", error.message);
  }
}

// Fonction pour afficher la modal pour ajouter une photo
async function addPhotoModal(works, event) {
  const contentModal = document.querySelector(".contentModal");
  const titleModal = document.querySelector("#titleModal");
  const btnModal = document.querySelector(".btn__modal");

  // Supprimer l'ancien bouton  
  btnModal.parentNode.removeChild(btnModal);

  contentModal.innerHTML = "";
  contentModal.classList.add("addWork"); // Ajouter la class addWork pour différencier les modales
  
  const html = 
    `
    <div class="inputPhoto">
      <i class="fa-regular fa-image displayPhoto"></i>
      <label for="photoInput" class="custom-file-upload displayPhoto">+ Ajouter photo</label>
      <input type="file" id="photoInput" class="displayPhoto" accept="image/png, image/jpeg">
      <img id="previewImage" alt="Preview" style="display: none;">
      <p class="inputModalContent displayPhoto">jpg, png : 4mo max</p>
    </div>
    <label for="photoTitle">Titre</label>
    <input type="text" id="photoTitle">
    <label for="photoCategory">Catégorie</label>
    <select id="photoCategory"></select>
    `;
  contentModal.insertAdjacentHTML("afterbegin", html);
  
  // Créer un nouveau bouton avec la classe btn__submit
  const btnSubmit = document.createElement("button");
  btnSubmit.textContent = "Valider";
  btnSubmit.classList.add("btn__submit");
  btnSubmit.disabled = true; // Ajouter la classe btn__lock au nouveau bouton
  btnSubmit.removeEventListener("click", onSubmitClick);
  btnSubmit.addEventListener("click", onSubmitClick);
  btnSubmit.classList.add("btn__lock");
  contentUnder.classList.add("addWorkBtn");
  const addWorkBtn = document.querySelector(".addWorkBtn");
  // Ajouter le nouveau bouton à la modal
  addWorkBtn.appendChild(btnSubmit);

  const photoInput = document.getElementById("photoInput");
  const titleInput = document.getElementById("photoTitle");
  const categoryInput = document.getElementById("photoCategory");
  const previewImage = document.getElementById("previewImage");

  titleModal.textContent = "Ajout Photo";
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
    if (btnSubmit.classList.contains("btn__rdy")) {
      submitFormData(titleInput, categoryInput, photoInput);
      resetInputs();
    } else {
      alert("Veuillez remplir tous les champs");
    }
  };

  // Permettre le retour sur la modale précédente
  const backToGalleryButton = document.querySelector(".js-modal-back");
  backToGalleryButton.style.display = null;
  backToGalleryButton.addEventListener("click", () => {
    updateGalleryModal(works, event);
    // Supprimer l'ancien bouton  
    if (btnSubmit) {
    btnSubmit.remove();
    }
  });
}

// Fonction pour réinitialiser les inputs dans la modal
function resetInputs() {
  const inputPhoto = document.querySelector('.inputPhoto');
  const photoInput = document.getElementById('photoInput');
  const titleInput = document.getElementById("photoTitle");
  const categoryInput = document.getElementById("photoCategory");
  const inputs = document.querySelectorAll('.addWork input');
  
  // Parcourir tous les enfants de .inputPhoto
  Array.from(inputPhoto.children).forEach(child => {
    // Masquer tous les enfants sauf celui avec l'id photoInput
    if (child !== photoInput) {
      child.style.display = 'block'; // Afficher l'élément
    }
  });
  
  // Réinitialiser les valeurs des inputs
  inputs.forEach(input => {
    if (input.type === 'file') {
      photoInput.value = '';
      inputPhoto.value = ''; // Réinitialiser la valeur du champ de fichier
      titleInput.value = '';
      categoryInput.selectedIndex = -1;
    } else {
      input.value = ''; // Réinitialiser la valeur de l'input de texte
    }
  });

  // Masquer l'aperçu de l'image
  const previewImage = document.getElementById('previewImage');
  previewImage.style.display = 'none';
}

// Fonction pour envoyer les données de la photo ajoutée 
async function submitFormData(titleInput, categoryInput, photoInput) {
  const titleValue = titleInput.value;
  const selectedCategory = categoryInput.value;
  const selectedImage = photoInput.files[0];
  const userId = sessionStorage.getItem("userId");
  const storedToken = sessionStorage.getItem("token");
  const maxFileSize = 4 * 1024 * 1024; // 4 Mo

  // Vérification de la taille de l'image
  if (selectedImage.size > maxFileSize) {
    alert("L'image est trop volumineuse. Veuillez sélectionner une image de moins de 4 Mo.");
    return;
  }
  

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
  const btnSubmit = document.querySelector(".btn__submit");
  const isInputsValid =
    photoInput.files.length === 1 &&
    titleInput.value &&
    categoryInput.value !== "";

  if (isInputsValid) {
    btnSubmit.classList.remove("btn__lock"); // Déverouille le bouton 
    btnSubmit.classList.add("btn__rdy");
    btnSubmit.disabled = false;
  } else {
    btnSubmit.classList.add("btn__lock"); // Garde le bouton vérouillé
    btnSubmit.classList.remove("btn__rdy");
    btnSubmit.disabled = true;
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
    disconnectUser();
    alert("Une erreur serveur s'est produite. Veuillez réessayer plus tard.");
  }
}

function disconnectUser() {
  sessionStorage.removeItem("token");
  window.location.href = "login.html";
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
    disconnectUser();
    alert("Une erreur serveur s'est produite. Veuillez réessayer plus tard.");
  }
}

// Fonction principale pour récupérer les données et les afficher
async function fetchData() {
  try {
    const works = await getWorks();
    const categories = await getCategories();
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error.message);
    disconnectUser();
    alert("Une erreur serveur s'est produite. Veuillez réessayer plus tard.");
  }
}

fetchData();
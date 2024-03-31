const loginIndex = document.querySelector(".loginIndex");

document.addEventListener("DOMContentLoaded", function (event) {
  // Vérifie si le token est déjà présent dans le localStorage
  const storedToken = sessionStorage.getItem("token");
  const loginLogoutLink = document.getElementById("loginLogout");

  if (storedToken) {
    // Si le token est présent, change le texte du lien à "logout"
    loginLogoutLink.textContent = "logout";

    // Ajoute un gestionnaire d'événements pour gérer le "logout"
    loginLogoutLink.addEventListener("click", function () {
      // Supprime le token du localStorage
      sessionStorage.removeItem("token");
      loginLogoutLink.textContent = "login";
      alert("Vous êtes maintenant déconnecté");
    });
  }
});

const loginForm = document.querySelector(".login form");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault(); 

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Créez l'objet avec les données pour l'API
  const loginData = {
    email: email,
    password: password,
  };

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    const responseData = await response.json();

    // Vérifiez si la connexion a réussi ou échoué
    if (response.ok) {
      sessionStorage.setItem("token", responseData.token);
      window.location.href = "index.html";
    } else {
      alert("Email ou Mot de passe incorrect");
    }
  } catch (error) {
    console.error("Erreur lors de la requête POST:", error);
  }
});

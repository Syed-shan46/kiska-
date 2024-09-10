document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".mobile-menu li");

  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove 'active' class from all items
      menuItems.forEach((el) => el.classList.remove("active"));

      // Add 'active' class to the clicked item
      this.classList.add("active");
    });
  });


}
);

document.querySelectorAll('.nav-link').forEach(function (link) {
  link.addEventListener('click', function () {
    this.blur(); // This removes focus
  });
});


function showLoginPopup() {
  const popup = document.getElementById('loginPopup');
  popup.style.display = 'flex'; // Show popup
  setTimeout(() => {
    popup.classList.add('show'); // Trigger zoom-in effect
  }, 10); // Small delay to ensure the transition works
}

function closePopup() {
  const popup = document.getElementById('loginPopup');
  popup.classList.remove('show'); // Zoom-out back in
  setTimeout(() => {
    popup.style.display = 'none'; // Hide after animation
  }, 300); // Wait for the animation to finish
}

function redirectToLogin() {
  window.location.href = '/login'; // Redirect to login page
}

AOS.init();


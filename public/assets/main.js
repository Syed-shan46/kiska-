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


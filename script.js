const API_BASE = "https://www.themealdb.com/api/json/v1/1/";
const content = document.getElementById("content");
const loader = document.getElementById("loader");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

searchBtn.addEventListener("click", () => {
  const q = searchInput.value.trim();
  if (q) searchMeals(q);
});

async function searchMeals(query) {
  content.innerHTML = "";
  loader.classList.remove("hidden");
  try {
    const res = await fetch(
      `${API_BASE}search.php?s=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    loader.classList.add("hidden");
    if (!data.meals) {
      content.innerHTML = `<p>No recipes found for "<strong>${query}</strong>".</p>`;
      return;
    }
    displayMealGrid(data.meals);
  } catch (err) {
    loader.classList.add("hidden");
    content.innerHTML = "<p>Oops! Something went wrong.</p>";
  }
}

function displayMealGrid(meals) {
  const grid = document.createElement("div");
  grid.className = "meal-grid";
  meals.forEach((meal) => {
    const card = document.createElement("div");
    card.className = "meal-card";
    card.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <div class="meal-info">
        <h3>${meal.strMeal}</h3>
        <div class="tags">
          <span class="tag">${meal.strArea}</span>
          <span class="tag">${meal.strCategory}</span>
        </div>
        <p class="description">${meal.strInstructions.slice(0, 100)}…</p>
      </div>
    `;
    card.addEventListener("click", () => openDetail(meal.idMeal));
    grid.appendChild(card);
  });
  content.innerHTML = "";
  content.appendChild(grid);
}

async function openDetail(id) {
  content.innerHTML = "";
  loader.classList.remove("hidden");
  try {
    const res = await fetch(`${API_BASE}lookup.php?i=${id}`);
    const data = await res.json();
    loader.classList.add("hidden");
    if (!data.meals) return;
    renderDetail(data.meals[0]);
  } catch {
    loader.classList.add("hidden");
    content.innerHTML = "<p>Error loading details.</p>";
  }
}

function renderDetail(meal) {
  const div = document.createElement("div");
  div.className = "detail-view";

  const back = document.createElement("div");
  back.className = "back-button";
  back.textContent = "← Back to results";
  back.onclick = () => displayMealGrid(currentMeals);
  div.appendChild(back);

  div.innerHTML += `
    <img style="width:500px;height:300px;" src="${meal.strMealThumb}" alt="${meal.strMeal}">
    <h2>${meal.strMeal}</h2>
    <div class="detail-tags">
      <span class="tag">${meal.strArea}</span>
      <span class="tag">${meal.strCategory}</span>
    </div>
  `;

  const ingredients = extractIngredients(meal);
  div.innerHTML += `
    <div class="ingredients">
      <h4>Ingredients:</h4>
      <ul>${ingredients.map((i) => `<li>${i}</li>`).join("")}</ul>
    </div>
    <div class="instructions">
      <h4>Instructions:</h4>
      <ol>${meal.strInstructions
        .split(". ")
        .map((step) => `<li>${step.trim()}.</li>`)
        .join("")}</ol>
    </div>
  `;

  content.innerHTML = "";
  content.appendChild(div);
}

function extractIngredients(meal) {
  const items = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const qty = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      items.push(`${qty.trim()} ${ing.trim()}`);
    }
  }
  return items;
}

// to re-render results after returning from detail:
let currentMeals = [];
async function searchMealsSave(query) {
  const res = await fetch(
    `${API_BASE}search.php?s=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  currentMeals = data.meals || [];
  displayMealGrid(currentMeals);
}
// Replace call inside search handler:
searchBtn.onclick = () => {
  const q = searchInput.value.trim();
  if (q) {
    content.innerHTML = "";
    loader.classList.remove("hidden");
    searchMealsSave(q).then(() => loader.classList.add("hidden"));
  }
};

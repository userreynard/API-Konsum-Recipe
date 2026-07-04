async function getRecipes() {

    const response = await fetch("/recipes");
    const data = await response.json();

    const recipesDiv = document.getElementById("recipes");

    data.recipes.forEach(recipe => {

        recipesDiv.innerHTML += `
            <div class="card">
                <img src="${recipe.image}" width="200">
                <h2>${recipe.name}</h2>
                <p>Rating : ${recipe.rating}</p>
                <p>Difficulty : ${recipe.difficulty}</p>
            </div>
        `;

    });

}

getRecipes();

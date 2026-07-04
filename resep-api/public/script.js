async function getRecipes() {

    const response = await fetch("/recipes");

    const data = await response.json();

    console.log(data);

}

getRecipes(); 
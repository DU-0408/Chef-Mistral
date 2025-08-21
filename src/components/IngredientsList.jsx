export default function IngredientsList(props){

    const ingredientsList = props.ingredients.map(ingredient => <li key={props.ingredients.length-ingredient.length}>{ingredient}</li>)

    return(
        <section className='ingredients-section'>
          <h2>Ingredients on hand:</h2>
          <ul className='ingredients-list'>{ingredientsList}</ul>
          {
            props.ingredients.length > 3 ? 
            <div className="get-recipe-container">
              <div>
                <h3>Ready for a recipe?</h3>
                <p>Generate a recipe from your list of ingredients.</p>
              </div>
              <div className='recipe-button'>
                <button onClick={props.getRecipe}>Get a recipe</button>
              </div>
            </div> : null
          }
        </section>
    )
}
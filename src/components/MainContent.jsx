import React from 'react'
import ClaudeRecipe from './ClaudeRecipe'
import IngredientsList from './IngredientsList'
import { getRecipeFromMistral } from './ai'


export default function Main()  {
  const [ingredients,setIngredients] = React.useState([])
  const [recipe, setRecipe] = React.useState("")
  
  function addIngredient(formData){
    const newIngredient = formData.get("ingredient")
    setIngredients(ingredient => [...ingredient, newIngredient])
  }

  async function getRecipe(){
    const res = await getRecipeFromMistral(ingredients)
    setRecipe(res)
  }

  return (
    <main className='main-section'>
      <form className='form-section' action={addIngredient}>
        <input type="text" className='form-input' placeholder='e.g. oregano' name='ingredient'/>
        <button className='form-button'>+ Add Ingredient</button>
      </form>
      {
        ingredients.length > 0 ? 
        <IngredientsList 
          ingredients={ingredients}
          getRecipe={getRecipe}
        /> : null}
      {recipe ? <ClaudeRecipe recipe={recipe}/> : null}
    </main>
  )
}
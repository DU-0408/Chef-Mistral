import chefMistralIcon from '../images/chef-claude-icon.png'

export default function Header()  {
  return (
    <header className='head'>
        <img src={chefMistralIcon} alt="Chef Mistral Icon" className='logo'/>
        <h1 className='title'>Chef Mistral</h1>
    </header>
  )
}
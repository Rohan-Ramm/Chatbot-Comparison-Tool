import { useState } from 'react'
import { MODELS } from './constants'
import Searchbar from './Searchbar'

function Scoreboard({ usrScores, glbScores, onClear }) {
  const [model,setModel] = useState("GPT-5")

  return (
    <div id="scores">
      <div className='border'>
        <h2>Scoreboard</h2>
        <b>{model}</b>
        <div>Local score: wins,  w.r.</div>
        <div>Global score: wins,  w.r.</div>
        <Searchbar/>
        <Searchbar/>
        <button id="clear" onClick={onClear}>Clear scores</button>
      </div>
      <div/>
    </div>
  )
}

export default Scoreboard

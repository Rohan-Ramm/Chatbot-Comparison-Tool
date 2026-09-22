import { useState } from 'react'
import Searchbar from './Searchbar'

function Scoreboard({ usrScores, glbScores, models, characters, onClear }) {
  const [model,setModel] = useState("GPT-4.1")
  const [character,setCharacter] = useState("None")

  function getWR(hashmap,name) {
    if (hashmap[name][0] == 0) return 0
    return (hashmap[name][0] / hashmap[name][1])
  }

  return (
    <div id="scores">
      <div className='border'>
        <h2>Scoreboard</h2>
        <b>{model}</b>
        <div>Local score: {usrScores.models[model][0]} wins,  {getWR(usrScores.models,model)}% w.r.</div>
        <div>Global score: wins,  w.r.</div>
        <b>{character}</b>
        <div>Local score: wins,  w.r.</div>
        <div>Global score: wins,  w.r.</div>
        <Searchbar name="Change Model" options={models} onSubmit={setModel}/>
        <Searchbar name="Change Character" options={characters} onSubmit={setCharacter}/>
        <button id="clear" onClick={onClear}>Clear scores</button>
      </div>
      <div/>
    </div>
  )
}

export default Scoreboard

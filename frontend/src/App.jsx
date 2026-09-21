import { useEffect, useState } from 'react'
import './App.css'
import Scoreboard from './Scoreboard'
import QuestionPanel from './QuestionPanel'
import VotePanel from './VotePanel'
import { MODELS,CHARACTERS } from './constants'

const zeroScores = () => ({
  models: Object.fromEntries(MODELS.map(m => [m, 0,0])),
  characters: Object.fromEntries(CHARACTERS.map(c => [c, 0, 0]))
});

function App() {
  const [model1, setModel1] = useState(MODELS[0])
  const [model2, setModel2] = useState(MODELS[1])
  const [character1,setCharacter1] = useState(CHARACTERS[0])
  const [character2,setCharacter2] = useState(CHARACTERS[1])
  const [usrScores, setUsrScores] = useState(zeroScores)
  const [glbScores, setGlbScores] = useState(zeroScores)
  const [scoresChangeable, setScoresChangeable] = useState(true)

  useEffect(() => {
    async function fetchGlobal() {
      const response = await fetch("http://localhost:5000/scores")
      const data = await response.json()
      console.log(data)
      setGlbScores(prev => ({ ...prev, ...data }))
    }
    fetchGlobal()
    if (!localStorage) return
    setUsrScores(() => {
      const scores = {
        models: { ...prev.models },
        characters: { ...prev.characters }
    };
      MODELS.forEach(model => {
          const stored = localStorage.getItem(`score_${model}`);

          if (stored !== null) {
              scores.models[model] = JSON.parse(stored);
          }
      });
      CHARACTERS.forEach(character => {
          const stored = localStorage.getItem(`score_${character}`);

          if (stored !== null) {
              scores.characters[character] = JSON.parse(stored);
          }
      });
      return scores;
    })  
  }, [])

  const updateServer = async (modelName) => {
    const url = "http://localhost:5000/update_scores"
    const options = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modelName)
    }
    const response = await fetch(url, options)
    console.log(response)
  }

  const handleVote = (modelName, characterName) => {
    const newModelScore = usrScores.models[modelName] + 1
    const newCharacterScore = usrScores.characters[characterName] + 1
    setUsrScores(prev => ({ ...prev, [modelName]: prev[modelName] + 1 }))
    setUsrScores(prev => ({ ...prev, models: {...models, [modelName]: newModelScore}}))
    setUsrScores(prev => ({ ...prev, characters: {...characters, [characterName]: newCharacterScore}}))
    localStorage.setItem(`score_${modelName}`, JSON.stringify(newModelScore))
    localStorage.setItem(`score_${modelName}`, JSON.stringify(newCharacterScore))
    updateServer(modelName)
    setScoresChangeable(false)
  }

  const clearUserScores = () => {
    setUsrScores(zeroScores())
    MODELS.forEach(m => localStorage.removeItem(`score_${m}`))
  }

  return (
    <>
      <div id="main-page">
        <div>
          <h1>A Second Opinion</h1>
          <h2>Who gives the best advice?</h2> 
        </div>
        <div id="main-section">
          <QuestionPanel
            model1={model1}
            model2={model2}
            onModel1Change={setModel1}
            onModel2Change={setModel2}
            onResponsesLoaded={() => setScoresChangeable(true)}
          />
          <VotePanel
            scoresChangeable={scoresChangeable}
            onModel1Vote={() => handleVote(model1,character1,model2,character2)}
            onModel2Vote={() => handleVote(model2,character2,model1,character1)}
          />
        </div>
      </div>
      <Scoreboard
        usrScores={usrScores}
        glbScores={glbScores}
        onClear={clearUserScores}
      />
    </>
  )
}

export default App

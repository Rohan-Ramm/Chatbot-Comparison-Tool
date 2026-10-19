import { useEffect, useState } from 'react'
import './App.css'
import Scoreboard from './Scoreboard'
import QuestionPanel from './QuestionPanel'
import VotePanel from './VotePanel'
import { CHARACTERS } from './constants'

const zeroScores = () => ({
  models: {"GPT-4.1": [0,0]}, //placeholder, so that nothing is undefined before the useEffect hook runs
  characters: Object.fromEntries(CHARACTERS.map(c => [c, [0, 0]]))
});

function App() {
  const [modelNames,setModelNames] = useState([])
  const [model1, setModel1] = useState("")
  const [model2, setModel2] = useState("")
  const [character1,setCharacter1] = useState(CHARACTERS[0])
  const [character2,setCharacter2] = useState(CHARACTERS[1])
  const [usrScores, setUsrScores] = useState(zeroScores)
  const [glbScores, setGlbScores] = useState(zeroScores)
  const [scoresChangeable, setScoresChangeable] = useState(true)

  useEffect(() => {
    async function fetchModelNames() {
      const response = await fetch("http://localhost:5000/model_names")
      const data = await response.json()
      console.log(data)
      setModelNames(data)
    }
    async function fetchGlobal() {
      const response = await fetch("http://localhost:5000/scores")
      const data = await response.json()
      console.log(data)
      setGlbScores(prev => ({models: data.models, characters: data.characters }))
    }
    fetchGlobal()
    fetchModelNames()
    if (!localStorage) return
    setUsrScores(prev => {
      const scores = {
          models: { ...prev.models },
          characters: { ...prev.characters }
      };

      modelNames.forEach(model => {
          const stored = localStorage.getItem(`score_${model}`);

          if (stored !== null) {
              scores.models[model] = JSON.parse(stored);
          } else {
            scores.models[model] = [0,0];
          }
      });

      CHARACTERS.forEach(character => {
          const stored = localStorage.getItem(`score_${character}`);

          if (stored !== null) {
              scores.characters[character] = JSON.parse(stored);
          } else {
            scores.characters[character] = [0,0];
          }
      });

      return scores;
    });
    console.log("Hi")
    console.log(usrScores)
  }, [])

  const updateServer = async (winnerModel, winnerCharacter, loserModel, loserCharacter) => {
    const data = {"winner_model": winnerModel, "winner_character": winnerCharacter, "loser_model": loserModel, "loser_character": loserCharacter}

    const url = "http://localhost:5000/update_scores"
    const options = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }
    const response = await fetch(url, options)
    console.log(response)
  }

  const handleVote = (winnerModel, winnerCharacter, loserModel, loserCharacter) => {
    const newWMScore = [usrScores.models[winnerModel][0] + 1, usrScores.models[winnerModel][1] + 1]
    const newWCScore = [usrScores.characters[winnerCharacter][0] + 1, usrScores.characters[winnerCharacter][1] + 1]
    const newLMScore = [usrScores.models[loserModel][0], usrScores.models[loserModel][1] + 1]
    const newLCScore = [usrScores.characters[loserCharacter][0], usrScores.characters[loserCharacter][1] + 1]

    setUsrScores(prev => ({ ...prev, models: {...prev.models, [winnerModel]: newWMScore}}))
    setUsrScores(prev => ({ ...prev, characters: {...prev.characters, [winnerCharacter]: newWCScore}}))
    setUsrScores(prev => ({ ...prev, models: {...prev.models, [loserModel]: newLMScore}}))
    setUsrScores(prev => ({ ...prev, characters: {...prev.characters, [loserCharacter]: newLCScore}}))

    localStorage.setItem(`score_${winnerModel}`, JSON.stringify(newWMScore))
    localStorage.setItem(`score_${winnerCharacter}`, JSON.stringify(newWCScore))
    localStorage.setItem(`score_${loserModel}`, JSON.stringify(newLMScore))
    localStorage.setItem(`score_${loserCharacter}`, JSON.stringify(newLCScore))

    updateServer(winnerModel, winnerCharacter, loserModel, loserCharacter)
    setScoresChangeable(false)
  }

  const clearUserScores = () => {
    setUsrScores(zeroScores())
    localStorage.clear()
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
            character1={character1}
            character2={character2}
            onChar1Change={setCharacter1}
            onChar2Change={setCharacter2}
            models={modelNames}
            characters={CHARACTERS}
            onResponsesLoaded={() => setScoresChangeable(true)}
            scoresChangeable={scoresChangeable}
          />
          <VotePanel
            scoresChangeable={scoresChangeable}
            onCounselorVote={() => handleVote(model1,character1,model2,character2)}
            onConsultantVote={() => handleVote(model2,character2,model1,character1)}
          />
        </div>
      </div>
      <Scoreboard
        usrScores={usrScores}
        glbScores={glbScores}
        models={modelNames}
        characters={CHARACTERS}
        onClear={clearUserScores}
      />
    </>
  )
}

export default App

import { useEffect, useState } from 'react'
import './App.css'
import Scoreboard from './Scoreboard'
import QuestionPanel from './QuestionPanel'
import VotePanel from './VotePanel'
import { MODELS } from './constants'

const zeroScores = () => Object.fromEntries(MODELS.map(m => [m, 0]))

function App() {
  const [model1, setModel1] = useState(MODELS[0])
  const [model2, setModel2] = useState(MODELS[1])
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
    MODELS.forEach(model => {
      const stored = localStorage.getItem(`score_${model}`)
      if (stored !== null) {
        setUsrScores(prev => ({ ...prev, [model]: JSON.parse(stored) }))
      }
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

  const handleVote = (modelName) => {
    const newScore = usrScores[modelName] + 1
    setUsrScores(prev => ({ ...prev, [modelName]: prev[modelName] + 1 }))
    localStorage.setItem(`score_${modelName}`, JSON.stringify(newScore))
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
          <h2>Which AI model gives the best advice?</h2> 
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
            model1={model1}
            model2={model2}
            onModel1Vote={() => handleVote(model1)}
            onModel2Vote={() => handleVote(model2)}
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

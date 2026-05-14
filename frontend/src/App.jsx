import { useEffect, useState } from 'react'
import './App.css'
import Scoreboard from './Scoreboard'
import QuestionPanel from './QuestionPanel'
import VotePanel from './VotePanel'

function App() {
  const [usrLowScr, setUsrLowScr] = useState(0)
  const [usrHighScr, setUsrHighScr] = useState(0)
  const [glbLowScr, setGlbLowScr] = useState(0)
  const [glbHighScr, setGlbHighScr] = useState(0)
  const [scoresChangeable, setScoresChangeable] = useState(false)

  useEffect(() => {
    async function fetchGlobal() {
      const response = await fetch("http://localhost:5000/scores")
      const global_data = await response.json()
      console.log(global_data)
      setGlbHighScr(global_data['complex_score'])
      setGlbLowScr(global_data['simple_score'])
    }
    fetchGlobal()
    if (!localStorage) return
    const simpleScore = localStorage.getItem('Simple_Response')
    const complexScore = localStorage.getItem('Complex_Reponse')
    if (simpleScore !== null) setUsrHighScr(JSON.parse(simpleScore))
    if (complexScore !== null) setUsrLowScr(JSON.parse(complexScore))
  }, [])

  const updateServer = async (id) => {
    const url = "http://localhost:5000/update_scores"
    const options = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id)
    }
    const response = await fetch(url, options)
    console.log(response)
  }

  const simpleVictory = async () => {
    const temp = usrLowScr + 1
    setUsrLowScr(temp)
    localStorage.setItem('Simple_Response', JSON.stringify(temp))
    updateServer("Simple")
    setScoresChangeable(false)
  }

  const complexVictory = async () => {
    const temp = usrHighScr + 1
    setUsrHighScr(temp)
    localStorage.setItem('Complex_Response', JSON.stringify(temp))
    updateServer("Complex")
    setScoresChangeable(false)
  }

  const clearUserScores = () => {
    setUsrHighScr(0)
    setUsrLowScr(0)
  }

  return (
    <>
      <div id="main-page">
        <h1>A second opinion</h1>
        <h2>Which AI model gives the best advice?</h2>
        <div id="page-body">
          <div id="main-section">
            <QuestionPanel onResponsesLoaded={() => setScoresChangeable(true)} />
            <VotePanel
              scoresChangeable={scoresChangeable}
              onSimpleVote={simpleVictory}
              onComplexVote={complexVictory}
            />
          </div>
        </div>
      </div>
      <Scoreboard
        usrLowScr={usrLowScr}
        usrHighScr={usrHighScr}
        glbLowScr={glbLowScr}
        glbHighScr={glbHighScr}
        onClear={clearUserScores}
      />
    </>
  )
}

export default App

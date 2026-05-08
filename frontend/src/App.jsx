import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [usrLowScr,setUsrLowScr] = useState(0)
  const [usrHighScr,setUsrHighScr] = useState(0)
  const [glbLowScr,setGlbLowScr] = useState(0)
  const [glbHighScr,setGlbHighScr] = useState(0)
  const [scoresChangeable,setScoresChangeable] = useState(false)
  const [lowResponse,setLowResponse] = useState("I lost a game, and while there's no shame in losing, especially since I had a strong opponent, there is shame in playing badly, and that's what I did. ")
  const [highResponse,setHighResponse] = useState("I lost a game, and while there's no shame in losing, especially since I had a strong opponent, there is shame in playing badly, and that's what I did. ")
  const [usrQuestion,setUsrQuestion] = useState("")

  const askQuestion = async (e) => {
    e.preventDefault()
    setScoresChangeable(true)
    await getResponses()
  }

  const getResponses = async () => {
    const url = "http://localhost:5000/get_responses"
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({usrQuestion})
    }
    const response = await fetch(url,options)
    //console.log(response)
    const message =  await response.json()
    console.log(message)
    if (response.status == 201) {
      setHighResponse(message["complex_response"])
      setLowResponse(message["simple_response"])
    } else {
      console.log(message["message"])
    }
  }
  


  const simpleVictory = async () => {
    const temp = usrLowScr + 1
    setUsrLowScr(temp)
    localStorage.setItem('Simple_Response', JSON.stringify(temp))
    updateServer("Simple")
    setScoresChangeable(false)
    saveUsrScores()
  } 

  const complexVictory = async () => {
    const temp = usrHighScr + 1
    setUsrHighScr(temp)
    localStorage.setItem('Complex_Response', JSON.stringify(temp))
    updateServer("Complex")
    setScoresChangeable(false)
    saveUsrScores()
  } 

  const updateServer = async (id) => {
    const url = "http://localhost:5000/update_scores"
    const options = {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(id)
    }
    const response = await fetch(url,options)
    if (response.status == 200) {
        console.log(response)
    } else {
        console.log(response)
    }
  }

  const clearUserScores = () => {
    setUsrHighScr(0)
    setUsrLowScr(0)
  }

  // load in scores
  useEffect( () => {
      async function fetchGlobal() {
        const response = await fetch("http://localhost:5000/scores")
        const global_data = await response.json()
        console.log(global_data)
        setGlbHighScr(global_data['complex_score'])
        setGlbLowScr(global_data['simple_score'])
      }   
      fetchGlobal() 
      if(!localStorage) {
        return
      }
      //console.log("New values:")
      //console.log(localStorage)
      const simpleScore = localStorage.getItem('Simple_Response');
      const complexScore = localStorage.getItem('Complex_Reponse');
      
      // Parse only if not null
      if (simpleScore !== null) {
        setUsrHighScr(JSON.parse(simpleScore));
      }
      if (complexScore !== null) {
        setUsrLowScr(JSON.parse(complexScore));
      }
    },[]
  ) 


  return (
    <>
      <div id = "main-page">
        <h1>A second opinion</h1>
        <h2>Which AI model gives the best advice?</h2>
        <div id = "page-body">
          <div id = "main-section">
            <div className="input-container">
              <form onSubmit={askQuestion}>
                <input
                  value={usrQuestion}
                  onChange={(e) => setUsrQuestion(e.target.value)}
                  placeholder="Ask a question"
                />
              </form>
            </div>
            <div>
              <p>You said: {usrQuestion}</p>
              <p>Low Complexity Model Response: {lowResponse}</p>
              <p>High Complexity Model Response: {highResponse}</p>
            </div>
            { scoresChangeable && <div className="after-response">
              <h4>Which gave better advice?</h4>
              <p className ="bullet-point">Low Complexity <button className="tiny-button" id="low" onClick={simpleVictory}><i className="fa fa-battery-empty" ></i></button></p>
              <p className ="bullet-point">High Complexity <button className="tiny-button" id="high" onClick={complexVictory}><i className="fa fa-battery-three-quarters"></i></button></p>
            </div> }
          </div>
        </div>
      </div>
      <div id="scores">
        <div className='border'>
          <div>
            <div id="title">
              <h4> User Scores <i className="fa fa-user" aria-hidden="true"></i></h4>
              <button id="clear" onClick={clearUserScores}>Clear</button>
            </div>
            <p>Low Complexity: {usrLowScr}</p>
            <p>High Complexity: {usrHighScr}</p>
          </div>
          <div>
            <h4> Global Scores <i className="fa fa-globe" aria-hidden="true"></i></h4>
            <p>Low Complexity: {glbLowScr}</p>
            <p>High Complexity: {glbHighScr}</p>
          </div>
        </div>
        <div/>
      </div>
    </>
  )
}

export default App

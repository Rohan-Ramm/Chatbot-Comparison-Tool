import { useState } from 'react'
import Searchbar from './Searchbar'
import ReactMarkdown from "react-markdown";

function QuestionPanel({ model1, model2, onModel1Change, onModel2Change,
character1,character2,onChar1Change,onChar2Change, 
onResponsesLoaded, models,characters, scoresChangeable}) {
  const [usrQuestion, setUsrQuestion] = useState("")
  const [qDisplay, setQDisplay] = useState("...")
  const [response1, setResponse1] = useState("N/A")
  const [response2, setResponse2] = useState("N/A")
  const [error, setError] = useState(null)

  const askQuestion = async (e) => {
    e.preventDefault()
    setQDisplay(usrQuestion)
    setResponse1("Loading...")
    setResponse2("Loading...")
    const ok = await getResponses()
    if (ok) onResponsesLoaded()
  }

  const getResponses = async () => {
    setError(null)
    try {
      const url = "http://localhost:5000/get_responses"
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usrQuestion, model1, model2, character1, character2 })
      }
      const response = await fetch(url, options)
      const message = await response.json()
      console.log(message)
      if (response.status == 201) {
        setResponse1(message["model1_response"])
        setResponse2(message["model2_response"])
        return true
      }
      setError(message["message"] || "An unknown error occurred")
      return false
    } catch (e) {
      setError(e.message || "Failed to reach the server")
      return false
    }
  }

  return (
    <>
      {error && (
        <div className="error-backdrop">
          <div className="error-modal">
            <p className="error-message">{error}</p>
            <button className="error-close" onClick={() => setError(null)}>Close</button>
          </div>
        </div>
      )}
      <div className="input-container">
        <form onSubmit={askQuestion}>
          <input 
            className="question-box"
            value={usrQuestion}
            onChange={(e) => setUsrQuestion(e.target.value)}
            placeholder="Ask a question"
          />
        </form>
      </div>
      <div className="model-selectors">
        <label className ="model-selector">
          <b>The Counselor</b>
          <i>{model1}</i>
          {!scoresChangeable && <Searchbar options={models} onSubmit={onModel1Change}/>}
          <i>{character1}</i>
          {!scoresChangeable && <Searchbar options={characters} onSubmit={onChar1Change}/>}
        </label>
        <label className ="model-selector">
          <b>The Consultant</b>
          <i>{model2}</i>
          {!scoresChangeable && <Searchbar options={models} onSubmit={onModel2Change}/>}
          <i>{character2}</i>
          {!scoresChangeable && <Searchbar options={characters} onSubmit={onChar2Change}/>}
        </label>
      </div>
      <div className='responses'>
        <div><b>You asked:</b> {qDisplay}</div>
        <div>
          <b>The Counselor: </b> 
          <ReactMarkdown>{response1}</ReactMarkdown>
        </div>
        <div>
          <b>The Consultant: </b> 
          <ReactMarkdown>{response2}</ReactMarkdown>
        </div>
      </div>
    </>
  )
}

export default QuestionPanel

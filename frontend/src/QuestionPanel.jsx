import { useState } from 'react'
import { MODELS } from './constants'

function QuestionPanel({ model1, model2, onModel1Change, onModel2Change, onResponsesLoaded }) {
  const [usrQuestion, setUsrQuestion] = useState("")
  const [response1, setResponse1] = useState("...")
  const [response2, setResponse2] = useState("...")

  const askQuestion = async (e) => {
    e.preventDefault()
    const ok = await getResponses()
    if (ok) onResponsesLoaded()
  }

  const getResponses = async () => {
    const url = "http://localhost:5000/get_responses"
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usrQuestion, model1, model2 })
    }
    const response = await fetch(url, options)
    const message = await response.json()
    console.log(message)
    if (response.status == 201) {
      setResponse1(message["model1_response"])
      setResponse2(message["model2_response"])
      return true
    }
    console.log(message["message"])
    return false
  }

  return (
    <>
      <div className="input-container">
        <form onSubmit={askQuestion}>
          <input
            value={usrQuestion}
            onChange={(e) => setUsrQuestion(e.target.value)}
            placeholder="Ask a question"
          />
        </form>
      </div>
      <div className="model-selectors">
        <label>
          Model 1:
          <select value={model1} onChange={(e) => onModel1Change(e.target.value)}>
            {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label>
          Model 2:
          <select value={model2} onChange={(e) => onModel2Change(e.target.value)}>
            {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
      </div>
      <div>
        <p>You said: {usrQuestion}</p>
        <p>{model1} Response: {response1}</p>
        <p>{model2} Response: {response2}</p>
      </div>
    </>
  )
}

export default QuestionPanel

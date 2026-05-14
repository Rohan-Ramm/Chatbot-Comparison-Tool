import { useState } from 'react'

function QuestionPanel({ onResponsesLoaded }) {
  const [usrQuestion, setUsrQuestion] = useState("")
  const [lowResponse, setLowResponse] = useState("... ")
  const [highResponse, setHighResponse] = useState("...")

  const askQuestion = async (e) => {
    e.preventDefault()
    await getResponses()
    onResponsesLoaded()
  }

  const getResponses = async () => {
    const url = "http://localhost:5000/get_responses"
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usrQuestion })
    }
    const response = await fetch(url, options)
    const message = await response.json()
    console.log(message)
    if (response.status == 201) {
      setHighResponse(message["complex_response"])
      setLowResponse(message["simple_response"])
    } else {
      console.log(message["message"])
    }
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
      <div>
        <p>You said: {usrQuestion}</p>
        <p>Low Complexity Model Response: {lowResponse}</p>
        <p>High Complexity Model Response: {highResponse}</p>
      </div>
    </>
  )
}

export default QuestionPanel

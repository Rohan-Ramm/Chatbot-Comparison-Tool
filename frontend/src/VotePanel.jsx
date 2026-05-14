function VotePanel({ scoresChangeable, model1, model2, onModel1Vote, onModel2Vote }) {
  if (!scoresChangeable) return null

  return (
    <div className="after-response">
      <h4>Which gave better advice?</h4>
      <p className="bullet-point">
        {model1} <button className="tiny-button" id="model1" onClick={onModel1Vote}><i className="fa fa-battery-empty"></i></button>
      </p>
      <p className="bullet-point">
        {model2} <button className="tiny-button" id="model2" onClick={onModel2Vote}><i className="fa fa-battery-three-quarters"></i></button>
      </p>
    </div>
  )
}

export default VotePanel

function VotePanel({ scoresChangeable, model1, model2, onModel1Vote, onModel2Vote }) {
  if (!scoresChangeable) return null

  return (
    <p className="after-response">
      <b>Which gave better advice?</b>
      <div className="bullet-point">
        {model1} <button className="tiny-button" id="model1" onClick={onModel1Vote}><i className="fa fa-thumbs-up"></i></button>
      </div>
      <div className="bullet-point">
        {model2} <button className="tiny-button" id="model2" onClick={onModel2Vote}><i className="fa fa-thumbs-up"></i></button>
      </div>
    </p>
  )
}

export default VotePanel

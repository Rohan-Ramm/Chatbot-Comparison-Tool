function VotePanel({ scoresChangeable, onModel1Vote, onModel2Vote }) {
  if (!scoresChangeable) return null

  return (
    <div className="after-response">
      <b>Which gave better advice?</b>
      <div className="bullet-point">
        The Counselor <button className="tiny-button" id="model1" onClick={onModel1Vote}><i className="fa fa-thumbs-up"></i></button>
      </div>
      <div className="bullet-point">
        The Consultant <button className="tiny-button" id="model2" onClick={onModel2Vote}><i className="fa fa-thumbs-up"></i></button>
      </div>
    </div>
  )
}

export default VotePanel

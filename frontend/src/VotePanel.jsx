function VotePanel({ scoresChangeable, onSimpleVote, onComplexVote }) {
  if (!scoresChangeable) return null

  return (
    <div className="after-response">
      <h4>Which gave better advice?</h4>
      <p className="bullet-point">
        Low Complexity <button className="tiny-button" id="low" onClick={onSimpleVote}><i className="fa fa-battery-empty"></i></button>
      </p>
      <p className="bullet-point">
        High Complexity <button className="tiny-button" id="high" onClick={onComplexVote}><i className="fa fa-battery-three-quarters"></i></button>
      </p>
    </div>
  )
}

export default VotePanel

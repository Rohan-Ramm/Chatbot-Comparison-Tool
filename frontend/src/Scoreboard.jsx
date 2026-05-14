function Scoreboard({ usrLowScr, usrHighScr, glbLowScr, glbHighScr, onClear }) {
  return (
    <div id="scores">
      <div className='border'>
        <div>
          <div id="title">
            <h4> User Scores <i className="fa fa-user" aria-hidden="true"></i></h4>
            <button id="clear" onClick={onClear}>Clear</button>
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
  )
}

export default Scoreboard

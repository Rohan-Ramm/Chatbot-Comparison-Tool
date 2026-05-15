import { MODELS } from './constants'

function Scoreboard({ usrScores, glbScores, onClear }) {
  return (
    <div id="scores">
      <div className='border'>
        <div>
          <div id="title">
            <h4> User Scores <i className="fa fa-user" aria-hidden="true"></i></h4>
            <button id="clear" onClick={onClear}>Clear</button>
          </div>
          {MODELS.map(model => (
            <p key={model}>{model}: {usrScores[model]}</p>
          ))}
        </div>
        <div>
          <h4> Global Scores <i className="fa fa-globe" aria-hidden="true"></i></h4>
          {MODELS.map(model => (
            <p key={model}>{model}: {glbScores[model]}</p>
          ))}
        </div>
      </div>
      <div/>
    </div>
  )
}

export default Scoreboard

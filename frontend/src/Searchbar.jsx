import { useState } from "react";

const getFilteredOptions = (input,options) => {
    if (!input) {
        return options
    }
    return options.filter(item => item.toLowerCase().includes(input.toLowerCase()))
};

function Searchbar ({name, options=[], onSubmit}){
    const [input,setInput] = useState("")
    const [isFocused, setIsFocused] = useState(false);
    
    const filteredOptions = getFilteredOptions(input,options)

    return (
        <div>
            <label>{name} </label>
            <input 
                placeholder="type here" 
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => {
                    if (e.key == "Enter") {
                        if (input) {
                            onSubmit(input)
                        }
                        setInput("")
                    }
                }}
            />
            {isFocused && 
            (<div className="search-results">
               {filteredOptions.map((item) => (
                    <div key={item} onMouseDown={() => setInput(item)}>{item}</div>
               ))}
            </div>)}
        </div>
    );
}

export default Searchbar
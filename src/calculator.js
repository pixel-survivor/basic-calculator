const displayText = document.getElementById("entry-display");
const signText = document.getElementById("sign-change");
const historyText = document.getElementById("last-number");

//Logic for moving calculator----------------------------------------/
const calcBox = document.getElementById("calculator");
calcBox.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/html", event.target.textContent);
});
document.addEventListener("dragover", (event) => {
    event.preventDefault();
});
document.addEventListener("drop", (event) => {
    event.preventDefault();
    const droppedX = event.clientX;
    const droppedY = event.clientY;
    calcBox.style.top = droppedY + "px";
    calcBox.style.left = droppedX + "px";
});
//Calculator Logic---------------------------------------------------/

displayText.textContent = 0; //initialize

let storedOperand = null;
let selectedOperand = null;
let storedNumber = null;

const numberIds = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const operandIds = ["percent", "divide", "multiply", "subtract", "add"];
const operationIds = ["clear-entry", "clear", "backspace", "inverse", "square", "square-root", "pos-neg", "equal", "decimal"];

let buttonIds = [];

numberIds.forEach(num => buttonIds.push(num));
operandIds.forEach(operand => buttonIds.push(operand));
operationIds.forEach(operation => buttonIds.push(operation));

const storedNumberText = () => {
    if(!isNumberStored()){
        historyText.textContent = '';
    }
    else{
        historyText.textContent = storedNumber;
    }
}

const operandSigns = ['%', '\u00F7', '\u00D7', '-', '+'];

const operandFunctions = {
    "add": (a, b) => a + b,
    "subtract": (a, b) => a - b,
    "multiply": (a, b) => a * b,
    "divide": (a, b) => a / b,
    "percent": (a) => a / 100,
};

const performOperation = {
    "clear-entry": () => {
        displayText.innerText = 0;

    },
    "clear": () => {
        storedOperand = null;
        selectedOperand = null;
        storedNumber = null;
        storedNumberText();
        signText.textContent = '';
        displayText.textContent = 0;
    },
    "inverse": () => {
        displayText.textContent = Math.pow(displayText.textContent, -1);
    },
    "square": () => displayText.textContent = displayText.textContent * displayText.textContent,
    "square-root": () => displayText.textContent = Math.sqrt(displayText.textContent),
    "pos-neg": () => displayText.textContent = displayText.textContent * -1,
    "equal": () => {
        if(isOperandStored()){
            let temp = parseFloat(displayText.textContent);
            displayText.textContent = operandFunctions[storedOperand](storedNumber, parseFloat(displayText.textContent));
            storedNumber = temp;
            storedNumberText();
            //----->Hide storedNumber after equal
            historyText.textContent = '';
            //----->Hide sign after equal
            signText.style.visibility = "hidden";
            selectedOperand = null;
            storedOperand = null;
        }
        else{   
            if(isNumberStored()){
                signText.style.visibility = "visible";
                storedNumberText();
                historyText.style.color = '#C22FB1';
                signText.style.color = '#C22FB1';

                //if equal is pressed in succession
                selectedOperand = signText.textContent;
                //pulls from the HTML to 'force' a selectedOperand
                storedOperand = operandSigns.indexOf(selectedOperand);
                //gets index to search operandIds
                storedOperand = operandIds[storedOperand];
                //stores the respective operandId
                
                displayText.textContent = operandFunctions[storedOperand](parseFloat(displayText.textContent), parseFloat(storedNumber));
                //in this case, storedNumber comes second due to subtraction and division
                selectedOperand = null;
                storedOperand = null;
                //nullify in case 'equal' is clicked again
            }
        }
    },
    "decimal": () => {
        if(!displayText.textContent.includes('.')){
            displayText.textContent = displayText.textContent + '.'
        }
    },
    "backspace": () => {
        let a = displayText.textContent.length;
        if(a >= 2){
        displayText.textContent = displayText.textContent.slice(0, -1);
        }
        else{
            displayText.textContent = 0;
        }
    }
};

const isNumberId = clickedId => numberIds.includes(clickedId);
const isOperandId = clickedId => operandIds.includes(clickedId);
const isNumberStored = () => storedNumber !== null;
const isOperandSelected = () => selectedOperand !== null;
const isOperandStored = () => storedOperand !== null;

const isCleared = () => {
    if(
        !isOperandStored() &&
        !isOperandSelected() &&
        !isNumberStored() &&
        parseFloat(displayText.textContent) === 0
    ){
        return true;
    }
    else{
        return false;
    }
}

const didOperandChange = (previous, current) => {
    if(previous !== current){
        return true;
    }
    else{
        return false
    };
}

const updateSign = clickedId => {
    signText.textContent = operandSigns[operandIds.indexOf(clickedId)];
};

const handleButtonClick = click => {
    const clickedButtonId = click.target.id;

    if(signText.style.color != '#114b3f' || signText.style.color != '#114b3f'){
        //CSS condition statement, no effect on logic.
        if(isOperandId(clickedButtonId)){
            signText.style.color = '#114b3f';
        }
        else{
            historyText.style.color = '#114b3f';
        }
    }

    if(isNumberId(clickedButtonId)){
        signText.style.visibility = "visible";
        let clickedNumber = numberIds.indexOf(clickedButtonId);

        if(isCleared()){
            if(clickedNumber != 0 && !displayText.textContent.includes('.')){
                //avoids appending to 0, avoids overriding decimal which was has a zero in front
                displayText.textContent = clickedNumber;
            }
            else{
                displayText.textContent += clickedNumber;
            }
        }

        else if(!isOperandStored()){    
            //if there is no operand stored, it must be the 'first' number.

            if(isOperandSelected()){
                /*if the number was pressed after selecting an operand,
                  storeOperand, nullify selectedOperand,
                  start the 'second' number */
                storedOperand = selectedOperand;                    
                selectedOperand = null;
                storedNumber = parseFloat(displayText.textContent);
                storedNumberText();
                displayText.textContent = clickedNumber;     
            
            }
            else if(isNumberStored()){
                //special-case for equal, this generates a new 'first' number
                storedNumber = null;
                storedNumberText();
                signText.textContent = '';
                displayText.textContent = clickedNumber;
            }
            else{
                //appends number to the 'first' number
                displayText.textContent += clickedNumber;
            }
        }

        else{
            //there is an operand stored, and therefore a storedNumber
            //this area applies for the 'second' number
            if(displayText.textContent != 0 || displayText.textContent.includes('.')){
                //avoids appending to 0
                displayText.textContent += clickedNumber;
            }
            else{
                if(clickedNumber != 0){
                    //second number isn't 0
                    displayText.textContent = clickedNumber;
                }
            }
        }
    }

    else if(isOperandId(clickedButtonId)){
        signText.style.visibility = "visible";

        if(clickedButtonId == 'percent' && !isOperandSelected()){
            //special case for percent
            displayText.textContent = operandFunctions[clickedButtonId](displayText.textContent);
        }
        else if(!isOperandSelected()){
            selectedOperand = clickedButtonId;
            updateSign(selectedOperand);
            if(isOperandStored()){
                displayText.textContent = operandFunctions[storedOperand](storedNumber, parseFloat(displayText.textContent));
                storedOperand = null;
                historyText.textContent = '';
            }   
        }
        else{
            if(didOperandChange(selectedOperand, clickedButtonId) && clickedButtonId != 'percent'){
                selectedOperand = clickedButtonId;
                updateSign(selectedOperand);
            }
        }
    }

    else{
    //OperationId was clicked
        if(!isOperandSelected()){
            //Cannot be clicked when an operand is currently selected
            switch(clickedButtonId){
                case 'backspace':
                    performOperation[clickedButtonId]();
                    break;
                case 'inverse':
                    performOperation[clickedButtonId]();
                    break;
                case 'square':
                    performOperation[clickedButtonId]();
                    break;
                case 'square-root':
                    performOperation[clickedButtonId]();
                    break;
                case 'equal':
                    performOperation[clickedButtonId]();
                    break;
            }
        }
        
        switch(clickedButtonId){    
            //Can be clicked regardless if an operand is currently selected or not
            case 'clear':
                performOperation[clickedButtonId]();
                break;
            case 'clear-entry':
                performOperation[clickedButtonId]();
                break;
            case 'pos-neg':
                if(!isOperandSelected()){
                    //if an operand is not selected, change the sign of the number
                    performOperation[clickedButtonId]();
                }
                break;
            case 'decimal':
                if(isOperandSelected()){
                    if(!isOperandStored()){
                        /*If an operand is selected but one isn't stored, it means there is no number stored
                        --if there is no number stored, store the number and selectedOperand, create a new number '0.'*/
                        storedNumber = parseFloat(displayText.textContent);
                        storedNumberText();
                        displayText.textContent = 0;
                        performOperation[clickedButtonId]();
                        storedOperand = selectedOperand;
                        selectedOperand = null;
                    }
                }
                else if(isNumberStored() && !isOperandStored()){
                    /*If there is a number stored, but not an operand selected, or operand stored, 
                    --it means it was cleared out by the equal sign. 
                    --if the person is clicking decimal after equal, it starts a new number*/
                    storedNumber = null;
                    storedNumberText();
                    displayText.textContent = 0;
                    performOperation[clickedButtonId]();
                }
                else{
                    //this only runs if there is no current existing decimal in an existing number
                    performOperation[clickedButtonId]();
                }
                break;

        }
        
    }
}

//adds EventListener that executes handleButtonClick when ANY button is clicked.
buttonIds.forEach((buttonId) => {
    document.getElementById(buttonId).addEventListener("click", handleButtonClick);
    }
);  
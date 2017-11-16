document.addEventListener('DOMContentLoaded',()=>{

const container = document.getElementById('saper__container');
let bombsIDs = [],
    fieldList = [],//table of table of objects
    counter = 0,
    revealedFields = [],
    fieldWidth=10;//the fild has 10 columns and 10 rows

const easyLevel = 0.15;
const mediumLevel = 0.35;
const hardLevel = 0.5;

let level = easyLevel;
let bombsNr=Math.floor(fieldWidth * fieldWidth * level);

document.getElementById('saper__container').classList.add(`width__${fieldWidth}`);

function startGame(){
  level=easyLevel;
  fieldWidth=10;
  createDataArray(fieldWidth);
  drawBombs(fieldWidth,bombsNr);

  fieldList.forEach((row,rowId)=>{//add bombs to array of objects
      row.forEach((col,colId)=>{
        if(!bombsIDs.includes(col.id)){
            countBombs(col);
        }
      })
    })
}

function checkGameStatus(revealedFields){
  if(revealedFields.length===counter - bombsNr){
  console.log('you won');
  }
}

function createDataArray(fieldWidth){//Create two dimensional array with objects
  for(let i=0; i<fieldWidth; i++){//row
    fieldList.push([]);
    for(let j=0;j<fieldWidth;j++){//column
      counter++;//counter starts from 1, shows actual number of fields
      let fieldObject={id:counter,row:i,column:j,className:'field',revealed:false};
      fieldList[i].push(fieldObject);//add field to array
      populateFields(fieldObject);//populate objects here so that bombs are not shown in HTML data
    }
  }
}

function drawBombs(fieldWidth,bombsNr){
  let bombsArray = new Array(bombsNr),
      fields = [],
      counter=fieldWidth * fieldWidth;
      taken=new Array(bombsNr);
  for(let i=0;i<counter-1;i++){//create array filled with idx
      fields.push(i);
  }
  while (bombsNr--) {
      let bomb = Math.floor(Math.random() * counter);
      bombsArray[bombsNr] = fields[bomb in taken ? taken[bomb] : bomb];
      taken[bomb] = --counter;
  }
  bombsIDs = bombsArray;
  fieldList.forEach((row,rowId)=>{//add bombs to array of objects
    row.forEach((col,colId)=>{
      if(bombsArray.includes(col.id)){
        col.hasBomb=true;
        document.getElementById(`${col.id}`).classList.add('bomb');
      }
    })
  })
}

function countBombs(field){
  let nearBombs=0,
      fieldID=field.id,
      fieldRow=field.row,
      fieldColumn=field.column;
  for(let i = (fieldRow-1); i <= (fieldRow + 1);i++){//check previous,current and next row
      if (i>=0 && i<=(fieldWidth-1)){//limits for border fields
        for(let j = (fieldColumn-1); j<=(fieldColumn + 1);j++){//check previous,current and next column
            if (j>=0 && j<=(fieldWidth-1)){//limits for border fields
            if(bombsIDs.includes(fieldList[i][j].id)){
              nearBombs++;
            }
            }
        }
      }
  }
  fieldList[fieldRow][fieldColumn].nearBombs=nearBombs;//add nearBombs to array of fields
}

function populateFields(fieldObject){
  let fieldDiv = document.createElement('div');
  fieldDiv.id=fieldObject.id;
  fieldDiv.dataset.row=fieldObject.row;
  fieldDiv.dataset.column=fieldObject.column;
  fieldDiv.className=fieldObject.className;
  container.appendChild(fieldDiv);
}


container.addEventListener('click',(e)=>{
  checkField(e.target,bombsIDs);
  checkGameStatus(revealedFields);
})

container.addEventListener('contextmenu',(e)=>{
  // e.preventDefault();
  // e.target.classList.toggle('marked');//mark bomb
})



function checkField(field,bombsIDs){
  bombsIDs.indexOf(parseInt(field.id))>=0 ?  gameOver(fieldList,bombsIDs) : reveal(field,bombsIDs);
}


function gameOver(fieldList,bombsIDs){//reveal all bombs
  console.log("GAME OVER");
  fieldList.forEach((row)=>{
    row.forEach((col)=>{
      if(bombsIDs.includes(col.id)){
        document.getElementById(`${col.id}`).classList.add('bomb');
      }
    })
  })
}


function reveal(field,bombsIDs){
  let fieldID=parseInt(field.id);
  let fieldRow=parseInt(field.dataset.row);
  let fieldColumn=parseInt(field.dataset.column);
  let fieldObject=fieldList[fieldRow][fieldColumn];
  if(fieldObject.nearBombs==0){
      if(!revealedFields.includes(fieldObject.id)){//if empty field is not already revealed
          revealedFields.push(fieldObject.id);//add to revealed and reveal
          revealAround(fieldObject.id,fieldObject.row,fieldObject.column);
      }
  }else if(fieldObject.nearBombs>0){
      if(!revealedFields.includes(fieldObject.id)){//if field is not already revealed
          revealedFields.push(fieldObject.id);
          showNumberOfBombs(fieldObject);
      }
    }
}

function showNumberOfBombs(field){
  let bombNumberField = document.getElementById(field.id);
  bombNumberField.classList.add(`bombs_${field.nearBombs}`);
  bombNumberField.classList.add('revealed');
  bombNumberField.innerText = field.nearBombs;

}

  function revealAround(id,row,column){
    let field=document.getElementById(id);//starting point
    field.classList.add('empty');
    if(!revealedFields.includes(fieldList[row][column].id)){
      revealedFields.push(fieldList[row][column].id);
    }
    let emptyFields=[];
    for(let i = (row-1); i <= (row + 1);i++){//check previous,current and next row
        if (i>=0 && i<=(fieldWidth-1)){//limits for border fields
          for(let j = (column-1); j<=(column + 1) ;j++){//check previous,current and next column
              if (j>=0 && j<=(fieldWidth-1)){//limits for border fields
                let currentField = document.getElementById(fieldList[i][j].id);
              if(!fieldList[i][j].hasBomb//has no bomb
                && fieldList[i][j].nearBombs===0
                && !currentField.classList.contains('empty')){
                      emptyFields.push(fieldList[i][j].id);
                      if(!revealedFields.includes(fieldList[i][j].id)){
                          revealedFields.push(fieldList[i][j].id);
                      }
                  currentField.classList.add('empty');
                  checkGameStatus(revealedFields);
              }else if(!fieldList[i][j].hasBomb//has no bomb
                && fieldList[i][j].nearBombs>0
                && !currentField.classList.contains('revealed')){
                  currentField.classList.add('revealed');
                  currentField.classList.add(`bombs_${fieldList[i][j].nearBombs}`);
                  currentField.innerText = fieldList[i][j].nearBombs;
                  if(!revealedFields.includes(fieldList[i][j].id)){
                      revealedFields.push(fieldList[i][j].id);
                  }

                  checkGameStatus(revealedFields);
                  break;
              }
            }
          }
        }
    }
    if(emptyFields.length>0){
      floodfill(emptyFields);
    }
  }


function floodfill(emptyFields){
  emptyFields.forEach((emptyField)=>{
  let element = document.getElementById(emptyField);
  revealAround(element.id,element.dataset.row,element.dataset.column);
  })
  checkGameStatus(revealedFields);
}
startGame();
})

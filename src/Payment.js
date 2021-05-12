if(document.readyState== 'loading'){
    document.addEventListener('DOMContentLoaded', ready)
}
else{
    ready()
}

function ready(){
    var addButton= document.getElementsByClassName('td-btn');
    console.log(addButton);
}


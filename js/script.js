function getDate(){
  var today = new Date();
  var year = today.getFullYear();
  document.getElementById("currentDate").innerHTML = year;
}

getDate();
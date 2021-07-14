var tasks = {};

//accept the li el as parameter in case we need to add classes
var auditTask = function(taskEl){
  //get date from task el
  var date =$(taskEl).find("span").text().trim();
  console.log(date);
  //convert to moment object at 5:00 pm
  var time = moment(date, "L").set("hour", 17);
  //get rid of old classes of target el
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
  //apply new class if task is nearing/past due date
  if(moment().isAfter(time)){
    //"warning" and "danger" are yellow and red respectivly
    $(taskEl).addClass("list-group-item-danger");
  }
  else if(Math.abs(moment().diff(time, "days")) <= 2){
    $(taskEl).addClass("list-group-item-warning");
  }
};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(taskDate);
  var taskP = $("<p>").addClass("m-1").text(taskText);
  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);
  //check the due date to see how near it is using that moment funciton
  auditTask(taskLi);
  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));
};
  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    //console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//method for dragging tasks into new categories
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  //tells jquery to make a copy of drag el and move the copy
  herlper: "clone",
  activate: function(event, ui){
    console.log(ui);
  },
  deactiviate: function(event, ui){
    console.log(ui);
  },
  over: function(event){
    console.log(event);
  },
  out: function(event){
    console.log(event);
  },
  update: function(){
    var tempArr  = [];
    //loop thru current children in sortable list
    $(this).children().each(function(){
      //set values in temp arr[] & add task data to temp arr as a object
      tempArr.push({
        text: $(this).find("p").text().trim(),
        date: $(this).find("span").text().trim()
      });
    });
    //trim lists id to match object property
    var arrName = $(this).attr("id").replace("list-", "");
    //update arr on tasks object and save it
    tasks[arrName] =tempArr;
    saveTasks();
  },
    stop: function(event){
      $(this).removeClass("dropover");
  }
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  //delete task
  drop: function(event, ui){
    ui.draggable.remove();
  },
  over: function(event, ui){
    console.log(ui);
  },
  out: function(event, ui){
    console.log(ui);
  }
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

  //FUNCTION listener for text area 
$(".list-group").on("click", "p", function() {
  var text = $(this).text().trim();
  var textInput = $("<textarea>").addClass("form-control").val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});
  
  $(".list-group").on("blur", "textarea", function() {
    // get the textarea current value/text
      var text = $(this).val();
    // get the parent ul id attribute
      var status = $(this).closest(".list-group").attr("id").replace("list-", "");
    // get the task position in the list of other li elements
      var index = $(this).closest(".list-group-item").index();
      tasks[status][index].text = text;
      saveTasks();
      // recreate p element
  var taskP = $("<p>").addClass("m-1").text(text);  
  // replace textarea with p element
  $(this).replaceWith(taskP);
  });

  //FUNCTION listener for due date click 
$(".list-group").on("click", "span", function(){
  //get current text
  var date = $(this).text().trim();
  //make new input el
  var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);
  //swap the elements
  $(this).replaceWith(dateInput);
  //allow jquery to use ui datepicker
  dateInput.datepicker({
    minDate:1,
    onClose: function(){
      //when calanedaer is closed, force change event on dateInput
      $(this).trigger("change");
    }
  });
  //focus on a new element
  dateInput.trigger("focus");
}); 

// value of due date was changed
$(".list-group").on("change", "input[type='text']", function() {
  var date = $(this).val();

  // get status type and position in the list
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");
  var index = $(this).closest(".list-group-item").index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span and insert in place of input element
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);
  $(this).replaceWith(taskSpan);
  //pass tasks li el to autitask to check the new due date fater the change
  auditTask($(taskSpan).closest(".list-group-item"));
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

//load tasks for the first time
loadTasks();

//select <input> el w id = modalduedate using jquery and chain .datepicker() method to it
//Due date drop down calendar
$("#modalDueDate").datepicker({
  minDate: 1
});


var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

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
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//MY CODE HERE:
//FUNCTION listener for text area 
$(".list-group").on("click", "p", function() {
  var text = $(this).text().trim();
  var textInput = $("<textarea>").addClass("form-control").val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");

  //nested blur function listener...for some reasont his works unlike how the module says to have them seperate but whatever for now
  $(".list-group").on("blur", "textarea", function() {
  // get the textarea current value/text
    var text = $(this).val().trim();
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
});

//MY CODE HERE:
//FUNCTION listener for due date click 
$(".list-group").on("click", "span", function(){
  //get current text
  var date = $(this).text().trim();
  //make new input el
  var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);
  //swap the elements
  $(this).replaceWith(dateInput);
  //focus on a new element
  dateInput.trigger("focus");

  //nested blur listener see of this works aginayayy
  $(".list-group").on("blur", "input[type = 'text']", function(){
    //get current text
    var date = $(this).val().trim();
    //get parent ul id attr
    var status = $(this).closest(".list-group").attr("id").replace("list-", "");
    //get task position in li list
    var index = $(this).closest(".list-group-item").index();
    //update task in arr and resave to localstorage
    tasks[status][index].date = date;
    saveTasks();
    //recreate span el w/ boostrap classes
    var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);
    //replace input w span el
    $(this).replaceWith(taskSpan);
  });
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

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();
//method for dragging tasks into new categories
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  //tells jquery to make a copy of drag el and move the copy
  herlper: "clone",
  activate: function(event){
    console.log("activate", this);
  },
  deactiviate: function(event){
    console.log("deactivate", this);
  },
  over: function(event){
    console.log("over", event.target);
  },
  update: function(event){
    var tempArr  = [];
    //loop thru current children in sortable list
    $(this).children().each(function(){
      var text = $(this).find("p").text().trim();
      var date = $(this).find("span").text().trim();
      //add task data to temp arr as a object
      tempArr.push({
        text:text,
        date: date
      });
    });
    //trim lists id to match object property
    var arrName = $(this).attr("id").replace("list", "");
    //update arr on tasks object and save it
    tasks[arrName] =tempArr;
    saveTasks();
  }
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  //delete task
  drop: function(event, ui){
    ui.draggable.remove();
    console.log("over");
  },
  out: function(event, ui){
    console.log("out");
  }
});

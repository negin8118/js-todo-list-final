//ایجاد متغیر برای دریافت ورودی از html
const taskInput = document.querySelector('#taskInput');
const list = document.querySelector('#taskList');
const AddBtn = document.querySelector('#AddBtn');
const Error = document.querySelector('#error');
const filterButtons = document.querySelectorAll('.nav-link');
const todoCount = document.querySelector('#todoCount');
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

//برای چک کردن تسک وارد شده (اگر فارسی باشد لیست راست چین میشود)
const isFarsi = (text) => {
  const rtlPattern = /[\u0600-\u06FF]/;
  return rtlPattern.test(text);
}

//متد شمردن تعداد تسک های انجام شده نسبت به کل
const updateCount = () => {
  const total = todos.length;
  const completed = todos.reduce((count, todo) => count + (todo.completed ? 1 : 0), 0);
  if(completed == total && total > 0)
  {
     todoCount.textContent = `All tasks are done! yay🎉`;
  }
  else {
   todoCount.textContent = `${completed}/${total} completed`;
  }


};

//رندر کردن برنامه با توجه به لیست غربال شده
const render = (filteredTodos) => {
  list.innerHTML = '';

  filteredTodos.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center border-0 mb-2 rounded todo-item';


      //ایجاد چک باکس برای مشخص کردن کار انجام شده
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.completed;
      checkbox.className = 'form-check-input me-2';

      checkbox.addEventListener('change', () => {
        todos = todos.map(t =>
          t.id === todo.id ? { ...t, completed: checkbox.checked } : t
        );

        li.classList.toggle('completed', checkbox.checked);
        updateCount();

        localStorage.setItem('todos', JSON.stringify(todos));


        filteredTodos = filterState(currentFilter);
        render(filteredTodos);
      });

      li.appendChild(checkbox);


    const textSpan = document.createElement('span');
    textSpan.textContent = todo.text;
    textSpan.className = 'flex-grow-1';

    //راست چین کردن تسک درصورتی که فارسی بود
    if (isFarsi(todo.text)) {
     textSpan.style.textAlign = 'right';
     textSpan.style.direction = 'rtl';
     li.style.flexDirection = 'row-reverse';
     } else {
       textSpan.style.textAlign = 'left';
       textSpan.style.direction = 'ltr';
       li.style.flexDirection = 'row';
     }

    //سبز کردن و خط کشیدن روی تسک پس از کامل شدن آن
    if (todo.completed) {
      textSpan.classList.toggle('text-completed');
      li.classList.toggle('completed');
    }

//قابلبت ادیت کردن تسک با دابل کلیک
  textSpan.addEventListener('dblclick', () => {
  textSpan.contentEditable = 'true';
  textSpan.focus();
  });

textSpan.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    textSpan.blur();
  }
});

  textSpan.addEventListener('blur', () => {
  const newText = textSpan.textContent.trim();
  //در صورت خالی شدن تسک بعد از ادیت اخطار به کاربر داده میشود
  if (!newText) {
    alert('you can\'t leave a Task empty!');
    textSpan.textContent = todo.text;
    return;
  }

  todos = todos.map(t =>
    t.id === todo.id ? { ...t, text: newText } : t
  );

  localStorage.setItem('todos', JSON.stringify(todos));
  textSpan.contentEditable = 'false';
});

//دکمه دیلیت به هر تسک در لیست اضافه میشود
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'btn btn-danger btn-sm ms-2';

    deleteBtn.addEventListener('click', () => {
      todos = todos.filter(t => t.id !== todo.id);
      updateCount();

      localStorage.setItem('todos', JSON.stringify(todos));
      render(filterState(currentFilter));
    });

    li.appendChild(textSpan);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
};

//فیلتر کردن آرایه تسک ها با توجه به وضعیت
const filterState = (currentFilter) => {
  let filteredTodos;

  if (currentFilter === 'all') {
    filteredTodos = todos;
  } else if (currentFilter === 'active') {
    filteredTodos = todos.filter(t => !t.completed);
  } else {
    filteredTodos = todos.filter(t => t.completed);
  }
  return filteredTodos;
};

//با زدن دکمه Enter دکمه Add برای اضافه کردن تسک جدید فعال میشود
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') AddBtn.click();
});

//با زدن دکمه Add تسک جدید وارد شده به لیست اضافه میشود
AddBtn.addEventListener('click', () => {
  const newTask = taskInput.value.trim();
//در صورتیکه تسک وارد شده خالی باشد پیام اخطار به کاربر داده میشود
  if (!newTask) {
  alert("please write a task!");
  return;
  }
//یک آبجکت جدید todo ایجاد میشود
  const newTodo = {
    id: Date.now(),
    text: newTask,
    completed: false
  };

  todos = [...todos, newTodo];
  updateCount();

  localStorage.setItem('todos', JSON.stringify(todos));
  taskInput.value = '';
  filteredTodos = filterState(currentFilter);
  render(filteredTodos);
});

//نسبت به هر وضعیت all,active و completed لیست فیلتر شده مربوط به آن نشان داده میشود
filterButtons.forEach(button => {
  button.addEventListener('click', () => {

    filterButtons.forEach(btn => btn.classList.remove('active'));
    list.innerHTML = '';
    let filteredTodos = [];
    button.classList.add('active');
    const filter = button.dataset.filter;
    filteredTodos = filterState(filter);
    currentFilter = filter;
    render(filteredTodos);
  });
});

//در آخر رندر نسبت به وضعیت از قبل مشخص شده
render(filterState(currentFilter));
//نشان دادن تعداد کارهای انجام شده یه کل
updateCount();

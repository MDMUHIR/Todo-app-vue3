<script setup>
import { computed, ref } from "vue";
import todos from "../data";
import fn from "../localhost";

const searchTaskInput = ref("");
const togAddingTodo = ref(false);
const newTask = ref("");
let nextId = todos.length + 1;

const newTaskTimePeriod = ref("");
const newTaskHour = ref(null);
const newTaskMin = ref(null);

const currentTab = ref("all");
const currentlyEditing = ref(null);

const getStorageData = () => {
  todos.length = 0;
  const storedTodos = fn.getTodosStorage();
  storedTodos.forEach((todo) => {
    todos.push(todo);
  });
  nextId = todos.length + 1;
};
getStorageData();

const getTodos = () => {
  if (currentTab.value == "active") {
    return todos.filter((todo) => {
      if (!todo.completed) {
        return todo;
      }
    });
  } else if (currentTab.value == "completed") {
    return todos.filter((todo) => {
      if (todo.completed) {
        return todo;
      }
    });
  } else if (searchTaskInput.value) {
    return todos.filter((todo) => {
      if (
        todo.task.toLowerCase().includes(searchTaskInput.value.toLowerCase())
      ) {
        return todo;
      }
    });
  } else {
    return todos;
  }
};

const newTaskTime = () => {
  if (newTaskHour.value == null) {
    return `N/A`;
  } else if (newTaskMin.value == null) {
    return `${newTaskHour.value} : 00`;
  } else {
    return `${newTaskHour.value} : ${newTaskMin.value}`;
  }
};

const addNewTask = () => {
  if (newTask.value == "") {
    alert("The Task Input Is Empty");
  } else if (newTaskHour.value == !null && newTaskTimePeriod.value == "") {
    alert("Please select a period of time...");
  } else {
    console.log(nextId);
    console.log(newTask.value);
    todos.push({
      id: nextId,
      task: newTask.value,
      time: newTaskTime(),
      timeFormat: newTaskTimePeriod.value,
      completed: false,
    });
    newTask.value = "";
    newTaskHour.value = null;
    newTaskMin.value = null;
    newTaskTimePeriod.value = "";

    nextId++;
  }

  fn.updateTodosStorage(todos);
};

const toggleTaskStatus = () => {
  console.log(todos);
  fn.updateTodosStorage(todos);
};

const deleteTask = (id) => {
  let tempTodos = JSON.parse(JSON.stringify(todos));
  todos.length = 0;
  tempTodos = tempTodos.map((todo) => {
    if (todo.id != id) {
      todos.push(todo);
    }
  });
  fn.updateTodosStorage(todos);
};

const updateTask = () => {
  currentlyEditing.value = null;
  fn.updateTodosStorage(todos);
};

const getRemainingTask = () => {
  let remaining = 0;
  let total = todos.length;
  todos.forEach((todo) => {
    if (!todo.completed) {
      remaining++;
    }
  });
  return `${remaining} of ${total} left`;
};

const clearTodos = () => {
  if (currentTab.value == "active") {
    let tempTodos = JSON.parse(JSON.stringify(todos));
    todos.length = 0;
    tempTodos = tempTodos.map((todo) => {
      if (todo.completed) {
        todos.push(todo);
      }
    });
  } else if (currentTab.value == "completed") {
    let tempTodos = JSON.parse(JSON.stringify(todos));
    todos.length = 0;
    tempTodos = tempTodos.map((todo) => {
      if (!todo.completed) {
        todos.push(todo);
      }
    });
  } else {
    todos.length = 0;
  }
  fn.updateTodosStorage(todos);
};
</script>

<template>
  <div
    class="h-screen md:container md:mx-auto bg-zinc-700 relative rounded-lg border-4"
  >
    <div class="todos-top text-center w-full p-2">
      <h1 class="heading text-yellow-200 text-3xl font-bold">Muhir's Todos</h1>
      <div class="search-option w-full px-5">
        <input
          v-model="searchTaskInput"
          type="text"
          placeholder="Search todos"
          class="block w-full p-2 mt-5 text-white border border-zinc-300 rounded-lg bg-zinc-500 sm:text-xs focus:border-blue-500 focus:outline-none"
        />
      </div>
    </div>

    <!-- todo list  -->
    <div class="todo-list overflow-y-auto p-5 rounded">
      <template v-for="todo in getTodos()" :key="todo.id">
        <div
          v-if="currentlyEditing != todo.id"
          @dblclick="currentlyEditing = todo.id"
          class="todo flex items-center p-2 rounded-md mt-4 relative bg-stone-950"
        >
          <input
            @change="toggleTaskStatus()"
            v-model="todo.completed"
            type="checkbox"
            class="w-5 h-5 accent-pink-500"
          />
          <label
            @click="todo.completed = !todo.completed"
            class="ms-2 text-2xl font-medium"
            :class="
              todo.completed ? 'text-gray-500 line-through' : 'text-gray-100'
            "
            >{{ todo.task }}</label
          >
          <span
            class="ms-3 p-1 font-bold text-xl rounded absolute right-12"
            :class="todo.timeFormat == 'Am' ? 'bg-blue-300' : 'bg-orange-400'"
            ><span class="bg-white px-1 rounded italic font-semibold">{{
              todo.time
            }}</span>
            {{ todo.timeFormat }}</span
          >

          <button
            @click="deleteTask(todo.id)"
            type="button"
            class="text-red-500 hover:text-red-800 focus:ring-1 focus:ring-red-300 font-medium px-2 rounded-full text-2xl text-center absolute right-1"
          >
            <i class="bi bi-trash3-fill"></i>
          </button>
        </div>

        <!-- Edit Feild -->
        <div v-else class="w-full">
          <form
            @submit.prevent="updateTask()"
            class="flex items-center p-2 rounded-md mt-4 relative bg-stone-950"
          >
            <input
              v-model="todo.task"
              @keyup.enter="updateTask()"
              type="text"
              placeholder="Search todos"
              class="block w-full p-2 text-white rounded rounded-r-none bg-zinc-500 focus:border-0 focus:outline-none"
            />
            <button
              class="bg-red-500 hover:bg-red-900 transition-all text-white font-bold rounded rounded-l-none float-end px-3 py-2"
            >
              ok
            </button>
          </form>
        </div>
        <!-- //// -->
      </template>
    </div>

    <!--                       Bottom part                           -->
    <!-- add todo -->
    <div
      v-show="togAddingTodo"
      class="add-todo w-full bg-black p-2 rounded-t-lg border-t absolute bottom-14"
    >
      <button
        @click="togAddingTodo = !togAddingTodo"
        type="submit"
        class="bg-red-500 hover:bg-red-900 transition-all text-white font-bold rounded px-2 float-end mb-2"
      >
        Close
      </button>
      <form @submit.prevent="addNewTask()" class="">
        <div class="top-part w-full flex items-center bg-slate-400">
          <input
            v-model="newTask"
            type="text"
            placeholder="Add A New Task"
            class="block w-full px-2 py-1 text-black rounded bg-zinc-200 text-xl focus:border-0 focus:outline-none"
          />
        </div>

        <div class="bottom-part flex items-center">
          <div class="bottom-left w-3/4 flex items-center">
            <div class="Time-input-feild flex items-center relative">
              <input
                v-model="newTaskHour"
                type="number"
                placeholder="H"
                min="01"
                max="12"
                class="w-20 py-1 text-black border border-zinc-300 rounded bg-zinc-200 text-2xl focus:border-red-500 focus:outline-none text-center"
              />
              <span class="font-bold text-4xl px-2">:</span>
              <input
                v-model="newTaskMin"
                type="number"
                placeholder="M"
                min="01"
                max="60"
                class="w-20 py-1 text-black border border-zinc-300 rounded bg-zinc-200 text-2xl focus:border-red-500 focus:outline-none text-center"
              />

              <!-- TIME period radios  -->
              <div class="timePeriod-radios p-1 rounded mx-3">
                <div class="flex items-center">
                  <input
                    v-model="newTaskTimePeriod"
                    id="default-radio-1"
                    type="radio"
                    value="Am"
                    name="default-radio"
                    class="w-4 h-4"
                    style="border-radius: 0"
                  />
                  <label
                    for="default-radio-1"
                    class="ms-2 text-xl font-bold text-gray-900 dark:text-gray-300 hover:text-lime-600"
                  >
                    Am
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    v-model="newTaskTimePeriod"
                    id="default-radio-2"
                    type="radio"
                    value="Pm"
                    name="default-radio"
                    class="w-4 h-4"
                  />
                  <label
                    for="default-radio-2"
                    class="ms-2 text-xl font-bold text-gray-900 dark:text-gray-300 hover:text-yellow-600"
                    >Pm</label
                  >
                </div>
              </div>
              <!-- //////////////// -->
            </div>
          </div>

          <div class="bottom-right w-1/4">
            <button
              type="submit"
              class="bg-pink-500 hover:bg-pink-700 transition-all w-full text-white font-bold py-2 px-4 rounded mt-3"
            >
              Add
            </button>
          </div>
        </div>
      </form>
    </div>
    <!-- add todo/////////////////// -->

    <!-- todos functional buttons and etc  -->
    <div
      class="text-center w-full p-2 flex absolute bottom-0 bg-slate-600 border-b-4 border rounded-b-lg"
    >
      <div class="todos-extensions w-2/3 flex justify-around items-center">
        <div class="todos-count">
          <p class="font-bold text-white">{{ getRemainingTask() }}</p>
        </div>
        <div class="todos-filters flex border-x-2 border-indigo-500">
          <button
            @click="currentTab = 'all'"
            :class="currentTab == 'all' ? 'text-yellow-400' : 'text-gray-400'"
            class="mx-2 hover:text-white transition-all"
          >
            All
          </button>
          <button
            @click="currentTab = 'active'"
            :class="
              currentTab == 'active' ? 'text-yellow-400' : 'text-gray-400'
            "
            class="me-2 hover:text-white transition-all"
          >
            Active
          </button>
          <button
            @click="currentTab = 'completed'"
            :class="
              currentTab == 'completed' ? 'text-yellow-400' : 'text-gray-400'
            "
            class="me-2 hover:text-white transition-all"
          >
            Completed
          </button>
        </div>
      </div>
      <div class="buttons w-1/3 flex flex-col justify-between sm:flex-row">
        <button
          @click="togAddingTodo = !togAddingTodo"
          v-show="!togAddingTodo"
          type="submit"
          class="bg-purple-200 hover:bg-purple-500 border-2 border-black transition-all rounded p-2"
        >
          Add New Task
        </button>

        <button
          @click="clearTodos()"
          class="bg-red-500 hover:bg-red-900 transition-all text-white font-bold p-2 float-end rounded border"
        >
          Clear
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
